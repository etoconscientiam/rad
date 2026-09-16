#!/usr/bin/env bash
# Локальный просмотр исходного прототипа Claude Design.
# Открывает http://localhost:8777/STAL%20Prototype.dc.html
set -euo pipefail
cd "$(dirname "$0")/../_source/prototype"
echo "→ http://localhost:8777/STAL%20Prototype.dc.html"
exec python3 -m http.server 8777
