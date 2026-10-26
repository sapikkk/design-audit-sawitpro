# SPESIFIKASI: DESIGN SYSTEM AUDIT PLUGIN (FIGMA PROFESSIONAL)

Versi: 1.0
Status: Draf untuk disetujui
Bahasa UI dan laporan: Bahasa Indonesia. Nama teknis (layer, variabel, properti Figma) tetap Bahasa Inggris.

---

## 0. CARA MEMAKAI DOKUMEN INI

Dokumen ini adalah **brief build**. Dipakai sekali oleh Cursor (atau developer) untuk menulis kode `manifest.json`, `code.js`, `ui.html`, `aggregate.js`, dan `extract-library.js` (opsional). Setelah kode jadi, audit berjalan sepenuhnya dengan JavaScript deterministik.

**Aturan keras:**
- Tidak ada pemanggilan LLM saat plugin atau script berjalan.
- Tidak ada pemanggilan REST API Figma untuk variabel (endpoint variabel hanya untuk Enterprise).
- Semua perhitungan skor, pencocokan nilai, dan pembuatan payload dilakukan oleh kode, bukan oleh model bahasa.

---

## 1. TUJUAN

1. Memindai satu file Figma (satu halaman atau semua halaman) dan menemukan pelanggaran terhadap Design System tim.
2. Menghitung skor kepatuhan per file yang bisa dibandingkan antar-file, antar-sprint, dan antar-waktu.
3. Mengoreksi otomatis nilai yang punya padanan *exact* ke variabel resmi, hanya setelah persetujuan desainer.
4. Menampilkan anotasi visual di halaman terpisah, bukan di frame produksi.
5. Mengekspor hasil audit sebagai JSON per file, lalu menggabungkannya menjadi laporan tim (CSV) lewat script lokal.

## 2. BATASAN YANG HARUS DIPATUHI

| Batasan | Dampak |
| :--- | :--- |
| Paket Figma tim: Professional | Endpoint REST variabel tidak tersedia. Semua baca/tulis variabel lewat Plugin API. |
| Plugin hanya membaca file yang sedang terbuka | Audit lintas file dilakukan dengan membuka tiap file lalu menjalankan plugin, lalu ekspor JSON. |
| Professional tidak punya "Publish to Organization" untuk plugin privat | Distribusi lewat repository GitHub tim dan impor `manifest.json`. |
| Variabel library lintas file | Wajib memakai `importVariableByKeyAsync` dengan variable key, bukan ID. |
| Node dengan `figma.mixed` | Harus ditangani sebagai pelanggaran atau dilewati dengan catatan, tidak boleh menyebabkan crash. |

## 3. ARSITEKTUR

```
[Master Design System file]
   └─ Plugin mode: EXTRACT LIBRARY  ──► library-registry.json (variabel, style, komponen, key)
                                              │
[Setiap file sprint]                          │
   └─ Plugin mode: AUDIT ──► rules.json ◄─────┤ (dibaca dari repo via impor, atau disimpan di plugin)
        │                         │
        ▼                         ▼
   audit-<namafile>.json    (dipakai untuk matching)
        │
        ▼
[Node.js lokal: aggregate.js]  (tanpa LLM)
   ├─ team-report.csv          (per pelanggaran, semua file)
   ├─ score-per-file.csv       (skor tiap file)
   └─ score-per-sprint.csv     (rata-rata berbobot per folder sprint)
```

## 4. STRUKTUR REPOSITORY

```
ds-audit/
├─ plugin/
│  ├─ manifest.json
│  ├─ code.js
│  └─ ui.html
├─ config/
│  ├─ rules.json            (aturan, bobot, ambang, pola nama)
│  └─ library-registry.json (hasil ekstraksi dari master file)
├─ exports/                 (JSON hasil audit per file, dari plugin)
├─ reports/                 (keluaran aggregate.js)
├─ scripts/
│  ├─ aggregate.js
│  └─ check-registry.js     (validasi library-registry.json)
├─ package.json             (dependensi: hanya Node bawaan, tanpa LLM)
└─ README.md
```

## 5. MANIFEST

