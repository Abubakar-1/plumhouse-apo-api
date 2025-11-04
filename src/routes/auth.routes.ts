// src/routes/auth.routes.ts
import { Router } from "express";
import { handleAdminLogin } from "../controllers/auth.controller";

const router = Router();

router.post("/login", handleAdminLogin);

export default router;
