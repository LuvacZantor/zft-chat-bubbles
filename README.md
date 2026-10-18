# ZFT Chat Bubbles v1.4.0

## Development standards

Zantor's Realms maintains its authoritative Foundry module development, validation, compatibility, and release policies in a centrally managed, private ZFT standards repository. New feature development is **Foundry V14-first**; the existing version numbers, supported environments, and release history documented here remain unchanged. This documentation notice does not imply V14 compatibility for a previously V13-only build.


ZFT Chat Bubbles is a Foundry VTT V13 module providing independently styled chat bubbles, user-customizable colors, configurable timing, and Polyglot-language support.

## Version and compatibility

- Version: 1.4.0
- Foundry VTT: V13 Build 351 (V14 not validated)
- Requires: ZFT Tools shared canvas toolbar (tested with ZFT Tools 0.1.0-dev.7)

## Features

- Independently rendered token chat bubbles for IC/emote messages.
- User-configurable text, background, and border colors.
- GM-configurable reading speed and minimum/maximum duration.
- Compatible presentation for Polyglot-language messages.
- A **Chat Bubbles** configuration action under **ZFT Tools** for both GMs and players.
- GM-only timing settings remain accessible only to GMs; players can configure their own colors and diagnostics.

## v1.4.0

- Moved the Chat Bubbles configuration shortcut from Foundry's Token Controls group into the shared ZFT Tools toolbar.
- Made the configuration shortcut visible to GMs and players (`gmOnly: false`).
- Integrated with the stable ZFT Tools button order (after Cinematics Settings, before Raised Hands).
- Added `zft-tools` as a required module dependency.
- Preserved bubble rendering, settings persistence, Polyglot presentation, and existing personal-color UI unchanged from v1.3.9.

## Local validation

1. Enable ZFT Tools, then ZFT Chat Bubbles and refresh the browser (Ctrl+Shift+R).
2. As GM, open ZFT Tools > Chat Bubbles; confirm the personal-color editor and GM timing settings appear.
3. As a non-GM player, open ZFT Tools > Chat Bubbles; confirm personal colors can be saved and that GM timing fields are absent.
4. Confirm the shortcut no longer appears under Token Controls.
5. Test IC/emote messages and Polyglot-language messages. Confirm bubbles render as before.
6. Switch between ZFT Tools and Token Controls directly; confirm no console errors.

## Installation / source

The release candidate ZIP prepared for the GitHub update contains only the three **changed files**, and is not a standalone installable module. The full release archive must additionally contain all unchanged v1.3.9 repository files. Do not install the candidate ZIP into an empty module folder.

## License

See LICENSE in the repository.
