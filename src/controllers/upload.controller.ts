import { Request, Response } from "express";
import { getCloudinarySignature } from "../services/room.service";
import { successResponse, errorResponse } from "../utils/responseHandler";

export const handleGetUploadSignature = (req: Request, res: Response) => {
  try {
    const signatureData = getCloudinarySignature();
    successResponse(res, signatureData, "Signature generated successfully.");
  } catch (error) {
    errorResponse(res, "Failed to generate upload signature.", 500, error);
  }
};
