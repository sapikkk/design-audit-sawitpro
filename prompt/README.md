# DS Audit Pro (v2)

Plugin Figma lokal untuk mengaudit kepatuhan Design System. Tanpa LLM saat berjalan, tanpa REST API, tanpa data token di repository.

## Prinsip

Repository tidak menyimpan token. Plugin menemukan sendiri variabel dan text style dari file yang dibuka, serta variabel dari library yang di-enable. Setiap audit membangun registry baru dari sumber itu.

## Isi folder

```
plugin/        manifest.json, code.js, ui.html
config/        rules.json (bobot, ambang, pola nama; tanpa token), detached-test-log.md
exports/       JSON hasil audit per file (dibuat plugin)
reports/       CSV dan summary.md (dibuat aggregate.js)
scripts/       aggregate.js
```

## Instalasi (sekali per anggota tim)

1. Clone repository atau unduh ZIP.
2. Figma Desktop atau Web: Main Menu > Plugins > Development > Import plugin from manifest.
3. Pilih `plugin/manifest.json`.
4. Ganti `"id"` di manifest dengan ID yang diberikan Figma saat plugin dibuat.
5. Di file yang akan diaudit, aktifkan library tim lewat Assets > Libraries (Figma tidak mengizinkan plugin mengaktifkannya).

## Alur harian

1. Buka file sprint.
2. Jalankan plugin, mode **AUDIT FILE**.
3. Isi nama sprint dan penanggung jawab. Upload `rules.json` jika ingin mengubah bobot (opsional).
4. Klik **Jalankan audit**. Centang **Scan semua halaman** untuk semua halaman.
5. Klik **Ekspor JSON**, simpan ke `exports/`.
6. Ulangi untuk setiap file.
7. Di terminal: `npm run aggregate`. Hasil ada di `reports/`.

Perbaikan (opsional):
- Centang baris **EXACT**, lalu **Terapkan terpilih**, atau **Terapkan semua EXACT**.
- Simpan file undo yang diunduh otomatis.
- **Buat anotasi** menaruh label di halaman `🔍 DS Audit`. **Hapus anotasi** hanya mengosongkan halaman itu.

Snapshot token (opsional): mode **SNAPSHOT TOKEN** mengunduh daftar token yang ditemukan di file. Untuk dokumentasi, tidak dipakai audit.

## Skor

Rata-rata berbobot dari rasio lulus per kategori. Kategori tanpa objek yang bisa dicek tidak dihitung dan bobotnya dinormalisasi. Jika tidak ada yang bisa dicek sama sekali, skor 100.

- ≥ 90: EXCELLENT
- 75 sampai 89: PASS_WITH_WARNING
- < 75: REJECTED

## Yang ditemukan otomatis dan yang tidak

| Sumber | Ditemukan otomatis? |
| :--- | :--- |
| Variabel lokal di file | Ya |
| Variabel dari library yang di-enable | Ya (lewat teamLibrary, nilainya di-import) |
| Text style lokal | Ya |
| Text style dari library | **Tidak**. Belum ada API untuk mendaftar style library. Style yang sudah dipakai di file bisa dikenali saat audit. |
| Komponen lokal | Ya |
| Komponen dari library | **Tidak didaftar**. Plugin hanya menilai instance: main component dari library dianggap sah, komponen lokal dianggap tidak sah. |
| Daftar library yang di-enable | **Tidak**. Plugin hanya melihat koleksi variabel dari library yang sudah aktif. |

Akibatnya: plugin tidak bisa memastikan bahwa sebuah instance berasal dari library tim tertentu, hanya bahwa berasal dari library apa pun yang di-enable.

## Batasan lain

- **Deteksi detached bersifat heuristik.** Frame yang namanya sama dengan komponen lokal ditandai untuk diperiksa manual. Catat hasil uji di `config/detached-test-log.md`.
- **Isi instance tidak diperiksa.** Itu tanggung jawab library.
- **Hanya file yang sedang dibuka** yang bisa diaudit. Audit banyak file berarti membuka dan menjalankan plugin satu per satu.
- **Undo tidak didukung Figma API.** File undo memulihkan nilai sebelumnya. Binding variabel pada properti numerik perlu dicek ulang setelah dipulihkan.
- **Radius seragam hanya diikat pada `topLeftRadius`.** Keempat sudut perlu dicek manual.
- **Fill campuran** dan **teks campuran** dilaporkan untuk pengecekan manual.
- **Opacity hardcoded** belum dicek.
- **Padding dan radius 0** dianggap standar.
- **Near match** (ΔE2000 di bawah `nearMatchDeltaE`) hanya saran, tidak pernah diterapkan otomatis.
- **Import variabel library** menambah referensi variabel ke file yang diaudit setiap kali audit berjalan.

## Yang belum diuji

Kode belum dijalankan di Figma. Uji sebelum dipakai untuk audit tim:
- apply EXACT pada variabel lokal dan variabel library,
- pemulihan undo,
- anotasi pada file besar,
- `documentAccess: dynamic-page` dengan banyak halaman,
- apakah `teamLibrary` mengembalikan koleksi setelah library di-enable,
- heuristik detached pada tiga file nyata.
