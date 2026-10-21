#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_DIR="$REPO_ROOT/zhongguan-assistant-gateway"

ENV_FILE="${ENV_FILE:-$REPO_ROOT/deploy/gateway.env}"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "未找到 $ENV_FILE ，请先复制 deploy/env.example 为 deploy/gateway.env"
  exit 1
fi

APP_HOME="${APP_HOME:-$APP_DIR}"
JAR_NAME="${JAR_NAME:-zhongguan-assistant-gateway-0.1.0-SNAPSHOT.jar}"
JAR="$APP_HOME/$JAR_NAME"
if [[ ! -f "$JAR" ]]; then
  JAR="$APP_DIR/target/$JAR_NAME"
fi
if [[ ! -f "$JAR" ]]; then
  echo "找不到 $JAR_NAME ，请先运行 package.sh"
  exit 1
fi

mkdir -p "$APP_HOME/logs" "$APP_HOME/data"
cd "$APP_HOME"

export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-ums-test,edge}"
PID_FILE="${PID_FILE:-$APP_HOME/gateway.pid}"

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "已在运行 pid=$(cat "$PID_FILE")"
  exit 0
fi

if [[ -z "${CHINAUMS_TEST_PRIVATE_KEY:-}${CHINAUMS_ASSISTANT_PRIVATE_KEY:-}${CHINAUMS_PROD_PRIVATE_KEY:-}" ]]; then
  echo "警告：未配置银商私钥，check/query 会失败。请在 gateway.env 填写 CHINAUMS_TEST_PRIVATE_KEY"
fi

nohup java -jar "$JAR" \
  --server.port="${SERVER_PORT:-8080}" \
  --spring.profiles.active="$SPRING_PROFILES_ACTIVE" \
  > "$APP_HOME/logs/gateway.out" 2>&1 &
echo $! > "$PID_FILE"
echo "已启动 pid=$(cat "$PID_FILE")  profile=$SPRING_PROFILES_ACTIVE"
echo "本机端口 127.0.0.1:${SERVER_PORT:-8080} ；对外 HTTPS 由 Nginx 反代"
echo "健康检查: curl -s http://127.0.0.1:${SERVER_PORT:-8080}/actuator/health"
