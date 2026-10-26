# Publish v1.0 — DESIGN AUDIT SAWITPRO

## Asset

| File | Ukuran | Dipakai |
|------|--------|---------|
| [`icon.png`](../../icon.png) | 128×128 | Upload di modal Publish + header panel (`prompt/icon.png`) |
| [`assets/sawitpro-icon.png`](../../assets/sawitpro-icon.png) | Master | `npm run figma:bundle` regenerates icons |

Logo di **header panel** = `icon.png` di folder yang sama dengan `ui.html`.  
Logo di **bar native Figma** (`</>` → logo) = upload **`icon.png`** saat publish (Development import tidak mengubah bar native).

## Sebelum publish

```bash
cd ~/Downloads/SAWITPRO\ AUDIT\ PLUGIN
git pull
npm run figma:bundle
npm run figma:check
```

Versi rilis: **1.0.0** (tampilan UI **v1.0**).

## Langkah di Figma Desktop

1. **Plugins → Development → DESIGN AUDIT SAWITPRO** — pastikan plugin jalan (logo di header panel, notifikasi `v1.0`).
2. **Publish new release** (atau **Manage plugin → Publish**).
3. **Private to organization** (SawitPRO) — disarankan internal.
4. Upload **`icon.png`** dari root repo (128×128 PNG).
5. Release notes: `v1.0 — audit DS, apply EXACT, tools detach/remap`.
6. Submit. Jika modal minta **Generate ID** baru, salin ke `manifest.json` + `figma-dev/manifest.json`, lalu `npm run figma:bundle` dan publish lagi.

## Setelah publish

Tim instal dari **Organization plugins**, bukan Development import.  
ID plugin di manifest harus sama dengan plugin terpublish.
