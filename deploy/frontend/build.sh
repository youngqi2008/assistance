#!/usr/bin/env bash
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

PUBLIC_HTTPS_ORIGIN="${PUBLIC_HTTPS_ORIGIN:-https://sdk.zgzytech.com}"
PUBLIC_BASE_PATH="${PUBLIC_BASE_PATH:-/sign-pay-pro/}"
BASE_PATH="${PUBLIC_BASE_PATH%/}/"
BASE_URL="${PUBLIC_HTTPS_ORIGIN%/}${BASE_PATH}"

if ! command -v npm >/dev/null 2>&1; then
  echo "未找到 npm，请安装 Node.js 20+"
  exit 1
fi

cd "$FE_DIR"
if [[ ! -d node_modules ]]; then
  npm ci
fi

echo "构建 0.3.2 静态资源"
echo "  base-path=$BASE_PATH"
echo "  base-url=$BASE_URL"
npm run build:duodian-health032 -- --base-path "$BASE_PATH" --base-url "$BASE_URL"

OUT="$FE_DIR/dist-duodian-health032-temp"
echo "产物目录: $OUT"
echo "SDK: ${BASE_URL}assist/0.3.2/assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.2.umd.cjs"
echo "iframe: ${BASE_URL}assist/0.3.2/custom-verification.html"
echo "下一步：运行 start.sh 同步到 Nginx HTML 目录"
