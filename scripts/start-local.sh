#!/usr/bin/env bash
# Start local prototype server for vh48 mockups.
# Usage: ./scripts/start-local.sh [port]

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-8080}"

cd "$ROOT"

echo "Starting vh48 on port $PORT..."

if lsof -ti "tcp:$PORT" >/dev/null 2>&1; then
  echo "Port $PORT already in use — dev server is running." >&2
  echo "Open: http://127.0.0.1:$PORT/mockups/vibe-hunt/index.html" >&2
  exit 0
fi

LANDING_CSS="$ROOT/mockups/vibe-hunt/landing-develop.css"

echo ""
echo "  vh48 local prototype"
echo "  ─────────────────────────────────────────"
echo "  Commit:       $(git rev-parse --short HEAD 2>/dev/null || echo '?')"
if [[ -f "$LANDING_CSS" ]]; then
  echo "  Landing CSS:  landing-develop.css ✓"
else
  echo "  Landing CSS:  missing — run: git pull origin main"
fi
echo ""
echo "  Auto-sync:    git pull every 15s (disable: VH48_AUTO_SYNC=0)"
echo "  VibeHunt:     http://127.0.0.1:$PORT/mockups/vibe-hunt/index.html"
echo ""
echo "  Cursor/VS Code: server starts when you open this folder"
echo "  Or double-click: Open VibeHunt Dev.command"
echo "  Ctrl+C to stop"
echo ""

exec python3 "$ROOT/scripts/local-server.py" "$PORT"
