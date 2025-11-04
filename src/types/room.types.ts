// src/types/room.types.ts
import { Room } from "@prisma/client";

// For creating a new room, all fields are required except for the image, which is optional at creation.
// We omit database-generated fields like `id`.
export interface ICreateRoomData
  extends Omit<Room, "id" | "images" | "bookings" | "features"> {
  features?: string[];
}

// For updating a room, all fields become optional. The admin might only want to change the price, for example.
export interface IUpdateRoomData extends Partial<ICreateRoomData> {}

// This represents one image object after being uploaded to Cloudinary
interface IUploadedImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

// Update the create room payload to include an array of these objects
export interface ICreateRoomData
  extends Omit<Room, "id" | "images" | "bookings" | "features"> {
  features?: string[];
  images: IUploadedImage[]; // Expect an array of image data
}
