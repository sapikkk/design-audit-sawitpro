# Referensi: semantic layer & “layer ini komponen apa?” di Figma

Dokumen ini memetakan repo dan plugin luar yang relevan jika tim ingin melampaui audit token/variabel (plugin SawitPRO hari ini) menuju deteksi komponen atau penamaan semantic. Tiga masalah berbeda; solusinya tidak selalu satu plugin.

## Tiga level

| Level | Pertanyaan | Cara umum |
|-------|------------|-----------|
| A | Layer sudah INSTANCE: komponen DS apa? | API Figma: `getMainComponentAsync()` → `mainComponent.name` / `key` |
| B | Frame bukan instance (detach / rakit manual): cocok komponen library mana? | Fingerprint struktural + skor similarity, kadang nama |
| C | Layer harus dinamai apa (semantic untuk dev/AI)? | Pola UI, konvensi tim, atau rename AI |

Kebanyakan repo di bawah ini level B atau C. Level A sudah tersedia di API; plugin audit hanya perlu menampilkan `mainComponent` pada INSTANCE.

## Level B: cocokkan ke komponen library

| Sumber | Link | Catatan singkat |
|--------|------|-----------------|
| Intent | [Figma Community](https://www.figma.com/community/plugin/1610840315625561207/intent) | Closed source. Fingerprint layout/visual/tipografi, fallback nama → struktur → peran semantic (Button, Card, …), confidence + reconnect. Referensi produk untuk level B. |
| Pattern Pal | https://github.com/miiimchelle/pattern-pal-pippin | Fingerprint frame vs library URL + file tim; skor konsistensi (IDS Hackathon 2026). |
| Codifig (Component Mapper) | https://github.com/YvonneQin/codifig | Raw layer → instance jika nama mengikuti konvensi + match library. |
| desing-lint | https://github.com/moduesss/desing-lint | `signature.ts`, duplikat struktural, detached instance; lint sengaja tidak pakai heuristik nama untuk keputusan semantic. |
| nCompose | https://github.com/nesterlabs-ai/nCompose | `src/figma/component-discovery.ts` untuk design-to-code. |
| Missing library usage finder | https://github.com/rangle/figma-plugin-missing-library-usage-finder | Cari instance by nama component set, bukan reverse-match frame mentah. |

**SawitPRO DESIGN AUDIT (plugin repo ini):** INSTANCE → cek library remote + pola penamaan di `prompt/rules.json` (`Card/…`, `Button/…`, dll.). Belum ada fingerprint struktural seperti Intent atau Pattern Pal.

## Level C: penamaan semantic

| Repo | Link | Fokus |
|------|------|--------|
| FigmaLint | https://github.com/southleft/figmalint | Audit AI + rename layer (generic → semantic, BEM, kebab, 30+ tipe). |
| Quick Naming Plugin | https://github.com/championwang00/figma-quick-naming-plugin | camelCase/PascalCase, batch page/file, tanpa network. |
| Figma Design Auditor | https://github.com/himanshu-lal4/figma-design-auditor | Rename kontekstual + mapping komponen → React Native. |
| Figma AutoNamer | https://github.com/jacksonkasi0/figma-auto-namer | AI vision + rename (backend terpisah). |
| figma-plugin-html-layers | https://github.com/wagnerbeethoven/figma-plugin-html-layers | Hierarki gaya tag HTML. |
| figma-plugin-renaming-layers | https://github.com/debbieyuen/figma-plugin-renaming-layers | Rename massal dalam parent. |
| figma-mcp-rust (skill bulk-rename) | https://github.com/alvinindra/figma-mcp-rust | Skill BEM untuk agent; INSTANCE → `mainComponent.name`. |

**Community (repo publik sering tidak ada):**

- [AutoLayers](https://www.figma.com/community/plugin/1411822707031516886/autolayers): 40+ pola UI (btn, nav, card, …).
- [AI Auto Naming](https://www.figma.com/community/plugin/1569668830987093633/ai-auto-naming): AI + konteks frame.
- [Layer Lint](https://www.figma.com/community/plugin/1626564985947649735/layer-lint): rename `Frame 3` → semantic (BYO Anthropic key).

## Handoff: komponen Figma ↔ kode

Bukan rename layer, melainkan semantic untuk developer dan agent.

| Repo | Link |
|------|------|
| Figma Code Connect (official) | https://github.com/figma/code-connect |
| Superconnect | https://github.com/bitovi/superconnect |
| uSpec | https://github.com/redongreen/uSpec |
| figma-console-mcp | https://github.com/southleft/figma-console-mcp |

## Lint/audit (token & style; sebagian sentuh naming)

| Repo | Link | Relevansi |
|------|------|-----------|
| design-lint | https://github.com/destefanis/design-lint | Style/token missing; fork custom rules. |
| figma-design-linter | https://github.com/Flaex/figma-design-linter | Naming + token + a11y (rules configurable). |
| SawitPRO vs Community | [`community-linter-comparison.md`](community-linter-comparison.md) | Varlint, YADL, dll.; fokus variabel/token. |

## API & indeks

| Sumber | Link |
|--------|------|
| Plugin samples | https://github.com/figma/plugin-samples |
| Indeks plugin GitHub | https://github.com/mrstev3n/figma-plugins-on-github |
| Awesome Figma | https://github.com/react-figma/awesome-figma |
| InstanceNode API | https://developers.figma.com/docs/plugins/api/InstanceNode/ |
| Contoh scan instance + key | https://github.com/7nohe/figram (`packages/plugin/src/debug-keys.ts`) |
| Indeks curated repo ini | [`.cursor/skills/figma-ecosystem-index/reference.md`](../../.cursor/skills/figma-ecosystem-index/reference.md) |

## Prioritas baca (untuk tim SawitPRO)

1. Frame manual mirip Button/Card DS: Intent (Community) + kode Pattern Pal + `signature.ts` di desing-lint.
2. Rename semantic massal + aturan tim: Quick Naming (tanpa AI) atau FigmaLint `naming-fixer.ts`.
3. Instance sudah ada, hanya perlu nama komponen: API Figma + logic INSTANCE plugin SawitPRO.
4. Handoff ke code/agent: Code Connect, uSpec, figma-console-mcp.

## Arah pengembangan plugin (opsional)

| Prioritas | Usulan fitur | Inspirasi |
|-----------|--------------|-----------|
| Match library (B) | Tab atau rule “tebak komponen” dengan fingerprint ringan | Pattern Pal, Intent |
| Rename semantic (C) | Perluas `namingPatterns` atau saran rename generic → semantic | Quick Naming, FigmaLint |
| Keduanya | Fase 1: tampilkan `mainComponent` + confidence pada INSTANCE; fase 2: fingerprint opsional | Repo level B di atas |

Keputusan product (match vs rename vs keduanya) sebaiknya disepakati dengan Design Ops sebelum implementasi; plugin runtime tetap tanpa LLM kecuali tim mengubah kebijakan repo.
