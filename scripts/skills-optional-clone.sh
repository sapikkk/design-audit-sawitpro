#!/usr/bin/env bash
# Clone a small curated set of reference repos OUTSIDE this project (not committed).
set -euo pipefail
DEST="${FIGMA_REF_DIR:-$HOME/figma-dev-references}"
mkdir -p "$DEST"
clone() {
  local url="$1" dir="$2"
  if [[ -d "$DEST/$dir/.git" ]]; then
    echo "OK  $dir (exists)"
  else
    echo "CLONE $url → $DEST/$dir"
    git clone --depth 1 "$url" "$DEST/$dir"
  fi
}
echo "Reference clones → $DEST (not part of plugin bundle)"
clone https://github.com/figma/plugin-samples.git figma-plugin-samples
clone https://github.com/thomas-lowry/figma-plugin-ds.git figma-plugin-ds
clone https://github.com/figma/community-resources.git figma-community-resources
clone https://github.com/yuanqing/create-figma-plugin.git create-figma-plugin
clone https://github.com/southleft/skills-for-figma.git skills-for-figma
echo "Done. Use these for reading patterns only."
