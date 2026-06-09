import { Request, Response } from "express";
import KnowledgeService from "../services/knowledge.service";
import asyncHandler from "../utils/asyncHandler";

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
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
});

export const addText = asyncHandler(async (req: Request, res: Response) => {
  const { botId, name, content } = req.body;
  if (!botId || !name || !content) {
    return res
      .status(400)
      .json({ error: "botId, name, and content are required" });
  }
  const result = await KnowledgeService.addText(
    req.user!.userId,
    botId,
    name,
    content,
  );
  res.status(201).json(result);
});

export const addUrl = asyncHandler(async (req: Request, res: Response) => {
  const { botId, url } = req.body;
  if (!botId || !url) {
    return res.status(400).json({ error: "botId and url are required" });
  }
  const result = await KnowledgeService.addUrl(req.user!.userId, botId, url);
  res.status(201).json(result);
});

export const listSources = asyncHandler(async (req: Request, res: Response) => {
  const { botId } = req.query as { botId: string };
  if (!botId) {
    return res.status(400).json({ error: "botId query parameter is required" });
  }
  const sources = await KnowledgeService.listSources(
    botId as string,
    req.user!.userId,
  );
  res.json(sources);
});

export const getSource = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const source = await KnowledgeService.getSource(id, req.user!.userId);
  res.json(source);
});

export const deleteSource = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await KnowledgeService.deleteSource(id, req.user!.userId);
    res.json(result);
  },
);

export const reindexSource = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await KnowledgeService.reindexSource(id, req.user!.userId);
    res.json(result);
  },
);
