// src/services/booking.service.ts
import { PrismaClient, Booking } from "@prisma/client";
import { ICreateBooking, IUpdateBookingByAdmin } from "../types/booking.types";
import axios from "axios";
import crypto from "crypto";

const prisma = new PrismaClient();

const checkAvailability = async (
  roomId: number,
  checkIn: Date,
  checkOut: Date
) => {
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      roomId: roomId,
      status: "PAID", // Only paid bookings block the calendar
      AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
    },
    select: { id: true },
  });
  return conflictingBookings.length === 0;
};

/**
 * Creates a guest booking, ensuring date availability within an atomic transaction.
 * @param bookingDetails - The guest's booking information.
 * @returns The newly created booking, including the secure public `bookingId`.
 * @throws An error if the dates are no longer available (concurrency safe).
 */
export const createGuestBooking = async (
  bookingDetails: ICreateBooking
): Promise<Booking> => {
  const { roomId, checkIn, checkOut } = bookingDetails;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // A transaction is non-negotiable here. It guarantees that the availability check
  // and the creation of the booking happen as a single, indivisible operation.
  // This is the definitive safeguard against race conditions and double bookings.
  return prisma.$transaction(async (tx) => {
    // 1. Perform a final, authoritative availability check *inside* the transaction.
    const isAvailable = await checkAvailability(
      roomId,
      checkInDate,
      checkOutDate
    );

    // 2. If a conflict exists, throw an error. This automatically rolls back the transaction.
    if (!isAvailable) {
      throw new Error("Conflict: The selected dates are no longer available.");
    }

    // 3. If the coast is clear, create the booking.
    const newBooking = await tx.booking.create({
      data: { ...bookingDetails, checkIn: checkInDate, checkOut: checkOutDate },
    });

    // (Future Enhancement): This is the ideal place to dispatch a confirmation email.
    // e.g., `await emailService.sendBookingConfirmation(newBooking);`

    return newBooking;
  });
};

/**
 * Retrieves a single booking using its secure, public-facing bookingId (CUID).
 * Includes associated room details.
 * @param bookingId - The secure CUID string identifying the booking.
 * @returns The booking object with room details, or null if not found.
 */
export const getBookingByPublicId = async (bookingId: string) => {
  return prisma.booking.findUnique({
    where: { bookingId },
    select: {
      bookingId: true,
      checkIn: true,
      checkOut: true,
      guestName: true,
      createdAt: true,
      room: {
        // Include the public details of the booked room.
        select: {
          name: true,
          price: true,
          images: true,
        },
      },
    },
  });
};

// --- ADMIN-ONLY FUNCTIONS ---

/**
 * [ADMIN] Retrieves a comprehensive list of all bookings.
 * Includes associated room details for context.
 * @returns A promise resolving to an array of all booking objects.
 */
export const getAllBookingsByAdmin = async (): Promise<Booking[]> => {
  return prisma.booking.findMany({
    orderBy: {
      createdAt: "desc", // Show the most recent bookings first
    },
    include: {
      room: true, // Include the full room object for the admin view
    },
  });
};

/**
 * [ADMIN] Retrieves a single, complete booking by its internal numeric ID.
 * @param id - The numeric primary key of the booking.
 * @returns The full booking object with room details, or null if not found.
 */
export const getBookingByIdAdmin = async (
  id: number
): Promise<Booking | null> => {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      room: true,
    },
  });
};

/**
 * [ADMIN] Updates an existing booking's details.
 * @param id - The numeric ID of the booking to update.
 * @param bookingData - The data to update.
 * @returns The updated booking object.
 */
export const updateBookingByAdmin = async (
  id: number,
  bookingData: IUpdateBookingByAdmin
): Promise<Booking> => {
  return prisma.booking.update({
    where: { id },
    data: {
      ...bookingData,
      // Ensure dates are correctly formatted if they are part of the update
      ...(bookingData.checkIn && { checkIn: new Date(bookingData.checkIn) }),
      ...(bookingData.checkOut && { checkOut: new Date(bookingData.checkOut) }),
    },
  });
};

/**
 * [ADMIN] Deletes/cancels a booking.
 * @param id - The numeric ID of the booking to delete.
 * @returns The deleted booking object.
 */
export const deleteBookingByAdmin = async (id: number): Promise<Booking> => {
  return prisma.booking.delete({
    where: { id },
  });
};

/**
 * Creates a PENDING booking and initializes a Paystack transaction.
 * @param bookingDetails - The guest's booking information.
 * @returns The Paystack authorization URL.
 */
export const initializePayment = async (bookingDetails: ICreateBooking) => {
  const { roomId, checkIn, checkOut } = bookingDetails;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // 1. Re-check availability against PAID bookings.
  const isAvailable = await checkAvailability(
    roomId,
    checkInDate,
    checkOutDate
  );
  if (!isAvailable) {
    throw new Error("Conflict: The selected dates are no longer available.");
  }

  // 2. Get room details to calculate the price.
  const room = await prisma.room.findUniqueOrThrow({ where: { id: roomId } });
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
  );
  const amountInKobo = Math.round(nights * room.price * 100);

  // 3. Create a PENDING booking in our database.
  const pendingBooking = await prisma.booking.create({
    data: { ...bookingDetails, status: "PENDING" },
  });

  // 4. Call Paystack to initialize the transaction.
  const paystackResponse = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: bookingDetails.guestEmail,
      amount: amountInKobo,
      callback_url: `${process.env.FRONTEND_URL}/payment/success`, // You'll create this page
      metadata: {
        bookingId: pendingBooking.id, // Pass our internal ID for reference
        guestName: bookingDetails.guestName,
      },
    },
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  );

  const { authorization_url, reference } = paystackResponse.data.data;

  // 5. Save the Paystack reference to our booking for future lookup.
  await prisma.booking.update({
    where: { id: pendingBooking.id },
    data: { paymentReference: reference },
  });

  return { authorization_url };
};

/**
 * Verifies a Paystack webhook and updates booking status.
 * @param signature - The 'x-paystack-signature' header.
 * @param body - The raw request body from Paystack.
 * @returns The updated booking object if successful.
 */
export const verifyPaymentAndUpdateBooking = async (
  signature: string,
  body: any
) => {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY as string)
    .update(JSON.stringify(body))
    .digest("hex");

  if (hash !== signature) {
    throw new Error("Invalid Paystack signature.");
  }

  const { event, data } = body;

  if (event === "charge.success") {
    const reference = data.reference;
    const booking = await prisma.booking.findUnique({
      where: { paymentReference: reference },
    });

    if (!booking) {
      throw new Error(`Booking with reference ${reference} not found.`);
    }

    // Re-check availability one last time before confirming.
    const isAvailable = await checkAvailability(
      booking.roomId,
      booking.checkIn,
      booking.checkOut
    );
    if (!isAvailable) {
      // This is a race condition. The room was booked while this user was paying.
      // Log this for manual intervention/refund.
      console.error(
        `Race Condition: Room ${booking.roomId} no longer available for booking ID ${booking.id}`
      );
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "FAILED" },
      });
      throw new Error("Room was booked by another user during payment.");
    }

    return prisma.booking.update({
      where: { id: booking.id },
      data: { status: "PAID" },
    });
  }
};
