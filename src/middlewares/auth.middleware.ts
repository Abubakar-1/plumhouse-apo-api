// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protectAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided." });
    return;
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("[Auth Middleware]: JWT_SECRET is not defined.");
    res.status(500).json({ message: "Server configuration error." });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as IAdminPayload;
    req.admin = decoded; // Attach the payload to the request object
    next(); // Proceed to the next middleware or controller
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token." });
  }
};
