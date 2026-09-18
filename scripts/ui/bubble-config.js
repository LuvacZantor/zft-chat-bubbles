import {
  getUserColors,
  setCurrentUserColors
} from "../settings.js";

const MODULE_ID="zft-chat-bubbles";

function normalizeHex(value) {
  const raw=String(value ?? "").trim();
  const short=raw.match(/^#([0-9a-f]{3})$/i);
  if (short) return `#${[...short[1]].map(c => c+c).join("")}`.toLowerCase();
  return /^#[0-9a-f]{6}$/i.test(raw) ? raw.toLowerCase() : null;
}

function getSetting(key, fallback) {
  try { return game.settings.get(MODULE_ID,key); }
  catch { return fallback; }
}

export class ZFTBubbleConfig {
  static async open() {
    const colors=getUserColors(game.user);
    const isGM=game.user.isGM;

    const gmSection=isGM ? `
      <fieldset class="zft-config-section">
        <legend>GM Bubble Timing</legend>
        <div class="form-group">
          <label>Minimum Duration</label>
          <div class="form-fields"><input name="minimumDuration" type="number" min="1" max="60" step="1" value="${getSetting("minimumDuration",3)}"><span>seconds</span></div>
        </div>
        <div class="form-group">
          <label>Maximum Duration</label>
          <div class="form-fields"><input name="maximumDuration" type="number" min="5" max="120" step="1" value="${getSetting("maximumDuration",25)}"><span>seconds</span></div>
        </div>
        <div class="form-group">
          <label>Reading Speed</label>
          <div class="form-fields"><input name="wordsPerMinute" type="number" min="60" max="600" step="10" value="${getSetting("wordsPerMinute",300)}"><span>WPM</span></div>
        </div>
      </fieldset>` : "";

    const content=`
      <form class="zft-bubble-config">
        <fieldset class="zft-config-section">
          <legend>Personal Bubble Colors</legend>
          <p class="hint">These colors belong to your Foundry user and are shown to everyone when you speak.</p>
          ${this.#colorRow("text","Text Color",colors.text)}
          ${this.#colorRow("background","Background Color",colors.background)}
          ${this.#colorRow("border","Border Color",colors.border)}
        </fieldset>
        ${gmSection}
        <fieldset class="zft-config-section">
          <legend>Diagnostics</legend>
          <div class="form-group">
            <label>Debug Logging</label>
            <div class="form-fields"><input name="debug" type="checkbox" ${getSetting("debug",false) ? "checked" : ""}></div>
          </div>
        </fieldset>
      </form>`;

    const result=await foundry.applications.api.DialogV2.wait({
      window:{title:"ZFT Chat Bubble Configuration"},
      content,
      buttons:[
        {
          action:"save",
          label:"Save",
          icon:"fa-solid fa-floppy-disk",
          default:true,
          callback:(_event,button,dialog) => this.#save(dialog.element, isGM)
        },
        {action:"cancel",label:"Cancel",icon:"fa-solid fa-xmark"}
      ],
      render:(_event,dialog) => this.#activate(dialog.element)
    });

    return result;
  }

  static #colorRow(key,label,value) {
    return `
      <div class="form-group zft-config-color-row" data-color="${key}">
        <label>${label}</label>
        <div class="form-fields">
          <input class="zft-color-hex" type="text" value="${value}">
          <input class="zft-color-picker" type="color" value="${value}" aria-label="${label} color picker">
        </div>
      </div>`;
  }

  static #activate(root) {
    if (!root) {
      console.warn("[ZFT] ⚠️ v1.3.9 | Configuration popup activation skipped: root unavailable");
      return;
    }

    for (const row of root.querySelectorAll(".zft-config-color-row")) {
      const text=row.querySelector(".zft-color-hex");
      const picker=row.querySelector(".zft-color-picker");
      picker?.addEventListener("input",() => { text.value=picker.value; });
      text?.addEventListener("input",() => {
        const value=normalizeHex(text.value);
        if (value && picker) picker.value=value;
      });
    }

    console.log("[ZFT] 🪟 v1.3.9 | Configuration popup rendered", {userId:game.user.id, isGM:game.user.isGM});
  }

  static async #save(root,isGM) {
    const colors={};
    for (const row of root.querySelectorAll(".zft-config-color-row")) {
      const key=row.dataset.color;
      const value=normalizeHex(row.querySelector(".zft-color-hex")?.value);
      if (!value) {
        ui.notifications?.error(`ZFT Chat Bubbles: Invalid ${key} color. Use #RRGGBB.`);
        console.warn("[ZFT] ⚠️ v1.3.9 | Configuration save rejected: invalid color", {key});
        return false;
      }
      colors[key]=value;
    }

    try {
      await setCurrentUserColors(colors);
      await game.settings.set(MODULE_ID,"debug",Boolean(root.querySelector('[name="debug"]')?.checked));

      if (isGM) {
        for (const key of ["minimumDuration","maximumDuration","wordsPerMinute"]) {
          const input=root.querySelector(`[name="${key}"]`);
          if (input) await game.settings.set(MODULE_ID,key,Number(input.value));
        }
      }

      ui.notifications?.info("ZFT Chat Bubbles: Configuration saved.");
      console.log("[ZFT] ✅ v1.3.9 | Configuration popup save completed", {
        userId:game.user.id,
        worldTimingUpdated:isGM
      });
      return true;
    } catch (error) {
      console.error("[ZFT] ❌ v1.3.9 | Configuration popup save failed", {error});
      ui.notifications?.error("ZFT Chat Bubbles: Failed to save configuration.");
      return false;
    }
  }
}
