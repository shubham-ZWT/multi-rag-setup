import { Request, Response } from 'express';
import BotService from '../services/bot.service';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/appError';

export const createBot = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    slug,
    systemPrompt,
    model,
    temperature,
    maxTokens,
    widgetConfig,
    allowedDomains,
    isPublic,
  } = req.body;

  if (
    !name ||
    !systemPrompt ||
    !model ||
    temperature === undefined ||
    maxTokens === undefined
  ) {
    return res.status(400).json({
      error:
        'Name, systemPrompt, model, temperature, and maxTokens are required',
    });
  }

  const result = await BotService.createBot({
    userId: req.user!.userId,
    name,
    slug,
    systemPrompt,
    model,
    temperature,
    maxTokens,
    widgetConfig,
    allowedDomains,
    isPublic,
  });

  res.status(201).json(result);
});

export const getBot = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) {
    throw new AppError('Bot ID is required', 400);
  }
  const result = await BotService.getBot(id, req.user!.userId);
  res.json(result);
});

export const getUserBots = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '10', search = '' } = req.query;
  const result = await BotService.getUserBots(req.user!.userId, {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
    search: search as string,
  });
  res.json(result);
});

export const deleteBot = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) {
    throw new AppError('Bot ID is required', 400);
  }
  const result = await BotService.deleteBot(id, req.user!.userId);
  res.json(result);
});

export const toggleBotStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!id) {
      throw new AppError('Bot ID is required', 400);
    }
    if (!status) {
      throw new AppError('Status is required', 400);
    }
    const result = await BotService.toggleBotStatus(
      id,
      req.user!.userId,
      status,
    );
    res.json(result);
  },
);

export const updateBot = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const {
    name,
    slug,
    systemPrompt,
    model,
    temperature,
    maxTokens,
    status,
    widgetConfig,
    allowedDomains,
    isPublic,
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Bot ID is required' });
  }

  const result = await BotService.updateBot(id, req.user!.userId, {
    name,
    slug,
    systemPrompt,
    model,
    temperature,
    maxTokens,
    status,
    widgetConfig,
    allowedDomains,
    isPublic,
  });

  res.json(result);
});
