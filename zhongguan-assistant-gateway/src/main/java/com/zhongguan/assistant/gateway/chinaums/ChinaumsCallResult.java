package com.zhongguan.assistant.gateway.chinaums;

import com.fasterxml.jackson.databind.JsonNode;

public record ChinaumsCallResult(
        int httpStatus,
        String errCode,
        String errInfo,
        String respCode,
        String respMsg,
        String detailRespCode,
        String detailRespMsg,
        JsonNode business
) {
    public boolean envelopeOk() {
        return "20000000".equals(errCode);
    }

    public boolean businessOk() {
        return envelopeOk() && "00".equals(respCode) && "0000".equals(detailRespCode);
    }
}
