# 中冠银杏助理网关

Spring Boot 3 / Java 17。对客户提供 `check`、`query`；对银商使用与 `backend/Test2.java`、`Test3.java` 相同的 SM2 + `OPEN-BODY-SIG`。

客户浏览器不要调本服务。由**客户后端**在 JSSDK `onSuccess` 拿到 `token`、`idLast4`、`keyA` 后调用。

## 接口

| 方法 | 路径 | 客户明文 |
| --- | --- | --- |
| POST | `/v1/assistant/info/check` | `token`、`idLast4`、`keyA`，可选 `requestId`、`userNo` |
| POST | `/v1/assistant/info/query` | `token`，可选 `requestId`、`userNo` |
| GET | `/actuator/health` | 无需鉴权 |

默认必须先 check 成功再 query。银商 `appId` / `appKey` / SM2 私钥只配在网关环境变量里。

## 银商测试 / 生产

依据《大数据银杏盾接口规范-银杏助理项目开放平台版本-v2.0.1》。路径相同，主机不同；`query` 与 `check` 同域。

| 环境 | Profile | check | query |
| --- | --- | --- | --- |
| 测试（默认） | `ums-test` 或不指定 | `https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/check` | `…/info/query` |
| 生产 | `ums-prod` | `https://api-mop.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/check` | `…/info/query` |

```bash
# 测试（默认，与规范测试地址一致）
mvn spring-boot:run
# 或显式
mvn spring-boot:run -Dspring-boot.run.profiles=ums-test

# 生产
mvn spring-boot:run -Dspring-boot.run.profiles=ums-prod
```

测试、生产的银商凭据必须分开配置，由 Profile 选用哪一套：

| 用途 | 测试（默认 / `ums-test`） | 生产（`ums-prod`） |
| --- | --- | --- |
| appId | `CHINAUMS_TEST_APP_ID`（兼容 `CHINAUMS_ASSISTANT_APP_ID`） | `CHINAUMS_PROD_APP_ID` |
| appKey | `CHINAUMS_TEST_APP_KEY`（兼容 `CHINAUMS_ASSISTANT_APP_KEY`） | `CHINAUMS_PROD_APP_KEY` |
| SM2 私钥 | `CHINAUMS_TEST_PRIVATE_KEY`（兼容 `CHINAUMS_ASSISTANT_PRIVATE_KEY`） | `CHINAUMS_PROD_PRIVATE_KEY` |
| 平台公钥（可选） | `CHINAUMS_TEST_PLATFORM_PUBLIC_KEY` | `CHINAUMS_PROD_PLATFORM_PUBLIC_KEY` |
| userNo（可选） | `CHINAUMS_TEST_USER_NO` | `CHINAUMS_PROD_USER_NO` |

启动日志会打印 `银商环境 env=test|prod` 及实际 URL，不含密钥。

## 启动

```bash
cd zhongguan-assistant-gateway
mvn spring-boot:run
```

本地可先关掉调用方鉴权（仍走银商测试地址）：

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

运行必须配置：

```text
# 测试套（默认；也可用旧名 CHINAUMS_ASSISTANT_*）
CHINAUMS_TEST_APP_ID
CHINAUMS_TEST_APP_KEY
CHINAUMS_TEST_PRIVATE_KEY   # 测试默认与 Test2.java priKey 相同；生产不要用这把

# 生产套（仅 ums-prod 使用，不要复用测试 appId/appKey）
CHINAUMS_PROD_APP_ID
CHINAUMS_PROD_APP_KEY
CHINAUMS_PROD_PRIVATE_KEY

ZHONGUAN_ADMIN_TOKEN
```

## 小团队：自助开通多个客户

不需要 K8s。中冠内部用一个管理令牌调开通接口，网关会生成一对 `appId` / `appKey`，写入 `data/clients.json`（已 gitignore）。

先设管理令牌再启动：

```text
ZHONGUAN_ADMIN_TOKEN=请换成足够长的随机串
```

开通（把客户名称发给网关即可）：

```bash
curl -s http://127.0.0.1:8080/admin/clients \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: $ZHONGUAN_ADMIN_TOKEN" \
  -d "{\"name\":\"多点健康\",\"userNo\":\"08\"}"
```

返回里的 `appKey` **只出现这一次**。立刻复制给该客户后端，不要再向别人展示。

```bash
# 查看已开通客户（不含 appKey）
curl -s http://127.0.0.1:8080/admin/clients -H "X-Admin-Token: $ZHONGUAN_ADMIN_TOKEN"

# 停用某客户
curl -s -X DELETE http://127.0.0.1:8080/admin/clients/<appId> \
  -H "X-Admin-Token: $ZHONGUAN_ADMIN_TOKEN"
```

流程：中冠开通 → 把 `appId`/`appKey` 私下给客户后端 → 客户用 `ZG-BODY-SIG` 调 check/query。多家客户重复开通即可，每家一对密钥。

未配置 `ZHONGUAN_ADMIN_TOKEN` 时，管理接口不可用。YAML 里的 `zg-demo` 仅供开发。

## 客户鉴权

请求头：

```text
Authorization: ZG-BODY-SIG AppId="zg-demo", Timestamp="yyyyMMddHHmmss", Nonce="<32位>", Signature="<Base64>"
```

算法与银商 `OPEN-BODY-SIG` 相同：

1. `bodyDigest = SHA256_HEX(原始 JSON 请求体)`
2. `HMAC_SHA256_BASE64(appId + timestamp + nonce + bodyDigest, appKey)`

## 示例（local 档关闭鉴权后）

```bash
curl -s http://127.0.0.1:8080/v1/assistant/info/check \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"<移动token>\",\"idLast4\":\"1234\",\"keyA\":\"<keyA>\"}"
```

check 的 `success=true` 后再 query 同一 `token`。

## 计费业务日志

每次 `check` / `query` 写一行 JSON 到 `logs/billing.jsonl`（按天滚动，保留 180 天）。按 `appId` 汇总 `billable=true` 的次数即可计费。

| 字段 | 含义 |
| --- | --- |
| `action` | `check` 或 `query` |
| `appId` | 哪个客户 |
| `requestId` / `userNo` | 关联单号 |
| `success` | 本次业务是否成功 |
| `chinaumsCalled` / `billable` | 是否已实际调用银商（建议按此计费） |
| `errCode` / `respCode` / `detailRespCode` | 结果码 |
| `outcome` | `checked` / `queried` / `check-required` / `upstream-error` 等 |

不记录 `token`、`keyA`、身份证、姓名手机号。未先 check 就 query（`ZG40001`）会记日志，但 `billable=false`。

## 测试

```bash
mvn test
```
