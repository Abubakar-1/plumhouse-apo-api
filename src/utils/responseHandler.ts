// src/utils/responseHandler.ts
import { Response } from "express";
import { IApiResponse } from "../types/api.types";

/**
 * Sends a standardized success response.
 * @param res - The Express Response object.
 * @param data - The payload to be sent in the `data` field.
 * @param message - A descriptive success message.
 * @param statusCode - The HTTP status code (defaults to 200).
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200
): void => {
  const response: IApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

/**
 * Sends a standardized error response.
 * @param res - The Express Response object.
 * @param message - A descriptive error message for the client.
 * @param statusCode - The HTTP status code (defaults to 500).
 * @param error - Optional detailed error information.
 */
export const errorResponse = (
  res: Response,
  message: string = "An error occurred",
  statusCode: number = 500,
  error: object | null = null
): void => {
  const response: IApiResponse<null> = {
    success: false,
    message,
    data: null,
    error,
  };
  res.status(statusCode).json(response);
};

/**
 * A convenience function for sending a 404 Not Found response.
 * @param res - The Express Response object.
 * @param message - A message indicating what was not found.
 */
export const notFoundResponse = (
  res: Response,
  message: string = "Resource not found"
): void => {
  errorResponse(res, message, 404);
};
