import {calculateDuration, debugEnabled, stripHTML, getUserColors} from "../settings.js";
import {getPolyglotPresentation} from "../integrations/polyglot.js";

export class ZFTBubbleManager {
  constructor() {
    this.active = new Map();
    this.layer = null;
    this.raf = null;
  }

  initialize() {
    this.ensureLayer();
    window.addEventListener("resize", () => this.requestPositionUpdate(), {passive:true});
    Hooks.on("canvasPan", () => this.requestPositionUpdate());
    Hooks.on("canvasReady", () => {
      this.clearAll();
      this.ensureLayer();
    });
    console.log("[ZFT] ✅ v1.3.9 | ZFT-owned bubble renderer initialized");
  }

  ensureLayer() {
    let layer=document.getElementById("zft-chat-bubbles");
    if (!layer) {
      layer=document.createElement("div");
      layer.id="zft-chat-bubbles";
      layer.setAttribute("aria-live","polite");
      document.body.append(layer);
    }
    this.layer=layer;
    return layer;
  }

  handleMessage(message) {
    if (!canvas?.ready) return;
    if (!this.isBubbleMessage(message)) return;

    const token=this.resolveSpeakerToken(message);
    if (!token) {
      if (debugEnabled()) console.log("[ZFT] 🔎 v1.3.9 | Message skipped: no active-scene speaker token", {messageId:message.id});
      return;
    }

    const content=this.getBubbleContent(message);
    if (!content) return;

    const presentation=getPolyglotPresentation(message, content);
    this.show(token, presentation, message);
  }

  isBubbleMessage(message) {
    // V13 CONST.CHAT_MESSAGE_STYLES: IC and EMOTE are the core bubble-producing styles.
    const style=message.style ?? message.type;
    const styles=CONST.CHAT_MESSAGE_STYLES ?? CONST.CHAT_MESSAGE_TYPES ?? {};
    const ic=styles.IC;
    const emote=styles.EMOTE;
    return style === ic || style === emote;
  }

  resolveSpeakerToken(message) {
    const speaker=message.speaker ?? {};
    const sceneId=speaker.scene ?? canvas.scene?.id;
    if (sceneId !== canvas.scene?.id) return null;

    if (speaker.token) {
      const direct=canvas.tokens?.get(speaker.token);
      if (direct) return direct;
    }

    if (speaker.actor) {
      const matches=canvas.tokens?.placeables?.filter(t => t.actor?.id === speaker.actor) ?? [];
      if (matches.length === 1) return matches[0];
      if (matches.length > 1 && debugEnabled()) {
        console.warn("[ZFT] ⚠️ v1.3.9 | Multiple active-scene tokens match speaker actor; token ID was absent", {
          actorId:speaker.actor, count:matches.length
        });
      }
    }
    return null;
  }

  getBubbleContent(message) {
    const content=stripHTML(message.content ?? "").trim();
    return content || null;
  }

  show(token, presentation, message) {
    this.remove(token.id, "replacement");

    const content=presentation.content;

    const layer=this.ensureLayer();
    const bubble=document.createElement("div");
    bubble.className="zft-chat-bubble";
    bubble.dataset.tokenId=token.id;
    this.applyColors(bubble, message);

    const body=document.createElement("div");
    body.className="zft-chat-bubble__content";

    if (presentation.polyglot && presentation.showOriginal) {
      const original=document.createElement("div");
      original.className="zft-chat-bubble__polyglot-original";
      original.textContent=presentation.originalText ?? content;

      if (presentation.originalFont) original.style.font=presentation.originalFont;

      body.append(original);
      bubble.classList.add("zft-chat-bubble--polyglot");

      if (presentation.showTranslation && presentation.translationText) {
        const translation=document.createElement("div");
        translation.className="zft-chat-bubble__polyglot-translation";
        translation.textContent=presentation.translationText;
        body.append(translation);
      }
    } else {
      body.textContent=content;
    }

    if (presentation.language) bubble.dataset.language=presentation.language;

    const tail=document.createElement("div");
    tail.className="zft-chat-bubble__tail";
    bubble.append(body, tail);
    layer.append(bubble);

    const duration=calculateDuration(content);
    const timer=window.setTimeout(() => this.remove(token.id, "duration"), duration);

    this.active.set(token.id,{token,bubble,timer,messageId:message.id});
    this.position(token.id);

    if (debugEnabled()) console.log("[ZFT] 🫧 v1.3.9 | ZFT bubble displayed", {
      tokenId:token.id,
      messageId:message.id,
      durationMs:duration,
      language:presentation.language,
      polyglot:presentation.polyglot,
      polyglotUnknown:presentation.unknown,
      polyglotTranslation:presentation.showTranslation
    });
  }

  applyColors(bubble, message) {
    const speakerUser=message.user ?? game.users?.get(message.user?.id ?? message.user);
    const colors=getUserColors(speakerUser);

    bubble.style.setProperty("--zft-text-color", colors.text);
    bubble.style.setProperty("--zft-background-color", colors.background);
    bubble.style.setProperty("--zft-border-color", colors.border);

    if (debugEnabled()) console.log("[ZFT] 🎨 v1.3.9 | Speaker-owned bubble colors applied", {
      messageId:message.id,
      speakerUserId:speakerUser?.id ?? null,
      textColor:colors.text,
      backgroundColor:colors.background,
      borderColor:colors.border
    });
  }

  position(tokenId) {
    const state=this.active.get(tokenId);
    if (!state?.bubble?.isConnected || !state.token) return;

    const token=state.token;
    const center=token.center;
    if (!center) return;

    // Convert canvas world coordinates to viewport coordinates through the stage transform.
    const global=canvas.stage.worldTransform.apply({x:center.x, y:token.document.y});
    state.bubble.style.left=`${global.x}px`;
    state.bubble.style.top=`${global.y}px`;
  }

  requestPositionUpdate() {
    if (this.raf) return;
    this.raf=requestAnimationFrame(() => {
      this.raf=null;
      for (const tokenId of this.active.keys()) this.position(tokenId);
    });
  }

  remove(tokenId, reason="cleanup") {
    const state=this.active.get(tokenId);
    if (!state) return;
    clearTimeout(state.timer);
    state.bubble?.remove();
    this.active.delete(tokenId);
    if (debugEnabled()) console.log("[ZFT] 🧹 v1.3.9 | ZFT bubble removed", {tokenId, reason});
  }

  clearAll() {
    for (const tokenId of [...this.active.keys()]) this.remove(tokenId,"canvas-change");
  }
}
