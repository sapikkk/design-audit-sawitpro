# REQ-HDO-001 — DesignDoc [Spectral]: Measures, Annotations, and Handoff

| Field | Nilai |
|-------|--------|
| **Status** | Diterima untuk tim desain SawitPRO |
| **Tipe** | Plugin Figma Community (pihak ketiga), bukan kode di repo ini |
| **Publisher** | Marka Plugin Dev |
| **Community** | [DesignDoc [Spectral]](https://www.figma.com/community/plugin/1177722582033208360/designdoc-spectral-measures-annotations-and-handoff) |
| **Situs / lisensi** | [spectral.markaplugin.com](https://spectral.markaplugin.com/) · Pro via Lemon Squeezy |
| **Sumber kode** | Tidak ada repo GitHub publik; closed source |

## Masalah yang diselesaikan

Dev dan QA butuh **jarak nyata di kanvas** (padding, gap, margin, ukuran frame) tanpa membuka Dev Mode di setiap layer. DESIGN AUDIT SAWITPRO mengecek **kepatuhan DS** (variabel, penamaan, instance) tetapi **tidak** menggambar redline handoff di atas desain sprint.

Spectral mengisi celah **handoff visual**: ukuran + anotasi spec untuk engineering, terutama auto-layout bertingkat.

## Ruang lingkup (in)

1. **Measures** — label spacing/margin/padding pada seleksi; layer dikelompokkan (mis. grup `📏 Container` di halaman).
2. **Create Spec** — scan node + nested frame; cocok untuk komponen auto-layout.
3. **Pembersihan** — hapus ukuran per node atau seluruh grup container sebelum share file.

## Di luar ruang lingkup (out)

- Audit skor DS, bind variabel, rename layer, deteksi detached → tetap **DESIGN AUDIT SAWITPRO**.
- Vendor kode Spectral ke repo SawitPRO.
- Menggantikan Dev Mode untuk snippet kode / export asset.

## Koeksistensi dengan plugin internal

| Aspek | DESIGN AUDIT SAWITPRO | DesignDoc Spectral |
|--------|------------------------|---------------------|
| Tujuan | Lint DS sebelum critique/handoff | Dokumentasi px untuk dev |
| Anotasi | Halaman `🔍 DS Audit` (temuan) | Overlay di halaman desain |
| Network runtime | Tidak | `*.markaplugin.com` (validasi lisensi Pro) |
| File sprint | Audit + apply | Measures/spec (bersihkan sebelum merge ke master) |

**Aturan file:** gunakan Spectral di **file sprint / handoff**; hindari menumpuk redline di **file library DS** atau species master. Sebelum publish frame ke dev, pertimbangkan duplikat halaman “handoff” vs “desain bersih”.

## Model harga (verifikasi ulang di UI plugin)

| Tier | Ringkasan (situs publisher, 2026) |
|------|-------------------------------------|
| Gratis | Ukuran tak terbatas; kuota generasi **spec** terbatas (situs menyebut ~50) |
| Pro | Spec tanpa batas; aktivasi license key di plugin |

Tim menilai apakah kuota gratis cukup untuk pilot; upgrade Pro keputusan Design Ops.

## Kebutuhan non-fungsional

| ID | Kebutuhan |
|----|-----------|
| NFR-01 | Hanya dipasang di org yang mengizinkan plugin Community dengan network ke `markaplugin.com`. |
| NFR-02 | Tidak memproses data sprint di luar Figma (sesuai pernyataan publisher; verifikasi Network tab saat pilot). |
| NFR-03 | Tidak mengganti checklist audit internal (`team-rollout.md`). |

## Risiko yang diketahui (Community)

- Anotasi/ukuran **tidak ikut** saat frame dipindah; bisa perlu ulang measure.
- **Create Spec** bisa menghasilkan terlalu banyak label → waktu bersih-bersih manual.
- **Slot** komponen baru dilaporkan hang pada versi tertentu — uji di file pilot sebelum wide rollout.
- Label variabel menampilkan path folder DS, belum selalu sama dengan nama token di kode (wishlist komunitas).

## Instalasi (tim)

1. Figma Desktop → Community → link di atas → **Install** (atau Org plugins jika sudah di-allow admin).
2. File uji: satu screen auto-layout sprint 3F.
3. Jalankan **DESIGN AUDIT SAWITPRO** dulu (skor/temuan); lalu Spectral untuk redline layer yang sudah lulus atau disetujui exception.

## Kriteria penerimaan pilot (3 layar)

| # | Kriteria |
|---|----------|
| AC-1 | Dev membaca gap utama tanpa Dev Mode pada ≥2 dari 3 layar pilot. |
| AC-2 | Waktu bersih-bersih spec (hapus label berlebih) ≤15 menit per layar atau workflow diubah (measures saja, tanpa full spec). |
| AC-3 | Tidak bentrok dengan halaman audit internal; redline tidak masuk ke file library DS. |
| AC-4 | Design lead mencatat keputusan Gratis vs Pro setelah kuota spec habis. |

## Alternatif yang dipertimbangkan

| Opsi | Keputusan |
|------|-----------|
| Hanya Dev Mode | Ditolak untuk pilot: ketergantungan seat / kurang visual di critique. |
| Fitur measure di plugin SawitPRO | Tunda: effort besar; Spectral sudah dipakai luas (~140k+ user di indeks komunitas). |
| Plugin redline open source | Tidak dipilih untuk fase ini; Spectral sudah memenuhi REQ singkat. |

## Tindak lanjut opsional (produk internal)

- Paragraf di `community-linter-comparison.md` (kategori handoff).
- Satu baris di `prompt/README.md` / `team-rollout.md`: “handoff ukuran → Spectral”.

**Pemilik dokumen:** Design Ops / PIC plugin. **Revisi:** cek versi Community + pricing publisher setiap kuartal.
