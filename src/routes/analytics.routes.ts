import { Router } from "express";
import { getBotAnalytics, getOverview } from "../controllers/analytics.controller";

const router = Router();

router.get("/overview", getOverview);
router.get("/bots/:id", getBotAnalytics);

export default router;
