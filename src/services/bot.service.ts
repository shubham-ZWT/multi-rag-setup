import { prisma } from "../lib/prisma";
import crypto from "node:crypto";
import AppError from "../utils/AppError";

interface UpdateBotInput {
  name?: string;
  slug?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  status?: string;
  widgetConfig?: object;
  allowedDomains?: string[];
  isPublic?: boolean;
}

interface CreateBotInput {
  userId: string;
  name: string;
  slug?: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  status?: string;
  widgetConfig?: object;
  allowedDomains?: string[];
  isPublic?: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateEmbedKey(): string {
  return `emb_${crypto.randomBytes(24).toString("hex")}`;
}

class BotService {
  async updateBot(botId: string, userId: string, updates: UpdateBotInput) {
    const existing = await prisma.bot.findUnique({ where: { id: botId } });
    if (!existing) {
      throw new AppError("Bot not found", 404);
    }
    if (existing.userId !== userId) {
      throw new AppError("Forbidden", 403);
    }

    const slug = updates.slug || (updates.name ? generateSlug(updates.name) : undefined);

    const bot = await prisma.bot.update({
      where: { id: botId },
      data: {
        ...(updates.name !== undefined && { name: updates.name }),
        ...(slug !== undefined && { slug }),
        ...(updates.systemPrompt !== undefined && { systemPrompt: updates.systemPrompt }),
        ...(updates.model !== undefined && { model: updates.model }),
        ...(updates.temperature !== undefined && { temperature: updates.temperature }),
        ...(updates.maxTokens !== undefined && { maxTokens: updates.maxTokens }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.widgetConfig !== undefined && { widgetConfig: updates.widgetConfig as object }),
        ...(updates.allowedDomains !== undefined && { allowedDomains: updates.allowedDomains as string[] }),
        ...(updates.isPublic !== undefined && { isPublic: updates.isPublic }),
      },
    });

    return { message: "Bot updated successfully", bot };
  }

  async createBot(botData: CreateBotInput) {
    const slug = botData.slug || generateSlug(botData.name);

    console.log(
      `Creating bot: ${botData.name} - ${slug} for user ${botData.userId}`,
    );

    const bot = await prisma.bot.create({
      data: {
        userId: botData.userId,
        name: botData.name,
        slug,
        systemPrompt: botData.systemPrompt,
        model: botData.model,
        temperature: botData.temperature,
        maxTokens: botData.maxTokens,
        status: botData.status ?? "draft",
        embedKey: generateEmbedKey(),
        widgetConfig: (botData.widgetConfig ?? {}) as object,
        allowedDomains: (botData.allowedDomains ?? []) as string[],
        isPublic: botData.isPublic ?? false,
      },
    });

    return { message: "Bot created successfully", bot };
  }
}

export default new BotService();
