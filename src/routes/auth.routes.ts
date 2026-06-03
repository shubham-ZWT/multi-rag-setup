import { Router } from "express";
import { login, register } from "../controllers/auth.controller";

const router = Router();

// Placeholder for authentication routes
router.post("/register", register);
router.post("/login", login);

export default router;
