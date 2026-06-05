import { styles } from "./styles";
import { BotConfig, ChatResponse, fetchBotConfig, sendMessage, submitFeedback } from "./api";

const CHAT_ICON = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M11 11h2v2h-2zm0-4h2v2h-2z"/></svg>`;
const CLOSE_ICON = `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
const SEND_ICON = `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
const THUMB_UP = `<svg viewBox="0 0 24 24"><path d="M2 20h3V9H2v11zm19-9c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9.33c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>`;
const THUMB_DOWN = `<svg viewBox="0 0 24 24"><path d="M22 4h-3v11h3V4zm-5 8.5V4c0-1.1-.9-2-2-2H5.7c-.83 0-1.54.5-1.84 1.22L.84 10.27c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V12.5z"/></svg>`;

function uuid(): string {
  return (
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  );
}

function getOrCreateVisitorId(): string {
  let id = localStorage.getItem("ragbot_visitor_id");
  if (!id) {
    id = uuid();
    localStorage.setItem("ragbot_visitor_id", id);
  }
  return id;
}

export class RagBotWidget {
  private config: BotConfig;
  private baseUrl: string;
  private embedKey: string;
  private sessionId: string;
  private visitorId: string;
  private container!: HTMLDivElement;
  private windowEl!: HTMLDivElement;
  private bubbleEl!: HTMLButtonElement;
  private messagesEl!: HTMLDivElement;
  private inputEl!: HTMLInputElement;
  private sendBtnEl!: HTMLButtonElement;
  private isOpen = false;
  private isLoading = false;

  private constructor(config: BotConfig, baseUrl: string, embedKey: string) {
    this.config = config;
    this.baseUrl = baseUrl;
    this.embedKey = embedKey;
    this.sessionId = uuid();
    this.visitorId = getOrCreateVisitorId();
  }

  static async init(baseUrl: string, embedKey: string): Promise<RagBotWidget> {
    const config = await fetchBotConfig(baseUrl, embedKey);
    const widget = new RagBotWidget(config, baseUrl, embedKey);
    widget.render();
    return widget;
  }

