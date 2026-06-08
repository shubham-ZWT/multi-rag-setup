import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import ChatService from "../services/chat.service";
import FeedbackService from "../services/feedback.service";
import asyncHandler from "../utils/asyncHandler";

const router = Router();

function getAllowedOrigin(req: Request): string | null {
  const origin = req.headers["origin"] as string | undefined;
  const referer = req.headers["referer"] as string | undefined;
  return origin || (referer ? new URL(referer).origin : null);
}

function isDomainAllowed(allowedDomains: string[], origin: string | null): boolean {
  if (!allowedDomains || allowedDomains.length === 0) return true;
  if (allowedDomains.some((d) => d === "*")) return true;
  if (!origin) return false;
  try {
    const hostname = new URL(origin).hostname;
    return allowedDomains.some((d) => {
      const pattern = d.replace(/\./g, "\\.").replace(/\*/g, ".*");
      return new RegExp(`^${pattern}$`, "i").test(hostname);
    });
  } catch {
    return false;
  }
}

router.get("/:embedKey/config", asyncHandler(async (req: Request, res: Response) => {
  const embedKey = req.params.embedKey as string;

  const bot = await prisma.bot.findUnique({ where: { embedKey } });
  if (!bot) {
    return res.status(404).json({ error: "Bot not found" });
  }
  if (bot.status !== "published" && !bot.isPublic) {
    return res.status(404).json({ error: "Bot is not available" });
  }

  const origin = getAllowedOrigin(req);
  if (!isDomainAllowed(bot.allowedDomains as string[], origin)) {
    return res.status(403).json({ error: "Domain not allowed" });
  }

  res.json({
    id: bot.id,
    name: bot.name,
    model: bot.model,
    systemPrompt: bot.systemPrompt,
    temperature: bot.temperature,
    widgetConfig: bot.widgetConfig,
  });
}));

router.post("/:embedKey/chat", asyncHandler(async (req: Request, res: Response) => {
  const embedKey = req.params.embedKey as string;
  const { sessionId, visitorId, message, pageUrl, referrer } = req.body;

  if (!sessionId || !visitorId || !message) {
    return res.status(400).json({ error: "sessionId, visitorId, and message are required" });
  }

  const bot = await prisma.bot.findUnique({ where: { embedKey } });
  if (!bot) {
    return res.status(404).json({ error: "Bot not found" });
  }
  if (bot.status !== "published" && !bot.isPublic) {
    return res.status(404).json({ error: "Bot is not available" });
  }

  const origin = getAllowedOrigin(req);
  if (!isDomainAllowed(bot.allowedDomains as string[], origin)) {
    return res.status(403).json({ error: "Domain not allowed" });
  }

  const ipAddress = (req.ip || req.socket.remoteAddress) as string | undefined;
  const userAgent = req.headers["user-agent"];

  const result = await ChatService.chat(bot.id, {
    sessionId,
    visitorId,
    message,
    pageUrl,
    referrer,
    ipAddress,
    userAgent,
  });

  res.json(result);
}));

router.post("/:embedKey/feedback", asyncHandler(async (req: Request, res: Response) => {
  const embedKey = req.params.embedKey as string;
  const { messageId, feedbackType } = req.body;

  if (!messageId || !feedbackType) {
    return res.status(400).json({ error: "messageId and feedbackType are required" });
  }
  if (!["thumbs_up", "thumbs_down", "none"].includes(feedbackType)) {
    return res.status(400).json({ error: "feedbackType must be thumbs_up, thumbs_down, or none" });
  }

  const bot = await prisma.bot.findUnique({ where: { embedKey } });
  if (!bot) {
    return res.status(404).json({ error: "Bot not found" });
  }
  if (bot.status !== "published" && !bot.isPublic) {
    return res.status(404).json({ error: "Bot is not available" });
  }

  const origin = getAllowedOrigin(req);
  if (!isDomainAllowed(bot.allowedDomains as string[], origin)) {
    return res.status(403).json({ error: "Domain not allowed" });
  }

  const msg = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: { select: { botId: true } } },
  });
  if (!msg || msg.conversation.botId !== bot.id) {
    return res.status(404).json({ error: "Message not found" });
  }

  const result = await FeedbackService.submitFeedback(bot.id, messageId, feedbackType);
  res.json(result);
}));

export default router;
