import { Request, Response, NextFunction } from "express";
import KnowledgeService from "../services/knowledge.service";

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { botId } = req.body;
    if (!botId) {
      return res.status(400).json({ error: "botId is required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }
    const result = await KnowledgeService.uploadFile(
      req.user!.userId,
      botId,
      req.file,
    );
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === "Bot not found") {
      return res.status(404).json({ error: "Bot not found" });
    }
    if (error.message === "Forbidden") {
      return res.status(403).json({ error: "You can only modify your own bots" });
    }
    next(error);
  }
};

export const addText = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { botId, name, content } = req.body;
    if (!botId || !name || !content) {
      return res.status(400).json({ error: "botId, name, and content are required" });
    }
    const result = await KnowledgeService.addText(
      req.user!.userId,
      botId,
      name,
      content,
    );
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === "Bot not found") {
      return res.status(404).json({ error: "Bot not found" });
    }
    if (error.message === "Forbidden") {
      return res.status(403).json({ error: "You can only modify your own bots" });
    }
    next(error);
  }
};

export const addUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { botId, url } = req.body;
    if (!botId || !url) {
      return res.status(400).json({ error: "botId and url are required" });
    }
    const result = await KnowledgeService.addUrl(
      req.user!.userId,
      botId,
      url,
    );
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === "Bot not found") {
      return res.status(404).json({ error: "Bot not found" });
    }
    if (error.message === "Forbidden") {
      return res.status(403).json({ error: "You can only modify your own bots" });
    }
    next(error);
  }
};

export const listSources = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { botId } = req.query as { botId: string };
    if (!botId) {
      return res.status(400).json({ error: "botId query parameter is required" });
    }
    const sources = await KnowledgeService.listSources(
      botId as string,
      req.user!.userId,
    );
    res.json(sources);
  } catch (error: any) {
    if (error.message === "Bot not found") {
      return res.status(404).json({ error: "Bot not found" });
    }
    if (error.message === "Forbidden") {
      return res.status(403).json({ error: "You can only view your own bots" });
    }
    next(error);
  }
};

export const getSource = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const source = await KnowledgeService.getSource(id, req.user!.userId);
    res.json(source);
  } catch (error: any) {
    if (error.message === "Knowledge source not found") {
      return res.status(404).json({ error: "Knowledge source not found" });
    }
    if (error.message === "Forbidden") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next(error);
  }
};

export const deleteSource = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const result = await KnowledgeService.deleteSource(
      id,
      req.user!.userId,
    );
    res.json(result);
  } catch (error: any) {
    if (error.message === "Knowledge source not found") {
      return res.status(404).json({ error: "Knowledge source not found" });
    }
    if (error.message === "Forbidden") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next(error);
  }
};

export const reindexSource = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const result = await KnowledgeService.reindexSource(
      id,
      req.user!.userId,
    );
    res.json(result);
  } catch (error: any) {
    if (error.message === "Knowledge source not found") {
      return res.status(404).json({ error: "Knowledge source not found" });
    }
    if (error.message === "Forbidden") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next(error);
  }
};
