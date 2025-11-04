// src/services/auth.service.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAuthRequest } from "../types/auth.types";

const prisma = new PrismaClient();

export const loginAdmin = async (
  credentials: IAuthRequest
): Promise<{ token: string }> => {
  const { email, password } = credentials;

  // 1. Validate the existence of the admin
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new Error("Invalid credentials.");
  }

  // 2. Verify the password
  const isPasswordCorrect = await bcrypt.compare(password, admin.password);
  if (!isPasswordCorrect) {
    throw new Error("Invalid credentials.");
  }

  // 3. Generate JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("[Auth Service]: JWT_SECRET is not defined in .env file.");
    throw new Error("Server configuration error.");
  }

  const token = jwt.sign(
    { adminId: admin.id, email: admin.email },
    jwtSecret,
    { expiresIn: "8h" } // Token is valid for 8 hours
  );

  return { token };
};
