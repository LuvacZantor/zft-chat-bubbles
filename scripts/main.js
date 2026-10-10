console.log("[ZFT] 🫧 v1.4.0 | ZFT Chat Bubbles module script loaded");

import { registerSettings, debugEnabled } from "./settings.js";
import { ZFTBubbleConfig } from "./ui/bubble-config.js";
import { ZFTBubbleManager } from "./core/bubble-manager.js";

const manager = new ZFTBubbleManager();
const MODULE_ID = "zft-chat-bubbles";

Hooks.once("init", () => {
  registerSettings();
  console.log("[ZFT] ⚙️ v1.4.0 | ZFT Chat Bubbles settings registered");
});

Hooks.once("ready", () => {
  manager.initialize();

  Hooks.on("createChatMessage", (message) => {
    if (debugEnabled()) {
      console.log("[ZFT] 💬 v1.4.0 | ChatMessage received", {
        messageId: message.id,
        style: message.style ?? message.type,
        speaker: message.speaker
      });
    }
    manager.handleMessage(message);
  });

  const coreBubbles = game.settings.get("core", "chatBubbles");
  if (coreBubbles) {
    ui.notifications?.warn("ZFT Chat Bubbles: Disable Foundry's core “Enable Chat Bubbles” setting to prevent duplicate bubbles.");
    console.warn("[ZFT] ⚠️ v1.4.0 | Core chat bubbles are enabled. Disable Core Settings → Enable Chat Bubbles to prevent duplicate rendering.");
  } else {
    console.log("[ZFT] ✅ v1.4.0 | Core chat bubbles are disabled; ZFT renderer has exclusive bubble ownership");
  }

  if (game.modules.get("polyglot")?.active && game.polyglot) {
    console.log("[ZFT] 🌐 v1.4.0 | Polyglot detected; V13 bubble compatibility enabled");
  } else if (debugEnabled()) {
    console.log("[ZFT] 🌐 v1.4.0 | Polyglot inactive; standard ZFT bubble rendering enabled");
  }

  console.log("[ZFT] 🚀 v1.4.0 | ZFT Chat Bubbles ready");
});

Hooks.on("zft-tools.collectTools", (tools) => {
  if (!game.user) return;

  tools[MODULE_ID] = {
    name: MODULE_ID,
    title: "ZFT Chat Bubble Configuration",
    icon: "fa-solid fa-comment-dots",
    order: 20,
    gmOnly: false,
    button: true,
    visible: true,
    onChange: () => {
      console.log("[ZFT] 🛠️ v1.4.0 | ZFT Tools configuration shortcut activated");
      ZFTBubbleConfig.open();
    }
  };

  console.log("[ZFT] ✅ v1.4.0 | ZFT Tools configuration shortcut registered");
});
