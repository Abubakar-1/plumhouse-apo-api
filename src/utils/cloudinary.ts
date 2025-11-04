// src/utils/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure the Cloudinary instance with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Ensure all URLs are HTTPS
});

/**
 * Uploads an image buffer to Cloudinary.
 * @param buffer The image file buffer.
 * @param folder The folder in Cloudinary to upload the image to.
 * @returns A promise that resolves to the Cloudinary upload result.
 * @throws An error if the upload fails.
 */
export const uploadImageStream = (
  buffer: Buffer,
  folder: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        // Optional: Add transformations here (e.g., resizing, cropping)
        // transformation: [{ width: 800, height: 600, crop: "limit" }]
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    // Create a readable stream from the buffer and pipe it to Cloudinary's uploader
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

/**
 * Deletes an image from Cloudinary using its public ID.
 * @param publicId The public ID of the image to delete.
 * @returns A promise that resolves to the Cloudinary deletion result.
 */
export const deleteImage = (publicId: string): Promise<any> => {
  return cloudinary.uploader.destroy(publicId);
};
