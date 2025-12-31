// src/index.ts
import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Admin Imports
import authRoutes from "./routes/auth.routes";
import roomAdminRoutes from "./routes/room.routes";
import adminBookingRoutes from "./routes/admin.booking.routes";

// Public Imports
import publicRoomRoutes from "./routes/public.room.routes";
import publicBookingRoutes from "./routes/public.booking.routes";

import uploadAdminRoutes from "./routes/upload.routes";

import webhookRoutes from "./routes/webhook.routes";

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---

// PUBLIC ROUTES (No authentication required)
app.use("/api/rooms", publicRoomRoutes);
app.use("/api/bookings", publicBookingRoutes);

// ADMIN ROUTES (Protected by JWT)
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/rooms", roomAdminRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);

app.use("/api/admin/uploads", uploadAdminRoutes);

// WEBHOOK ROUTES
app.use("/api/webhooks", webhookRoutes);

// --- Health Check Endpoint ---
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// --- Server Activation ---
app.listen(PORT, () => {
  console.log(`[Server]: Running at http://localhost:${PORT}`);
});