```json
{
  "name": "DS Audit Pro",
  "id": "ISI_ID_UNIK_DARI_FIGMA",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"],
  "documentAccess": "dynamic-page",
  "permissions": []
}
```

Catatan:
- `documentAccess: dynamic-page` wajib agar `figma.loadAllPagesAsync()` dan `page.findAllAsync` bisa dipakai pada file besar.
- Tidak ada `networkAccess`. Plugin tidak mengambil data dari internet. Aturan dibaca dari file lokal yang diimpor bersama plugin atau ditempel di UI.

## 6. MODE PLUGIN

Plugin punya tiga mode yang dipilih dari dropdown di UI:

1. **AUDIT FILE** (mode utama, dijalankan di setiap file sprint)
2. **EXTRACT LIBRARY** (dijalankan sekali di file master Design System, lalu setiap ada perubahan token)
3. **APPLY & ANNOTATE** (aksi lanjutan setelah audit, selalu butuh klik persetujuan)

## 7. ATURAN PENAMAAN (`rules.json` → `naming`)

Pola yang diterima:

| Jenis node | Pola layer | Contoh valid |
| :--- | :--- | :--- |
| Screen (frame top-level di halaman) | `^Screen\/[A-Za-z0-9-]+$` | `Screen/Homepage`, `Screen/Checkout-Step-1` |
| Komponen (COMPONENT atau INSTANCE) | `^(Card\|Button\|Navbar\|Input\|Modal)\/[A-Za-z0-9-]+$` | `Button/Primary` |
| Teks | `^Text\/(Header\|Body\|Caption\|Label)$` | `Text/Body` |
| Ikon | `^Icon\/[A-Za-z0-9-]+$` | `Icon/Search` |
| Surface | `^Surface\/[A-Za-z0-9-]+$` | `Surface/Default` |

Nama bawaan Figma (`Frame \d+`, `Rectangle \d+`, `Group \d+`, `Vector \d+`, `Text \d+`) dianggap pelanggaran *Minor Naming* (LOW), kecuali node tersebut hidden (`visible === false`).

## 8. DAFTAR PENGECEKAN

Setiap pengecekan menghasilkan dua nilai: **lulus** atau **gagal**. Hasil dikumpulkan per kategori untuk skor (Bagian 9).

### 8.1 Auto Layout (kategori `AUTO_LAYOUT`)
- Berlaku untuk: FRAME dan COMPONENT yang punya anak.
- Lulus jika `layoutMode !== 'NONE'`.
- Frame tanpa anak (kosong) dilewati, tidak dihitung.
- Screen (top-level) yang gagal diberi severity **HIGH**. Frame internal yang gagal diberi **MEDIUM**.

### 8.2 Typography (kategori `TYPOGRAPHY`)
- Berlaku untuk setiap TEXT.
- Lulus jika `textStyleId` tidak kosong dan bukan `figma.mixed`.
- Jika teks memakai variabel untuk fontSize atau lineHeight tanpa text style, tetap gagal.
- Severity: **MEDIUM**.

### 8.3 Color (kategori `COLOR`)
- Berlaku untuk setiap node yang punya `fills` berisi paint SOLID visible.
- Lulus jika `fillStyleId` tidak kosong, atau `boundVariables.fills` berisi variabel untuk setiap paint SOLID visible.
- Gagal jika ada paint SOLID yang tidak terikat.
- Severity: **LOW**.
- Node dengan `fills` berupa `figma.mixed` dicatat sebagai gagal dengan keterangan "fills campuran, cek manual".

### 8.4 Spacing dan Radius (kategori `SPACING`)
- Berlaku untuk FRAME, COMPONENT, dan INSTANCE dengan Auto Layout.
- Cek: `itemSpacing`, `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`.
- Lulus jika nilai ada di `rules.json → spacingTokens` **atau** properti terikat variabel (`boundVariables`).
- Untuk radius (`cornerRadius`): lulus jika ada di `radiusTokens` atau terikat variabel. Jika `cornerRadius` adalah `figma.mixed`, cek `topLeftRadius` dan saudaranya; jika ada yang tidak sesuai, gagal.
- Severity: **MEDIUM** untuk spacing, **MEDIUM** untuk radius.

