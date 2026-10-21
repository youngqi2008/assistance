package com.zhongguan.assistant.gateway.client;

import java.time.Instant;

public record ClientRecord(
        String appId,
        String appKey,
        String name,
        String userNo,
        boolean enabled,
        Instant createdAt
) {
    public ClientRecord disabled() {
        return new ClientRecord(appId, appKey, name, userNo, false, createdAt);
    }
}
