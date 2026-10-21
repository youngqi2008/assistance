package com.zhongguan.assistant.gateway.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CheckRequest(
        @NotBlank String token,
        @NotBlank String idLast4,
        @NotBlank String keyA,
        String requestId,
        String userNo
) {
}
