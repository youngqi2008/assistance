# 前后端部署说明（Maven / Java / 静态资源 / Nginx HTTPS）

> 版本：v1.0  
> 日期：2026-10-20  
> 脚本目录：`deploy/`  
> 口径：Java 只监听本机 `127.0.0.1:8080`；**浏览器和客户后端看到的全部是 Nginx 的 HTTPS**。

Windows 用 `*.ps1`，Linux 服务器用 `*.sh`。先复制环境文件：

```bash
cp deploy/env.example deploy/gateway.env
# 填写 PUBLIC_HTTPS_ORIGIN、SERVER_NAME、证书路径、银商私钥、ZHONGUAN_ADMIN_TOKEN
```

PowerShell：把 `env.example` 复制为 `deploy\gateway.env` 后同样填写。

---

## 总览

```text
浏览器 / 客户后端
        │  HTTPS :443
        ▼
     Nginx
        ├─ /sign-pay-pro/     → 前端静态（SDK、iframe）
        ├─ /v1/               → 反代 Java check/query
        ├─ /admin/            → 反代开通客户
        └─ /actuator/health   → 反代健康检查
                │  HTTP 127.0.0.1:8080
                ▼
        Spring Boot JAR（Profile: ums-test,edge 或 ums-prod,edge）
```

| 角色 | 构建 | 运行时进程 | 对外协议 |
| --- | --- | --- | --- |
| 前端 SDK | Node + npm | **无**（静态文件） | Nginx HTTPS |
| 后端网关 | Maven 打 JAR | `java -jar` | 本机 HTTP，对外 Nginx HTTPS |
| 入口 | — | Nginx | 80 跳 443 |

`mvn spring-boot:run` **不是**部署。部署用 `mvn package` 得到 JAR，再用 `java -jar` 或 systemd。

---

## 一、后端：从代码到 Java 部署

### 1.1 环境

- JDK **17+**（`java -version`）
- Maven **3.9+**（`mvn -version`）
- 不要用 `ums-prod` 做第一次联调

### 1.2 打包（Maven）

在仓库根目录：

**Windows**

```powershell
cd deploy\backend
.\package.ps1
```

**Linux / Git Bash**

```bash
cd deploy/backend
chmod +x *.sh
./package.sh
```

等价手写命令：

```bash
cd zhongguan-assistant-gateway
mvn clean package -DskipTests
```

产物：

```text
zhongguan-assistant-gateway/target/zhongguan-assistant-gateway-0.1.0-SNAPSHOT.jar
```

该命令会编译、跑资源过滤、打可执行 Fat JAR。**不会启动进程。**

需要跑单测时去掉 `-DskipTests`：

```bash
mvn clean package
```

### 1.3 本机启动（尚未接 Nginx 也可先调 HTTP）

先保证 `deploy/gateway.env` 里有银商测试私钥 `CHINAUMS_TEST_PRIVATE_KEY`（与 `backend/Test2.java` 的 `priKey` 同一把）。

**Windows**

```powershell
cd deploy\backend
.\start.ps1
```

**Linux**

```bash
./start.sh
```

脚本会带上 `SPRING_PROFILES_ACTIVE`（默认 `ums-test,edge`）：

- `ums-test`：银商测试地址 + 测试 appId/appKey  
- `edge`：只绑 `127.0.0.1`，避免 8080 暴露到公网  

等价手写：

```bash
java -jar zhongguan-assistant-gateway/target/zhongguan-assistant-gateway-0.1.0-SNAPSHOT.jar \
  --spring.profiles.active=ums-test,edge \
  --server.port=8080
```

停止：`deploy/backend/stop.ps1` 或 `./stop.sh`。

健康检查（本机）：

```bash
curl -s http://127.0.0.1:8080/actuator/health
```

接上 Nginx 之后改用：

```bash
curl -sk https://sdk.zgzytech.com/actuator/health
```

### 1.4 Linux 服务器部署（推荐 systemd）

在构建机 `package.sh` 后，把下面文件拷到服务器：

- `target/*.jar`
- `deploy/gateway.env`
- `deploy/backend/assistant-gateway.service`
- `deploy/backend/install-linux.sh`

