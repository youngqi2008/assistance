package com.zhongguan.assistant.gateway.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zhongguan.assistant.gateway.billing.BillingEvent;
import com.zhongguan.assistant.gateway.billing.BillingLogService;
import com.zhongguan.assistant.gateway.chinaums.ChinaumsAssistantClient;
import com.zhongguan.assistant.gateway.chinaums.ChinaumsCallResult;
import com.zhongguan.assistant.gateway.config.ChinaumsProperties;
import com.zhongguan.assistant.gateway.config.ZhongguanProperties;
import com.zhongguan.assistant.gateway.web.dto.CheckRequest;
import com.zhongguan.assistant.gateway.web.dto.GatewayResponse;
import com.zhongguan.assistant.gateway.web.dto.QueryRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class AssistantGatewayService {

    private final ChinaumsAssistantClient chinaumsAssistantClient;
    private final ChinaumsProperties chinaumsProperties;
    private final ZhongguanProperties zhongguanProperties;
    private final VerifiedTokenStore verifiedTokenStore;
    private final ObjectMapper objectMapper;
    private final BillingLogService billingLogService;

    public AssistantGatewayService(
            ChinaumsAssistantClient chinaumsAssistantClient,
            ChinaumsProperties chinaumsProperties,
            ZhongguanProperties zhongguanProperties,
            VerifiedTokenStore verifiedTokenStore,
            ObjectMapper objectMapper,
            BillingLogService billingLogService
    ) {
        this.chinaumsAssistantClient = chinaumsAssistantClient;
        this.chinaumsProperties = chinaumsProperties;
        this.zhongguanProperties = zhongguanProperties;
        this.verifiedTokenStore = verifiedTokenStore;
        this.objectMapper = objectMapper;
        this.billingLogService = billingLogService;
    }

    public GatewayResponse check(CheckRequest request, ZhongguanProperties.Client client) {
        String requestId = firstNonBlank(request.requestId(), newRequestId());
        String userNo = firstNonBlank(request.userNo(), client == null ? null : client.userNo(), chinaumsProperties.defaultUserNo());
        String appId = client == null ? "anonymous" : client.appId();
        try {
            ChinaumsCallResult result = chinaumsAssistantClient.check(
                    requestId,
                    userNo,
                    request.token().trim(),
                    request.idLast4().trim().toUpperCase(),
                    request.keyA().trim()
            );
            GatewayResponse response = result.businessOk()
                    ? GatewayResponse.ok(firstNonBlank(result.respMsg(), "身份核验通过"), summary(result, requestId, userNo, false))
                    : toFailure(result, requestId, userNo, "身份核验未通过");
            if (result.businessOk()) {
                verifiedTokenStore.markVerified(request.token().trim());
            }
            billingLogService.record(event("check", appId, userNo, requestId, response, result, true, "checked"));
            return response;
        } catch (RuntimeException ex) {
            billingLogService.record(event("check", appId, userNo, requestId, false, true, "ZG50200", null, null, "upstream-error"));
            throw ex;
        }
    }

    public GatewayResponse query(QueryRequest request, ZhongguanProperties.Client client) {
        String token = request.token().trim();
        String appId = client == null ? "anonymous" : client.appId();
        if (zhongguanProperties.requireCheckBeforeQuery() && !verifiedTokenStore.isVerified(token)) {
            String requestId = firstNonBlank(request.requestId(), newRequestId());
            String userNo = firstNonBlank(request.userNo(), client == null ? null : client.userNo(), chinaumsProperties.defaultUserNo());
            GatewayResponse rejected = GatewayResponse.fail("ZG40001", "01", "4001", "请先完成 check 且核验通过后再 query", null);
            billingLogService.record(event("query", appId, userNo, requestId, rejected, null, false, "check-required"));
            return rejected;
        }
        String requestId = firstNonBlank(request.requestId(), newRequestId());
        String userNo = firstNonBlank(request.userNo(), client == null ? null : client.userNo(), chinaumsProperties.defaultUserNo());
        try {
            ChinaumsCallResult result = chinaumsAssistantClient.query(requestId, userNo, token);
            GatewayResponse response;
            String outcome;
            if (result.businessOk()) {
                JsonNode business = result.business();
                String mobile = text(business, "mobile");
                String idCard = text(business, "idCard");
                if (mobile == null || mobile.isBlank() || idCard == null || idCard.isBlank()) {
                    response = GatewayResponse.fail(
                            firstNonBlank(result.errCode(), "20000000"),
                            firstNonBlank(result.respCode(), "00"),
                            "4002",
                            "身份信息字段不完整",
                            summary(result, requestId, userNo, true)
                    );
                    outcome = "identity-incomplete";
                } else {
                    response = GatewayResponse.ok(firstNonBlank(result.respMsg(), "身份信息已返回"), identityPayload(result, requestId, userNo));
                    outcome = "queried";
                }
            } else {
                response = toFailure(result, requestId, userNo, "身份信息查询未通过");
                outcome = "query-failed";
            }
            billingLogService.record(event("query", appId, userNo, requestId, response, result, true, outcome));
            return response;
        } catch (RuntimeException ex) {
            billingLogService.record(event("query", appId, userNo, requestId, false, true, "ZG50200", null, null, "upstream-error"));
            throw ex;
        }
    }

    private BillingEvent event(
            String action,
            String appId,
            String userNo,
            String requestId,
            GatewayResponse response,
            ChinaumsCallResult result,
            boolean chinaumsCalled,
            String outcome
    ) {
        return event(
                action,
                appId,
                userNo,
                requestId,
                response.success(),
                chinaumsCalled,
                response.errCode(),
                response.respCode(),
                response.detailRespCode(),
                outcome
        );
    }

    private BillingEvent event(
            String action,
            String appId,
            String userNo,
            String requestId,
            boolean success,
            boolean chinaumsCalled,
            String errCode,
            String respCode,
            String detailRespCode,
            String outcome
    ) {
        return new BillingEvent(
                Instant.now(),
                action,
                appId,
                userNo,
                requestId,
                success,
                chinaumsCalled,
                chinaumsCalled,
                errCode,
                respCode,
                detailRespCode,
                outcome
        );
    }

    private GatewayResponse toFailure(ChinaumsCallResult result, String requestId, String userNo, String fallback) {
        return GatewayResponse.fail(
                firstNonBlank(result.errCode(), "ZG50200"),
                result.respCode(),
                result.detailRespCode(),
                firstNonBlank(result.detailRespMsg(), result.respMsg(), result.errInfo(), fallback),
                summary(result, requestId, userNo, false)
        );
    }

    private JsonNode summary(ChinaumsCallResult result, String requestId, String userNo, boolean includeIdentity) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("requestId", requestId);
        node.put("userNo", userNo);
        node.put("errCode", result.errCode());
        node.put("respCode", result.respCode());
        node.put("detailRespCode", result.detailRespCode());
        if (includeIdentity && result.business() != null) {
            putIfPresent(node, result.business(), "name");
            putIfPresent(node, result.business(), "mobile");
            putIfPresent(node, result.business(), "idCard");
        }
        return node;
    }

    private JsonNode identityPayload(ChinaumsCallResult result, String requestId, String userNo) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("requestId", requestId);
        node.put("userNo", userNo);
        putIfPresent(node, result.business(), "name");
        putIfPresent(node, result.business(), "mobile");
        putIfPresent(node, result.business(), "idCard");
        node.put("encryptedName", text(result.business(), "name"));
        node.put("encryptedMobile", text(result.business(), "mobile"));
        node.put("encryptedIdCard", text(result.business(), "idCard"));
        return node;
    }

    private static void putIfPresent(ObjectNode target, JsonNode source, String field) {
        String value = text(source, field);
        if (value != null) {
            target.put(field, value);
        }
    }

    private static String text(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) {
            return null;
        }
        return node.get(field).asText();
    }

    private static String newRequestId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }
}
