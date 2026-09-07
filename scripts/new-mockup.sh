#!/usr/bin/env bash
# Scaffold a new click-through mockup.
# Usage: ./scripts/new-mockup.sh my-flow "My Flow Title"

set -euo pipefail

SLUG="${1:?Usage: $0 <slug> [title]}"
TITLE="${2:-$SLUG}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/mockups/$SLUG"

if [[ -d "$DEST" ]]; then
  echo "Already exists: $DEST" >&2
  exit 1
fi

mkdir -p "$DEST"
cp "$ROOT/templates/prototype/index.html" "$DEST/index.html"
cp "$ROOT/templates/prototype/style.css" "$DEST/style.css"

sed -i "s/{Concept Name}/$TITLE/g" "$DEST/index.html"

echo "Created mockup at mockups/$SLUG/"
echo "Next: add an entry to catalog.json and open mockups/$SLUG/index.html"
