// src/routes/upload.routes.ts
import { Router } from "express";
import { protectAdmin } from "../middlewares/auth.middleware";
import { handleGetUploadSignature } from "../controllers/upload.controller";

const router = Router();

// This endpoint must be protected. Only logged-in admins can get a signature.
router.use(protectAdmin);

router.get("/signature", handleGetUploadSignature);

export default router;
