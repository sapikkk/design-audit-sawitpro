---
name: figma-ecosystem-index
description: >-
  Curated map of Figma plugin, MCP, and agent-skill GitHub repos for this project.
  Use when choosing patterns, UI libs, or MCP tooling — not to clone everything.
---

# Figma & agent ecosystem index

**Policy:** This project keeps **one** plugin runtime (`prompt/`). Other repos are **reference** or **optional dev tools** on the developer machine — not submodules in production.

Read the full link list: [reference.md](./reference.md).

## When to open which repo

| Need | Repo |
|------|------|
| Official API examples | [figma/plugin-samples](https://github.com/figma/plugin-samples) |
| Community docs/snippets | [figma/community-resources](https://github.com/figma/community-resources) |
| Scaffold new plugin (greenfield) | [yuanqing/create-figma-plugin](https://github.com/yuanqing/create-figma-plugin) |
| Plugin UI CSS patterns | [thomas-lowry/figma-plugin-ds](https://github.com/thomas-lowry/figma-plugin-ds) |
| Figma + agent skills | [southleft/skills-for-figma](https://github.com/southleft/skills-for-figma), [southleft/figma-console-mcp-skills](https://github.com/southleft/figma-console-mcp-skills) |
| Design-to-code skills | [Properly-DEV/figma-to-code-skills](https://github.com/Properly-DEV/figma-to-code-skills), [jeltehomminga/figma-design-skills](https://github.com/jeltehomminga/figma-design-skills) |
| MCP / Figma file tools | [planetabhi/figma-mcp-server](https://github.com/planetabhi/figma-mcp-server), [dannote/figma-use](https://github.com/dannote/figma-use) |
| Awesome lists (discovery only) | [react-figma/awesome-figma](https://github.com/react-figma/awesome-figma), [awesomelistsio/awesome-figma](https://github.com/awesomelistsio/awesome-figma), [mrstev3n/figma-plugins-on-github](https://github.com/mrstev3n/figma-plugins-on-github) |
| Agent harness (personal machine) | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman), [barlevalon/skills](https://github.com/barlevalon/skills) (Superpowers), [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) |

## Install (curated)

```bash
npm run skills:verify    # lists project skills under .cursor/skills/
npm run skills:optional  # optional clones to ~/figma-dev-references (never committed)
```

Do **not** add npm dependencies from 20+ unrelated repos into this plugin.
