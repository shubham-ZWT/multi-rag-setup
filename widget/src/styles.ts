export const styles = `
  #ragbot-widget-container *,
  #ragbot-widget-container *::before,
  #ragbot-widget-container *::after {
    box-sizing: border-box;
  }

  #ragbot-widget-container {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    z-index: 2147483647;
    position: fixed;
    bottom: 24px;
    right: 24px;
    direction: ltr;
  }

  #ragbot-bubble {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--ragbot-primary, #2563eb);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: transform 0.2s, box-shadow 0.2s;
    border: none;
    outline: none;
    position: relative;
  }

  #ragbot-bubble:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  }

  #ragbot-bubble svg {
    width: 28px;
    height: 28px;
    fill: white;
  }

  #ragbot-bubble .ragbot-close-icon {
    display: none;
  }

  #ragbot-bubble.ragbot-open .ragbot-chat-icon {
    display: none;
  }

  #ragbot-bubble.ragbot-open .ragbot-close-icon {
    display: block;
  }

  #ragbot-window {
    position: absolute;
    bottom: 76px;
    right: 0;
    width: 380px;
    height: 560px;
    max-height: calc(100vh - 120px);
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    display: none;
    flex-direction: column;
    overflow: hidden;
    animation: ragbot-slide-up 0.25s ease-out;
  }

  #ragbot-window.ragbot-open {
    display: flex;
  }

  @keyframes ragbot-slide-up {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  #ragbot-header {
    background: var(--ragbot-primary, #2563eb);
    color: var(--ragbot-header-text, white);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  #ragbot-header-title {
    font-size: 16px;
    font-weight: 600;
  }

  #ragbot-header-status {
    font-size: 12px;
    opacity: 0.85;
    margin-top: 2px;
  }

  #ragbot-close-btn {
    background: none;
    border: none;
    color: var(--ragbot-header-text, white);
    cursor: pointer;
    padding: 4px;
    display: flex;
    opacity: 0.8;
  }

  #ragbot-close-btn:hover { opacity: 1; }

  #ragbot-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px 18px; /* more breathing room */
    display: flex;
    flex-direction: column;
    gap: 10px; /* slightly larger gaps between messages */
    background: var(--ragbot-bg, #f8fafc);
  }

  .ragbot-message {
    max-width: 85%;
    padding: 12px 16px; /* increased padding for readability */
    border-radius: 14px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
    white-space: pre-wrap; /* preserve simple formatting */
    animation: ragbot-fade-in 0.2s ease-out;
  }

  @keyframes ragbot-fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ragbot-message-bot {
    background: var(--ragbot-bot-msg-bg, white);
    color: var(--ragbot-bot-msg-text, #1e293b);
    align-self: flex-start;
    border-bottom-left-radius: 6px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    padding: 14px;
  }

  .ragbot-message-bot h2,
  .ragbot-message-bot h3 {
    margin: 8px 0 4px;
    font-weight: 600;
    line-height: 1.3;
  }

  .ragbot-message-bot h2 { font-size: 15px; }
  .ragbot-message-bot h3 { font-size: 14px; }

  .ragbot-message-bot hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 10px 0;
  }

  .ragbot-feedback {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px solid #e2e8f0;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .ragbot-message-bot:hover .ragbot-feedback {
    opacity: 1;
  }

  .ragbot-thumb {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.15s, opacity 0.15s;
    opacity: 0.6;
    width: 24px;
    height: 24px;
  }

  .ragbot-thumb:hover {
    background: rgba(0,0,0,0.06);
    opacity: 1;
  }

  .ragbot-thumb svg {
    width: 16px;
    height: 16px;
    fill: var(--ragbot-bot-msg-text, #64748b);
    transition: fill 0.15s;
  }

  .ragbot-thumb.active {
    opacity: 1;
  }

  .ragbot-thumb.active[data-type="thumbs_up"] svg {
    fill: #22c55e;
  }

  .ragbot-thumb.active[data-type="thumbs_down"] svg {
    fill: #ef4444;
  }

  .ragbot-message-user {
    background: var(--ragbot-primary, #2563eb);
    color: var(--ragbot-user-msg-text, white);
    align-self: flex-end;
    border-bottom-right-radius: 6px;
    padding: 12px 16px;
    display: inline-block; /* shrink to content while keeping padding */
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }

  .ragbot-message-error {
    background: #fef2f2;
    color: #dc2626;
    align-self: flex-start;
    font-size: 13px;
  }

  .ragbot-typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
    align-self: flex-start;
  }

  .ragbot-typing span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--ragbot-primary, #2563eb);
    animation: ragbot-bounce 1.2s infinite;
  }

  .ragbot-typing span:nth-child(2) { animation-delay: 0.2s; }
  .ragbot-typing span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes ragbot-bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-6px); }
  }

  #ragbot-input-area {
    display: flex;
    padding: 14px 16px; /* a touch more vertical padding */
    gap: 10px;
    border-top: 1px solid #e2e8f0;
    background: white;
    flex-shrink: 0;
  }

  #ragbot-input {
    flex: 1;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    outline: none;
    font-family: inherit;
    transition: border-color 0.2s;
    color: #1e293b;
  }

  #ragbot-input:focus {
    border-color: var(--ragbot-primary, #2563eb);
  }

  #ragbot-input::placeholder {
    color: #94a3b8;
  }

  #ragbot-send-btn {
    background: var(--ragbot-primary, #2563eb);
    color: var(--ragbot-user-msg-text, white);
    border: none;
    border-radius: 10px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  #ragbot-send-btn:hover { background: var(--ragbot-primary-hover, #1d4ed8); }
  #ragbot-send-btn:disabled { background: #94a3b8; cursor: not-allowed; }

  #ragbot-send-btn svg {
    width: 18px;
    height: 18px;
    fill: var(--ragbot-user-msg-text, white);
  }

  @media (max-width: 480px) {
    #ragbot-window {
      width: 100vw;
      height: 100vh;
      max-height: 100vh;
      bottom: 0;
      right: 0;
      border-radius: 0;
      position: fixed;
      top: 0;
      left: 0;
    }

    #ragbot-widget-container {
      bottom: 0;
      right: 0;
    }

    #ragbot-bubble {
      position: fixed;
      bottom: 20px;
      right: 20px;
    }
  }

  #ragbot-watermark {
    text-align: center;
    font-size: 11px;
    color: #94a3b8;
    padding: 6px;
    background: white;
    border-top: 1px solid #f1f5f9;
    flex-shrink: 0;
  }

  #ragbot-watermark a {
    color: var(--ragbot-primary, #2563eb);
    text-decoration: none;
  }
`;
