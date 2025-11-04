// src/routes/admin.booking.routes.ts
import { Router } from "express";
import * as adminBookingController from "../controllers/admin.booking.controller";
import { protectAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Secure all endpoints in this file with the admin authentication middleware.
router.use(protectAdmin);

router.get("/", adminBookingController.handleGetAllBookings);
router.get("/:id", adminBookingController.handleGetBookingById);
router.put("/:id", adminBookingController.handleUpdateBooking);
router.delete("/:id", adminBookingController.handleDeleteBooking);

export default router;
