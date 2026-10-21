package com.zhongguan.assistant.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;

@ConfigurationProperties(prefix = "chinaums")
public record ChinaumsProperties(
        @DefaultValue("test")
        String env,
        String appId,
        String appKey,
        String privateKey,
        @DefaultValue("0414bb7e9c3914bb65b85079b1dc6e1ca2a0ee04dd9bb55b2f8d31704a6dec0cca695739e128f9c931330e1c0f493be4d56244236434c9d344c4716ba64a4470ba")
        String platformPublicKey,
        @DefaultValue("https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/check")
        String checkUrl,
        @DefaultValue("https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/query")
        String queryUrl,
        @DefaultValue("08")
        String defaultUserNo,
        @DefaultValue("5s")
        Duration connectTimeout,
        @DefaultValue("15s")
        Duration readTimeout
) {
}
