import { Request, Response, NextFunction } from "express";
import BotService from "../services/bot.service";

export const createBot = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, slug, systemPrompt, model, temperature, maxTokens, widgetConfig, allowedDomains, isPublic } = req.body;

    if (!name || !systemPrompt || !model || temperature === undefined || maxTokens === undefined) {
      return res.status(400).json({ error: "Name, systemPrompt, model, temperature, and maxTokens are required" });
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
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ error: "A bot with this slug already exists" });
    }
    next(error);
  }
};

export const updateBot = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const { name, slug, systemPrompt, model, temperature, maxTokens, status, widgetConfig, allowedDomains, isPublic } = req.body;

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
  } catch (error: any) {
    if (error.message === "Bot not found") {
      return res.status(404).json({ error: "Bot not found" });
    }
    if (error.message === "Forbidden") {
      return res.status(403).json({ error: "You can only update your own bots" });
    }
    if (error?.code === "P2002") {
      return res.status(409).json({ error: "A bot with this slug already exists" });
    }
    next(error);
  }
};
