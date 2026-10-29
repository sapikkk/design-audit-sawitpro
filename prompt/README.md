# DESIGN AUDIT SAWITPRO (plugin)

Plugin Figma untuk mengaudit kepatuhan Design System. Tanpa LLM, tanpa REST API, tanpa upload/unduh file dari UI.

## Prinsip

- Token tidak disimpan di repo. Variabel dan text style dibaca dari file terbuka + library yang di-enable.
- Semua alur di dalam plugin: periksa, daftar temuan, perbaiki otomatis (EXACT/NEAR), undo in-memory, anotasi.
- Aturan audit (`rules.json`) disematkan di `code.js` (`AUDIT_RULES`). Ubah bobot/ambang di repo → sync → re-import plugin.

## Instalasi

1. Clone repo.
2. Figma Desktop → **Import from manifest** → `manifest.json` di **root** repo.
3. Aktifkan library DS di file (Assets → Libraries).
4. Setelah edit kode: tutup panel plugin, jalankan lagi (import ulang hanya jika manifest/pindah folder).

Checklist: [`../docs/agent/team-rollout.md`](../docs/agent/team-rollout.md).  
Ikon publish org: [`../docs/agent/figma-plugin-icon-publish.md`](../docs/agent/figma-plugin-icon-publish.md).

## Alur harian

1. Buka file sprint / species master / full app.
2. **Periksa** → cakupan → **Mulai periksa** ( **Batal** jika perlu ).
3. Baca skor, filter kategori, klik temuan → layer terpilih. Baris bawah kartu: hex/px → variabel, atau nama komponen library pada INSTANCE.
4. **Ayo perbaiki** → halaman **Perbaiki** (kategori sama, perbaiki semua otomatis atau per baris).
5. **Alat** / menu titik tiga: detach, remap, **perbaiki penamaan**. **Tandai di halaman** membuat daftar kartu di halaman terpisah «🔍 DS Audit» (bukan stiker di atas kanvas desain), maks. 120 temuan penting dulu.

Komponen dengan `[no-tokens]` di deskripsi: instance + subtree tidak diperiksa.

## Perbaikan otomatis

| Kategori | Kondisi apply |
|----------|----------------|
| Warna | EXACT hex atau NEAR (ΔE ≤ `nearMatchColorApplyDeltaE`) |
| Spacing / radius / lebar·tinggi | EXACT px atau NEAR (± `nearMatchSpacingApplyPx`) |
| Ukuran font | NEAR/EXACT ke variabel font |
| Text style | EXACT ke gaya teks di file |
| Penamaan | Rename otomatis jika ada `suggestedName` (pola `rules.json`, tanpa AI) |

## Komponen (INSTANCE)

Setiap INSTANCE dihitung di ringkasan: total, dari library tim vs lokal, tiga komponen paling sering. Temuan komponen menampilkan nama component set / variant. Detached frame tetap heuristic nama; fingerprint struktural direncanakan (lihat doc referensi).

## Dokumen terkait

- Community parity: [`../docs/agent/community-linter-comparison.md`](../docs/agent/community-linter-comparison.md)
- Semantic layer / roadmap: [`../docs/agent/figma-semantic-layer-references.md`](../docs/agent/figma-semantic-layer-references.md)

## Skor

≥ 90 EXCELLENT · 75–89 PASS_WITH_WARNING · &lt; 75 REJECTED

## Batasan API (ringkas)

| Sumber | Otomatis? |
| :--- | :--- |
| Variabel lokal + library (enabled) | Ya |
| Text style library (daftar) | Tidak — style yang sudah dipakai bisa dikenali |
| Komponen library | Instance remote dianggap sah; daftar master tidak diimpor penuh untuk apply |