### 8.5 Komponen (kategori `COMPONENT`)
Dua cek:

**a. Instance yang tidak sah**
- Berlaku untuk INSTANCE.
- Ambil main component lewat `await node.getMainComponentAsync()`.
- Jika null: gagal, severity **HIGH**, keterangan "instance yatim (main component hilang)".
- Jika key main component tidak ada di `library-registry.json → componentKeys`: gagal, severity **HIGH**, keterangan "komponen dari luar library tim".

**b. Dugaan detached (heuristik, bukan kepastian)**
- Berlaku untuk FRAME atau GROUP.
- Figma tidak menandai frame yang pernah jadi instance. Karena itu deteksi memakai dua sinyal, dan keduanya harus terpenuhi agar dilaporkan:
  1. Nama layer sama persis dengan nama salah satu komponen di `library-registry.json → componentNames`, atau nama diawali nama komponen tersebut diikuti spasi atau `/`.
  2. Node bukan COMPONENT dan bukan INSTANCE.
- Keterangan laporan: "dugaan detached, verifikasi manual".
- Severity: **HIGH**.
- Batas akurasi: heuristik ini bisa salah positif. Sebelum dipakai di produksi, uji pada minimal tiga file nyata yang sudah diketahui kondisinya dan catat hasilnya di `config/detached-test-log.md`.

### 8.6 Naming (kategori `NAMING`)
- Berlaku untuk semua node yang terlihat (`visible !== false`) dan bertipe FRAME, COMPONENT, INSTANCE, TEXT, GROUP.
- Lulus jika cocok dengan pola di Bagian 7.
- Nama bawaan Figma: gagal, LOW.
- Screen yang tidak cocok dengan pola `Screen/*`: gagal, MEDIUM.
- Komponen yang tidak cocok dengan pola: gagal, MEDIUM.

## 9. SKOR KEPATUHAN

### 9.1 Prinsip
Skor **tidak** memakai penalti absolut per pelanggaran. Skor dihitung dari rasio pengecekan yang lulus per kategori, lalu dibobot. Dengan cara ini skor tetap berarti meski file besar atau kecil.

### 9.2 Rumus
Untuk setiap kategori `c` dengan total pengecekan `N_c > 0`:

```
rasio_c = lulus_c / N_c
```

Skor akhir:

```
Skor = (Σ w_c × rasio_c) / (Σ w_c)   untuk c yang N_c > 0
Skor (%) = Skor × 100
```

Kategori dengan `N_c = 0` tidak ikut dihitung, dan bobotnya dinormalisasi otomatis. Ini mencegah file tanpa teks dianggap buruk karena tidak punya teks.

### 9.3 Bobot default (`rules.json → weights`)

| Kategori | Bobot |
| :--- | :--- |
| AUTO_LAYOUT | 20 |
| TYPOGRAPHY | 20 |
| COLOR | 20 |
| SPACING | 15 |
| COMPONENT | 20 |
| NAMING | 5 |

Bobot bisa diubah di `rules.json` tanpa mengubah kode.

### 9.4 Status kelayakan (`rules.json → thresholds`)
- **≥ 90%**: `EXCELLENT` (siap handover)
- **75% sampai 89,99%**: `PASS_WITH_WARNING` (perlu perbaikan minor)
- **< 75%**: `REJECTED` (perlu revisi besar)

### 9.5 Pembulatan
- Skor ditampilkan satu angka di belakang koma.
- Perbandingan antar-file memakai nilai tanpa pembulatan.

### 9.6 Severity tetap dicatat
Severity tidak mempengaruhi skor. Severity dipakai untuk mengurutkan prioritas perbaikan di laporan.

## 10. MATCHING NILAI KE VARIABEL

