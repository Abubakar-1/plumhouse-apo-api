import { Router } from "express";
import express from "express";
import { handlePaystackWebhook } from "../controllers/webhook.controller";

const router = Router();

// IMPORTANT: Webhook handlers need the raw request body, not parsed JSON.
// We apply this middleware only to this route.
router.post(
  "/paystack",
  express.raw({ type: "application/json" }),
  handlePaystackWebhook
);

export default router;
