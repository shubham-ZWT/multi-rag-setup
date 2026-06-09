import { prisma } from '../lib/prisma';
import { getChatModel } from '../lib/gemini';
import embeddingService from './embedding.service';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages';
import AppError from '../utils/appError';

interface ChatRequest {
  sessionId: string;
  visitorId: string;
  message: string;
  pageUrl?: string;
  referrer?: string;
  ipAddress?: string;
  userAgent?: string;
  countryCode?: string;
}

interface ChatResponse {
  reply: string;
  sources: { content: string; chunkIndex: number }[];
  conversationId: string;
  messageId: string;
}

class ChatService {
  async chat(botId: string, input: ChatRequest): Promise<ChatResponse> {
    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) throw new AppError('Bot not found', 404);

    const conversation = await this.getOrCreateConversation(botId, input);

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: input.message,
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: 0,
      },
    });

    const queryEmbedding = await embeddingService.embedQuery(input.message);

    const relevantChunks = await this.searchSimilarChunks(
      botId,
      queryEmbedding,
      5,
    );

    const sources = relevantChunks.map((c: any) => ({
      content: c.content,
      chunkIndex: c.chunk_index,
    }));

    const context = relevantChunks
      .map((c: any) => `[Source ${c.chunk_index}]: ${c.content}`)
      .join('\n\n');

    const recentMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const startTime = Date.now();

    const messages = [
      new SystemMessage(
        `${bot.systemPrompt}\n\nUse the following context to answer the user's question. If you cannot answer from the context, say so.\n\nContext:\n${context}`,
      ),
      ...recentMessages.map((m) =>
        m.role === 'user'
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      ),
      new HumanMessage(input.message),
    ];

    const model = getChatModel();
    const response = await model.invoke(messages);
    const latencyMs = Date.now() - startTime;
    const replyText = this.stripThinkTags(
      typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content),
    );

    const inputTokensEst = Math.ceil(input.message.length / 4);
    const outputTokensEst = Math.ceil(replyText.length / 4);

    const assistantMsg = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: replyText,
        sourcesUsed: sources as any,
        confidenceScore: 0,
        inputTokens: inputTokensEst,
        outputTokens: outputTokensEst,
        latencyMs,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
      },
    });

    try {
      await this.updateMessageAnalytics(
        bot.id,
        conversation,
        inputTokensEst,
        outputTokensEst,
        latencyMs,
      );
    } catch (err) {
      console.error('Analytics update failed:', err);
    }

    return {
      reply: replyText,
      sources,
      conversationId: conversation.id,
      messageId: assistantMsg.id,
    };
  }

  async getMessages(conversationId: string) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    return messages;
  }

  private async updateMessageAnalytics(
    botId: string,
    conversation: { id: string; messageCount: number },
    inputTokens: number,
    outputTokens: number,
    latencyMs: number,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isNewConversation = conversation.messageCount === 0;

    const existing = await prisma.botAnalyticsDaily.findUnique({
      where: { botId_date: { botId, date: today } },
    });

    const oldCount = existing?.totalMessages ?? 0;
    const oldLatency = existing?.avgLatencyMs ?? 0;
    const newAvgLatency =
      oldCount > 0
        ? Math.round((oldLatency * oldCount + latencyMs) / (oldCount + 1))
        : latencyMs;

    await prisma.botAnalyticsDaily.upsert({
      where: { botId_date: { botId, date: today } },
      create: {
        botId,
        date: today,
        totalConversations: 1,
        totalMessages: 1,
        uniqueVisitors: 1,
        avgMessagesPerConv: 1,
        totalTokensUsed: inputTokens + outputTokens,
        avgLatencyMs: latencyMs,
      },
      update: {
        totalMessages: { increment: 1 },
        totalTokensUsed: { increment: inputTokens + outputTokens },
        avgLatencyMs: newAvgLatency,
        ...(isNewConversation && { totalConversations: { increment: 1 } }),
      },
    });
  }

  private async getOrCreateConversation(botId: string, input: ChatRequest) {
    const existing = await prisma.conversation.findFirst({
      where: {
        botId,
        sessionId: input.sessionId,
      },
      orderBy: { startedAt: 'desc' },
    });

    if (existing) {
      return existing;
    }

    return prisma.conversation.create({
      data: {
        botId,
        sessionId: input.sessionId,
        visitorId: input.visitorId,
        pageUrl: input.pageUrl,
        referrer: input.referrer,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        countryCode: input.countryCode,
        lastMessageAt: new Date(),
        messageCount: 0,
      },
    });
  }

  private async searchSimilarChunks(
    botId: string,
    embedding: number[],
    limit: number = 5,
  ): Promise<any[]> {
    const vectorStr = `[${embedding.join(',')}]`;

    const chunks = await prisma.$queryRawUnsafe(
      `SELECT content, chunk_index
       FROM chunks
       WHERE bot_id = $1
       ORDER BY embedding <=> $2::vector
       LIMIT $3`,
      botId,
      vectorStr,
      limit,
    );

    return chunks as any[];
  }

  private stripThinkTags(text: string): string {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  }
}

export default new ChatService();
