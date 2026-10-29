#!/usr/bin/env bash
# Verifikasi plugin + path manifest untuk Import from manifest di Figma Desktop.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== DESIGN AUDIT SAWITPRO — cek development =="
echo "Folder: $ROOT"
echo ""

git rev-parse --abbrev-ref HEAD 2>/dev/null && git log -1 --oneline 2>/dev/null || true
echo ""

MANIFEST="$ROOT/manifest.json"
if [[ ! -f "$MANIFEST" ]]; then
  echo "ERROR: manifest.json tidak ada di root."
  exit 1
fi

MAIN=$(python3 -c "import json; print(json.load(open('$MANIFEST'))['main'])")
UI=$(python3 -c "import json; print(json.load(open('$MANIFEST'))['ui'])")
ID=$(python3 -c "import json; print(json.load(open('$MANIFEST'))['id'])")

echo "manifest.json (ROOT — pakai ini di Figma):"
echo "  main: $MAIN"
echo "  ui:   $UI"
echo "  id:   $ID"
echo ""

if [[ "$MAIN" != "prompt/code.js" ]]; then
  echo "ERROR: main harus prompt/code.js (bukan code.js root)."
  exit 1
fi

for f in "$ROOT/$MAIN" "$ROOT/$UI" "$ROOT/prompt/ui.html" "$ROOT/icon.png"; do
  if [[ -f "$f" ]]; then echo "  OK  ${f#$ROOT/}"; else echo "  MISS ${f#$ROOT/}"; exit 1; fi
done

node --check "$ROOT/prompt/code.js"
echo "  OK  prompt/code.js (syntax)"

if grep -E '^[[:space:]]*import[[:space:]]|^[[:space:]]*export[[:space:]]' "$ROOT/prompt/code.js" >/dev/null; then
  echo "ERROR: ES import/export di prompt/code.js — sandbox Figma menolak."
  exit 1
fi
if grep -E 'import[[:space:]]*\(' "$ROOT/prompt/code.js" >/dev/null; then
  echo "ERROR: Pola 'import (' di code.js — SES Figma false-positive (SyntaxError line 1)."
  grep -n -E 'import[[:space:]]*\(' "$ROOT/prompt/code.js" || true
  exit 1
fi
if ! grep -q "PLUGIN_VERSION = '1.3.3'" "$ROOT/prompt/code.js"; then
  echo "ERROR: PLUGIN_VERSION 1.3.3 tidak ada di code.js"
  exit 1
fi
for f in "$ROOT/icon.png" "$ROOT/prompt/icon.png" "$ROOT/prompt/brand-icon.png"; do
  if [[ ! -f "$f" ]]; then echo "ERROR: missing $f — npm run figma:bundle"; exit 1; fi
done
if grep -qE 'src="icon\.png"|href="icon\.png"' "$ROOT/prompt/ui.html" 2>/dev/null; then
  echo "ERROR: logo UI masih path relatif — jalankan npm run figma:bundle (embed data URI)."
  exit 1
fi
if ! grep -q 'data:image/png;base64,' "$ROOT/prompt/ui.html" 2>/dev/null; then
  echo "ERROR: logo belum di-embed di prompt/ui.html — npm run figma:bundle"
  exit 1
fi
echo "  OK  icons + logo embed + no SES trap + version 1.3.3"
echo ""

if [[ -f "$ROOT/code.js" ]]; then
  if grep -q "TypeScript" "$ROOT/code.js" 2>/dev/null; then
    echo "WARN: $ROOT/code.js masih stub template — jangan jadikan main di manifest."
  fi
fi

SETTINGS="$HOME/Library/Application Support/Figma/settings.json"
if [[ -f "$SETTINGS" ]]; then
  if python3 -c "
import json, sys
p='$SETTINGS'
d=json.load(open(p))
for i in d.get('localFileExtensions', []):
  m=i.get('manifestPath','')
  if m.endswith('/prompt/code.js') or m.endswith('/prompt/ui.html'):
    sys.exit(1)
" 2>/dev/null; then
    : # ok
  else
    echo "WARN: Figma pernah mendaftar prompt/code.js atau ui.html sebagai plugin."
    echo "      Jalankan: npm run figma:fix-import"
    echo ""
  fi
fi

echo "----------------------------------------"
echo "Di Figma Desktop (sekali):"
echo "  Plugins → Development → Import from manifest…"
echo "  Pilih file:"
echo "  $MANIFEST"
echo ""
echo "Buka folder di Finder:"
echo "  open -R \"$MANIFEST\""
echo "----------------------------------------"
