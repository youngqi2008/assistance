package com.zhongguan.assistant.gateway.web;

import com.zhongguan.assistant.gateway.client.ClientRecord;
import com.zhongguan.assistant.gateway.client.ClientRegistry;
import com.zhongguan.assistant.gateway.web.dto.CreateClientRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/clients")
public class AdminClientController {

    private final ClientRegistry clientRegistry;

    public AdminClientController(ClientRegistry clientRegistry) {
        this.clientRegistry = clientRegistry;
    }

    @PostMapping
    public Map<String, Object> create(@Valid @RequestBody CreateClientRequest request) {
        ClientRecord created = clientRegistry.create(request.name(), request.userNo());
        Map<String, Object> body = publicView(created);
        body.put("appKey", created.appKey());
        body.put("hint", "appKey 只在开通时返回一次，请立即交给客户后端并妥善保存");
        return body;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return clientRegistry.list().stream()
                .map(AdminClientController::publicView)
                .toList();
    }

    @DeleteMapping("/{appId}")
    public Map<String, Object> disable(@PathVariable String appId) {
        return publicView(clientRegistry.disable(appId));
    }

    private static Map<String, Object> publicView(ClientRecord record) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("appId", record.appId());
        body.put("name", record.name());
        body.put("userNo", record.userNo());
        body.put("enabled", record.enabled());
        body.put("createdAt", record.createdAt());
        return body;
    }
}
