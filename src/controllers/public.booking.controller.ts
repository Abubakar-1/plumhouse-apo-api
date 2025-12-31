// src/controllers/public.booking.controller.ts
import { Request, Response } from "express";
import * as bookingService from "../services/booking.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../utils/responseHandler";

/**
 * Handles POST /api/bookings
 * Creates a new guest booking after a final availability check.
 */
export const handleCreateGuestBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Basic validation to ensure required fields are present.
    // In a production system, a more robust validation library like Zod or Joi would be used here.
    const { roomId, guestName, guestEmail, checkIn, checkOut, adults } =
      req.body;
    if (
      !roomId ||
      !guestName ||
      !guestEmail ||
      !checkIn ||
      !checkOut ||
      !adults
    ) {
      return errorResponse(res, "Missing required booking information.", 400);
    }

    const newBooking = await bookingService.createGuestBooking(req.body);

    // Upon successful creation, we only return the secure bookingId.
    // This prevents leaking any internal or sensitive data.
    const responsePayload = {
      bookingId: newBooking.bookingId,
    };

    successResponse(
      res,
      responsePayload,
      "Booking confirmed successfully.",
      201
    );
  } catch (error: any) {
    console.log(error);
    // Specifically handle the concurrency/conflict error from the service layer.
    if (error instanceof Error && error.message.startsWith("Conflict:")) {
      return errorResponse(res, error.message, 409, error); // 409 Conflict
    }

    // Handle other potential errors (e.g., invalid roomId, database issues).
    errorResponse(res, "Failed to create booking.", 500, error);
  }
};

export const handleInitializePayment = async (req: Request, res: Response) => {
  try {
    const paymentData = await bookingService.initializePayment(req.body);
    successResponse(res, paymentData, "Payment initialized successfully.", 201);
  } catch (error: any) {
    console.log(error);
    console.log(error);
    if (error instanceof Error && error.message.startsWith("Conflict:")) {
      return errorResponse(res, error.message, 409);
    }
    errorResponse(res, "Failed to initialize payment.", 500, error);
  }
};

/**
 * Handles GET /api/bookings/:bookingId
 * Retrieves a specific booking's details using its public-facing secure ID.
 */

export const handleGetBookingByPublicId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;

    // A simple check to ensure the bookingId parameter is not empty.
    if (!bookingId) {
      return errorResponse(res, "Booking ID is required.", 400);
    }

    const booking = await bookingService.getBookingByPublicId(bookingId);
    if (!booking) {
      return notFoundResponse(res, "Booking not found.");
    }

    successResponse(res, booking, "Booking details retrieved successfully.");
  } catch (error: any) {
    console.log(error);
    errorResponse(res, "Failed to retrieve booking.", 500, error);
  }
};
