package com.zhongguan.assistant.gateway.billing;

import java.time.Instant;

public record BillingEvent(
        Instant at,
        String action,
        String appId,
        String userNo,
        String requestId,
        boolean success,
        boolean chinaumsCalled,
        boolean billable,
        String errCode,
        String respCode,
        String detailRespCode,
        String outcome
) {
}
