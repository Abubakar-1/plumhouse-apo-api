import { Request, Response } from "express";
import * as bookingService from "../services/booking.service";

export const handlePaystackWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["x-paystack-signature"] as string;
  try {
    await bookingService.verifyPaymentAndUpdateBooking(signature, req.body);
    // Respond to Paystack immediately with a 200 OK
    res.status(200).send("Webhook received and processed.");
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Respond with an error status so Paystack might retry
    res.status(400).send((error as Error).message);
  }
};
