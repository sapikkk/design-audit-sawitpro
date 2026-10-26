---
name: design-audit-sawitpro
description: >-
  Maintain DESIGN AUDIT SAWITPRO Figma plugin (prompt/code.js, ui.html, rules.json).
  Use for audit rules, Apply/undo, DS 3.0 UI tokens, figma-dev import, SES-safe JS.
---

# DESIGN AUDIT SAWITPRO

## Scope

- **In repo:** `prompt/code.js`, `prompt/ui.html`, `prompt/rules.json`, `manifest.json`, `figma-dev/`.
- **Out of scope:** LLM inside plugin, network in plugin, JSON export from UI, migrating to React/create-figma-plugin unless explicitly requested.

## Before editing `code.js`

1. Read `AGENTS.md` and `prompt/README.md`.
2. Keep `AUDIT_RULES` aligned with `prompt/rules.json`.
3. **SES trap:** never write `import (` in comments or strings (Figma sandbox false-positive). Run `npm run figma:check`.
4. After `prompt/` changes: `npm run figma:bundle` then re-import `figma-dev/manifest.json` in Figma.

## UI

- Tokens: DS 3.0 Color via `applyTheme()` from `code.js`; fallback in `:root` in `ui.html`.
- Layout: figma-plugin-ds–style density (11–12px type, 32px controls, clear focus rings).
- Copy: Indonesian, short labels; no marketing fluff.

## Verify

```bash
npm run figma:check
node --check prompt/code.js
```

Success in Figma: notification with current `PLUGIN_VERSION`, console `[DESIGN AUDIT SAWITPRO] plugin v… loaded`.

## External references

See `.cursor/skills/figma-ecosystem-index/reference.md` — consult linked repos; do not vendor entire ecosystems into this repo.
