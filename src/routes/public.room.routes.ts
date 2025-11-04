// src/routes/public.room.routes.ts
import { Router } from "express";
import * as publicRoomController from "../controllers/public.room.controller";

const router = Router();

router.get("/", publicRoomController.handleGetPublicRooms);
router.get("/:id", publicRoomController.handleGetPublicRoomById);
router.get("/:id/availability", publicRoomController.handleGetRoomAvailability);

export default router;
