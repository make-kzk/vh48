#!/usr/bin/env python3
"""Static file server for local vh48 mockups — no cache + live reload."""

from __future__ import annotations

import http.server
import json
import socketserver
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

WATCH_SUFFIXES = {".html", ".css", ".js", ".json"}
WATCH_PATHS = (
    ROOT / "mockups",
    ROOT / "assets",
    ROOT / "local",
    ROOT / "index.html",
    ROOT / "catalog.json",
)

LIVERELOAD_SNIPPET = b'<script src="/__livereload.js"></script>'

LIVERELOAD_CLIENT = b"""\
(function () {
  var last = null;
  function tick() {
    fetch('/__livereload?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (last !== null && data.v !== last) location.reload();
        last = data.v;
      })
      .catch(function () {});
  }
  setInterval(tick, 400);
  tick();
})();
"""


def compute_version() -> float:
    latest = 0.0
    for base in WATCH_PATHS:
        if not base.exists():
            continue
        if base.is_file():
            latest = max(latest, base.stat().st_mtime)
            continue
        for path in base.rglob("*"):
            if path.is_file() and path.suffix.lower() in WATCH_SUFFIXES:
                latest = max(latest, path.stat().st_mtime)
    return latest


class LiveReloadHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path

        if route == "/__livereload":
            payload = json.dumps({"v": compute_version()}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        if route == "/__livereload.js":
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript; charset=utf-8")
            self.send_header("Content-Length", str(len(LIVERELOAD_CLIENT)))
            self.end_headers()
            self.wfile.write(LIVERELOAD_CLIENT)
            return

        file_path = Path(self.translate_path(route))
        if (
            file_path.is_file()
            and file_path.suffix.lower() == ".html"
            and LIVERELOAD_SNIPPET not in (content := file_path.read_bytes())
            and b"</body>" in content
        ):
            content = content.replace(b"</body>", LIVERELOAD_SNIPPET + b"</body>", 1)
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        super().do_GET()


def main() -> None:
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), LiveReloadHandler) as httpd:
        print(f"Serving {ROOT} at http://127.0.0.1:{PORT}/", flush=True)
        print("Live reload: save HTML/CSS/JS → page refreshes automatically", flush=True)
        print("Press Ctrl+C to stop.", flush=True)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
