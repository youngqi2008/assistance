package com.open.demo.local;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class ChinaumsAssistantCli {
    private static final String CHECK_URL = "https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/check";
    private static final String QUERY_URL = "https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/query";
    private static final String PLATFORM_PUBLIC_KEY = "0414bb7e9c3914bb65b85079b1dc6e1ca2a0ee04dd9bb55b2f8d31704a6dec0cca695739e128f9c931330e1c0f493be4d56244236434c9d344c4716ba64a4470ba";

    public static void main(String[] args) throws Exception {
        if (args.length < 6) {
            throw new IllegalArgumentException("Usage: <check|query> <appId> <appKey> <privateKey> <requestId> <token> [userNo] [servidL4] [keyA]");
        }

        String action = args[0];
        String appId = args[1];
        String appKey = args[2];
        String privateKey = args[3];
        String requestId = args[4];
        String token = args[5];
        String userNo = args.length > 6 ? args[6] : "08";
        String servidL4 = args.length > 7 ? args[7] : "";
        String keyA = args.length > 8 ? args[8] : "12345685825822222222222222";

        LinkedHashMap<String, String> body = new LinkedHashMap<String, String>();
        if ("check".equals(action)) {
            body.put("keyA", keyA);
            body.put("requestId", requestId);
            body.put("userNo", userNo);
            body.put("servidL4", servidL4);
            body.put("token", token);
            runRequest(CHECK_URL, appId, appKey, privateKey, body);
            return;
        }

        if ("query".equals(action)) {
            body.put("requestId", requestId);
            body.put("userNo", userNo);
            body.put("token", token);
            runRequest(QUERY_URL, appId, appKey, privateKey, body);
            return;
        }

        throw new IllegalArgumentException("Unknown action: " + action);
    }

    private static void runRequest(String url, String appId, String appKey, String privateKey, LinkedHashMap<String, String> body) throws Exception {
        String plainText = toJsonObject(body);
        String encryptedData = SM2.sm2Encrypt(plainText, PLATFORM_PUBLIC_KEY);
        String requestBody = "{\"data\":\"" + escapeJson(encryptedData) + "\"}";
        String responseText = post(url, requestBody, getOpenBodySig(appId, appKey, requestBody));
        String encryptedResponseData = extractJsonString(responseText, "data");
        String decryptedData = "";
        if (encryptedResponseData != null && encryptedResponseData.length() > 0) {
            decryptedData = SM2.sm2Decrypt(encryptedResponseData, privateKey);
        }

        System.out.println("{"
                + "\"httpBody\":\"" + escapeJson(responseText) + "\","
                + "\"decryptedData\":\"" + escapeJson(decryptedData == null ? "" : decryptedData) + "\""
                + "}");
    }

    private static String post(String requestUrl, String params, String authorization) throws Exception {
        HttpURLConnection connection = null;
        BufferedReader reader = null;
        try {
            URL url = new URL(requestUrl);
            connection = (HttpURLConnection) url.openConnection();
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setRequestMethod("POST");
            connection.setUseCaches(false);
            connection.setInstanceFollowRedirects(true);
            connection.setRequestProperty("Content-Type", "application/json;charset=UTF-8");
            connection.setRequestProperty("Accept", "application/json");
            connection.setRequestProperty("Authorization", authorization);
            connection.connect();

            OutputStream out = connection.getOutputStream();
            out.write(params.getBytes(StandardCharsets.UTF_8));
            out.flush();
            out.close();

            InputStream responseStream = connection.getResponseCode() >= 400 ? connection.getErrorStream() : connection.getInputStream();
            reader = new BufferedReader(new InputStreamReader(responseStream, StandardCharsets.UTF_8));
            String line;
            StringBuilder sb = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        } finally {
            if (reader != null) {
                reader.close();
            }
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private static String getOpenBodySig(String appId, String appKey, String body) throws Exception {
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String nonce = UUID.randomUUID().toString().replace("-", "");
        String bodyDigest = sha256Hex(new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8)));
        String signingText = appId + timestamp + nonce + bodyDigest;
        byte[] localSignature = hmacSHA256(signingText.getBytes(StandardCharsets.UTF_8), appKey.getBytes(StandardCharsets.UTF_8));
        String localSignatureStr = java.util.Base64.getEncoder().encodeToString(localSignature);
        return "OPEN-BODY-SIG AppId=\"" + appId + "\", Timestamp=\"" + timestamp + "\", Nonce=\"" + nonce + "\", Signature=\"" + localSignatureStr + "\"";
    }

    private static byte[] hmacSHA256(byte[] data, byte[] key) throws NoSuchAlgorithmException, InvalidKeyException {
        String algorithm = "HmacSHA256";
        Mac mac = Mac.getInstance(algorithm);
        mac.init(new SecretKeySpec(key, algorithm));
        return mac.doFinal(data);
    }

    private static String sha256Hex(InputStream is) throws Exception {
        java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
        byte[] buffer = new byte[8192];
        int read;
        while ((read = is.read(buffer)) != -1) {
            digest.update(buffer, 0, read);
        }
        byte[] bytes = digest.digest();
        StringBuilder result = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            result.append(String.format("%02x", b & 0xff));
        }
        return result.toString();
    }

    private static String toJsonObject(LinkedHashMap<String, String> body) {
        StringBuilder result = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, String> entry : body.entrySet()) {
            if (!first) {
                result.append(",");
            }
            first = false;
            result.append("\"").append(escapeJson(entry.getKey())).append("\":\"").append(escapeJson(entry.getValue())).append("\"");
        }
        result.append("}");
        return result.toString();
    }

    private static String extractJsonString(String json, String key) {
        String needle = "\"" + key + "\"";
        int keyIndex = json.indexOf(needle);
        if (keyIndex < 0) {
            return null;
        }
        int colonIndex = json.indexOf(':', keyIndex + needle.length());
        if (colonIndex < 0) {
            return null;
        }
        int start = json.indexOf('"', colonIndex + 1);
        if (start < 0) {
            return null;
        }

        StringBuilder result = new StringBuilder();
        boolean escaped = false;
        for (int i = start + 1; i < json.length(); i++) {
            char ch = json.charAt(i);
            if (escaped) {
                result.append(ch);
                escaped = false;
                continue;
            }
            if (ch == '\\') {
                escaped = true;
                continue;
            }
            if (ch == '"') {
                return result.toString();
            }
            result.append(ch);
        }
        return null;
    }

    private static String escapeJson(String value) {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            switch (ch) {
                case '"':
                    result.append("\\\"");
                    break;
                case '\\':
                    result.append("\\\\");
                    break;
                case '\b':
                    result.append("\\b");
                    break;
                case '\f':
                    result.append("\\f");
                    break;
                case '\n':
                    result.append("\\n");
                    break;
                case '\r':
                    result.append("\\r");
                    break;
                case '\t':
                    result.append("\\t");
                    break;
                default:
                    if (ch < 0x20) {
                        result.append(String.format("\\u%04x", (int) ch));
                    } else {
                        result.append(ch);
                    }
            }
        }
        return result.toString();
    }
}
