// src/services/room.service.ts
import { PrismaClient, Room } from "@prisma/client";
import { ICreateRoomData, IUpdateRoomData } from "../types/room.types";
import { deleteImage, uploadImageStream } from "../utils/cloudinary";

import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

/**
 * Creates a new room and its associated images within a single transaction.
 * @param roomData - The core data for the room (name, price, etc.).
 * @param files - An array of image files from Multer.
 * @param primaryImageIndex - The index from the `files` array that should be marked as primary.
 * @returns The newly created room object with its images included.
 */
export const createRoom = async (roomData: any): Promise<Room> => {
  const { images, ...coreRoomData } = roomData;

  return prisma.$transaction(async (tx) => {
    // 1. Create the core Room record.
    const newRoom = await tx.room.create({
      data: {
        ...coreRoomData,
      },
    });

    // 2. If image data was provided, create the related RoomImage records.
    if (images && images.length > 0) {
      await tx.roomImage.createMany({
        data: images.map((image: any) => ({
          ...image,
          roomId: newRoom.id,
        })),
      });
    }

    // 3. Return the complete room with its images.
    return tx.room.findUniqueOrThrow({
      where: { id: newRoom.id },
      include: { images: true },
    });
  });
};

/**
 * Retrieves all rooms from the database.
 * @returns An array of all room objects.
 */
export const getAllRooms = async (): Promise<Room[]> => {
  return prisma.room.findMany();
};

/**
 * Retrieves a single room by its unique ID.
 * @param id - The numeric ID of the room.
 * @returns The room object if found, otherwise null.
 */
export const getRoomById = async (id: number): Promise<Room | null> => {
  return prisma.room.findUnique({
    where: { id },
    include: {
      images: true, // This will fetch all related RoomImage records for each room
    },
  });
};

/**
 * [ADMIN] Updates an existing room and replaces its images transactionally.
 * @param id The numeric ID of the room to update.
 * @param roomData The complete new data for the room, including the new set of images.
 * @returns The updated room object with its new images.
 */
export const updateRoom = async (
  id: number,
  roomData: IUpdateRoomData
): Promise<Room> => {
  const { images, ...coreRoomData } = roomData;

  return prisma.$transaction(async (tx) => {
    // 1. Find all old images that are about to be replaced.
    const oldImages = await tx.roomImage.findMany({
      where: { roomId: id },
      select: { publicId: true },
    });

    // 2. Delete all existing RoomImage records from the database for this room.
    await tx.roomImage.deleteMany({ where: { roomId: id } });

    // 3. Update the core Room details (name, price, amenities, etc.).
    const updatedRoom = await tx.room.update({
      where: { id },
      data: { ...coreRoomData },
    });

    // 4. If a new set of images was provided, create them.
    if (images && images.length > 0) {
      await tx.roomImage.createMany({
        data: images.map((image) => ({
          url: image.url,
          publicId: image.publicId,
          isPrimary: image.isPrimary,
          roomId: updatedRoom.id,
        })),
      });
    }

    // After the transaction succeeds, trigger the cleanup of old images from Cloudinary.
    // This is done outside the transaction as it's a side-effect and we don't want to
    // roll back the database change if the Cloudinary API call fails.
    if (oldImages.length > 0) {
      const publicIdsToDelete = oldImages.map((img) => img.publicId);
      // Asynchronously delete without waiting
      Promise.all(publicIdsToDelete.map((pid) => deleteImage(pid))).catch(
        (err) =>
          console.error("Failed to clean up old images from Cloudinary:", err)
      );
    }

    // 5. Return the fully updated room with its new images.
    return tx.room.findUniqueOrThrow({
      where: { id: updatedRoom.id },
      include: { images: true },
    });
  });
};

/**
 * Deletes a room and cascades to delete all its images from the database.
 * Also triggers deletion of the images from Cloudinary.
 * @param id The ID of the room to delete.
 */
export const deleteRoomAndImages = async (id: number): Promise<void> => {
  // 1. Find all images associated with the room.
  const imagesToDelete = await prisma.roomImage.findMany({
    where: { roomId: id },
    select: { publicId: true },
  });

  // 2. Trigger deletions from Cloudinary (asynchronously, no need to wait).
  if (imagesToDelete.length > 0) {
    const deletePromises = imagesToDelete.map((img) =>
      deleteImage(img.publicId)
    );
    Promise.all(deletePromises).catch((err) =>
      console.error("Cloudinary cleanup failed on room delete:", err)
    );
  }

  // 3. Delete the room from the database.
  // The `onDelete: Cascade` in the schema handles deleting RoomImage records.
  await prisma.room.delete({ where: { id } });
};

// --- PUBLIC FUNCTIONS ---

/**
 * Retrieves all rooms with a curated set of public-facing fields.
 * @returns A promise that resolves to an array of publicly safe room data.
 */
// src/services/room.service.ts
// ...

export const getPublicRooms = async () => {
  return prisma.room.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      size: true,
      capacity: true,

      //   amenities: {
      //     select: {
      freeWifi: true,
      shower: true,
      airportTransport: true,
      balcony: true,
      refrigerator: true,
      support24_7: true,
      workDesk: true,
      fitnessCenter: true,
      swimmingPool: true,
      //     },
      //   },

      features: true, // The JSON array of strings is fine as a top-level field.

      // The image selection logic was already perfect.
      images: {
        where: { isPrimary: true },
        select: { url: true },
      },
    },
  });
};

/**
 * Retrieves a single room by its ID with public-facing fields.
 * @param id - The numeric ID of the room.
 * @returns A promise that resolves to the publicly safe room data, or null if not found.
 */
export const getPublicRoomById = async (id: number) => {
  return prisma.room.findUnique({
    where: { id },
    include: {
      images: {
        // Get all images for the detail view.
        select: { url: true, isPrimary: true },
      },
    },
  });
};

/**
 * Retrieves the booked date ranges for a specific room.
 * Used by the frontend to disable dates on a calendar.
 * @param id - The numeric ID of the room.
 * @returns A promise that resolves to an array of objects containing checkIn and checkOut dates.
 */
export const getRoomAvailability = async (id: number) => {
  return prisma.booking.findMany({
    where: {
      roomId: id,
      // Optimization: Only fetch bookings that haven't ended yet.
      checkOut: { gte: new Date() },
    },
    select: {
      checkIn: true,
      checkOut: true,
    },
  });
};

/**
 * [ADMIN] Generates a secure signature for a direct-to-Cloudinary upload.
 * The API secret is NEVER exposed to the client.
 * @returns An object containing the timestamp and the generated signature.
 */
export const getCloudinarySignature = () => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "guesthouse-rooms"; // Define a consistent folder

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: folder,
    },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return { timestamp, signature };
};
