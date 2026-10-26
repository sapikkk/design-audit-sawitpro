# Rollout tim — DESIGN AUDIT SAWITPRO

Checklist dari development import sampai tim desain pakai plugin org.

## Fase A — Anda (plugin owner) ✅ import manifest

Sudah jika toast **“has been imported”** dan plugin ada di **Resources → Plugins & widgets → Development**.

| # | Langkah | Selesai? |
|---|---------|----------|
| A1 | Figma Desktop, login **SawitPro** org | ☐ |
| A2 | **Import from manifest** → root [`manifest.json`](../../manifest.json) | ☐ |
| A3 | Buka file desain → **Assets → Libraries** → nyalakan **DS 3.0 Color** (dan library komponen jika dipakai) | ☐ |
| A4 | Jalankan plugin → tab **Audit** → **Halaman** → **Jalankan audit** → skor & temuan muncul | ☐ |
| A5 | Uji **Apply** (EXACT) + **Pulihkan** di frame uji | ☐ |

**Catatan:** Setelah edit kode, cukup **tutup panel & jalankan plugin lagi**. Import manifest **hanya** jika pindah folder atau ubah `manifest.json`.

---

## Fase B — Publish org (ikon brand + install tanpa manifest)

| # | Langkah | Selesai? |
|---|---------|----------|
| B1 | Pastikan [`icon.png`](../../icon.png) (128×128) di repo | ☐ |
| B2 | **Plugins → Development → DESIGN AUDIT SAWITPRO → Publish plugin…** | ☐ |
| B3 | Visibility: **Private to organization** (SawitPro) | ☐ |
| B4 | Upload **icon.png**, deskripsi singkat, submit | ☐ |
| B5 | Buka plugin dari **Org plugins** (bukan Development) — bar atas harus logo SawitPRO, bukan hanya `</>` | ☐ |

Detail: [`figma-plugin-icon-publish.md`](figma-plugin-icon-publish.md).

---

## Fase C — Tim desain (tanpa Git)

Kirim ke tim (Slack/Notion):

1. Figma Desktop → **Resources → Plugins & widgets** → filter **Organization**.
2. Pasang **DESIGN AUDIT SAWITPRO**.
3. Di setiap file sprint: **Libraries** → enable DS tim.
4. **Audit** sebelum handoff; perbaiki **EXACT** dari tab Apply; jangan detach/remap di file produksi tanpa koordinasi DS.

---

## Fase D — Opsional (DS lead / eng)

| # | Item |
|---|------|
| D1 | Komponen ilustrasi/dekor: deskripsi **`[no-tokens]`** agar instance dilewati audit |
| D2 | Agregat lintas file: clone repo → `node prompt/aggregate.js` (pipeline offline, bukan dari plugin) |
| D3 | Parity vs plugin Community: [`community-linter-comparison.md`](community-linter-comparison.md) |

---

## Troubleshooting cepat

| Gejala | Solusi |
|--------|--------|
| Console: **TypeScript… generate code.js** | Manifest mengarah ke **`code.js` root** (stub). Hapus plugin Development lama → **Import** [`manifest.json`](../../manifest.json) **root** (`main`: `prompt/code.js`). |
| Console: **FILE_CATEGORY_LABEL is not initialized** | Versi/cache plugin lama → tutup plugin → import ulang manifest root. |
| Console: **import expression rejected** | Biasanya plugin dev lain / cache; hapus duplikat **DESIGN AUDIT SAWITPRO** di Development, sisakan satu dari folder repo. |
| LaunchDarkly / Datadog / Gravatar 403 | Noise Figma web app — **abaikan**, bukan plugin Anda. |
| **Memuat token…** lama ( pertama kali ) | Normal 10–60 dtk; tunggu **X/Y**. Buka plugin beberapa detik dulu (warmup) atau audit ulang (cache). |
| Audit 100% tanpa temuan padahal ada raw color | Library DS belum di-enable di file ini |
| Mode **Seleksi** tidak jalan | Pilih minimal satu layer di kanvas |
| Tema “Fallback SawitPRO” | Import variabel DS 3.0 Color ke file atau enable library |
| Permission teamlibrary | Manifest sudah `"permissions": ["teamlibrary"]` — re-import hanya jika manifest berubah |
| Bar native masih `</>` | Belum publish org (Fase B) |

---

**Repo:** https://github.com/sapikkk/design-audit-sawitpro · **Changelog:** [`CHANGELOG.md`](../../CHANGELOG.md)
