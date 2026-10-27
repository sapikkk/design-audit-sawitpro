# Publish ke Figma Community — DESIGN AUDIT SAWITPRO

Panduan **publik** (bukan hanya org privat). Plugin sudah **tanpa network** (`allowedDomains: none`) dan siap diajukan review Figma.

## Sebelum klik Publish

```bash
cd "/Users/mpik/Downloads/SAWITPRO AUDIT PLUGIN"
git pull
npm run figma:bundle
npm run figma:check
```

Versi saat ini: lihat `PLUGIN_VERSION` di `prompt/code.js` (UI menampilkan label `v1.x`).

| Asset | File |
|-------|------|
| Ikon publish | [`icon.png`](../../icon.png) (128×128 PNG) |
| Manifest import dev | [`manifest.json`](../../manifest.json) |

Uji cepat di **Figma Desktop** (bukan browser saat pertama kali):

1. **Plugins → Development → Import from manifest…** → `manifest.json` root repo.
2. Buka file dengan library DS di-enable → **Periksa → Mulai periksa** → tab kategori & kartu temuan muncul.
3. Tutup panel, jalankan lagi (tanpa import ulang).

## Langkah publish (Community)

1. Figma Desktop, login akun yang **boleh publish plugin** (profil org SawitPRO: pastikan izin brand/logo untuk listing publik).
2. **Plugins → Development → DESIGN AUDIT SAWITPRO**.
3. **Publish new release** (atau **Manage plugin → Publish**).
4. **Visibility:** pilih **Public** / **Publish to Community** (bukan *Private to organization* jika ingin semua orang menemukan plugin).
5. Upload **`icon.png`** (128×128).
6. Tempel deskripsi & release notes di bawah.
7. **Tags** (pilih yang tersedia di modal): `design system`, `variables`, `lint`, `audit`, `tokens`.
8. Submit → tunggu **review Figma** (biasanya beberapa hari). Status ada di **Figma → Community → Plugins → Published**.

### Jika modal minta Plugin ID baru

Salin ID ke `manifest.json` dan `figma-dev/manifest.json` (`"id": "..."`), lalu:

```bash
npm run figma:bundle
```

Publish lagi dari Development dengan ID yang sama.

## Teks siap tempel (Indonesia)

**Deskripsi singkat (≈1 baris)**

Periksa layer Figma terhadap variabel Design System: warna, spacing, radius, font, komponen, dan penamaan. Perbaikan otomatis jika nilai sudah cocok dengan token.

**Deskripsi panjang**

DESIGN AUDIT SAWITPRO membantu tim desain mengecek file Figma sebelum handoff.

- Membaca variabel dan gaya teks dari **library yang Anda aktifkan** di file (tanpa upload data ke server).
- Temuan dikelompokkan per kategori (warna, spacing, tipografi, komponen, dll.).
- **Perbaiki otomatis** untuk temuan yang nilainya sudah persis cocok dengan variabel (±1 px untuk spacing).
- Tunjuk layer, tandai di halaman, lepas atau ganti variabel lewat tab Alat.

Plugin ini dikembangkan untuk ekosistem Design System SawitPRO, tetapi bisa dipakai di file mana pun selama library variabel tim Anda di-enable.

Tidak memerlukan koneksi internet saat dipakai.

**Release notes (contoh rilis publik pertama)**

```
v1.2 — Navigasi beranda, tab kategori temuan, kartu temuan dengan aksi ikon, opsi periksa ringkas di samping ringkasan skor. Tanpa network; audit & apply di dalam Figma.
```

## Teks opsional (English, untuk jangkauan Community)

**Short**

Audit Figma layers against design-system variables—color, spacing, radius, type, components, naming. One-click fixes when values already match tokens.

**Long (first paragraph)**

Offline-friendly design-system audit for Figma. Findings grouped by category; auto-apply when layer values exactly match enabled library variables. Built for SawitPRO DS, works with any file that has variables enabled.

## Setelah lolos review

- Bagikan link Community (dari halaman plugin di Figma) ke Slack/Notion tim.
- Tim **tidak** perlu import manifest: **Resources → Plugins → Community** → pasang **DESIGN AUDIT SAWITPRO**.
- Bar judul Figma menampilkan logo setelah publish (bukan ikon `</>` development).

## Community vs org privat

| | Community (publik) | Org privat |
|---|-------------------|------------|
| Siapa bisa pasang | Siapa saja di Figma | Hanya anggota org |
| Review | Ya (Figma) | Lebih ringkas |
| Brand | Pastikan izin logo/nama SawitPRO publik | Internal |

Detail org privat: [`publish-v1.md`](publish-v1.md), [`team-rollout.md`](team-rollout.md) Fase B.

Terakhir diperbarui: 2026-10-27.
