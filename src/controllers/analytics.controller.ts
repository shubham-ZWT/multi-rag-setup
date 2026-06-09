import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import AnalyticsService from "../services/analytics.service";
import AppError from "../utils/appError";

export const getOverview = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await AnalyticsService.getOverview(userId);
  res.json(result);
};

export const getBotAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const botId = req.params.id as string;
    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot || bot.userId !== req.user!.userId) {
      throw new AppError("Bot not found", 404);
    }
    const result = await AnalyticsService.getBotAnalytics(botId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
