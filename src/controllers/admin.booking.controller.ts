// src/controllers/admin.booking.controller.ts
import { Request, Response } from "express";
import * as bookingService from "../services/booking.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../utils/responseHandler";

/**
 * Handles GET /api/admin/bookings
 * Retrieves all bookings for the admin dashboard.
 */
export const handleGetAllBookings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bookings = await bookingService.getAllBookingsByAdmin();
    successResponse(res, bookings, "All bookings retrieved successfully.");
  } catch (error: any) {
    console.log(error);
    errorResponse(res, "Failed to retrieve bookings.", 500, error);
  }
};

/**
 * Handles GET /api/admin/bookings/:id
 * Retrieves a single booking by its numeric ID.
 */
export const handleGetBookingById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid booking ID.", 400);
    }
    const booking = await bookingService.getBookingByIdAdmin(id);
    if (!booking) {
      return notFoundResponse(res, "Booking not found.");
    }
    successResponse(res, booking, "Booking retrieved successfully.");
  } catch (error: any) {
    console.log(error);
    errorResponse(res, "Failed to retrieve booking.", 500, error);
  }
};

/**
 * Handles PUT /api/admin/bookings/:id
 * Updates a booking's details.
 */
export const handleUpdateBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid booking ID.", 400);
    }
    const updatedBooking = await bookingService.updateBookingByAdmin(
      id,
      req.body
    );
    successResponse(res, updatedBooking, "Booking updated successfully.");
  } catch (error) {
    // This will catch errors like the record not being found by Prisma's `update`
    notFoundResponse(res, "Booking to update not found.");
  }
};

/**
 * Handles DELETE /api/admin/bookings/:id
 * Deletes/cancels a booking.
 */
export const handleDeleteBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid booking ID.", 400);
    }
    await bookingService.deleteBookingByAdmin(id);
    successResponse(res, null, "Booking deleted successfully.");
  } catch (error) {
    notFoundResponse(res, "Booking to delete not found.");
  }
};
