# Changelog

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/). Versi mengikuti perkembangan plugin di `prompt/`.

## [2.2.7] — 2026-10-27

### Added

- Skills proyek: `design-audit-sawitpro`, `figma-ecosystem-index` (+ `reference.md` tautan GitHub), `anti-slop-edits`; rule `no-ai-slop.mdc`.
- `npm run skills:verify` / `skills:optional` (clone referensi opsional di luar repo).

### Changed

- UI plugin: density figma-plugin-ds (32px tombol, 11px type), hover/focus-visible, header tanpa ALL CAPS, `aria-selected` tab.

## [2.2.6] — 2026-10-26

### Fixed

- **SyntaxError: possible import expression rejected** — komentar/string dengan teks `import (` memicu censor SES Figma; wording disesuaikan. `figma:check` menolak pola itu ke depannya.

## [2.2.5] — 2026-10-26

### Changed

- Tema UI memakai hex **1. DS 3.0: Color** yang di-resolve dari file PRODUCT DESIGN INTERN PLATFORM (Brand/primary `#007200`, greenBright-500 `#19A80B`, Secondary `#E5BE02`).
- `showUI` dipindah setelah semua konstanta (tanpa TDZ). Versi plugin tampil di header (`v2.2.5`) dan notifikasi.
- `AUDIT_RULES` sinkron `rules.json` (`schemaVersion` 2.1). `applyTheme` menulis `--header`, `--btn-hover`, `--text-subtle`.
- `tsc` tidak lagi menimpa `code.js` plugin (`outDir: dist`). Manifest `figma-dev` memakai ID yang sama dengan root.

## [2.2.4] — 2026-10-26

### Added

- Folder **`figma-dev/`** + `npm run figma:setup` untuk import manifest tanpa file TypeScript/stub di root.
- Notifikasi Figma: «DESIGN AUDIT SawitPRO — panel siap» = plugin yang benar sudah jalan.

## [2.2.3] — 2026-10-26

### Changed

- **Warmup:** token library dimuat di background saat plugin dibuka; chip “Token siap (N)”.
- Cache token shared antar cakupan Seleksi/Halaman; koleksi DS 3.0 Color di-import lebih dulu.

## [2.2.2] — 2026-10-26

### Changed

- Audit lebih cepat: cache registry per file, import library hanya COLOR + spacing/radius, scan komponen per halaman (bukan seluruh file kecuali cakupan Semua).
- Progress `Memuat token… X/Y`; opsi **Muat ulang token library** jika DS baru di-enable.

## [2.2.1] — 2026-10-26

### Added

- Panduan rollout tim: [`docs/agent/team-rollout.md`](docs/agent/team-rollout.md).
- Empty state + peringatan library di tab Audit saat boot plugin.

### Changed

- Dokumen publish/import — kapan perlu import manifest vs cukup run ulang.

## [2.2.0] — 2026-10-26

### Added

- Tab UI **Tools**: detach variabel (seleksi/halaman), **remap** token A→B pada seleksi.
- Audit **VARIABLE**: bind orphan, alias putus; **mode lint** variabel lokal multi-mode.
- Skip instance dengan **`[no-tokens]`** di deskripsi komponen (parity Variables audit).
- Cakupan **seleksi**, coverage token, grup temuan ×N, audit stroke/size, salin nama token.
- UI shadcn-inspired, responsif; tema dari library **DS 3.0 Color**.
- Dokumen: perbandingan Community, aturan MCP DS, publish icon.

### Changed

- Bobot skor: kategori **VARIABLE** (10); sync `rules.json` ↔ `AUDIT_RULES`.
- Apply mendukung bind **stroke** EXACT + undo.

### Assets

- `icon.png`, `prompt/brand-icon.png`, `prompt/icon.png` untuk publish / header.

## [2.0.0] — sebelumnya

- Alur internal-only: audit, apply EXACT, undo in-memory, anotasi; tanpa export/import rules.
- Infer kategori file dari nama; branding SawitPRO.
