#!/usr/bin/env bash
# 把已打包的 JAR 安装到 Linux APP_HOME，并注册 systemd（需 root）。
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

APP_HOME="${APP_HOME:-/app/home/zhongguan-assistant-gateway}"
JAR_NAME="${JAR_NAME:-zhongguan-assistant-gateway-0.1.0-SNAPSHOT.jar}"
if [[ -z "${JAVA_BIN:-}" ]]; then
  if [[ -x /usr/local/java/jdk-17/bin/java ]]; then
    JAVA_BIN=/usr/local/java/jdk-17/bin/java
  elif [[ -n "${JAVA_HOME:-}" && -x "${JAVA_HOME}/bin/java" ]]; then
    JAVA_BIN="${JAVA_HOME}/bin/java"
  elif command -v java >/dev/null 2>&1; then
    JAVA_BIN="$(command -v java)"
  fi
fi
if [[ -z "${JAVA_BIN:-}" || ! -x "$JAVA_BIN" ]]; then
  echo "找不到可用的 java。请先安装 JDK 17，或设置 JAVA_BIN=/path/to/java"
  exit 1
fi
JAVA_HOME="$(cd "$(dirname "$JAVA_BIN")/.." && pwd)"
SRC_JAR="$REPO_ROOT/zhongguan-assistant-gateway/target/$JAR_NAME"
if [[ ! -f "$SRC_JAR" ]]; then
  echo "请先在本机或构建机运行 package.sh"
  exit 1
fi

mkdir -p "$APP_HOME/logs" "$APP_HOME/data"
cp -f "$SRC_JAR" "$APP_HOME/$JAR_NAME"
cp -f "$ENV_FILE" "$APP_HOME/gateway.env"
cp -f "$SCRIPT_DIR/assistant-gateway.service" /etc/systemd/system/assistant-gateway.service
sed -i "s#__APP_HOME__#$APP_HOME#g" /etc/systemd/system/assistant-gateway.service
sed -i "s#__JAR_NAME__#$JAR_NAME#g" /etc/systemd/system/assistant-gateway.service
sed -i "s#__JAVA_BIN__#$JAVA_BIN#g" /etc/systemd/system/assistant-gateway.service
sed -i "s#__JAVA_HOME__#$JAVA_HOME#g" /etc/systemd/system/assistant-gateway.service
systemctl daemon-reload
systemctl enable assistant-gateway
systemctl restart assistant-gateway
systemctl --no-pager status assistant-gateway
echo "已部署到 $APP_HOME ，进程只监听 127.0.0.1（edge）。对外走 Nginx HTTPS。"
