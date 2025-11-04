// src/middlewares/upload.middleware.ts
import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
});

// The frontend will send an array of files under the field name 'images'.
// We'll set a reasonable limit, for instance, 10 images per upload.
export const uploadMultipleImages = upload.array("images", 10);
