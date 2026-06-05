export interface BotConfig {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  widgetConfig: {
    primaryColor?: string;
    headerTextColor?: string;
    userMsgTextColor?: string;
    botMsgBg?: string;
    botMsgTextColor?: string;
    bgColor?: string;
    title?: string;
    description?: string;
    position?: 'right' | 'left';
  };
}

export interface ChatResponse {
  reply: string;
  sources: { content: string; chunkIndex: number }[];
  conversationId: string;
  messageId: string;
}

export async function fetchBotConfig(baseUrl: string, embedKey: string): Promise<BotConfig> {
  const res = await fetch(`${baseUrl}/widget/${embedKey}/config`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Failed to load bot config (${res.status})`);
  }
  return res.json();
}

export async function sendMessage(
  baseUrl: string,
  embedKey: string,
  sessionId: string,
  visitorId: string,
  message: string,
  pageUrl?: string,
  referrer?: string,
): Promise<ChatResponse> {
  const res = await fetch(`${baseUrl}/widget/${embedKey}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, visitorId, message, pageUrl, referrer }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Chat request failed (${res.status})`);
  }
  return res.json();
}

export async function submitFeedback(
  baseUrl: string,
  embedKey: string,
  messageId: string,
  feedbackType: 'thumbs_up' | 'thumbs_down' | 'none',
): Promise<void> {
  const res = await fetch(`${baseUrl}/widget/${embedKey}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId, feedbackType }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Feedback request failed (${res.status})`);
  }
}
