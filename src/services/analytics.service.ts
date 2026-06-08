import { prisma } from "../lib/prisma";

class AnalyticsService {
  async aggregateDaily() {
    await prisma.$executeRawUnsafe(`
      INSERT INTO bot_analytics_daily (
        id, bot_id, date,
        total_conversations, total_messages, unique_visitors,
        avg_messages_per_conv, avg_confidence_score,
        total_tokens_used, avg_latency_ms,
        thumbs_up, thumbs_down,
        created_at
      )
      WITH aggregated AS (
        SELECT
          c.bot_id,
          c.started_at::date AS date,
          COUNT(DISTINCT c.id) AS total_conversations,
          COUNT(m.id) AS total_messages,
          COUNT(DISTINCT c.visitor_id) AS unique_visitors,
          CASE WHEN COUNT(DISTINCT c.id) > 0
            THEN ROUND(COUNT(m.id)::decimal / COUNT(DISTINCT c.id), 2) ELSE 0
          END AS avg_messages_per_conv,
          COALESCE(ROUND(AVG(m.confidence_score), 2), 0) AS avg_confidence_score,
          COALESCE(SUM(m.input_tokens + m.output_tokens), 0) AS total_tokens_used,
          COALESCE(ROUND(AVG(m.latency_ms)), 0) AS avg_latency_ms,
          COUNT(DISTINCT mf.id) FILTER (WHERE mf.feedback_type = 'thumbs_up') AS thumbs_up,
          COUNT(DISTINCT mf.id) FILTER (WHERE mf.feedback_type = 'thumbs_down') AS thumbs_down
        FROM conversations c
        JOIN messages m ON m.conversation_id = c.id
        LEFT JOIN message_feedback mf ON mf.message_id = m.id
        WHERE c.started_at >= NOW() - INTERVAL '30 days'
        GROUP BY c.bot_id, c.started_at::date
      )
      SELECT
        gen_random_uuid(), bot_id, date,
        total_conversations, total_messages, unique_visitors,
        avg_messages_per_conv, avg_confidence_score,
        total_tokens_used, avg_latency_ms,
        thumbs_up, thumbs_down,
        NOW()
      FROM aggregated
      ON CONFLICT (bot_id, date)
      DO UPDATE SET
        total_conversations = EXCLUDED.total_conversations,
        total_messages = EXCLUDED.total_messages,
        unique_visitors = EXCLUDED.unique_visitors,
        avg_messages_per_conv = EXCLUDED.avg_messages_per_conv,
        avg_confidence_score = EXCLUDED.avg_confidence_score,
        total_tokens_used = EXCLUDED.total_tokens_used,
        avg_latency_ms = EXCLUDED.avg_latency_ms,
        thumbs_up = EXCLUDED.thumbs_up,
        thumbs_down = EXCLUDED.thumbs_down;
    `);

    console.log(`[Analytics] Aggregated data updated`);
  }

  async getOverview(userId: string) {
    const rows = await prisma.botAnalyticsDaily.findMany({
      where: { bot: { userId } },
      orderBy: { date: "desc" },
      take: 30,
    });
    return this.buildAnalyticsResponse(rows);
  }

  async getBotAnalytics(botId: string) {
    const rows = await prisma.botAnalyticsDaily.findMany({
      where: { botId },
      orderBy: { date: "desc" },
      take: 30,
    });
    return this.buildAnalyticsResponse(rows);
  }

  private buildAnalyticsResponse(
    rows: {
      totalMessages: number;
      totalConversations: number;
      uniqueVisitors: number;
      totalTokensUsed: number;
      avgLatencyMs: number;
      thumbsUp: number;
      thumbsDown: number;
    }[],
  ) {
    const totals = rows.reduce(
      (acc, r) => ({
        totalMessages: acc.totalMessages + r.totalMessages,
        totalConversations: acc.totalConversations + r.totalConversations,
        totalVisitors: acc.totalVisitors + r.uniqueVisitors,
        totalTokens: acc.totalTokens + r.totalTokensUsed,
        sumLatency: acc.sumLatency + r.totalMessages * r.avgLatencyMs,
        thumbsUp: acc.thumbsUp + r.thumbsUp,
        thumbsDown: acc.thumbsDown + r.thumbsDown,
      }),
      {
        totalMessages: 0,
        totalConversations: 0,
        totalVisitors: 0,
        totalTokens: 0,
        sumLatency: 0,
        thumbsUp: 0,
        thumbsDown: 0,
      },
    );

    const aggMessages = totals.totalMessages || 1;
    const totalThumbs = totals.thumbsUp + totals.thumbsDown;

    return {
      daily: rows,
      summary: {
        totalMessages: totals.totalMessages,
        totalConversations: totals.totalConversations,
        uniqueVisitors: totals.totalVisitors,
        totalTokensUsed: totals.totalTokens,
        avgLatencyMs: Math.round(totals.sumLatency / aggMessages),
        thumbsUpPercent:
          totalThumbs > 0
            ? Math.round((totals.thumbsUp / totalThumbs) * 100)
            : 0,
      },
    };
  }
}

export default new AnalyticsService();
