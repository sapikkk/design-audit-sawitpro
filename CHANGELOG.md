# Changelog

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/). Versi mengikuti perkembangan plugin di `prompt/`.

## 1.2.0

- Splash screen saat plugin dibuka, lalu halaman beranda dengan pilihan Periksa, Perbaiki, Alat.
- Tiap pilihan membuka halamannya sendiri dengan tombol Kembali; tab atas dihapus.
- Tombol utama (Mulai periksa, Perbaiki semua otomatis) dipasang di bar bawah.
- Batalkan perubahan, Tandai di halaman, Hapus tanda dipindah ke menu titik tiga di halaman Perbaiki.
- Kolom nama desainer dihapus.

## [1.1.5] — 2026-10-27

### Changed

- Pencocokan spacing/radius/font: bulatkan px + toleransi ±1 px (`nearMatchSpacingPx`) agar lebih banyak temuan **EXACT** yang aman di-apply.
- Saran token menampilkan selisih px bila tidak otomatis; tab **Perbaiki** menjelaskan mengapa 0 otomatis.

## [1.1.4] — 2026-10-27

### Changed

- Tab **Periksa**: cakupan audit (Seleksi / Halaman / Semua) diganti dropdown, selaras field DS.

## [1.1.3] — 2026-10-27

### Fixed

- Panel tidak lagi melompat ke ukuran default setelah di-resize: skrip lama `syncUiSize` (debounce 120 ms, min 640 px tinggi) dihapus; hanya pegangan sudut yang mengubah ukuran.
- Ukuran tersimpan dibuka langsung saat plugin start (tanpa flash 420×760).

## [1.1.2] — 2026-10-27

### Added

- Pegangan **ubah ukuran panel** di sudut kanan bawah (Figma tidak mendukung drag tepi jendela plugin). Ukuran disimpan untuk sesi berikutnya.

### Fixed

- Pesan error seleksi lintas halaman ditampilkan dalam Bahasa Indonesia.

## [1.1.1] — 2026-10-27

### Changed

- UI tanpa kode mesin: badge hasil (mis. **Perlu perhatian**), filter kategori, teks temuan, dan notifikasi alat dalam Bahasa Indonesia.
- Panel responsif: font, tombol, field, dan radius mengikuti `--ui-scale` saat jendela plugin diperbesar/diperkecil (acuan 420×760).

## [1.1.0] — 2026-10-27

### Added

- Progress per kategori saat memuat token: "Sedang memuat spacing & padding 12/40", juga untuk warna, radius, font, text style.
- Panel **Token yang dimuat** dan **Sudah diperiksa di layer** selama audit; ringkasan hasil menampilkan jumlah token yang diaudit.
- Registry mengenali nama token DS (`Roundness/*`, `Font/Font size/*`, `Main System/*`) sebagai radius, font, spacing.

### Changed

- Checkbox jadi **Muat ulang token dari library** dengan keterangan.
- Tab **Alat**: Lepas variabel dan Ganti variabel disembunyikan secara default, tombol **Tampilkan** / **Sembunyikan**. Daftar variabel dimuat saat Ganti variabel dibuka.
- UI diselaraskan dengan komponen DS (atom/molecule/organism): font Inter, tombol pill, radius 4/8/12, border `Stroke/Low`, field 48px, progress 8px, tema dari `Brand/primary` dan `Surface/*`. Detail di `docs/agent/figma-mcp-design-system-rules.md`.

## [1.0.8] — 2026-10-27

### Fixed

- **Tunjuk layer** / **Perbaiki (tunjuk layer)**: pindah ke halaman layer dulu (`loadAllPagesAsync` + `setCurrentPageAsync`); temuan gabungan lintas halaman hanya seleksi layer di halaman yang sama.

## [1.0.7] — 2026-10-27

### Fixed

- Logo SawitPRO di header panel: disematkan sebagai **data URI** di `ui.html` (path `icon.png` tidak dimuat di iframe Figma).

## [1.0.6] — 2026-10-27

### Changed

- Hapus bar meta (file/konteks/token), intro tab ①②③, dan teks panduan kosong yang berulang.

## [1.0.5] — 2026-10-27

### Changed

- Setiap kartu temuan (tab **Periksa** dan **Perbaiki**) punya tombol **Perbaiki otomatis** atau **Perbaiki (tunjuk layer)**.

## [1.0.4] — 2026-10-27

### Changed

- Registry: impor **semua** variabel library `FLOAT` (spacing, padding, radius, size) — tidak hanya yang namanya diawali `spacing`/`radius`.
- Text style dari **library tim** diimpor lewat `getAvailableLibraryStylesAsync` agar typography bisa EXACT + **Perbaiki otomatis**.
- Teks dengan `fontSize` terikat variabel dianggap lulus typography; font size raw yang cocok token typography mendapat saran bind variabel.

## [1.0.3] — 2026-10-27

### Fixed

- `page.loadAsync()` sebelum akses `children` (audit halaman, anotasi, detach) — hilangkan error dynamic-page.

### Changed

- Tab Perbaiki: tombol **Perbaiki otomatis** / **Tunjuk layer** per temuan; garis kiri kartu dihapus.

## [1.0.2] — 2026-10-27

### Changed

- Teks UI disederhanakan (tab Periksa / Perbaiki / Alat, alur ①②③, font 12–13px) untuk pengguna senior.

## [1.0.1] — 2026-10-27

### Changed

- Tab **Apply**: daftar temuan + baris aksi (EXACT otomatis vs manual + token terdekat di project).
- Temuan tanpa border kartu; garis severity hanya di kiri. Intro singkat tiap tab (Audit / Apply / Tools).

## [1.0.0] — 2026-10-27

### Release

- Versi publish **1.0** (semver `1.0.0`). Logo SawitPRO di header panel (`icon.png` + favicon); `icon.png` 128×128 untuk modal Publish org.
- Panduan: [`docs/agent/publish-v1.md`](docs/agent/publish-v1.md).

## [2.2.8] — 2026-10-27

### Changed

- UI putih (kanvas `#FFFFFF`), tab underline ala Figma, meta satu baris; aksen DS hanya tombol/skor/teks brand.
- Copy dipendekkan (anti-slop). `applyTheme` tidak mengecat latar hijau dari token library.

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
