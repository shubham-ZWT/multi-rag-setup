import { RagBotWidget } from "./widget";

(function boot() {
  const script = document.currentScript as HTMLScriptElement | null;
  if (!script) return;

  const embedKey = script.getAttribute("data-bot-key");
  if (!embedKey) {
    console.error("[RagBotWidget] Missing data-bot-key attribute on the script tag.");
    return;
  }

  const baseUrl = script.getAttribute("data-base-url") || (() => {
    const src = script.src;
    try {
      const url = new URL(src);
      return `${url.protocol}//${url.host}`;
    } catch {
      return "";
    }
  })();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      RagBotWidget.init(baseUrl, embedKey).catch((err) =>
        console.error("[RagBotWidget] Init failed:", err)
      );
    });
  } else {
    RagBotWidget.init(baseUrl, embedKey).catch((err) =>
      console.error("[RagBotWidget] Init failed:", err)
    );
  }
})();
