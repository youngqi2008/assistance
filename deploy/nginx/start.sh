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

"$SCRIPT_DIR/render-conf.sh"
CONF="$SCRIPT_DIR/conf/assistant-https.conf"
NGINX_BIN="${NGINX_BIN:-nginx}"

if [[ -d /etc/nginx/conf.d ]]; then
  TARGET="/etc/nginx/conf.d/${NGINX_CONF_NAME:-assistant-https.conf}"
  if [[ -w /etc/nginx/conf.d ]]; then
    cp -f "$CONF" "$TARGET"
  else
    sudo cp -f "$CONF" "$TARGET"
  fi
  "$NGINX_BIN" -t
  if systemctl is-active --quiet nginx 2>/dev/null; then
    systemctl reload nginx
  else
    systemctl start nginx
  fi
  echo "Nginx HTTPS 已启动/重载  https://${SERVER_NAME:-localhost}/"
else
  echo "未检测到 /etc/nginx/conf.d 。已生成 $CONF"
  echo "请在主 nginx.conf 的 http { } 里增加: include $CONF;"
  echo "然后执行: $NGINX_BIN -t && $NGINX_BIN -s reload"
  exit 1
fi

echo "前端: https://${SERVER_NAME:-localhost}${PUBLIC_BASE_PATH:-/sign-pay-pro/}assist/0.3.2/"
echo "后端: https://${SERVER_NAME:-localhost}/v1/assistant/info/check"
echo "健康: https://${SERVER_NAME:-localhost}/actuator/health"
