import { Router } from "express";
import { login, register,forgotPassword, resetPassword } from "../controllers/auth.controller";

const router = Router();

// Placeholder for authentication routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);

export default router;
