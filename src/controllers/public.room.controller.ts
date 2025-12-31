// src/controllers/public.room.controller.ts
import { Request, Response } from "express";
import * as roomService from "../services/room.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../utils/responseHandler";

/**
 * Handles GET /api/rooms
 * Retrieves all publicly available rooms.
 */
export const handleGetPublicRooms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rooms = await roomService.getPublicRooms();
    successResponse(res, rooms, "Rooms retrieved successfully");
  } catch (error: any) {
    console.log(error);
    errorResponse(
      res,
      "Failed to retrieve public room listings.",
      500,
      error.message
    );
  }
};

/**
 * Handles GET /api/rooms/:id
 * Retrieves a single publicly available room by its ID.
 */
export const handleGetPublicRoomById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    // It's crucial to validate that the parsed ID is a number.
    if (isNaN(id)) {
      return errorResponse(res, "Invalid room ID provided.", 400);
    }

    const room = await roomService.getPublicRoomById(id);
    if (!room) {
      return notFoundResponse(res, "Room not found.");
    }

    successResponse(res, room, "Room details retrieved successfully");
  } catch (error: any) {
    console.log(error);
    errorResponse(res, "Failed to retrieve room details.", 500, error);
  }
};

/**
 * Handles GET /api/rooms/:id/availability
 * Retrieves the booking schedule for a specific room.
 */
export const handleGetRoomAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return errorResponse(res, "Invalid room ID provided.", 400);
    }

    // We can add a check to see if the room itself exists first for a more robust error message.
    const roomExists = await roomService.getRoomById(id);
    if (!roomExists) {
      return notFoundResponse(
        res,
        "Cannot get availability for a room that does not exist."
      );
    }

    const availability = await roomService.getRoomAvailability(id);
    successResponse(
      res,
      availability,
      "Room availability retrieved successfully"
    );
  } catch (error: any) {
    console.log(error);
    errorResponse(res, "Failed to retrieve room availability.", 500, error);
  }
};
