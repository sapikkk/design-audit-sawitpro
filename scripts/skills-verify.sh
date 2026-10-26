#!/usr/bin/env bash
# List project Cursor skills (installed in-repo, not cloned third-party repos).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SK="$ROOT/.cursor/skills"
echo "== Project skills: $SK =="
if [[ ! -d "$SK" ]]; then
  echo "MISSING .cursor/skills — run from repo root."
  exit 1
fi
found=0
while IFS= read -r -d '' f; do
  found=1
  name=$(grep -E '^name:' "$f" | head -1 | sed 's/^name:[[:space:]]*//')
  desc=$(grep -E '^description:' "$f" | head -1 | sed 's/^description:[[:space:]]*//' | cut -c1-80)
  dir=$(dirname "$f")
  echo "  • ${name:-?}  (${dir#$ROOT/})"
  [[ -n "$desc" ]] && echo "    $desc…"
done < <(find "$SK" -name SKILL.md -print0 | sort -z)
if [[ "$found" -eq 0 ]]; then
  echo "  (none)"
  exit 1
fi
echo ""
echo "Ecosystem links (reference only): .cursor/skills/figma-ecosystem-index/reference.md"
echo "Optional local clones: npm run skills:optional"
