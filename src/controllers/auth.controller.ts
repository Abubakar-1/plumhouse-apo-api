// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { successResponse, errorResponse } from "../utils/responseHandler";

/**
 * Handles POST /api/admin/auth/login
 * Authenticates an admin and returns a JWT.
 */
export const handleAdminLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Basic validation to ensure credentials are provided
    if (!email || !password) {
      // 400 Bad Request is more appropriate here than 401 Unauthorized,
      // as the request itself is malformed (missing data).
      return errorResponse(res, "Email and password are required.", 400);
    }

    const tokenPayload = await authService.loginAdmin({ email, password });
    successResponse(res, tokenPayload, "Admin login successful.");
  } catch (error: any) {
    console.log(error);
    // The service layer throws an error for invalid credentials.
    // We catch it and respond with a 401 Unauthorized, as originally intended.
    // The message is kept generic to prevent leaking information about which field was incorrect.
    errorResponse(res, "Invalid credentials provided.", 401, error);
  }
};
