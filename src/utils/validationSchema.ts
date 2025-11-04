// src/utils/validationSchemas.ts
import { z } from "zod";

// This schema defines the exact shape and types our `createRoom` service expects.
export const createRoomSchema = z.object({
  // --- Core Details ---
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),

  // --- Type Coercion & Validation ---
  // `z.coerce.number()` is the key. It will automatically convert strings to numbers.
  // We also add validation rules like .positive().
  price: z.coerce.number().positive("Price must be a positive number"),
  size: z.coerce.number().int().positive("Size must be a positive integer"),
  capacity: z.coerce
    .number()
    .int()
    .positive("Capacity must be a positive integer"),

  // --- Features Array ---
  // We expect a comma-separated string from the form, which we transform into an array.
  features: z
    .string()
    .transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .optional(),

  // --- Amenity Booleans ---
  // We expect 'on' or undefined from the form, and transform to true/false.
  freeWifi: z.preprocess((val) => val === "on", z.boolean()),
  shower: z.preprocess((val) => val === "on", z.boolean()),
  airportTransport: z.preprocess((val) => val === "on", z.boolean()),
  balcony: z.preprocess((val) => val === "on", z.boolean()),
  refrigerator: z.preprocess((val) => val === "on", z.boolean()),
  support24_7: z.preprocess((val) => val === "on", z.boolean()),
  workDesk: z.preprocess((val) => val === "on", z.boolean()),
  fitnessCenter: z.preprocess((val) => val === "on", z.boolean()),
  swimmingPool: z.preprocess((val) => val === "on", z.boolean()),

  // --- Images (Passed separately) ---
  // The images array will be validated and added after the initial form data parsing.
  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string(),
        isPrimary: z.boolean(),
      })
    )
    .optional(),
});
