#!/usr/bin/env bash
# Start local prototype server for vh48 mockups.
# Usage: ./scripts/start-local.sh [port]

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-8080}"

cd "$ROOT"

if ! python3 -c "import socket; s=socket.socket(); s.bind(('127.0.0.1', $PORT)); s.close()" 2>/dev/null; then
  echo "Port $PORT is already in use — prototype may already be running." >&2
  echo "Open: http://127.0.0.1:$PORT/local/" >&2
  exit 0
fi

echo ""
echo "  vh48 local prototype"
echo "  ─────────────────────────────────────────"
echo "  Local hub:    http://127.0.0.1:$PORT/local/"
echo "  VibeHunt:     http://127.0.0.1:$PORT/mockups/vibe-hunt/index.html"
echo "  Demo flow:    http://127.0.0.1:$PORT/mockups/demo/index.html"
echo "  Catalog:      http://127.0.0.1:$PORT/"
echo ""
echo "  Ctrl+C to stop"
echo ""

exec python3 -m http.server "$PORT" --bind 127.0.0.1
