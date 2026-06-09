import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import AnalyticsService from '../services/analytics.service';
import AppError from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await AnalyticsService.getOverview(userId);
  res.json(result);
});

export const getBotAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const botId = req.params.id as string;
    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot || bot.userId !== req.user!.userId) {
      throw new AppError('Bot not found', 404);
    }
    const result = await AnalyticsService.getBotAnalytics(botId);
    res.json(result);
  },
);
