// src/routes/room.routes.ts
import { Router } from "express";
import * as roomController from "../controllers/room.controller";
import { protectAdmin } from "../middlewares/auth.middleware";
import { uploadMultipleImages } from "../middlewares/upload.middleware";

const router = Router();

// Apply the `protectAdmin` middleware to ALL routes defined in this file.
// Any request to /api/admin/rooms/* must now include a valid JWT.
router.use(protectAdmin);

router.post("/", roomController.handleCreateRoom);
router.get("/", roomController.handleGetAllRooms);
router.get("/:id", roomController.handleGetRoomById);
router.put("/:id", roomController.handleUpdateRoom);
router.delete("/:id", roomController.handleDeleteRoom);

export default router;
