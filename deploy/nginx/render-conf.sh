#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/deploy/gateway.env}"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

SERVER_NAME="${SERVER_NAME:-localhost}"
SSL_CERT="${SSL_CERT:-$SCRIPT_DIR/ssl/server.crt}"
SSL_KEY="${SSL_KEY:-$SCRIPT_DIR/ssl/server.key}"
NGINX_HTML="${NGINX_HTML:-/var/www/assistant-h5}"
API_UPSTREAM="${API_UPSTREAM:-127.0.0.1:${SERVER_PORT:-8080}}"
TEMPLATE="$SCRIPT_DIR/conf/assistant-https.conf.template"
OUT="$SCRIPT_DIR/conf/assistant-https.conf"

if [[ ! -f "$SSL_CERT" || ! -f "$SSL_KEY" ]]; then
  echo "证书不存在，先运行 ./gen-self-signed.sh $SERVER_NAME 或配置 SSL_CERT/SSL_KEY"
  exit 1
fi

sed \
  -e "s#__SERVER_NAME__#${SERVER_NAME}#g" \
  -e "s#__SSL_CERT__#${SSL_CERT}#g" \
  -e "s#__SSL_KEY__#${SSL_KEY}#g" \
  -e "s#__NGINX_HTML__#${NGINX_HTML}#g" \
  -e "s#__API_UPSTREAM__#${API_UPSTREAM}#g" \
  "$TEMPLATE" > "$OUT"

# 本机 80 已被 Docker 等占用时：NGINX_LISTEN_HTTP=0 ，只开 443
if [[ "${NGINX_LISTEN_HTTP:-1}" == "0" ]]; then
  sed -i '/__BEGIN_HTTP_REDIRECT__/,/__END_HTTP_REDIRECT__/d' "$OUT"
fi

echo "已生成 $OUT （HTTP 跳转: ${NGINX_LISTEN_HTTP:-1}）"