  private render(): void {
    this.injectStyles();
    this.container = document.createElement("div");
    this.container.id = "ragbot-widget-container";

    this.container.innerHTML = `
      <button id="ragbot-bubble" aria-label="Open chat">
        <span class="ragbot-chat-icon">${CHAT_ICON}</span>
        <span class="ragbot-close-icon">${CLOSE_ICON}</span>
      </button>
      <div id="ragbot-window">
        <div id="ragbot-header">
          <div>
            <div id="ragbot-header-title">${this.config.widgetConfig?.title || this.config.name || "Chat"}</div>
            <div id="ragbot-header-status">${this.config.widgetConfig?.description || "Ask me anything"}</div>
          </div>
          <button id="ragbot-close-btn" aria-label="Close chat">${CLOSE_ICON}</button>
        </div>
        <div id="ragbot-messages"></div>
        <div id="ragbot-input-area">
          <input id="ragbot-input" type="text" placeholder="Type your message..." autocomplete="off" />
          <button id="ragbot-send-btn" aria-label="Send message">${SEND_ICON}</button>
        </div>
        <div id="ragbot-watermark">Powered by <a href="#" target="_blank">RAG Platform</a></div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.bubbleEl = this.container.querySelector("#ragbot-bubble")!;
    this.windowEl = this.container.querySelector("#ragbot-window")!;
    this.messagesEl = this.container.querySelector("#ragbot-messages")!;
    this.inputEl = this.container.querySelector("#ragbot-input")!;
    this.sendBtnEl = this.container.querySelector("#ragbot-send-btn")!;

    this.applyTheme();
    this.addEventListeners();
  }

  private applyTheme(): void {
    const wc = this.config.widgetConfig;
    if (!wc) return;
    const style = this.container.style;
    if (wc.primaryColor) {
      style.setProperty("--ragbot-primary", wc.primaryColor);
      style.setProperty("--ragbot-primary-hover", this.darken(wc.primaryColor));
    }
    if (wc.headerTextColor)
      style.setProperty("--ragbot-header-text", wc.headerTextColor);
    if (wc.userMsgTextColor)
      style.setProperty("--ragbot-user-msg-text", wc.userMsgTextColor);
    if (wc.botMsgBg) style.setProperty("--ragbot-bot-msg-bg", wc.botMsgBg);
    if (wc.botMsgTextColor)
      style.setProperty("--ragbot-bot-msg-text", wc.botMsgTextColor);
    if (wc.bgColor) style.setProperty("--ragbot-bg", wc.bgColor);
  }

  private darken(hex: string): string {
    const c = hex.replace("#", "");
    const r = Math.max(0, parseInt(c.substring(0, 2), 16) - 30);
    const g = Math.max(0, parseInt(c.substring(2, 4), 16) - 30);
    const b = Math.max(0, parseInt(c.substring(4, 6), 16) - 30);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  private injectStyles(): void {
    const id = "ragbot-widget-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = styles;
    document.head.appendChild(style);
  }

  private addEventListeners(): void {
    this.bubbleEl.addEventListener("click", () => this.toggle());
    document
      .querySelector("#ragbot-close-btn")!
      .addEventListener("click", () => this.close());
    this.sendBtnEl.addEventListener("click", () => this.send());
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.send();
    });
  }

  private toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  private open(): void {
    this.isOpen = true;
    this.bubbleEl.classList.add("ragbot-open");
    this.windowEl.classList.add("ragbot-open");
    this.inputEl.focus();
    if (this.messagesEl.children.length === 0) {
      this.addBotMessage(`Hello! How can I help you today?`);
    }
  }

  private close(): void {
    this.isOpen = false;
    this.bubbleEl.classList.remove("ragbot-open");
    this.windowEl.classList.remove("ragbot-open");
  }

  private async send(): Promise<void> {
    const text = this.inputEl.value.trim();
    if (!text || this.isLoading) return;

    this.inputEl.value = "";
    this.addUserMessage(text);
    this.showTyping();
    this.setLoading(true);

    try {
      const res = await sendMessage(
        this.baseUrl,
        this.embedKey,
        this.sessionId,
        this.visitorId,
        text,
        window.location.href,
        document.referrer,
      );
      this.hideTyping();
      this.addBotMessage(res.reply, res.messageId);
    } catch (err: any) {
      this.hideTyping();
      this.addErrorMessage(
        err.message || "Something went wrong. Please try again.",
      );
    } finally {
      this.setLoading(false);
    }
  }

  private addUserMessage(text: string): void {
    const el = document.createElement("div");
    el.className = "ragbot-message ragbot-message-user";
    el.textContent = text;
    this.messagesEl.appendChild(el);
    this.scrollToBottom();
  }

  private addBotMessage(text: string, messageId?: string): void {
    const el = document.createElement("div");
    el.className = "ragbot-message ragbot-message-bot";
    if (messageId) el.dataset.messageId = messageId;
    el.innerHTML = this.formatMessage(text);

    if (messageId) {
      const feedback = document.createElement("div");
      feedback.className = "ragbot-feedback";
      feedback.innerHTML = `
        <button class="ragbot-thumb" data-type="thumbs_up" title="Helpful">${THUMB_UP}</button>
        <button class="ragbot-thumb" data-type="thumbs_down" title="Not helpful">${THUMB_DOWN}</button>
      `;
      feedback.addEventListener("click", (e) => {
        const btn = (e.target as HTMLElement).closest(".ragbot-thumb") as HTMLButtonElement | null;
        if (!btn) return;
        this.handleFeedback(el, btn);
      });
      el.appendChild(feedback);
    }

    this.messagesEl.appendChild(el);
    this.scrollToBottom();
  }

  private async handleFeedback(el: HTMLDivElement, btn: HTMLButtonElement): Promise<void> {
    const messageId = el.dataset.messageId;
    if (!messageId) return;

    const current = el.dataset.feedback || "";
    const clicked = btn.dataset.type as "thumbs_up" | "thumbs_down";
    const newType = current === clicked ? "none" : clicked;

    this.setFeedbackState(el, newType);

    try {
      await submitFeedback(this.baseUrl, this.embedKey, messageId, newType);
    } catch {
      this.setFeedbackState(el, current);
    }
  }

  private setFeedbackState(el: HTMLDivElement, type: string): void {
    el.dataset.feedback = type;
    const thumbs = el.querySelectorAll<HTMLButtonElement>(".ragbot-thumb");
    thumbs.forEach((t) => {
      t.classList.toggle("active", t.dataset.type === type);
    });
  }

  private formatMessage(text: string): string {
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const inline = (s: string) =>
      s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
       .replace(/\*(.+?)\*/g, "<em>$1</em>");
    const lines = escaped.split("\n");
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^###\s+(.+)/.test(line)) {
        out.push(`<h3>${inline(line.replace(/^###\s+/, ""))}</h3>`);
      } else if (/^##\s+(.+)/.test(line)) {
        out.push(`<h2>${inline(line.replace(/^##\s+/, ""))}</h2>`);
      } else if (/^-{3,}$/.test(line.trim())) {
        out.push("<hr>");
      } else {
        out.push(inline(line));
        if (i < lines.length - 1) out.push("<br>");
      }
    }
    return out.join("");
  }

  private addErrorMessage(text: string): void {
    const el = document.createElement("div");
    el.className = "ragbot-message ragbot-message-error";
    el.textContent = text;
    this.messagesEl.appendChild(el);
    this.scrollToBottom();
  }

  private showTyping(): void {
    const el = document.createElement("div");
    el.className = "ragbot-typing";
    el.id = "ragbot-typing-indicator";
    el.innerHTML = "<span></span><span></span><span></span>";
    this.messagesEl.appendChild(el);
    this.scrollToBottom();
  }

  private hideTyping(): void {
    const el = document.getElementById("ragbot-typing-indicator");
    if (el) el.remove();
  }

  private setLoading(v: boolean): void {
    this.isLoading = v;
    this.sendBtnEl.disabled = v;
    this.inputEl.disabled = v;
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    });
  }
}
