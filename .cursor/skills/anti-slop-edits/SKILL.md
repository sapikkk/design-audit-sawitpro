---
name: anti-slop-edits
description: >-
  Edit plugin UI, docs, and agent output for this repo without generic AI filler.
  Use when writing CHANGELOG, UI strings, or chat replies about the plugin.
---

# Anti-slop for DESIGN AUDIT SAWITPRO

## Do

- State what changed and why in one or two sentences.
- UI labels: verb + object (`Jalankan audit`, `Muat daftar variabel`).
- Match existing tone in `prompt/ui.html` (Indonesian, technical, short).
- Prefer concrete steps (`figma-dev/manifest.json`, `npm run figma:check`).

## Do not

- Hype adjectives (“powerful”, “seamless”, “robust solution”).
- Duplicate the same instruction in three places in one response.
- Add features the user did not ask for (extra tabs, LLM, export JSON).
- Clone or vendor dozens of GitHub repos into this plugin tree.

## UI copy check

Before shipping text in `ui.html`:

1. Can a designer act on it without reading a paragraph?
2. Is every word necessary?
3. Avoid English marketing phrases unless they are DS token names.

## References

See `.cursor/skills/figma-ecosystem-index/reference.md` (anti-slop repos) for external lint ideas only — not runtime dependencies.
