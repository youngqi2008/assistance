package com.zhongguan.assistant.gateway.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateClientRequest(
        @NotBlank String name,
        String userNo
) {
}
