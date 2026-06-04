import { Request, Response, NextFunction } from "express";
import ChatService from "../services/chat.service";

export const chat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
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
  } catch (error: any) {
    if (error.message === "Bot not found") {
      return res.status(404).json({ error: "Bot not found" });
    }
    next(error);
  }
};

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const messages = await ChatService.getMessages(id);
    res.json(messages);
  } catch (error) {
    next(error);
  }
};
