// src/controllers/room.controller.ts
import { Request, Response } from "express";
import * as roomService from "../services/room.service";
import {
  errorResponse,
  notFoundResponse,
  successResponse,
} from "../utils/responseHandler";
import { createRoomSchema } from "../utils/validationSchema";

// Handler for POST /api/admin/rooms
export const handleCreateRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1. VALIDATE & SANITIZE THE INPUT
    // `safeParse` will not throw an error, but return a result object.
    const validationResult = createRoomSchema.safeParse(req.body);

    if (!validationResult.success) {
      // If validation fails, send a 400 error with the details.
      return errorResponse(
        res,
        "Invalid input data.",
        400,
        validationResult.error.flatten()
      );
    }

    // 2. CALL THE SERVICE WITH GUARANTEED CLEAN DATA
    // `validationResult.data` now contains the perfectly typed and sanitized data.
    const newRoom = await roomService.createRoom(validationResult.data);
    successResponse(res, newRoom, "Room created successfully", 201);
  } catch (error: any) {
    // This will now only catch true server/database errors, not validation errors.
    errorResponse(res, "Failed to create room.", 500, error);
  }
};

// Handler for GET /api/admin/rooms
export const handleGetAllRooms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allRooms = await roomService.getAllRooms();
    successResponse(res, allRooms, "Rooms retrieved successfully");
  } catch (error: any) {
    console.log(error);
    errorResponse(res, "Failed to retrieve rooms.", 500, error);
  }
};

// Handler for GET /api/admin/rooms/:id
export const handleGetRoomById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const room = await roomService.getRoomById(id);
    if (!room) {
      // Use our specific helper for 404
      return notFoundResponse(res, "Room not found.");
    }
    successResponse(res, room, "Room retrieved successfully");
  } catch (error: any) {
    console.log(error);
    errorResponse(res, "Failed to retrieve room.", 500, error);
  }
};

// Handler for PUT /api/admin/rooms/:id
export const handleUpdateRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid room ID provided.", 400);
    }
    // We can create a Zod schema for updates later if needed.
    // For now, we pass the body directly. The service expects a clean JSON payload.
    const updatedRoom = await roomService.updateRoom(id, req.body);
    successResponse(res, updatedRoom, "Room updated successfully");
  } catch (error) {
    // Prisma's `update` operation will throw an error if the record to update is not found.
    // This catch block will handle that gracefully.
    console.error("Update Room Error:", error);
    notFoundResponse(res, "Room to update not found.");
  }
};

// Handler for DELETE /api/admin/rooms/:id
export const handleDeleteRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await roomService.deleteRoomAndImages(id);
    successResponse(res, null, "Room and its images deleted successfully.");
  } catch (error) {
    notFoundResponse(res, "Room to delete not found.");
  }
};
