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
APP_HOME="${APP_HOME:-$REPO_ROOT/zhongguan-assistant-gateway}"
PID_FILE="${PID_FILE:-$APP_HOME/gateway.pid}"
if [[ -f "$PID_FILE" ]]; then
  PID="$(cat "$PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    echo "已停止 pid=$PID"
  fi
  rm -f "$PID_FILE"
else
  echo "没有 pid 文件，尝试按 jar 名结束"
  pkill -f "zhongguan-assistant-gateway-.*\\.jar" || true
fi
