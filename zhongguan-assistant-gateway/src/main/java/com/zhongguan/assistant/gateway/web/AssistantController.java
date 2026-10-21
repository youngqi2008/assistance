package com.zhongguan.assistant.gateway.web;

import com.zhongguan.assistant.gateway.auth.ClientAuthFilter;
import com.zhongguan.assistant.gateway.config.ZhongguanProperties;
import com.zhongguan.assistant.gateway.service.AssistantGatewayService;
import com.zhongguan.assistant.gateway.web.dto.CheckRequest;
import com.zhongguan.assistant.gateway.web.dto.GatewayResponse;
import com.zhongguan.assistant.gateway.web.dto.QueryRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/assistant/info")
public class AssistantController {

    private final AssistantGatewayService assistantGatewayService;

    public AssistantController(AssistantGatewayService assistantGatewayService) {
        this.assistantGatewayService = assistantGatewayService;
    }

    @PostMapping("/check")
    public GatewayResponse check(@Valid @RequestBody CheckRequest request, HttpServletRequest httpRequest) {
        return assistantGatewayService.check(request, client(httpRequest));
    }

    @PostMapping("/query")
    public GatewayResponse query(@Valid @RequestBody QueryRequest request, HttpServletRequest httpRequest) {
        return assistantGatewayService.query(request, client(httpRequest));
    }

    private static ZhongguanProperties.Client client(HttpServletRequest request) {
        Object value = request.getAttribute(ClientAuthFilter.CLIENT_ATTR);
        return value instanceof ZhongguanProperties.Client client ? client : null;
    }
}
