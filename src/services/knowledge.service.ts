import { prisma } from "../lib/prisma";
import embeddingService from "./embedding.service";
import extractionService from "./extraction.service";
import path from "node:path";

class KnowledgeService {
  async uploadFile(
    userId: string,
    botId: string,
    file: Express.Multer.File,
  ) {
    const bot = await this.validateBotOwnership(botId, userId);

    const text = await extractionService.extractFromFile(
      file.path,
      file.mimetype,
    );

    const chunks = await embeddingService.splitAndEmbed(text);

    const source = await prisma.knowledgeSource.create({
      data: {
        botId,
        userId,
        sourceType: "file",
        name: path.parse(file.originalname).name,
        contentRaw: text,
        fileUrl: file.path,
        fileMimeType: file.mimetype,
        fileSizeBytes: file.size,
        chunkCount: chunks.length,
        indexStatus: "completed",
        indexedAt: new Date(),
      },
    });

    await this.insertChunks(source.id, botId, chunks);

    return { message: "File uploaded and indexed successfully", source };
  }

  async addText(userId: string, botId: string, name: string, content: string) {
    await this.validateBotOwnership(botId, userId);

    const chunks = await embeddingService.splitAndEmbed(content);

    const source = await prisma.knowledgeSource.create({
      data: {
        botId,
        userId,
        sourceType: "text",
        name,
        contentRaw: content,
        chunkCount: chunks.length,
        indexStatus: "completed",
        indexedAt: new Date(),
      },
    });

    await this.insertChunks(source.id, botId, chunks);

    return { message: "Text added and indexed successfully", source };
  }

  async addUrl(userId: string, botId: string, url: string) {
    await this.validateBotOwnership(botId, userId);

    const html = await extractionService.fetchFromUrl(url);
    const text = this.stripHtml(html);
    const name = new URL(url).hostname;

    const chunks = await embeddingService.splitAndEmbed(text);

    const source = await prisma.knowledgeSource.create({
      data: {
        botId,
        userId,
        sourceType: "url",
        name,
        contentRaw: text,
        url,
        chunkCount: chunks.length,
        indexStatus: "completed",
        indexedAt: new Date(),
      },
    });

    await this.insertChunks(source.id, botId, chunks);

    return { message: "URL fetched and indexed successfully", source };
  }

  async listSources(botId: string, userId: string) {
    await this.validateBotOwnership(botId, userId);

    const sources = await prisma.knowledgeSource.findMany({
      where: { botId },
      orderBy: { createdAt: "desc" },
    });

    return sources;
  }

  async getSource(id: string, userId: string) {
    const source = await prisma.knowledgeSource.findUnique({
      where: { id },
    });
    if (!source) throw new Error("Knowledge source not found");
    const bot = await prisma.bot.findUnique({ where: { id: source.botId } });
    if (!bot || bot.userId !== userId) throw new Error("Forbidden");
    return source;
  }

  async deleteSource(id: string, userId: string) {
    const source = await prisma.knowledgeSource.findUnique({
      where: { id },
    });
    if (!source) throw new Error("Knowledge source not found");
    const bot = await prisma.bot.findUnique({ where: { id: source.botId } });
    if (!bot || bot.userId !== userId) throw new Error("Forbidden");

    if (source.fileUrl) {
      extractionService.cleanupFile(source.fileUrl);
    }

    await prisma.chunk.deleteMany({ where: { knowledgeSourceId: id } });
    await prisma.knowledgeSource.delete({ where: { id } });

    return { message: "Knowledge source deleted successfully" };
  }

  async reindexSource(id: string, userId: string) {
    const source = await prisma.knowledgeSource.findUnique({
      where: { id },
    });
    if (!source) throw new Error("Knowledge source not found");
    const bot = await prisma.bot.findUnique({ where: { id: source.botId } });
    if (!bot || bot.userId !== userId) throw new Error("Forbidden");

    let text = source.contentRaw;

    if (source.sourceType === "file" && source.fileUrl) {
      const mime = source.fileMimeType || "text/plain";
      text = await extractionService.extractFromFile(source.fileUrl, mime);
    }
    if (source.sourceType === "url" && source.url) {
      const html = await extractionService.fetchFromUrl(source.url);
      text = this.stripHtml(html);
    }

    await prisma.chunk.deleteMany({ where: { knowledgeSourceId: id } });

    const chunks = await embeddingService.splitAndEmbed(text);

    await this.insertChunks(source.id, source.botId, chunks);

    const updated = await prisma.knowledgeSource.update({
      where: { id },
      data: {
        contentRaw: text,
        chunkCount: chunks.length,
        indexStatus: "completed",
        indexError: null,
        indexedAt: new Date(),
      },
    });

    return { message: "Source reindexed successfully", source: updated };
  }

  private async validateBotOwnership(botId: string, userId: string) {
    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) throw new Error("Bot not found");
    if (bot.userId !== userId) throw new Error("Forbidden");
    return bot;
  }

  private async insertChunks(
    knowledgeSourceId: string,
    botId: string,
    chunks: { content: string; chunkIndex: number; tokenCount: number; embedding: number[] }[],
  ) {
    if (chunks.length === 0) return;
    if (chunks[0].embedding.length === 0) {
      throw new Error("Embedding failed: check your GOOGLE_API_KEY");
    }

    const vectorStr = (embedding: number[]) =>
      `[${embedding.join(",")}]`;

    for (const chunk of chunks) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO chunks (id, knowledge_source_id, bot_id, content, chunk_index, token_count, embedding_model, embedding, metadata, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'gemini-embedding-001', $6::vector, '{}'::jsonb, NOW())`,
        knowledgeSourceId,
        botId,
        chunk.content,
        chunk.chunkIndex,
        chunk.tokenCount,
        vectorStr(chunk.embedding),
      );
    }
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&[^;]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export default new KnowledgeService();
