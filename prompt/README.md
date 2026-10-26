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

## Alur harian

1. Buka file Figma (sprint, Species Master, DS, produk, platform, …).
2. Jalankan plugin → **AUDIT FILE**.
3. Konteks file otomatis dari nama file; penanggung jawab opsional.
4. **Jalankan audit** — hasil di panel (skor, filter, klik baris → fokus layer).
5. **APPLY & ANNOTATE:** terapkan EXACT, **Pulihkan perubahan terakhir** (tanpa file), buat/hapus anotasi di halaman `🔍 DS Audit`.

## Skor

- ≥ 90: EXCELLENT · 75–89: PASS_WITH_WARNING · &lt; 75: REJECTED

## Batasan API (ringkas)

| Sumber | Otomatis? |
| :--- | :--- |
| Variabel lokal + library (enabled) | Ya |
| Text style library (daftar) | Tidak — style yang sudah dipakai bisa dikenali |
| Komponen library (daftar) | Tidak — instance dari library dianggap sah |

Lihat bagian batasan lengkap di dokumen asli spesifikasi jika diperlukan.
