# Panduan agent — DESIGN AUDIT SAWITPRO

Repositori **plugin Figma** audit Design System SawitPRO (bukan app Kokonus). Kode plugin: `prompt/code.js`, `prompt/ui.html`, `manifest.json` (root → `prompt/`).

## Setelah selesai mengerjakan

1. Perbarui `CHANGELOG.md` jika perilaku plugin atau UX berubah.
2. **Commit + push** ke GitHub (`sapikkk/design-audit-sawitpro`) — **wajib**, lihat `.cursor/rules/auto-push.mdc`.
3. Jangan push secret atau export audit dari file produksi.

## Skills & aturan Cursor (repo)

| Path | Isi |
|------|-----|
| [`.cursor/skills/design-audit-sawitpro/`](.cursor/skills/design-audit-sawitpro/SKILL.md) | Workflow plugin + SES + bundle |
| [`.cursor/skills/figma-ecosystem-index/`](.cursor/skills/figma-ecosystem-index/SKILL.md) | Indeks GitHub Figma/MCP/agent (referensi, bukan submodule) |
| [`.cursor/skills/anti-slop-edits/`](.cursor/skills/anti-slop-edits/SKILL.md) | UI/docs tanpa filler AI |
| [`.cursor/rules/no-ai-slop.mdc`](.cursor/rules/no-ai-slop.mdc) | Guardrail teks user-facing |

`npm run skills:verify` — daftar skill proyek. `npm run skills:optional` — clone referensi ke `~/figma-dev-references` (opsional, di luar repo).

## Dokumen wajib baca

| Dokumen | Isi |
|--------|-----|
| [`prompt/README.md`](prompt/README.md) | Instalasi, tab Audit / Apply / Tools |
| [`docs/agent/community-linter-comparison.md`](docs/agent/community-linter-comparison.md) | Parity vs plugin Community |
| [`docs/agent/figma-mcp-design-system-rules.md`](docs/agent/figma-mcp-design-system-rules.md) | DS 3.0 + MCP |
| [`docs/agent/figma-plugin-icon-publish.md`](docs/agent/figma-plugin-icon-publish.md) | Ikon publish org |
| [`docs/agent/publish-v1.md`](docs/agent/publish-v1.md) | Checklist publish **v1.0** |

## Batasan teknis

- Tanpa LLM, tanpa network di plugin, tanpa export JSON dari UI.
- `AUDIT_RULES` di `code.js` harus selaras dengan `prompt/rules.json`.
