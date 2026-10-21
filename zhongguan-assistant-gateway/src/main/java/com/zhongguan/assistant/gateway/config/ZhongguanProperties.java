package com.zhongguan.assistant.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@ConfigurationProperties(prefix = "zhongguan")
public record ZhongguanProperties(
        @DefaultValue("true")
        boolean authEnabled,
        @DefaultValue("true")
        boolean requireCheckBeforeQuery,
        @DefaultValue("10m")
        Duration verifiedTokenTtl,
        @DefaultValue("")
        String adminToken,
        @DefaultValue("data/clients.json")
        String clientsFile,
        List<Client> clients
) {
    public ZhongguanProperties {
        if (clients == null) {
            clients = new ArrayList<>();
        }
    }

    public record Client(String appId, String appKey, String userNo) {
    }
}
