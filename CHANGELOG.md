# Changelog

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/). Versi mengikuti perkembangan plugin di `prompt/`.

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
