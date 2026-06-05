(function(){"use strict";const l=`
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
`;async function c(i,t){const e=await fetch(`${i}/widget/${t}/config`);if(!e.ok){const a=await e.text();throw new Error(a||`Failed to load bot config (${e.status})`)}return e.json()}async function p(i,t,e,a,o,r,s){const n=await fetch(`${i}/widget/${t}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:e,visitorId:a,message:o,pageUrl:r,referrer:s})});if(!n.ok){const w=await n.text();throw new Error(w||`Chat request failed (${n.status})`)}return n.json()}async function h(i,t,e,a){const o=await fetch(`${i}/widget/${t}/feedback`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messageId:e,feedbackType:a})});if(!o.ok){const r=await o.text();throw new Error(r||`Feedback request failed (${o.status})`)}}const u='<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M11 11h2v2h-2zm0-4h2v2h-2z"/></svg>',g='<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',m='<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',f='<svg viewBox="0 0 24 24"><path d="M2 20h3V9H2v11zm19-9c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9.33c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>',x='<svg viewBox="0 0 24 24"><path d="M22 4h-3v11h3V4zm-5 8.5V4c0-1.1-.9-2-2-2H5.7c-.83 0-1.54.5-1.84 1.22L.84 10.27c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V12.5z"/></svg>';function b(){var i;return((i=crypto.randomUUID)==null?void 0:i.call(crypto))??`${Date.now()}-${Math.random().toString(36).slice(2,11)}`}function y(){let i=localStorage.getItem("ragbot_visitor_id");return i||(i=b(),localStorage.setItem("ragbot_visitor_id",i)),i}class d{constructor(t,e,a){this.isOpen=!1,this.isLoading=!1,this.config=t,this.baseUrl=e,this.embedKey=a,this.sessionId=b(),this.visitorId=y()}static async init(t,e){const a=await c(t,e),o=new d(a,t,e);return o.render(),o}render(){var t,e;this.injectStyles(),this.container=document.createElement("div"),this.container.id="ragbot-widget-container",this.container.innerHTML=`
      <button id="ragbot-bubble" aria-label="Open chat">
        <span class="ragbot-chat-icon">${u}</span>
        <span class="ragbot-close-icon">${g}</span>
      </button>
      <div id="ragbot-window">
        <div id="ragbot-header">
          <div>
            <div id="ragbot-header-title">${((t=this.config.widgetConfig)==null?void 0:t.title)||this.config.name||"Chat"}</div>
            <div id="ragbot-header-status">${((e=this.config.widgetConfig)==null?void 0:e.description)||"Ask me anything"}</div>
          </div>
          <button id="ragbot-close-btn" aria-label="Close chat">${g}</button>
        </div>
        <div id="ragbot-messages"></div>
        <div id="ragbot-input-area">
          <input id="ragbot-input" type="text" placeholder="Type your message..." autocomplete="off" />
          <button id="ragbot-send-btn" aria-label="Send message">${m}</button>
        </div>
        <div id="ragbot-watermark">Powered by <a href="#" target="_blank">RAG Platform</a></div>
      </div>
    `,document.body.appendChild(this.container),this.bubbleEl=this.container.querySelector("#ragbot-bubble"),this.windowEl=this.container.querySelector("#ragbot-window"),this.messagesEl=this.container.querySelector("#ragbot-messages"),this.inputEl=this.container.querySelector("#ragbot-input"),this.sendBtnEl=this.container.querySelector("#ragbot-send-btn"),this.applyTheme(),this.addEventListeners()}applyTheme(){const t=this.config.widgetConfig;if(!t)return;const e=this.container.style;t.primaryColor&&(e.setProperty("--ragbot-primary",t.primaryColor),e.setProperty("--ragbot-primary-hover",this.darken(t.primaryColor))),t.headerTextColor&&e.setProperty("--ragbot-header-text",t.headerTextColor),t.userMsgTextColor&&e.setProperty("--ragbot-user-msg-text",t.userMsgTextColor),t.botMsgBg&&e.setProperty("--ragbot-bot-msg-bg",t.botMsgBg),t.botMsgTextColor&&e.setProperty("--ragbot-bot-msg-text",t.botMsgTextColor),t.bgColor&&e.setProperty("--ragbot-bg",t.bgColor)}darken(t){const e=t.replace("#",""),a=Math.max(0,parseInt(e.substring(0,2),16)-30),o=Math.max(0,parseInt(e.substring(2,4),16)-30),r=Math.max(0,parseInt(e.substring(4,6),16)-30);return`#${a.toString(16).padStart(2,"0")}${o.toString(16).padStart(2,"0")}${r.toString(16).padStart(2,"0")}`}injectStyles(){const t="ragbot-widget-styles";if(document.getElementById(t))return;const e=document.createElement("style");e.id=t,e.textContent=l,document.head.appendChild(e)}addEventListeners(){this.bubbleEl.addEventListener("click",()=>this.toggle()),document.querySelector("#ragbot-close-btn").addEventListener("click",()=>this.close()),this.sendBtnEl.addEventListener("click",()=>this.send()),this.inputEl.addEventListener("keydown",t=>{t.key==="Enter"&&this.send()})}toggle(){this.isOpen?this.close():this.open()}open(){this.isOpen=!0,this.bubbleEl.classList.add("ragbot-open"),this.windowEl.classList.add("ragbot-open"),this.inputEl.focus(),this.messagesEl.children.length===0&&this.addBotMessage("Hello! How can I help you today?")}close(){this.isOpen=!1,this.bubbleEl.classList.remove("ragbot-open"),this.windowEl.classList.remove("ragbot-open")}async send(){const t=this.inputEl.value.trim();if(!(!t||this.isLoading)){this.inputEl.value="",this.addUserMessage(t),this.showTyping(),this.setLoading(!0);try{const e=await p(this.baseUrl,this.embedKey,this.sessionId,this.visitorId,t,window.location.href,document.referrer);this.hideTyping(),this.addBotMessage(e.reply,e.messageId)}catch(e){this.hideTyping(),this.addErrorMessage(e.message||"Something went wrong. Please try again.")}finally{this.setLoading(!1)}}}addUserMessage(t){const e=document.createElement("div");e.className="ragbot-message ragbot-message-user",e.textContent=t,this.messagesEl.appendChild(e),this.scrollToBottom()}addBotMessage(t,e){const a=document.createElement("div");if(a.className="ragbot-message ragbot-message-bot",e&&(a.dataset.messageId=e),a.innerHTML=this.formatMessage(t),e){const o=document.createElement("div");o.className="ragbot-feedback",o.innerHTML=`
        <button class="ragbot-thumb" data-type="thumbs_up" title="Helpful">${f}</button>
        <button class="ragbot-thumb" data-type="thumbs_down" title="Not helpful">${x}</button>
      `,o.addEventListener("click",r=>{const s=r.target.closest(".ragbot-thumb");s&&this.handleFeedback(a,s)}),a.appendChild(o)}this.messagesEl.appendChild(a),this.scrollToBottom()}async handleFeedback(t,e){const a=t.dataset.messageId;if(!a)return;const o=t.dataset.feedback||"",r=e.dataset.type,s=o===r?"none":r;this.setFeedbackState(t,s);try{await h(this.baseUrl,this.embedKey,a,s)}catch{this.setFeedbackState(t,o)}}setFeedbackState(t,e){t.dataset.feedback=e,t.querySelectorAll(".ragbot-thumb").forEach(o=>{o.classList.toggle("active",o.dataset.type===e)})}formatMessage(t){const e=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),a=s=>s.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>"),o=e.split(`
`),r=[];for(let s=0;s<o.length;s++){const n=o[s];/^###\s+(.+)/.test(n)?r.push(`<h3>${a(n.replace(/^###\s+/,""))}</h3>`):/^##\s+(.+)/.test(n)?r.push(`<h2>${a(n.replace(/^##\s+/,""))}</h2>`):/^-{3,}$/.test(n.trim())?r.push("<hr>"):(r.push(a(n)),s<o.length-1&&r.push("<br>"))}return r.join("")}addErrorMessage(t){const e=document.createElement("div");e.className="ragbot-message ragbot-message-error",e.textContent=t,this.messagesEl.appendChild(e),this.scrollToBottom()}showTyping(){const t=document.createElement("div");t.className="ragbot-typing",t.id="ragbot-typing-indicator",t.innerHTML="<span></span><span></span><span></span>",this.messagesEl.appendChild(t),this.scrollToBottom()}hideTyping(){const t=document.getElementById("ragbot-typing-indicator");t&&t.remove()}setLoading(t){this.isLoading=t,this.sendBtnEl.disabled=t,this.inputEl.disabled=t}scrollToBottom(){requestAnimationFrame(()=>{this.messagesEl.scrollTop=this.messagesEl.scrollHeight})}}(function(){const t=document.currentScript;if(!t)return;const e=t.getAttribute("data-bot-key");if(!e){console.error("[RagBotWidget] Missing data-bot-key attribute on the script tag.");return}const a=t.getAttribute("data-base-url")||(()=>{const o=t.src;try{const r=new URL(o);return`${r.protocol}//${r.host}`}catch{return""}})();document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{d.init(a,e).catch(o=>console.error("[RagBotWidget] Init failed:",o))}):d.init(a,e).catch(o=>console.error("[RagBotWidget] Init failed:",o))})()})();