服务器（root）：

```bash
export ENV_FILE=/path/to/gateway.env
./deploy/backend/install-linux.sh
```

会执行：

1. 复制 JAR 到 `APP_HOME`（默认 `/app/home/zhongguan-assistant-gateway`）  
2. 写入 systemd `assistant-gateway.service`  
3. `systemctl enable --now assistant-gateway`

常用运维：

```bash
systemctl status assistant-gateway
journalctl -u assistant-gateway -f
systemctl restart assistant-gateway
```

发布新版本：再 `package` → 覆盖 `APP_HOME` 下 JAR → `systemctl restart assistant-gateway`。

### 1.5 后端启动脚本一览

| 脚本 | 作用 |
| --- | --- |
| `deploy/backend/package.ps1` / `package.sh` | Maven 打包 |
| `deploy/backend/start.ps1` / `start.sh` | 启动 `java -jar` |
| `deploy/backend/stop.ps1` / `stop.sh` | 停止 |
| `deploy/backend/install-linux.sh` | Linux 安装并注册 systemd |

---

## 二、前端：构建与部署

前端是 **静态资源**（UMD + iframe `custom-verification.html`），没有 Node 常驻服务。生产由 Nginx 用 HTTPS 托管。

构建时必须把 **最终 HTTPS 域名** 打进 SDK（iframe 地址、资源前缀）。域名改了就要重新 `build`，不能只拷文件。

### 2.1 环境

- Node.js **20+**
- `deploy/gateway.env` 中：

```text
PUBLIC_HTTPS_ORIGIN=https://sdk.zgzytech.com
PUBLIC_BASE_PATH=/sign-pay-pro/
SERVER_NAME=sdk.zgzytech.com
```

该 origin 还需向 **中国移动** 报备，否则 `showAuthPage` 会失败。

### 2.2 构建

**Windows**

```powershell
cd deploy\frontend
.\build.ps1
```

**Linux**

```bash
cd deploy/frontend
chmod +x *.sh
./build.sh
```

等价手写：

```bash
cd assistance-mobile-auth
npm ci
npm run build:duodian-health032 -- \
  --base-path /sign-pay-pro/ \
  --base-url https://sdk.zgzytech.com/sign-pay-pro/
```

产物目录：

```text
assistance-mobile-auth/dist-duodian-health032-temp/
  assist/0.3.2/custom-verification.html
  assist/0.3.2/assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.2.umd.cjs
  assist/0.3.2/assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.2.js
```

客户页面应加载（HTTPS）：

```text
https://sdk.zgzytech.com/sign-pay-pro/assist/0.3.2/assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.2.umd.cjs
```

### 2.3 发布（同步到 Nginx 目录）

**Windows**

```powershell
cd deploy\frontend
.\start.ps1
```

**Linux**

```bash
./start.sh
```

脚本把产物拷到 `NGINX_HTML`（默认 `/var/www/assistant-h5`），并尝试 `nginx -s reload`。

前端**没有** `java` / `node` 启动成功的概念；`start` 的含义是「静态文件就位 + Nginx 重载」。

### 2.4 前端脚本一览

| 脚本 | 作用 |
| --- | --- |
| `deploy/frontend/build.ps1` / `build.sh` | npm 构建，写入 HTTPS 公网前缀 |
| `deploy/frontend/start.ps1` / `start.sh` | 同步到 Nginx HTML 并 reload |

---

## 三、Nginx：HTTPS 同时托管前后端

### 3.1 原则

- 对外只开放 **443**（80 永久跳转到 HTTPS）。  
- 证书给 Nginx，不给 Java。  
- Java 不开公网端口。  
- 前端静态和后端 API **同一套 HTTPS**（可同域名不同 path）。

### 3.2 证书

联调自签：

```bash
cd deploy/nginx
./gen-self-signed.sh sdk.zgzytech.com
```

Windows：`.\gen-self-signed.ps1 sdk.zgzytech.com`

生产用 Let's Encrypt 或公司证书，在 `gateway.env` 指向：

