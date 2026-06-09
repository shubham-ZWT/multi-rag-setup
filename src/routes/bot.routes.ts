import { Router } from "express";
import { createBot, updateBot } from "../controllers/bot.controller";
import { verifyToken, authorizeRole } from "../middleware/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.use(verifyToken, authorizeRole([Role.USER, Role.ADMIN]));

router.post("/create", createBot);
router.put("/:id", updateBot);

export default router;
