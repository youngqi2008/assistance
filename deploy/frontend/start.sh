#!/usr/bin/env bash
# 生产前端没有 Node 常驻进程：把静态文件同步到 Nginx HTML 目录后 reload。
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FE_DIR="$REPO_ROOT/assistance-mobile-auth"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/deploy/gateway.env}"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

SRC="$FE_DIR/dist-duodian-health032-temp"
if [[ ! -d "$SRC" ]]; then
  echo "未找到构建产物，先运行 build.sh"
  exit 1
fi

NGINX_HTML="${NGINX_HTML:-/var/www/assistant-h5}"
mkdir -p "$NGINX_HTML"
cp -a "$SRC"/. "$NGINX_HTML"/
echo "已同步到 $NGINX_HTML"

if command -v nginx >/dev/null 2>&1 || [[ -n "${NGINX_BIN:-}" ]]; then
  "${NGINX_BIN:-nginx}" -t
  "${NGINX_BIN:-nginx}" -s reload || "${NGINX_BIN:-nginx}"
  echo "Nginx 已 reload，前端走 HTTPS: ${PUBLIC_HTTPS_ORIGIN:-https://\$server_name}${PUBLIC_BASE_PATH:-/sign-pay-pro/}assist/0.3.2/"
else
  echo "本机没有 nginx 命令。请运行 ../nginx/start.sh 或把 $NGINX_HTML 配进 Nginx。"
fi
