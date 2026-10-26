# DESIGN AUDIT SAWITPRO (plugin)

Plugin Figma untuk mengaudit kepatuhan Design System. Tanpa LLM, tanpa REST API, tanpa upload/unduh file dari UI.

## Prinsip

- Token tidak disimpan di repo. Variabel dan text style dibaca dari file terbuka + library yang di-enable.
- **Semua alur di dalam plugin:** audit, daftar temuan, apply EXACT, undo in-memory, anotasi.
- **Aturan audit** (`rules.json`) disematkan di `code.js` (`AUDIT_RULES`). Ubah bobot/ambang di repo → sync ke `AUDIT_RULES` → re-import plugin.

## Isi folder

```
manifest.json, code.js, ui.html   — plugin
rules.json                          — sumber aturan (disalin ke code.js)
aggregate.js                        — opsional/dev; tidak dipakai alur plugin
```

## Instalasi

1. Clone repo.
2. Figma → Plugins → Development → Import plugin from manifest → `manifest.json` (root repo mengarah ke folder ini).
3. Pastikan `"id"` di manifest sesuai plugin development Figma Anda.
4. Di file yang diaudit: aktifkan library DS (Assets → Libraries).

**Ikon brand di bar atas Figma (bukan di dalam panel):** upload [`../icon.png`](../icon.png) saat **Publish plugin** (org privat SawitPRO). Panduan: [`../docs/agent/figma-plugin-icon-publish.md`](../docs/agent/figma-plugin-icon-publish.md).

## Alur harian

1. Buka file Figma (sprint, Species Master, DS, produk, platform, …).
2. Tab **Audit** → pilih cakupan **Seleksi / Halaman / Semua**.
3. Konteks file otomatis dari nama file; penanggung jawab opsional.
4. **Jalankan audit** — skor, bar coverage token, stat variabel, filter, **kelompokkan ×N**, klik baris → fokus layer (multi-select jika grup).
5. Tab **Apply:** terapkan EXACT, pulihkan, anotasi halaman `🔍 DS Audit`.
6. Tab **Tools:** detach variabel (seleksi/halaman), remap token A→B pada seleksi, muat katalog variabel dari library.

**`[no-tokens]`** di deskripsi komponen → instance + subtree dilewati (sama seperti Variables audit).

Perbandingan Community: [`../docs/agent/community-linter-comparison.md`](../docs/agent/community-linter-comparison.md).

## Skor

- ≥ 90: EXCELLENT · 75–89: PASS_WITH_WARNING · &lt; 75: REJECTED

## Batasan API (ringkas)

| Sumber | Otomatis? |
| :--- | :--- |
| Variabel lokal + library (enabled) | Ya |
| Text style library (daftar) | Tidak — style yang sudah dipakai bisa dikenali |
| Komponen library (daftar) | Tidak — instance dari library dianggap sah |

Lihat bagian batasan lengkap di dokumen asli spesifikasi jika diperlukan.