### 10.1 Warna
1. Konversi `fills` SOLID ke HEX 6 digit (abaikan alpha dulu). Bulatkan tiap channel ke integer 0 sampai 255.
2. Bandingkan dengan `library-registry.json → colorVariables` (HEX dari nilai mode default).
3. **Exact match**: HEX sama persis. Tandai `matchType: "EXACT"`. Boleh di-auto-convert setelah persetujuan.
4. **Near match**: hitung ΔE2000 terhadap setiap warna token. Jika ΔE2000 ≤ `rules.json → nearMatchDeltaE` (default **2.0**), tandai `matchType: "NEAR"` dan `status: "NEEDS_REVIEW"`. **Near match tidak pernah di-auto-convert.** Hanya ditampilkan sebagai saran.
5. Alpha yang tidak 1 dianggap pelanggaran tersendiri dengan keterangan "opacity hardcoded", kecuali tokennya memang punya alpha.

### 10.2 Spacing dan radius
- Exact match nilai px ke token. Tidak ada near match untuk spacing atau radius. Nilai di luar token selalu dilaporkan sebagai "non-standard", dengan saran token terdekat hanya untuk ditampilkan.

### 10.3 Typography
- Cocokkan kombinasi `fontFamily`, `fontStyle`, `fontSize`, dan `lineHeight` ke text style di registry.
- Jika cocok sempurna, sarankan text style itu.
- Jika tidak cocok, tampilkan saran text style dengan `fontSize` terdekat dan `status: "NEEDS_REVIEW"`.

## 11. APPLY (AUTO-CONVERT)

### 11.1 Aturan
- Hanya `matchType: "EXACT"` yang bisa di-apply.
- Apply hanya berjalan setelah desainer memilih baris di UI dan menekan "Terapkan terpilih".
- Tombol "Terapkan semua EXACT" harus menampilkan konfirmasi dengan jumlah node.
- Sebelum mengubah apa pun, simpan nilai lama ke `exports/undo-<timestamp>.json`.

### 11.2 Cara mengikat variabel
- Variabel lokal di file: pakai `figma.variables.getVariableByIdAsync(id)`.
- Variabel dari library: pakai `figma.variables.importVariableByKeyAsync(key)`, lalu ikat.
- Warna: `node.fills = figma.variables.setBoundVariableForPaint(paint, 'color', variable)`.
- Spacing: `node.setBoundVariable('itemSpacing', variable)`, dan seterusnya untuk `paddingLeft` dan properti lain.
- Radius: `node.setBoundVariable('topLeftRadius', variable)` dan saudaranya, atau `cornerRadius` jika seragam.
- Text style: `node.textStyleId = styleId`. Jika style berasal dari library, impor dengan `importStyleByKeyAsync` lebih dulu.

### 11.3 Batasan yang harus dicatat di UI
- Figma tidak punya undo lewat API. Pemulihan hanya bisa dilakukan lewat file undo JSON yang diterapkan oleh mode "Pulihkan dari undo".

## 12. ANOTASI

### 12.1 Lokasi
- Semua anotasi dibuat di halaman baru bernama `🔍 DS Audit`. Jika halaman sudah ada, pakai yang ada.
- Tidak ada perubahan pada frame produksi. Anotasi berupa FRAME terpisah berisi label dan panah dari node target, dengan koordinat absolut.
- Tombol "Hapus anotasi" menghapus seluruh isi halaman `🔍 DS Audit` dan tidak menyentuh halaman lain.

### 12.2 Warna badge
| Kategori | Warna | Prefix label |
| :--- | :--- | :--- |
| SPACING | `#FF9800` | `[SPACE]` |
| TYPOGRAPHY | `#7B61FF` | `[TYPO]` |
| RADIUS | `#07A05E` | `[RADIUS]` |
| COLOR | `#E53935` | `[COLOR]` |
| COMPONENT | `#0D99FF` | `[COMP]` |
| AUTO_LAYOUT | `#795548` | `[LAYOUT]` |
| NAMING | `#9E9E9E` | `[NAME]` |

### 12.3 Isi label
Format: `[PREFIX] <ringkas masalah> → <saran>`. Contoh: `[SPACE] gap 13px → 12px (spacing/m)`. Maksimal 60 karakter. Label lebih panjang dipotong dengan `…`.

