// src/routes/public.booking.routes.ts
import { Router } from "express";
import * as publicBookingController from "../controllers/public.booking.controller";

const router = Router();

router.post("/", publicBookingController.handleCreateGuestBooking);
router.get("/:bookingId", publicBookingController.handleGetBookingByPublicId);
// Route for initializing payment
router.post(
  "/initialize-payment",
  publicBookingController.handleInitializePayment
);

export default router;
