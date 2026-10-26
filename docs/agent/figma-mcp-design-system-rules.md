# Aturan integrasi Figma MCP — DESIGN AUDIT SAWITPRO

Dokumen ini untuk agent Cursor (CLAUDE.md / rules) saat mengubah plugin audit atau UI terkait Figma. Proyek ini **bukan** app React; stack utamanya **plugin Figma (vanilla JS + HTML iframe)**.

---

## 1. Token definitions

| Sumber | Lokasi | Format |
|--------|--------|--------|
| **DS 3.0 Color (Figma library)** | Library tim `1. DS 3.0: Color` | Variabel Figma: **Semantic Color** + **Global Token** |
| Aturan audit (bobot, naming) | `prompt/rules.json` | JSON; disalin ke `AUDIT_RULES` di `prompt/code.js` |
| Tema UI plugin | Resolve runtime di `buildUiTheme()` | Map nama variabel → hex → CSS custom properties di `prompt/ui.html` |

### Nama variabel UI (DS 3.0)

| Token UI | Variabel Figma | Hex (resolve 2026-10-26) |
|----------|----------------|--------------------------|
| `--brand` / `--header` | `Brand/primary` · `Primary/greenBright-800` | `#007200` |
| `--primary` / tombol | `Primary/greenBright-500` | `#19A80B` |
| `--btn-hover` | `Primary/greenBright-600` | `#009F0C` |
| `--brand-secondary` | `Brand/Secondary` | `#E5BE02` |
| `--background` | `Primary/greenBright-50` | `#E5F3E6` |
| `--card` / surface | `Neutral/Neutral-0` | `#FFFFFF` |
| `--border` | `Primary/greenBright-200` | `#AEE0AF` |
| `--foreground` | `TextIcon/Black/primary` | `#1F1F1F` |
| muted / subtle | `TextIcon/Black/secondary` · `tertiary` | `#404040` · `#7A7A7A` |
| `--danger` / `--warning` | `Utility/Danger` · `Utility/Warning` | `#AB0000` · `#A04200` |

**Transformasi:** Tidak ada Style Dictionary di repo. Plugin resolve alias variabel lewat `resolveValue()` (sama seperti audit).

**Referensi file desain:** [PRODUCT-DESIGN-INTERN-PLATFORM](https://www.figma.com/design/Nl8e2ku3dPhoJmap3PGNmO/PRODUCT-DESIGN-INTERN-PLATFORM) — library DS harus **enabled** di file yang diaudit/dibuka.

---

## 2. Component library

| Lapisan | Di mana |
|---------|---------|
| Plugin UI | `prompt/ui.html` — HTML + CSS variables, tanpa React |
| Logika audit | `prompt/code.js` — scan, skor, apply, anotasi |
| Komponen Figma produk | Library terpisah (`SawitPRO Design System`, `WEB Design System`, `2.0 Mobile Design System`, Species Master, dll.) — **bukan** source code di repo ini |

Arsitektur plugin: **single iframe UI** + **main thread** `code.js`. Jangan menambah bundler kecuali diminta.

---

## 3. Frameworks & libraries

| Bagian | Stack |
|--------|--------|
| Plugin runtime | Figma Plugin API 1.0, `documentAccess: dynamic-page`, `permissions: ["teamlibrary"]` |
| Root folder | Template TypeScript Figma (`code.ts`, `eslint`, `tsc`) — **stub**; entry aktif: `manifest.json` → `prompt/code.js` |
| Build | `npm run build` hanya untuk root TS; plugin produksi = `prompt/` |
| Agregat (opsional) | `prompt/aggregate.js` — Node tanpa deps; **tidak** dipakai alur plugin internal |

---

## 4. Asset management

| Asset | Path | Pemakaian |
|-------|------|-----------|
| Brand icon master | `assets/sawitpro-icon.png` | Sumber brand |
| Icon publish Figma | `icon.png` (128×128) | Upload modal **Publish plugin** → bar & menu native |
| Icon plugin (72px) | `prompt/brand-icon.png` | Sumber raster |
| Icon di UI Figma (iframe) | Embedded **data URI** di `prompt/ui.html` | Header panel dalam plugin |

Bar judul **DESIGN AUDIT SAWITPRO** dengan ikon `</>` = UI **native Figma**; ganti dengan logo SawitPRO lewat publish ([`figma-plugin-icon-publish.md`](figma-plugin-icon-publish.md)), bukan lewat manifest saja.

Jangan hotlink URL Figma MCP asset di plugin (URL sementara). Optimasi: resize (≈72px) sebelum embed.

---

## 5. Icon system

- Brand: logo melingkar SawitPRO (hijau + emas).
- UI plugin: satu `<img class="logo">` di header; severity pakai border-left warna semantic (danger/warning/neutral).
- Tidak ada icon font / SVG sprite di repo.

---

## 6. Styling approach

- **CSS custom properties** di `:root`, diisi dari pesan `theme` (plugin) atau fallback SawitPRO.
- **Bahasa UI:** Indonesia; istilah Figma tetap Inggris (layer, EXACT, severity).
- Responsif: lebar panel tetap (~400px); scroll di `#list`.
- Figma `themeColors: true` pada `showUI` — tetap pakai token DS untuk brand consistency.

---

## 7. Project structure

```
manifest.json          → entry import Figma (arah ke prompt/)
prompt/
  code.js              → audit + theme resolve
  ui.html              → UI branded
  rules.json           → sumber AUDIT_RULES
  ds-audit-plugin-spec.md
docs/
  agent/               → panduan agent (file ini, cursor-agent-stack.md)
  standards/           → format temuan audit
assets/                → brand raster
```

### Pola kerja agent

1. **Figma MCP:** `create_session` → `search_design_system` (library `1. DS 3.0: Color`) → jangan tebak hex jika variabel bisa di-resolve di plugin.
2. **Perubahan UI:** edit `prompt/ui.html` + token map di `UI_THEME_VAR_MAP` / `buildUiTheme`.
3. **Perubahan aturan audit:** `prompt/rules.json` **dan** `AUDIT_RULES` di `code.js` harus sinkron.
4. **Tanpa export/import file** dari UI plugin — semua alur in-panel.
5. **Delegasi token berat:** investigasi lokasi kode → `cavecrew-investigator`; patch kecil → `cavecrew-builder`; review diff → `cavecrew-reviewer` (output terkompresi).

### Workflow skills (ringkas)

| Skill | Kapan |
|-------|--------|
| **caveman-learn** | Optimasi token context (CLAUDE.md, skills); consent per edit; ukur before/after |
| **ultracave** | Mode jawaban ringkas; tidak mengubah prose di commit/docs |
| **cavecrew** | Subagent parallel untuk explore/fix/review dengan payload kecil |

---

## 8. Checklist sebelum merge UI/audit

- [ ] Library **1. DS 3.0: Color** enabled di file uji
- [ ] Chip UI menampilkan `Warna: DS 3.0 Color` (bukan hanya fallback)
- [ ] Logo brand tampil di header
- [ ] Reload plugin development setelah ubah `ui.html` / `code.js`
- [ ] Tidak menambah upload/download JSON di UI

Terakhir diperbarui: 2026-10-26 (token hex diukur MCP dari PRODUCT-DESIGN-INTERN-PLATFORM).
