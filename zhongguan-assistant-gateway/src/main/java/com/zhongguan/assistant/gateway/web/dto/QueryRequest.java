package com.zhongguan.assistant.gateway.web.dto;

import jakarta.validation.constraints.NotBlank;

public record QueryRequest(
        @NotBlank String token,
        String requestId,
        String userNo
) {
}
