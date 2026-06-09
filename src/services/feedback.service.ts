import { prisma } from '../lib/prisma';

type FeedbackType = 'thumbs_up' | 'thumbs_down' | 'none';

class FeedbackService {
  async submitFeedback(
    botId: string,
    messageId: string,
    feedbackType: FeedbackType,
  ) {
    const existing = await prisma.messageFeedback.findFirst({
      where: { messageId },
      orderBy: { createdAt: 'desc' },
    });

    const oldType: FeedbackType | null =
      existing?.feedbackType as FeedbackType | null;
    if (oldType === feedbackType) {
      return { success: true };
    }

    if (feedbackType === 'none' && existing) {
      await prisma.messageFeedback.delete({ where: { id: existing.id } });
    } else if (existing) {
      await prisma.messageFeedback.update({
        where: { id: existing.id },
        data: { feedbackType },
      });
    } else {
      await prisma.messageFeedback.create({
        data: { messageId, feedbackType },
      });
    }

    await this.updateDailyAnalytics(botId, oldType, feedbackType);

    return { success: true };
  }

  private async updateDailyAnalytics(
    botId: string,
    oldType: FeedbackType | null,
    newType: FeedbackType,
  ) {
    let deltaUp = 0;
    let deltaDown = 0;

    if (oldType === 'thumbs_up') deltaUp -= 1;
    if (oldType === 'thumbs_down') deltaDown -= 1;
    if (newType === 'thumbs_up') deltaUp += 1;
    if (newType === 'thumbs_down') deltaDown += 1;

    if (deltaUp === 0 && deltaDown === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.botAnalyticsDaily.upsert({
      where: { botId_date: { botId, date: today } },
      create: {
        botId,
        date: today,
        thumbsUp: Math.max(0, deltaUp),
        thumbsDown: Math.max(0, deltaDown),
      },
      update: {
        thumbsUp: { increment: deltaUp },
        thumbsDown: { increment: deltaDown },
      },
    });
  }
}

export default new FeedbackService();
