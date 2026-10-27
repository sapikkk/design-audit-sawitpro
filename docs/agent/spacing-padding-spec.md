# Ketentuan spacing, padding, radius — SawitPRO

Sumber: ukur langsung dari file `PRODUCT-DESIGN-INTERN-PLATFORM` (page "DS Audit", frame `Home-Panen` 360×800, plus statistik 413 node auto-layout) dan konvensi umum design system profesional. Variabel spacing di library `Main System/*` tidak bisa dibaca dari file ini (library remote), jadi nilai di bawah adalah nilai terukur, bukan nama token.

## 1. Skala dasar

Grid 4/8 px. Nilai yang dipakai dan sering muncul di file:

| Nilai | Dipakai untuk |
|-------|---------------|
| 4 | celah rapat (ikon–teks kecil, padding dalam pill input) |
| 8 | gap default antar elemen terkait (paling sering: 164 kali) |
| 12 | gap sedang (ikon–judul navbar), padding vertikal tombol |
| 16 | margin layar, padding section, gap antar blok |
| 20 | padding vertikal field / navbar |
| 24 | gap besar antar grup, radius tombol pill |

Nilai di luar skala ini (6, 10, 15.218…) adalah temuan audit: bulatkan ke 4/8.

## 2. Layar (mobile 360 px)

Terukur di `Home-Panen`:

| Area | Padding | Gap |
|------|---------|-----|
| Layar (frame root) | 0, tiap section memegang paddingnya sendiri | 0 |
| Status bar | 8 | — |
| Navbar | 20 atas/bawah, **16 kiri/kanan** | 24 (antar grup), 12 (ikon–judul) |
| Section / Form | **16 semua sisi** (atau 16 atas-bawah, konten 16 dari tepi) | 16 |
| Daftar field (Input Text) | 20 atas/bawah, 16 kiri/kanan | 8 (label–input) |
| Grup chip | 0 | 8 |
| Jarak antar section | — | 8 |
| Bar tombol bawah (Button Container) | 16 semua sisi | — |

Aturan praktis:
- Margin horizontal layar **16**; lebar konten 328 pada layar 360.
- Konten tidak menempel tepi: padding dipasang di section, bukan di frame layar.
- Tombol aksi utama pinned di bawah, tinggi total bar 77 (tombol 45 + 16×2).
- Area aman atas: status bar 24 + navbar 65 = header 89.

## 3. Komponen

| Komponen | Padding (V/H) | Gap | Radius | Tinggi |
|----------|---------------|-----|--------|--------|
| Button | 12 / 16 (kecil: 8 / 0, lebar hug) | 8 | pill (20–24, 100) | 45 (kecil 36) |
| Input pill | 4 | 12 | 24 | 52 |
| Field label + input | 20 / 16 | 8 | — | 70–118 |
| Chips | 4 / 12 (item pilihan 44 tinggi) | 8 antar chip | 8 atau 16 | 44 |
| Tab | 12 / 16 | — | — | — |
| Segmented / Tabs V2 | wadah 4, item 8 / 16 | — | 12 wadah, 8 item | — |
| Toast / notice | 16 | 8 | 8 | — |
| Card / modal | 16 | 16–24 | 12–24 | — |
| Navbar | 20 / 16 | 24 | 0 | 65 |

Distribusi radius terukur: 0 (251 node), 100 pill (39), 24 (38), 8 (29), 12 (19), 16 (14). Skala resmi: 4 · 8 · 12 · 24 · 100.

Distribusi padding terbanyak: `12/16/12/16` (52×, tombol/tab), `12` (15×), `16` (15×), `4/20/4/20` (13×), `20/16/20/16` (12×).

## 4. Kebiasaan umum tim profesional

- **Skala 4 dasar, 8 utama.** Material, Carbon (IBM), Polaris (Shopify), Atlassian memakai kelipatan 4/8. Nilai ganjil dilarang kecuali 4 dan 12 (kelipatan 4).
- **Margin layar mobile 16**, tablet 24, desktop 24–32. Atlassian dan Material sama-sama 16 di ponsel.
- **Padding komponen mengikuti tinggi sentuh.** Target sentuh minimal 44×44 (Apple) / 48 dp (Material). Button 45 dan chip 44 sudah memenuhi.
- **Gap dalam < gap luar.** Elemen terkait (label–input) 8, antar grup 16–24, antar section 24–32. Jarak di dalam komponen tidak boleh lebih besar dari jarak antar komponen.
- **Padding dipasang di wadah, gap di auto-layout.** Jangan memakai margin lewat frame kosong atau spacer.
- **Hug untuk komponen, Fill untuk lebar di layar.** Layar fixed 360, anak lebar Fill dengan margin 16.
- **Satu token per nilai.** Jarak diikat ke variabel `spacing/*`, bukan angka mentah; audit plugin menandai nilai mentah yang sama persis dengan token (bisa diperbaiki otomatis) dan yang mendekati (±1 px, manual).
- **Naming layer** sesuai pola `Screen/…`, `Button/…`, `Card/…` agar audit bisa mengenali.

## 5. Dampak ke audit plugin

- `AUDIT_RULES.nearMatchSpacingPx = 1`: 15 → dianggap 16 hanya jika token 16 ada.
- Usulan aturan lanjutan (belum diimplementasi): tandai padding/gap di luar {0,4,8,12,16,20,24,32,40,48} sebagai "di luar skala".
