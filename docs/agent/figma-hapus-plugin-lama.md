# Figma browser — hapus plugin lama (5 menit)

Console error **TypeScript**, **FILE_CATEGORY_LABEL**, **import expression** = plugin **bukan** dari folder `figma-dev/` terbaru.

## A. Bersihkan console (supaya tidak bingung)

1. Di Chrome: **F12** → tab **Console**
2. Klik ikon **Clear console** (lingkaran garis miring)
3. Jangan scroll log lama — yang lama **tidak** hilang sendiri dari layar

## B. Hapus plugin development lama

Di file Figma (browser **atau** Desktop):

1. Klik menu **Plugins** (atas tengah)
2. **Development** → **Manage plugins in development…**
3. Untuk **setiap** baris di list:
   - klik **⋯** (tiga titik) → **Remove plugin**
4. Hapus **semua**, termasuk:
   - DESIGN AUDIT SAWITPRO (lama)
   - plugin **TypeScript template**
   - duplikat apapun

List harus **kosong**.

## C. Import yang benar (sekali)

1. **Plugins** → **Development** → **Import plugin from manifest…**
2. Pilih file (Finder):

   `Downloads/SAWITPRO AUDIT PLUGIN/figma-dev/manifest.json`

3. Nama plugin harus: **SAWITPRO DS Audit (import ini)**

## D. Jalankan

1. **Plugins** → **Development** → **SAWITPRO DS Audit (import ini)**
2. Harus muncul notifikasi: **DESIGN AUDIT SawitPRO — panel siap**
3. Panel kanan: tab **Audit | Apply | Tools**

Kalau notifikasi itu **tidak** muncul, Anda masih menjalankan plugin lama — ulangi B dan C.

## E. Terminal (Mac)

```bash
cd ~/Downloads/SAWITPRO\ AUDIT\ PLUGIN
npm run figma:setup
```

Lalu ulangi B → C → D di Figma.
