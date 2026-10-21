package com.zhongguan.assistant.gateway.service;

import com.zhongguan.assistant.gateway.config.ZhongguanProperties;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class VerifiedTokenStore {

    private final ZhongguanProperties properties;
    private final Map<String, Long> verifiedUntil = new ConcurrentHashMap<>();

    public VerifiedTokenStore(ZhongguanProperties properties) {
        this.properties = properties;
    }

    public void markVerified(String token) {
        long ttl = Instant.now().plus(properties.verifiedTokenTtl()).toEpochMilli();
        verifiedUntil.put(digest(token), ttl);
    }

    public boolean isVerified(String token) {
        prune();
        Long until = verifiedUntil.get(digest(token));
        return until != null && until >= Instant.now().toEpochMilli();
    }

    private void prune() {
        long now = Instant.now().toEpochMilli();
        verifiedUntil.entrySet().removeIf(entry -> entry.getValue() < now);
    }

    private static String digest(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
