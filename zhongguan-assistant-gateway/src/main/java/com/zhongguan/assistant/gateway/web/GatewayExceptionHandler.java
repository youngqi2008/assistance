package com.zhongguan.assistant.gateway.web;

import com.zhongguan.assistant.gateway.chinaums.ChinaumsUpstreamException;
import com.zhongguan.assistant.gateway.web.dto.GatewayResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GatewayExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GatewayExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<GatewayResponse> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(GatewayResponse.fail("ZG40000", "01", "4000", ex.getMessage(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<GatewayResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + " 不能为空")
                .orElse("请求参数不完整");
        return ResponseEntity.badRequest()
                .body(GatewayResponse.fail("ZG40000", "01", "4000", message, null));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<GatewayResponse> handleConfig(IllegalStateException ex) {
        log.warn("网关配置不完整");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(GatewayResponse.fail("ZG50300", null, null, "网关未完成银商凭据配置", null));
    }

    @ExceptionHandler(ChinaumsUpstreamException.class)
    public ResponseEntity<GatewayResponse> handleUpstream(ChinaumsUpstreamException ex) {
        log.warn("银商上游失败: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(GatewayResponse.fail("ZG50200", null, null, "银商接口暂时不可用", null));
    }
}
