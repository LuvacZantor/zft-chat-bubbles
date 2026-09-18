# ZFT Chat Bubbles v1.3.9

Based directly on stable V13 baseline v1.3.6.

Change:
- Restores Foundry-native Font Awesome `fa-comment-dots` for the Token Controls shortcut.
- Adds a dedicated ZFT icon class and gold/yellow glyph color.
- No PNG rendering and no toolbar sizing/layout CSS.
- No changes to bubble rendering, Polyglot integration, Common handling, colors, timing, or configuration popup.

Validation:
1. Install/update v1.3.9 and F5 the client.
2. Open Token Controls.
3. Expected: the ZFT configuration shortcut shows a gold/yellow chat-bubble-with-dots Font Awesome icon.
4. Click the icon.
5. Expected: the existing ZFT configuration popup opens normally.
6. Send normal IC, Common, and Polyglot-language messages and verify bubble behavior is unchanged.

Expected console:
[ZFT] 🫧 v1.3.9 | ZFT Chat Bubbles module script loaded
[ZFT] ✅ v1.3.9 | Token Controls configuration shortcut registered
[ZFT] 🛠️ v1.3.9 | Token Controls configuration shortcut activated
