#!/usr/bin/env bash
# Folder datar khusus import Figma — tanpa code.ts / stub root.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/figma-dev"
mkdir -p "$OUT"
cp "$ROOT/prompt/code.js" "$OUT/code.js"
cp "$ROOT/prompt/ui.html" "$OUT/ui.html"
cp "$ROOT/icon.png" "$OUT/icon.png" 2>/dev/null || true
cp "$ROOT/prompt/brand-icon.png" "$OUT/brand-icon.png" 2>/dev/null || true
cat > "$OUT/manifest.json" << 'JSON'
{
  "name": "DESIGN AUDIT SAWITPRO",
  "id": "1696532958279147641",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"],
  "documentAccess": "dynamic-page",
  "permissions": ["teamlibrary"],
  "networkAccess": {
    "allowedDomains": ["none"]
  }
}
JSON
node --check "$OUT/code.js"
echo "OK bundle → $OUT/manifest.json"
