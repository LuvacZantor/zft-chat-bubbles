const MODULE_ID = "zft-chat-bubbles";
const POLYGLOT_ID = "polyglot";

function debugEnabled() {
  try {
    return Boolean(game.settings.get(MODULE_ID, "debug"));
  } catch {
    return false;
  }
}

function getSetting(key, fallback=false) {
  try {
    return game.settings.get(POLYGLOT_ID, key);
  } catch {
    return fallback;
  }
}

function isActive() {
  return Boolean(game.modules.get(POLYGLOT_ID)?.active && game.polyglot);
}

function resolveFont(polyglot, language) {
  try {
    const font=polyglot._getFontStyle?.(language) ?? null;
    if (font && debugEnabled()) console.log("[ZFT] 🔠 v1.3.9 | Polyglot language font resolved", {
      language,
      font
    });
    return font;
  } catch (error) {
    console.warn("[ZFT] ⚠️ v1.3.9 | Polyglot language font resolution failed", {
      language,
      error
    });
    return null;
  }
}

export function getPolyglotPresentation(message, content) {
  const fallback={
    content,
    language:null,
    polyglot:false,
    unknown:false,
    showOriginal:false,
    showTranslation:false,
    originalText:null,
    originalFont:null,
    translationText:null
  };

  if (!isActive()) return fallback;

  const polyglot=game.polyglot;
  const language=message.getFlag?.(POLYGLOT_ID, "language") ?? "";

  if (!language) {
    if (debugEnabled()) console.log("[ZFT] ↪️ v1.3.9 | Polyglot skipped: message has no language flag", {
      messageId:message.id
    });
    return fallback;
  }

  try {
    const known=typeof polyglot.isLanguageKnown === "function"
      ? Boolean(polyglot.isLanguageKnown(language))
      : false;

    const understood=typeof polyglot.isLanguageUnderstood === "function"
      ? Boolean(polyglot.isLanguageUnderstood(language))
      : known;

    const runifyGM=Boolean(getSetting("runifyGM", false));
    const gmBypass=Boolean(game.user.isGM && !runifyGM);
    const force=Boolean(message.polyglot_force);
    const hideTranslation=Boolean(message.getFlag?.(POLYGLOT_ID, "hideTranslation"));

    // Polyglot's working chat rendering distinguishes "known" from "understood".
    // For ZFT, the Polyglot-font representation is always available for a
    // language-tagged message. A readable translation is added only when this
    // viewer is permitted to understand/read the language.
    const canRead=gmBypass || known || understood;
    const unknown=!canRead || force;

    const originalText=typeof polyglot.scrambleString === "function"
      ? polyglot.scrambleString(content, message.id, language)
      : content;

    const originalFont=resolveFont(polyglot, language);

    // Bubble-only Common exception:
    // If this viewing client can read Common, suppress the Polyglot representation
    // and render only the readable message. Unknown Common remains scrambled.
    const normalizedLanguage=String(language).trim().toLowerCase();
    if (normalizedLanguage === "common" && canRead && !force) {
      if (debugEnabled()) console.log("[ZFT] 🗣️ v1.3.9 | Common-language bubble rendered readable-only", {
        messageId:message.id,
        language,
        known,
        understood,
        gmBypass
      });

      return {
        content,
        language,
        polyglot:true,
        unknown:false,
        showOriginal:false,
        showTranslation:true,
        originalText:null,
        originalFont:null,
        translationText:content
      };
    }

    // Preserve the useful Polyglot behavior the user verified in the chat log:
    // known/understood language => Polyglot representation + readable text.
    // unknown language => Polyglot representation only.
    const showOriginal=true;
    const showTranslation=canRead && !hideTranslation && !force;

    if (debugEnabled()) console.log("[ZFT] 🌐 v1.3.9 | Polyglot presentation resolved", {
      messageId:message.id,
      language,
      known,
      understood,
      runifyGM,
      gmBypass,
      force,
      hideTranslation,
      unknown,
      showOriginal,
      showTranslation,
      originalFont
    });

    return {
      content:showTranslation ? content : originalText,
      language,
      polyglot:true,
      unknown,
      showOriginal,
      showTranslation,
      originalText,
      originalFont,
      translationText:showTranslation ? content : null
    };
  } catch (error) {
    console.error("[ZFT] ❌ v1.3.9 | Polyglot presentation resolution failed; using normal ZFT bubble", {
      messageId:message.id,
      language,
      error
    });
    return {...fallback, language};
  }
}
