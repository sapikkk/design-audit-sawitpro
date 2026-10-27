#!/usr/bin/env bash
# Folder datar khusus import Figma — tanpa code.ts / stub root.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/figma-dev"
ICON_SRC="$ROOT/assets/sawitpro-icon.png"
mkdir -p "$OUT"

if [[ -f "$ICON_SRC" ]]; then
  sips -z 128 128 "$ICON_SRC" --out "$ROOT/icon.png" >/dev/null
  sips -z 128 128 "$ICON_SRC" --out "$ROOT/prompt/icon.png" >/dev/null
  sips -z 72 72 "$ICON_SRC" --out "$ROOT/prompt/brand-icon.png" >/dev/null
fi

node "$ROOT/scripts/embed-ui-logo.mjs"
cp "$ROOT/prompt/code.js" "$OUT/code.js"
cp "$ROOT/prompt/ui.html" "$OUT/ui.html"
cp "$ROOT/icon.png" "$OUT/icon.png"
cp "$ROOT/prompt/icon.png" "$OUT/icon.png"
cp "$ROOT/prompt/brand-icon.png" "$OUT/brand-icon.png"

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
cp "$OUT/code.js" "$ROOT/code.js"
node --check "$ROOT/code.js"
echo "OK bundle → $OUT/manifest.json"
echo "OK icons  → icon.png (128), brand-icon.png (72), prompt/icon.png untuk UI"
