import { Request, Response } from "express";
import BotService from "../services/bot.service";
import asyncHandler from "../utils/asyncHandler";

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
        "Name, systemPrompt, model, temperature, and maxTokens are required",
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
    return res.status(400).json({ error: "Bot ID is required" });
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
