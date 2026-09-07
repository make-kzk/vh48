#!/usr/bin/env bash
# Start local prototype server for vh48 mockups.
# Usage: ./scripts/start-local.sh [port]

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-8080}"

cd "$ROOT"

echo "Starting vh48 on port $PORT..."

if lsof -ti "tcp:$PORT" >/dev/null 2>&1; then
  echo "Port $PORT is already in use." >&2
  echo "Stop the old server: Ctrl+C in that terminal, or run:" >&2
  echo "  kill \$(lsof -ti tcp:$PORT)" >&2
  echo "Then run ./scripts/start-local.sh again." >&2
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo '?')"
LANDING_CSS="$ROOT/mockups/vibe-hunt/landing-develop.css"

echo ""
echo "  vh48 local prototype"
echo "  ─────────────────────────────────────────"
echo "  Branch:       $BRANCH @ $COMMIT"
if [[ -f "$LANDING_CSS" ]]; then
  echo "  Landing CSS:  landing-develop.css ✓"
else
  echo "  Landing CSS:  missing — run: git checkout main && git pull"
fi
echo ""
echo "  Local hub:    http://127.0.0.1:$PORT/local/"
echo "  VibeHunt:     http://127.0.0.1:$PORT/mockups/vibe-hunt/index.html"
echo ""
echo "  Edit HTML/CSS → Save → Cmd+R in browser (no git push needed)"
echo "  Ctrl+C to stop"
echo ""

exec python3 "$ROOT/scripts/local-server.py" "$PORT"
