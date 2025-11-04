// src/services/booking.service.ts
import { PrismaClient, Booking } from "@prisma/client";
import { ICreateBooking, IUpdateBookingByAdmin } from "../types/booking.types";

const prisma = new PrismaClient();

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
    const conflictingBookings = await tx.booking.findMany({
      where: {
        roomId: roomId,
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
      select: { id: true }, // We only need to know if any exist.
    });

    // 2. If a conflict exists, throw an error. This automatically rolls back the transaction.
    if (conflictingBookings.length > 0) {
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
          imageUrl: true,
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
