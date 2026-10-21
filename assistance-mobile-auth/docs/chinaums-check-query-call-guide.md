# 银联商务 check / query 调用时序

## 0. 先准备

服务端固定参数：

```text
appId      = 银联商务分配
appKey     = 银联商务分配，用于签名
requestId  = 请求流水号
userNo     = 08
```

平台公钥，用于 SM2 加密请求明文：

```text
0414bb7e9c3914bb65b85079b1dc6e1ca2a0ee04dd9bb55b2f8d31704a6dec0cca695739e128f9c931330e1c0f493be4d56244236434c9d344c4716ba64a4470ba
```

服务端还要有业务方 SM2 私钥，用于解密响应 `data`。私钥不要放前端。

## 1. 前端授权后给服务端

前端通过移动 JSSDK 授权成功后，把这三个值给业务方服务端：

```json
{
  "token": "移动JSSDK返回的token",
  "idLast4": "身份证后四位",
  "keyA": "移动JSSDK返回的encryptPublicKey"
}
```

## 2. 服务端调用 check

### 2.1 组装 check 明文

```json
{
  "requestId": "请求流水号",
  "userNo": "08",
  "token": "移动JSSDK返回的token",
  "servidL4": "身份证后四位",
  "keyA": "移动JSSDK返回的encryptPublicKey"
}
```

其中：

```text
servidL4 = idLast4
keyA     = encryptPublicKey
```

### 2.2 SM2 加密

把上面的明文对象 `JSON.stringify` 成字符串，然后用平台公钥做 SM2 加密。

得到的返回值就是要放进 `data` 的字符串：

```text
checkEncryptedData = SM2加密方法返回的Base64字符串
```

调用方不需要手工拼密文，也不需要手工处理内部字节格式。后端只要封装一个 SM2 加密方法：输入 `明文JSON字符串 + 平台公钥`，输出 `Base64密文字符串`。

伪代码：

```text
checkEncryptedData = sm2Encrypt(checkPlainText, platformPublicKey)
```

最终 body：

```json
{
  "data": "checkEncryptedData"
}
```

### 2.3 生成签名

请求头签名方式是 `OPEN-BODY-SIG`，其中 `Signature` 使用 `HMAC-SHA256` 计算；这里不需要额外做 SM3 签名。

签名用最终 body 字符串算：

```text
bodyString = {"data":"checkEncryptedData"}
bodyDigest = SHA256(bodyString)
signText   = appId + timestamp + nonce + bodyDigest
signature  = Base64(HMAC-SHA256(appKey, signText))
```

请求头：

```http
Accept: application/json
Content-Type: application/json;charset=UTF-8
Authorization: OPEN-BODY-SIG AppId="你的appId", Timestamp="yyyyMMddHHmmss", Nonce="随机串", Signature="签名"
```

### 2.4 POST check

```text
POST https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/check
```

```bash
curl -X POST 'https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/check' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -H 'Authorization: OPEN-BODY-SIG AppId="你的appId", Timestamp="20260701123456", Nonce="随机串", Signature="签名"' \
  -d '{"data":"checkEncryptedData"}'
```

### 2.5 处理 check 响应

`check` 返回的是外层 JSON，其中 `data` 是密文：

```json
{
  "errCode": "20000000",
  "errInfo": "成功",
  "data": "SM2加密后的响应数据"
}
```

处理顺序：

```text
1. 先看外层 errCode / errInfo
2. errCode=20000000 表示开放平台外层请求成功
3. 如果有 data，用业务方 SM2 私钥解密 data
4. data 解密后是 check 的业务结果 JSON 字符串
```

解密方式：后端封装一个 SM2 解密方法，输入 `响应data密文 + 业务方SM2私钥`，输出 `解密后的JSON字符串`。

伪代码：

```text
decryptedData = sm2Decrypt(responseData, businessPrivateKey)
```

解密后通过条件：

```json
{
  "respCode": "00",
  "detailRespCode": "0000"
}
```

`check` 通过后再调 `query`。

## 3. 服务端调用 query

### 3.1 组装 query 明文

```json
{
  "requestId": "请求流水号",
  "userNo": "08",
  "token": "移动JSSDK返回的token"
}
```

`query` 不传 `servidL4`，也不传 `keyA`。

### 3.2 SM2 加密

同样先 `JSON.stringify`，再用平台公钥 SM2 加密：

```text
queryEncryptedData = SM2加密方法返回的Base64字符串
```

最终 body：

```json
{
  "data": "queryEncryptedData"
}
```

### 3.3 生成签名

`query` 也使用 `OPEN-BODY-SIG + HMAC-SHA256`，不需要额外做 SM3 签名。

用 query 的最终 body 重新签名：

```text
bodyString = {"data":"queryEncryptedData"}
bodyDigest = SHA256(bodyString)
signText   = appId + timestamp + nonce + bodyDigest
signature  = Base64(HMAC-SHA256(appKey, signText))
```

### 3.4 POST query

```text
POST https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/query
```

```bash
curl -X POST 'https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/query' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -H 'Authorization: OPEN-BODY-SIG AppId="你的appId", Timestamp="20260701123510", Nonce="随机串", Signature="签名"' \
  -d '{"data":"queryEncryptedData"}'
```

### 3.5 处理 query 响应

`query` 返回的外层结构也是 JSON，其中 `data` 是密文：

```json
{
  "errCode": "20000000",
  "errInfo": "成功",
  "data": "SM2加密后的响应数据"
}
```

处理顺序：

```text
1. 先看外层 errCode / errInfo
2. errCode=20000000 表示开放平台外层请求成功
3. 如果有 data，用业务方 SM2 私钥解密 data
4. data 解密后是 query 的业务结果 JSON 字符串
```

解密方式同 `check`：后端封装一个 SM2 解密方法，输入 `响应data密文 + 业务方SM2私钥`，输出 `解密后的JSON字符串`。

伪代码：

```text
decryptedData = sm2Decrypt(responseData, businessPrivateKey)
```

成功时解密后可拿到：

```json
{
  "respCode": "00",
  "detailRespCode": "0000",
  "name": "加密姓名",
  "mobile": "加密手机号",
  "idCard": "加密身份证号"
}
```

`name / mobile / idCard` 仍可能是业务密文，需要按对接约定继续解密。

## 4. 最短时序

```text
1. 前端拿 token / idLast4 / keyA
2. 服务端组装 check 明文
3. check 明文 JSON.stringify
4. SM2 加密成 checkEncryptedData
5. 生成 {"data":"checkEncryptedData"}
6. 基于 check body 生成 OPEN-BODY-SIG
7. POST check
8. check 通过
9. 服务端组装 query 明文
10. query 明文 JSON.stringify
11. SM2 加密成 queryEncryptedData
12. 生成 {"data":"queryEncryptedData"}
13. 基于 query body 生成 OPEN-BODY-SIG
14. POST query
15. 解密 query 响应
```

## 5. 一句话区别

```text
check 明文 = requestId + userNo + token + servidL4 + keyA
query 明文 = requestId + userNo + token
```

如果客户使用第三方 SM2 库，需要先和银联商务联调确认“请求能被平台解开、响应能被客户私钥解开”。不要在业务代码里手工拼密文格式。