### 12.4 Font untuk anotasi
Gunakan font yang sudah ada di file (`figma.listAvailableFontsAsync` untuk memastikan). Jika tidak tersedia, fallback ke `Inter Regular`. Muat font dengan `figma.loadFontAsync` sebelum mengisi teks.

## 13. UI PLUGIN

### 13.1 Elemen
- Dropdown **Mode**: AUDIT FILE, EXTRACT LIBRARY, APPLY & ANNOTATE.
- Input teks **Nama sprint** dan **Penanggung jawab** (dipakai di laporan agregat).
- Checkbox **Scan semua halaman** (default: halaman aktif saja).
- Tombol **Jalankan audit**.
- Panel hasil: ringkasan skor, status kelayakan, dan daftar pelanggaran yang bisa diklik untuk memilih node di canvas.
- Filter: kategori, severity, dan `matchType`.
- Tombol **Ekspor JSON** (menyimpan `audit-<namafile>.json` lewat download browser).
- Tombol **Terapkan terpilih** dan **Terapkan semua EXACT** (dengan konfirmasi).
- Tombol **Buat anotasi** dan **Hapus anotasi**.
- Tombol **Ekstrak library** (hanya aktif di mode EXTRACT LIBRARY).
- Tombol **Pulihkan dari undo** (mengunggah file undo JSON).

### 13.2 Perilaku
- Jika audit berjalan lebih dari 2 detik, tampilkan progres (jumlah node yang sudah diperiksa).
- Traversal dibagi per potongan 500 node. Setelah tiap potongan, `await` sebuah promise nol untuk melepas thread.
- Klik baris pelanggaran memanggil `figma.currentPage.selection` dan `figma.viewport.scrollAndZoomIntoView`.
- Node yang berpindah halaman saat dipilih harus pindah halaman dulu (`figma.currentPage = node.parentPage`).

## 14. FORMAT JSON HASIL AUDIT (kontrak data)

File ekspor `exports/audit-<namafile>.json`:

```json
{
  "schemaVersion": "1.0",
  "fileName": "Checkout Flow v3",
  "fileKey": "abc123",
  "sprint": "Sprint 14",
  "owner": "Nama Desainer",
  "auditedAt": "2026-10-26T10:00:00.000Z",
  "pagesScanned": ["Screens", "Components"],
  "nodeCount": 1832,
  "categories": {
    "AUTO_LAYOUT": { "total": 42, "passed": 40 },
    "TYPOGRAPHY": { "total": 210, "passed": 188 },
    "COLOR": { "total": 390, "passed": 301 },
    "SPACING": { "total": 120, "passed": 99 },
    "COMPONENT": { "total": 64, "passed": 58 },
    "NAMING": { "total": 300, "passed": 250 }
  },
  "score": 84.7,
  "status": "PASS_WITH_WARNING",
  "violations": [
    {
      "id": "123:456",
      "page": "Screens",
      "topLevelScreen": "Checkout / Step 1",
      "layerName": "Button Primary",
      "nodeType": "INSTANCE",
      "category": "COLOR",
      "severity": "LOW",
      "currentValue": "#18A0FB",
      "issue": "Warna fill tidak terikat variabel",
      "matchType": "EXACT",
      "targetVariableKey": "abc...",
      "targetVariableName": "color/brand/primary",
      "suggestion": "Ikat ke color/brand/primary",
      "status": "OPEN"
    }
  ]
}
```

Aturan kontrak:
- `score` dihitung dengan rumus Bagian 9. Angka ini tidak boleh dihitung ulang di UI dengan cara lain.
- `status` mengikuti Bagian 9.4.
- `violations` berisi semua pelanggaran, tidak dipotong.
- `targetVariableKey` hanya diisi jika `matchType` EXACT atau NEAR.

## 15. SCRIPT AGREGAT (`scripts/aggregate.js`)

Tanpa dependensi LLM. Hanya Node.js bawaan (`fs`, `path`).

Input: semua `exports/audit-*.json`.

