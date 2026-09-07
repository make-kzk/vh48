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
echo "  Quick sync:   bash scripts/dev.sh"
echo "  VibeHunt:     http://127.0.0.1:$PORT/mockups/vibe-hunt/index.html"
echo ""
echo "  Bottom banner shows commit — if wrong, run: bash scripts/dev.sh"
echo "  Ctrl+C to stop"
echo ""

exec python3 "$ROOT/scripts/local-server.py" "$PORT"
