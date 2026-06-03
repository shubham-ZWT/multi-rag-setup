import { Router } from "express";
import { createBot, updateBot } from "../controllers/bot.controller";

const router = Router();

router.post("/create", createBot);
router.put("/:id", updateBot);

export default router;
