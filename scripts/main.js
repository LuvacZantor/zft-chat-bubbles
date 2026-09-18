console.log("[ZFT] 🫧 v1.3.9 | ZFT Chat Bubbles module script loaded");

import {registerSettings, debugEnabled} from "./settings.js";
import {ZFTBubbleConfig} from "./ui/bubble-config.js";
import {ZFTBubbleManager} from "./core/bubble-manager.js";

const manager=new ZFTBubbleManager();

Hooks.once("init", () => {
  registerSettings();
  console.log("[ZFT] ⚙️ v1.3.9 | ZFT Chat Bubbles settings registered");
});

Hooks.once("ready", () => {
  manager.initialize();

  Hooks.on("createChatMessage", (message) => {
    if (debugEnabled()) console.log("[ZFT] 💬 v1.3.9 | ChatMessage received", {
      messageId:message.id,
      style:message.style ?? message.type,
      speaker:message.speaker
    });
    manager.handleMessage(message);
  });

  const coreBubbles=game.settings.get("core","chatBubbles");
  if (coreBubbles) {
    ui.notifications?.warn("ZFT Chat Bubbles: Disable Foundry's core “Enable Chat Bubbles” setting to prevent duplicate bubbles.");
    console.warn("[ZFT] ⚠️ v1.3.9 | Core chat bubbles are enabled. Disable Core Settings → Enable Chat Bubbles to prevent duplicate rendering.");
  } else {
    console.log("[ZFT] ✅ v1.3.9 | Core chat bubbles are disabled; ZFT renderer has exclusive bubble ownership");
  }

  if (game.modules.get("polyglot")?.active && game.polyglot) {
    console.log("[ZFT] 🌐 v1.3.9 | Polyglot detected; V13 bubble compatibility enabled");
  } else if (debugEnabled()) {
    console.log("[ZFT] 🌐 v1.3.9 | Polyglot inactive; standard ZFT bubble rendering enabled");
  }

  console.log("[ZFT] 🚀 v1.3.9 | ZFT Chat Bubbles ready");
});


Hooks.on("getSceneControlButtons", controls => {
  const tokenControls=controls.tokens;
  if (!tokenControls?.tools) {
    console.warn("[ZFT] ⚠️ v1.3.9 | Token Controls shortcut not added: token control group unavailable");
    return;
  }

  tokenControls.tools["zft-chat-bubbles-config"]={
    name:"zft-chat-bubbles-config",
    title:"ZFT Chat Bubble Configuration",
    icon:"fa-solid fa-comment-dots zft-chat-bubbles-toolbar-icon",
    button:true,
    visible:true,
    onChange:() => {
      console.log("[ZFT] 🛠️ v1.3.9 | Token Controls configuration shortcut activated");
      ZFTBubbleConfig.open();
    }
  };

  console.log("[ZFT] ✅ v1.3.9 | Token Controls configuration shortcut registered");
});