```text
SSL_CERT=/etc/letsencrypt/live/sdk.zgzytech.com/fullchain.pem
SSL_KEY=/etc/letsencrypt/live/sdk.zgzytech.com/privkey.pem
```

### 3.3 生成配置并启动

```bash
cd deploy/nginx
chmod +x *.sh
./render-conf.sh
./start.sh
```

Windows（需已安装 Nginx，并设置 `NGINX_HOME`，例如 `C:\nginx`）：

```powershell
cd deploy\nginx
.\render-conf.ps1
$env:NGINX_HOME="C:\nginx"
.\start.ps1
```

Linux 上 `start.sh` 会把 `deploy/nginx/conf/assistant-https.conf` 拷到 `/etc/nginx/conf.d/`，然后 `nginx -t` 并 reload。

停止：`./stop.sh` 或 `.\stop.ps1`。

### 3.4 配置行为（模板）

模板：`deploy/nginx/conf/assistant-https.conf.template`

| location | 作用 |
| --- | --- |
| `/sign-pay-pro/` | 前端 SDK / iframe |
| `/v1/` | 反代 Java check/query |
| `/admin/` | 反代开通客户 |
| `/actuator/health` | 健康检查 |

反代会带 `X-Forwarded-Proto: https`，与 Java 的 `forward-headers-strategy: framework` 配合。

### 3.5 Nginx 脚本一览

| 脚本 | 作用 |
| --- | --- |
| `deploy/nginx/gen-self-signed.ps1` / `.sh` | 自签证书 |
| `deploy/nginx/render-conf.ps1` / `.sh` | 用 env 渲染 conf |
| `deploy/nginx/start.ps1` / `.sh` | 安装 conf 并启动/reload |
| `deploy/nginx/stop.ps1` / `.sh` | 退出 Nginx |

---

## 四、推荐上线顺序

在已填写 `deploy/gateway.env` 的前提下：

```text
1. deploy/backend/package.*     Maven 打 JAR
2. deploy/backend/start.*       或 Linux install-linux.sh
3. curl http://127.0.0.1:8080/actuator/health
4. deploy/frontend/build.*      用 HTTPS 域名构建 SDK
5. deploy/nginx/gen-self-signed.*或安装正式证书
6. deploy/frontend/start.*      静态文件就位
7. deploy/nginx/start.*         443 对外
8. curl -sk https://$SERVER_NAME/actuator/health
9. 真机访问 HTTPS SDK / 测试页（移动蜂窝）
```

客户后端 check/query 应改为：

```text
https://sdk.zgzytech.com/v1/assistant/info/check
https://sdk.zgzytech.com/v1/assistant/info/query
```

不要再打 `http://127.0.0.1:8080`（生产）。本机排障可以打 8080。

---

## 五、验收

| 项 | 期望 |
| --- | --- |
| `https://$SERVER_NAME/actuator/health` | `{"status":"UP"}` |
| SDK URL 为 `https://` | 与构建时 `base-url` 一致 |
| iframe `custom-verification.html` | 同域 HTTPS |
| Java 监听 | 仅 `127.0.0.1:8080` |
| 80 端口 | 跳转到 443 |
| 启动日志 | `银商环境 env=test` 且 URL 为 `test-api-open.chinaums.com`（测试档） |

---

## 六、常见问题

**check 报未配置私钥**  
`gateway.env` 未填 `CHINAUMS_TEST_PRIVATE_KEY`。

**授权页空白 / showAuthPage 失败**  
HTTPS 域名未向移动报备，或构建时 `PUBLIC_HTTPS_ORIGIN` 与 Nginx `server_name` 不一致。改域名后必须重新 `frontend/build`。

**用了 `mvn spring-boot:run` 当生产**  
那是开发启动。生产用 `package` + `java -jar` / systemd。

**误开 `ums-prod`**  
生产银商凭据为空时会调失败或打到生产主机。第一次联调用 `ums-test,edge`。

**Windows 上 Nginx 不起来**  
安装 Nginx 并设置 `NGINX_HOME`，在主 `nginx.conf` 的 `http` 里 `include assistant-https.conf;`。更稳妥是把 JAR + 静态文件放到 Linux 再跑 `deploy/nginx/start.sh`。
