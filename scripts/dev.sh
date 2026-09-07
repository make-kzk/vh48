#!/usr/bin/env bash
# Pull latest code, restart local server, open VibeHunt mockup.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-8080}"
URL="http://127.0.0.1:${PORT}/mockups/vibe-hunt/index.html"

cd "$ROOT"

echo "→ git pull origin main"
git pull origin main

COMMIT="$(git rev-parse --short HEAD)"
echo "→ commit ${COMMIT}"

if lsof -ti "tcp:${PORT}" >/dev/null 2>&1; then
  echo "→ stopping old server on port ${PORT}"
  kill "$(lsof -ti "tcp:${PORT}")" 2>/dev/null || true
  sleep 0.5
fi

echo "→ starting server"
bash "$ROOT/scripts/start-local.sh" "$PORT" &
SERVER_PID=$!
sleep 1

echo ""
echo "Open: ${URL}"
echo "Expected commit in bottom banner: ${COMMIT}"
echo ""

if command -v open >/dev/null 2>&1; then
  open "$URL"
fi

wait "$SERVER_PID"