Output:
1. `reports/team-report.csv`: satu baris per pelanggaran. Kolom: `sprint, owner, fileName, page, topLevelScreen, layerName, category, severity, matchType, currentValue, suggestion, status`.
2. `reports/score-per-file.csv`: satu baris per file. Kolom: `sprint, owner, fileName, score, status, nodeCount, dan rasio per kategori`.
3. `reports/score-per-sprint.csv`: rata-rata skor per sprint, dihitung dengan bobot `nodeCount` supaya file besar punya pengaruh lebih.
4. `reports/summary.md`: ringkasan tabel tiga kategori terburuk, tiga desainer dengan skor terendah, dan jumlah pelanggaran per severity.

Aturan:
- File JSON yang `schemaVersion`-nya tidak cocok dilewati dan dicatat di konsol.
- Jika `owner` kosong, isi `(tidak diisi)`.
- Skrip harus idempoten: menjalankan dua kali menghasilkan output yang sama.

## 16. SCRIPT VALIDASI REGISTRY (`scripts/check-registry.js`)

Memeriksa `config/library-registry.json`:
- Tidak ada key duplikat.
- Setiap variabel warna punya `hex` valid.
- Setiap token spacing berupa angka.
- Tidak ada nama token yang melanggar pola `color/`, `spacing/`, `radius/`, `text/`.

Gagal dengan kode keluar 1 dan pesan jelas jika ada masalah.

## 17. EKSTRAKSI LIBRARY (mode EXTRACT LIBRARY)

Dijalankan di file master. Menghasilkan `library-registry.json`:

```json
{
  "schemaVersion": "1.0",
  "extractedFrom": "DS Master",
  "extractedAt": "2026-10-26T10:00:00.000Z",
  "componentKeys": ["key1", "key2"],
  "componentNames": ["Button/Primary", "Card/ProductItem"],
  "colorVariables": [
    { "name": "color/brand/primary", "key": "abc", "id": "VariableID:1:2", "hex": "#0052CC" }
  ],
  "spacingVariables": [
    { "name": "spacing/m", "key": "def", "id": "VariableID:1:3", "px": 12 }
  ],
  "radiusVariables": [
    { "name": "radius/sm", "key": "ghi", "id": "VariableID:1:4", "px": 4 }
  ],
  "textStyles": [
    { "name": "Text/Body", "key": "jkl", "id": "S:1", "fontFamily": "Inter", "fontStyle": "Regular", "fontSize": 14, "lineHeight": 20 }
  ]
}
```

Catatan:
- `key` adalah string stabil yang dipakai lintas file. `id` hanya berlaku di file master.
- Variabel dengan lebih dari satu mode: ambil nilai mode default.
- Jika file master tidak punya variabel lokal, tampilkan peringatan, jangan gagal diam-diam.

## 18. PENANGANAN KASUS KHUSUS

| Kasus | Perilaku |
| :--- | :--- |
| `figma.mixed` pada fills, cornerRadius, textStyleId | Dicatat sebagai pelanggaran dengan keterangan "nilai campuran, cek manual". |
| Node `visible: false` | Dilewati di semua pengecekan. Jumlahkan di `hiddenSkipped` untuk transparansi. |
| Instance di dalam instance | Dicek seperti biasa. Tidak diperiksa ke dalam isi main component (itu tanggung jawab library). |
| Halaman yang belum dimuat | Panggil `await figma.loadAllPagesAsync()` sebelum scan semua halaman. |
| File sangat besar (timeout) | Traversal per potongan dengan pelepasan thread. Tampilkan progres. |
| Node dari library yang tidak dimuat | Dicatat sebagai `matchType: "UNRESOLVED"` dengan keterangan. Tidak dihitung sebagai lulus maupun gagal, dan dikeluarkan dari penyebut rasio. |
| Teks kosong | Dilewati di pengecekan typography. |

## 19. PENGUJIAN PENERIMAAN

Plugin dianggap siap jika lulus semua tes berikut:

