#!/usr/bin/env bash
# Bersihkan entri Figma Desktop yang salah (import code.js/ui.html sebagai plugin).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SETTINGS="${FIGMA_SETTINGS:-$HOME/Library/Application Support/Figma/settings.json}"
MANIFEST="$ROOT/manifest.json"

echo "== Perbaikan import Development (Figma Desktop) =="
echo "Repo:   $ROOT"
echo "Settings: $SETTINGS"
echo ""

if [[ ! -f "$MANIFEST" ]]; then
  echo "ERROR: manifest.json root tidak ditemukan."
  exit 1
fi

if [[ ! -f "$SETTINGS" ]]; then
  echo "WARN: settings.json tidak ada (pakai Figma Desktop sekali, lalu ulangi)."
  echo "Tanpa Desktop, lakukan manual di browser:"
  echo "  Plugins → Development → hapus semua DESIGN AUDIT / template TypeScript"
  echo "  Import from manifest → $MANIFEST"
  exit 0
fi

BACKUP="$SETTINGS.bak.$(date +%Y%m%d-%H%M%S)"
cp "$SETTINGS" "$BACKUP"
echo "Backup: $BACKUP"
echo ""

python3 << PY
import json, os
settings_path = os.path.expanduser("$SETTINGS")
manifest = "$MANIFEST"
with open(settings_path, encoding="utf-8") as f:
    data = json.load(f)
ext = data.get("localFileExtensions")
if not isinstance(ext, list):
    print("localFileExtensions tidak ada — tidak ada yang dibersihkan.")
    raise SystemExit(0)

good_manifest = manifest
dev_manifest = os.path.join(os.path.dirname(manifest), "figma-dev", "manifest.json")

keep = []
removed = []
seen = set()
for item in ext:
    path = item.get("manifestPath") or ""
    meta = item.get("fileMetadata") or {}
    ftype = meta.get("type") or ""
    if not path.endswith("manifest.json"):
        if "SAWITPRO AUDIT PLUGIN" in path or "design-audit" in path.lower():
            removed.append(path + (f" ({ftype})" if ftype else ""))
        continue
    if path in seen:
        removed.append(path + " (duplikat)")
        continue
    seen.add(path)
    if "SAWITPRO AUDIT PLUGIN" in path and path not in (good_manifest, dev_manifest):
        removed.append(path)
        continue
    keep.append(item)

if removed:
    data["localFileExtensions"] = keep
    with open(settings_path, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"))
    print("Dihapus dari localFileExtensions:")
    for p in removed:
        print("  -", p)
else:
    print("Tidak ada entri salah di localFileExtensions.")

print("")
print("Entri manifest plugin yang tersisa:")
for item in keep:
    p = item.get("manifestPath", "")
    if "AUDIT" in p.upper() or "SAWITPRO" in p.upper():
        print(" ", p, "→", item.get("lastKnownName", "?"))
PY

echo ""
echo "----------------------------------------"
echo "Di Figma (Desktop disarankan):"
echo "  1. Plugins → Development → Remove semua plugin audit/template duplikat"
echo "     (yang error TypeScript / FILE_CATEGORY_LABEL = versi lama)."
DEV_MANIFEST="$ROOT/figma-dev/manifest.json"
echo "  2. Import from manifest… → pilih SALAH SATU (disarankan figma-dev):"
echo "     $DEV_MANIFEST"
echo "     atau $MANIFEST"
echo "  3. Tutup panel plugin → jalankan lagi DESIGN AUDIT SAWITPRO."
echo ""
echo "Console yang BOLEH diabaikan: LaunchDarkly 429, Gravatar CORS, Datadog 403."
echo "Console yang HARUS hilang setelah langkah di atas:"
echo "  - TypeScript… generate code.js"
echo "  - FILE_CATEGORY_LABEL is not initialized"
echo "  - SyntaxError: possible import expression rejected"
echo "----------------------------------------"
