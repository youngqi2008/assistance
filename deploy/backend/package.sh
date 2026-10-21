#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_DIR="$REPO_ROOT/zhongguan-assistant-gateway"

if ! command -v mvn >/dev/null 2>&1; then
  echo "未找到 mvn，请先安装 Maven 3.9+ 与 JDK 17+"
  exit 1
fi

cd "$APP_DIR"
echo "Maven package: $APP_DIR"
mvn clean package -DskipTests
JAR="$(ls -1 "$APP_DIR"/target/zhongguan-assistant-gateway-*.jar | grep -v original | head -n 1)"
echo "已生成: $JAR"
echo "下一步：把 JAR 拷到服务器 APP_HOME，或本机运行 ../backend/start.sh"