1. **Screen tanpa Auto Layout** terdeteksi sebagai HIGH.
2. **Teks dengan text style** lulus. **Teks tanpa style** gagal dengan MEDIUM.
3. **Fill ter-bind variabel** lulus. **Fill hardcoded** gagal dengan LOW.
4. **Instance dari main component di registry** lulus. **Instance dari luar registry** gagal dengan HIGH.
5. **Nilai px ada di token** lulus. **Nilai px di luar token** gagal.
6. **Skor 100%** untuk file yang semua pengecekannya lulus.
7. **Skor tidak turun ke 0** hanya karena jumlah pelanggaran banyak, selama rasio lulus masih ada.
8. **Apply EXACT** mengubah node dan menyimpan undo JSON.
9. **Near match** tidak pernah ikut "Terapkan semua EXACT".
10. **Anotasi** tidak menambah node di halaman selain `🔍 DS Audit`.
11. **Hapus anotasi** menghapus seluruh halaman anotasi tanpa menyentuh halaman lain.
12. **Agregat** dengan dua file menghasilkan output yang sama saat dijalankan dua kali.
13. **File besar** (lebih dari 2.000 node) selesai tanpa crash, dengan progres tampil.
14. **Heuristik detached** diuji pada tiga file nyata; hasilnya dicatat di `config/detached-test-log.md`.

## 20. DISTRIBUSI DAN VERSI

- Simpan folder `plugin/` di repository GitHub tim.
- Setiap anggota tim: clone atau unduh ZIP, lalu Plugins > Development > Import plugin from manifest di Figma Desktop atau Web.
- Pembaruan: `git pull`, lalu Plugins > Development > Re-import plugin from manifest.
- Kolom `schemaVersion` di JSON harus dinaikkan jika format berubah, dan `aggregate.js` harus menolak versi yang tidak dikenal.

## 21. ATURAN DAN BOBOT (`config/rules.json`)

```json
{
  "schemaVersion": "1.0",
  "weights": {
    "AUTO_LAYOUT": 20,
    "TYPOGRAPHY": 20,
    "COLOR": 20,
    "SPACING": 15,
    "COMPONENT": 20,
    "NAMING": 5
  },
  "thresholds": { "excellent": 90, "warning": 75 },
  "nearMatchDeltaE": 2.0,
  "spacingTokens": [4, 8, 12, 16, 24, 32, 48, 64],
  "radiusTokens": [0, 4, 8, 12, 16, 999],
  "allowedFonts": ["Inter", "Roboto"],
  "namingPatterns": {
    "screen": "^Screen\\/[A-Za-z0-9-]+$",
    "component": "^(Card|Button|Navbar|Input|Modal)\\/[A-Za-z0-9-]+$",
    "text": "^Text\\/(Header|Body|Caption|Label)$",
    "icon": "^Icon\\/[A-Za-z0-9-]+$",
    "surface": "^Surface\\/[A-Za-z0-9-]+$"
  }
}
```

Catatan: nilai `spacingTokens`, `radiusTokens`, dan `allowedFonts` di atas masih contoh. Ganti dengan token asli dari Design System tim sebelum audit pertama.

## 22. TUGAS BUILD UNTUK CURSOR (SEKALI SAJA)

Urutan kerja:
1. Buat struktur folder Bagian 4.
2. Tulis `config/rules.json` dari Bagian 21 dan `config/library-registry.json` dummy sesuai Bagian 17.
3. Tulis `plugin/manifest.json`, `plugin/code.js`, dan `plugin/ui.html` sesuai Bagian 5 sampai 13.
4. Tulis `scripts/aggregate.js` sesuai Bagian 15 dan `scripts/check-registry.js` sesuai Bagian 16.
5. Jalankan `node scripts/check-registry.js` dan `node scripts/aggregate.js` pada data contoh di `exports/`.
6. Uji plugin di satu file uji dengan semua kasus Bagian 19.
7. Tulis `README.md` berisi langkah instalasi dan pemakaian harian.

Larangan saat build: jangan menambahkan fitur di luar dokumen ini. Setiap fitur baru harus dicatat dulu sebagai usulan revisi dokumen.

## 23. ITEM YANG BELUM DIISI

- [ ] Token spacing asli tim.
- [ ] Token radius asli tim.
- [ ] Daftar font yang diizinkan.
- [ ] Hasil ekstraksi library dari file master.
- [ ] Hasil uji heuristik detached pada tiga file nyata.
- [ ] ID plugin di `manifest.json`.
