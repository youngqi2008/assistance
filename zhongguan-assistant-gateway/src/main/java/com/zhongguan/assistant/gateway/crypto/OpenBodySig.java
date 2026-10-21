package com.zhongguan.assistant.gateway.crypto;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 与银商 OPEN-BODY-SIG 同算法：AppId + Timestamp + Nonce + SHA256(body) 再 HMAC-SHA256(appKey)。
 * 中冠对外鉴权使用前缀 ZG-BODY-SIG，对银商仍使用 OPEN-BODY-SIG。
 */
public final class OpenBodySig {

    public static final String CHINAUMS_SCHEME = "OPEN-BODY-SIG";
    public static final String ZHONGUAN_SCHEME = "ZG-BODY-SIG";
    private static final DateTimeFormatter TIMESTAMP =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final Pattern HEADER = Pattern.compile(
            "(OPEN-BODY-SIG|ZG-BODY-SIG)\\s+AppId=\"([^\"]+)\",\\s*Timestamp=\"([^\"]+)\",\\s*Nonce=\"([^\"]+)\",\\s*Signature=\"([^\"]+)\"");

    private OpenBodySig() {
    }

    public static String timestampNow() {
        return LocalDateTime.now(ZoneId.systemDefault()).format(TIMESTAMP);
    }

    public static String nonce() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public static String sha256Hex(String body) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(body.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    public static String sign(String scheme, String appId, String appKey, String body) {
        return sign(scheme, appId, appKey, body, timestampNow(), nonce());
    }

    public static String sign(
            String scheme,
            String appId,
            String appKey,
            String body,
            String timestamp,
            String nonce
    ) {
        String bodyDigest = sha256Hex(body);
        String signingText = appId + timestamp + nonce + bodyDigest;
        String signature = hmacSha256Base64(signingText, appKey);
        return scheme + " AppId=\"" + appId + "\", Timestamp=\"" + timestamp
                + "\", Nonce=\"" + nonce + "\", Signature=\"" + signature + "\"";
    }

    public static ParsedHeader parse(String authorization) {
        if (authorization == null || authorization.isBlank()) {
            return null;
        }
        Matcher matcher = HEADER.matcher(authorization.trim());
        if (!matcher.matches()) {
            return null;
        }
        return new ParsedHeader(
                matcher.group(1),
                matcher.group(2),
                matcher.group(3),
                matcher.group(4),
                matcher.group(5)
        );
    }

    public static boolean matches(ParsedHeader header, String appKey, String body) {
        if (header == null || appKey == null) {
            return false;
        }
        String expected = sign(header.scheme(), header.appId(), appKey, body, header.timestamp(), header.nonce());
        ParsedHeader expectedHeader = parse(expected);
        return expectedHeader != null && constantTimeEquals(expectedHeader.signature(), header.signature());
    }

    private static String hmacSha256Base64(String signingText, String appKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(appKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getEncoder().encodeToString(mac.doFinal(signingText.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("HMAC-SHA256 unavailable", e);
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    public record ParsedHeader(String scheme, String appId, String timestamp, String nonce, String signature) {
    }
}
