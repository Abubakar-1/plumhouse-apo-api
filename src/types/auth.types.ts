// src/types/auth.types.ts
import { Admin } from "@prisma/client";

// We only need email and password for a login request.
// This ensures we don't accidentally pass other properties from the body.
export type IAuthRequest = Pick<Admin, "email" | "password">;
