package com.zhongguan.assistant.gateway.web.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record GatewayResponse(
        boolean success,
        String errCode,
        String respCode,
        String detailRespCode,
        String message,
        JsonNode data
) {
    public static GatewayResponse ok(String message, JsonNode data) {
        return new GatewayResponse(true, "20000000", "00", "0000", message, data);
    }

    public static GatewayResponse fail(String errCode, String respCode, String detailRespCode, String message, JsonNode data) {
        return new GatewayResponse(false, errCode, respCode, detailRespCode, message, data);
    }
}
