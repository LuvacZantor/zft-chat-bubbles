const MODULE_ID = "zft-chat-bubbles";

export function registerSettings() {
  game.settings.register(MODULE_ID, "minimumDuration", {
    name: "Minimum Bubble Duration",
    hint: "Minimum number of seconds a ZFT chat bubble remains visible.",
    scope: "world", config: true, type: Number,
    range: { min: 1, max: 60, step: 1 }, default: 3
  });
  game.settings.register(MODULE_ID, "maximumDuration", {
    name: "Maximum Bubble Duration",
    hint: "Maximum number of seconds a ZFT chat bubble remains visible.",
    scope: "world", config: true, type: Number,
    range: { min: 5, max: 120, step: 1 }, default: 25
  });
  game.settings.register(MODULE_ID, "wordsPerMinute", {
    name: "Reading Speed",
    hint: "Words per minute used to calculate bubble duration.",
    scope: "world", config: true, type: Number,
    range: { min: 60, max: 600, step: 10 }, default: 300
  });
  game.settings.register(MODULE_ID, "debug", {
    name: "Debug Logging",
    hint: "Enable focused ZFT bubble lifecycle diagnostics.",
    scope: "client", config: true, type: Boolean, default: false
  });
}

export const DEFAULT_COLORS = Object.freeze({
  text: "#111111",
  background: "#f5f1e6",
  border: "#2d2d2d"
});

export function getUserColors(user) {
  const stored=user?.getFlag?.(MODULE_ID, "colors") ?? {};
  return {
    text:stored.text ?? DEFAULT_COLORS.text,
    background:stored.background ?? DEFAULT_COLORS.background,
    border:stored.border ?? DEFAULT_COLORS.border
  };
}

export async function setCurrentUserColors(colors) {
  const normalized={
    text:colors.text ?? DEFAULT_COLORS.text,
    background:colors.background ?? DEFAULT_COLORS.background,
    border:colors.border ?? DEFAULT_COLORS.border
  };

  await game.user.setFlag(MODULE_ID, "colors", normalized);
  console.log("[ZFT] 🎨 v1.3.9 | Personal bubble colors saved to User document", {
    userId:game.user.id,
    colors:normalized
  });
  return normalized;
}

export function debugEnabled() {
  try { return Boolean(game.settings.get(MODULE_ID, "debug")); }
  catch { return false; }
}

export function calculateDuration(text) {
  const plain = stripHTML(text);
  const words = plain.trim() ? plain.trim().split(/\s+/u).length : 0;
  const wpm = Math.max(1, Number(game.settings.get(MODULE_ID, "wordsPerMinute")) || 300);
  let min = Math.max(0, Number(game.settings.get(MODULE_ID, "minimumDuration")) || 3);
  let max = Math.max(0, Number(game.settings.get(MODULE_ID, "maximumDuration")) || 25);
  if (max < min) [min, max] = [max, min];
  const ms = words * 60000 / wpm;
  return Math.round(Math.clamp(ms, min * 1000, max * 1000));
}

export function stripHTML(text) {
  const t=document.createElement("template");
  t.innerHTML=String(text ?? "");
  return t.content.textContent ?? "";
}
