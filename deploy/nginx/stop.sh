#!/usr/bin/env bash
set -euo pipefail
NGINX_BIN="${NGINX_BIN:-nginx}"
"$NGINX_BIN" -s quit || "$NGINX_BIN" -s stop || true
echo "已请求 Nginx 退出"
