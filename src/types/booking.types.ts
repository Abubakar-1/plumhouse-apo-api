// src/types/booking.types.ts
import { Booking } from "@prisma/client";

// Defines the shape of the data required from a guest to create a booking.
// We explicitly pick the fields to prevent any unwanted data injection.
export type ICreateBooking = Pick<
  Booking,
  | "roomId"
  | "guestName"
  | "guestEmail"
  | "guestPhone"
  | "checkIn"
  | "checkOut"
  | "adults"
  | "children"
>;

export type IUpdateBookingByAdmin = Partial<
  Omit<ICreateBooking, "roomId"> // Admin might not be allowed to change the room of a booking easily
>;
