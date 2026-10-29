# DESIGN AUDIT SAWITPRO

Plugin Figma untuk mengaudit kepatuhan Design System di file desain SawitPRO (PetaniPRO, RamPRO, TimPRO, Toko Sawit, sprint species master, dan portofolio aplikasi lain). Audit deterministik di dalam plugin: tanpa LLM, tanpa export JSON dari UI, tanpa REST API, tanpa menyimpan token di repository.

**Repo:** [github.com/sapikkk/design-audit-sawitpro](https://github.com/sapikkk/design-audit-sawitpro)  
**Versi plugin:** 1.3.3 (runtime `PLUGIN_VERSION` di `prompt/code.js`) — riwayat lengkap [`CHANGELOG.md`](CHANGELOG.md).

---

## Peta repo

| Path | Isi |
|------|-----|
| [`prompt/`](prompt/) | Plugin: `code.js`, `ui.html`, `rules.json`, ikon |
| [`manifest.json`](manifest.json) | Entry Figma → `prompt/` |
| [`figma-dev/`](figma-dev/) | Bundle setelah `npm run figma:bundle` |
| [`docs/agent/`](docs/agent/) | Community parity, MCP DS, publish, referensi semantic layer |
| [`AGENTS.md`](AGENTS.md) | Panduan agent + commit/push |

---

## Alur pengguna (Periksa → Perbaiki)

1. Beranda: **Periksa**, **Perbaiki**, **Alat**.
2. **Periksa:** pilih cakupan (seleksi / halaman / semua) → **Mulai periksa**. Saat berjalan ada **Batal**.
3. Hasil: skor, tab kategori (Warna, Spacing, Komponen, …), baris nilai → variabel atau nama komponen library.
4. **Ayo perbaiki** (setelah selesai) membuka **Perbaiki** untuk temuan yang bisa otomatis (EXACT + NEAR warna/spacing/font dalam ambang `rules.json`).
5. **Alat:** detach variabel, remap A→B, anotasi halaman (menu di Perbaiki).

Detail instalasi dan batasan API: [`prompt/README.md`](prompt/README.md).  
Checklist tim: [`docs/agent/team-rollout.md`](docs/agent/team-rollout.md).

---

## Fitur audit (ringkas)

| Area | Perilaku |
|------|----------|
| Token | Warna, spacing, radius, tipografi dari library yang enabled |
| Apply otomatis | Bind variabel (exact + near), text style exact |
| Komponen | INSTANCE → main component + library vs lokal; ringkasan instance di hasil periksa |
| Penamaan | Pola `rules.json` (Screen/, Button/, Text/, …) |
| Komponen `[no-tokens]` | Subtree instance dilewati |

Parity vs plugin Community: [`docs/agent/community-linter-comparison.md`](docs/agent/community-linter-comparison.md).

Roadmap deteksi komponen (fingerprint frame vs library, rename semantic): [`docs/agent/figma-semantic-layer-references.md`](docs/agent/figma-semantic-layer-references.md). Level A (nama main component pada INSTANCE) sudah di hasil audit; fingerprint struktural (level B) belum.

---

## Instalasi

```bash
git clone https://github.com/sapikkk/design-audit-sawitpro.git
cd design-audit-sawitpro
npm run figma:bundle   # opsional, untuk figma-dev/
```

Figma Desktop → **Plugins → Development → Import plugin from manifest** → [`manifest.json`](manifest.json) di root. Aktifkan library DS di file yang diaudit.

Publish org: [`docs/agent/figma-plugin-icon-publish.md`](docs/agent/figma-plugin-icon-publish.md).

---

## Skor

| Skor | Status |
|------|--------|
| ≥ 90 | EXCELLENT |
| 75–89 | PASS_WITH_WARNING |
| &lt; 75 | REJECTED |

Bobot kategori: [`prompt/rules.json`](prompt/rules.json).

---

## Development

```bash
npm run figma:check    # syntax, SES, versi
npm run figma:bundle   # sync figma-dev/
```

Setelah ubah `prompt/`: commit + push ke `main` (lihat [`AGENTS.md`](AGENTS.md)).
