# Ikon brand di header & menu plugin Figma

## Kenapa masih ikon `</>`?

Bar **DESIGN AUDIT SAWITPRO** dengan ikon code (screenshot) adalah **chrome native Figma** di luar iframe. Plugin development yang di-import lewat `manifest.json` **tidak** membaca `ui.html` untuk bar itu.

Ikon di bar + menu **Recents / Development** di-set saat **publish** plugin (Community atau **Organization private**), bukan lewat CSS di dalam plugin.

Referensi: [Publishing to the Community](https://help.figma.com/hc/en-us/articles/4407531267607-BYFP-Publishing-to-the-Community) — ikon **128×128 px PNG** di-upload di modal Publish.

## Asset siap pakai

| File | Ukuran | Pemakaian |
|------|--------|-----------|
| [`../../icon.png`](../../icon.png) | 128×128 | Upload saat publish |
| [`../../assets/sawitpro-icon.png`](../../assets/sawitpro-icon.png) | Master | Sumber desain |
| [`../../prompt/brand-icon.png`](../../prompt/brand-icon.png) | 72×72 | Header di dalam panel plugin (iframe) |

## Langkah (SawitPro — plugin privat org, disarankan)

1. Pastikan `icon.png` di root repo (sudah dari brand SawitPRO).
2. Figma Desktop → **Plugins → Development** → pilih **DESIGN AUDIT SAWITPRO**.
3. **Publish plugin…** (atau **Manage plugin → Publish**).
4. Pilih **Organization** / **Private to SawitPro** (bukan public Community jika hanya internal).
5. Upload **`icon.png`** (128×128), isi deskripsi singkat, submit.
6. Tim memasang plugin dari **Organization plugins**, bukan hanya Development import.
7. Jalankan plugin dari listing org — header native seharusnya menampilkan **logo SawitPRO**.

Setelah publish, `id` di `manifest.json` harus tetap sama dengan plugin di Figma (ganti hanya jika modal publish minta ID baru).

## Development import (sementara)

- Di dalam panel, header hijau + logo sudah dari `prompt/ui.html`.
- Bar native tetap `</>` sampai langkah publish di atas selesai.
- Setelah ubah manifest: **Development → Import plugin from manifest** lagi (root `manifest.json`).

Terakhir diperbarui: 2026-10-26.
