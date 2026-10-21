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
SSL_DIR="$SCRIPT_DIR/ssl"
mkdir -p "$SSL_DIR"
CN="${1:-${SERVER_NAME:-sdk.zgzytech.com}}"
SAN="DNS:${CN}"
if [[ -n "${DEPLOY_HOST:-}" ]]; then
  SAN="${SAN},IP:${DEPLOY_HOST}"
fi
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$SSL_DIR/server.key" \
  -out "$SSL_DIR/server.crt" \
  -subj "/CN=$CN" \
  -addext "subjectAltName=${SAN}"
echo "自签证书: $SSL_DIR/server.crt"
echo "SAN: $SAN"
echo "联调可在 gateway.env 设置："
echo "  SSL_CERT=$SSL_DIR/server.crt"
echo "  SSL_KEY=$SSL_DIR/server.key"
echo "  SERVER_NAME=$CN"
echo "真机 / 移动报备请改用正规证书，不要用自签上生产。"
