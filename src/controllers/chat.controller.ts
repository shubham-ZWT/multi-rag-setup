import { Request, Response } from "express";
import ChatService from "../services/chat.service";
import asyncHandler from "../utils/asyncHandler";

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const botId = req.params.botId as string;
  const { sessionId, visitorId, message, pageUrl, referrer } = req.body;

  if (!sessionId || !visitorId || !message) {
    return res
      .status(400)
      .json({ error: "sessionId, visitorId, and message are required" });
  }

  const ipAddress = (req.ip || req.socket.remoteAddress) as string | undefined;
  const userAgent = req.headers["user-agent"];

  const result = await ChatService.chat(botId, {
    sessionId,
    visitorId,
    message,
    pageUrl,
    referrer,
    ipAddress,
    userAgent,
  });

  res.json(result);
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const messages = await ChatService.getMessages(id);
  res.json(messages);
});
