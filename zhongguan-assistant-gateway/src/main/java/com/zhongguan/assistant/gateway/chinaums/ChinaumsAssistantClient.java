package com.zhongguan.assistant.gateway.chinaums;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhongguan.assistant.gateway.config.ChinaumsProperties;
import com.zhongguan.assistant.gateway.crypto.OpenBodySig;
import com.zhongguan.assistant.gateway.crypto.Sm2Codec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class ChinaumsAssistantClient {

    private static final Logger log = LoggerFactory.getLogger(ChinaumsAssistantClient.class);

    private final ChinaumsProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public ChinaumsAssistantClient(ChinaumsProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(properties.connectTimeout());
        factory.setReadTimeout(properties.readTimeout());
        this.restClient = RestClient.builder().requestFactory(factory).build();
        log.info("银商环境 env={} checkUrl={} queryUrl={}", properties.env(), properties.checkUrl(), properties.queryUrl());
    }

    public ChinaumsCallResult check(String requestId, String userNo, String token, String servidL4, String keyA) {
        Map<String, String> plain = new LinkedHashMap<>();
        plain.put("requestId", requestId);
        plain.put("userNo", userNo);
        plain.put("token", token);
        plain.put("servidL4", servidL4);
        plain.put("keyA", keyA);
        return invoke(properties.checkUrl(), "check", requestId, plain);
    }

    public ChinaumsCallResult query(String requestId, String userNo, String token) {
        Map<String, String> plain = new LinkedHashMap<>();
        plain.put("requestId", requestId);
        plain.put("userNo", userNo);
        plain.put("token", token);
        return invoke(properties.queryUrl(), "query", requestId, plain);
    }

    private ChinaumsCallResult invoke(String url, String action, String requestId, Map<String, String> plain) {
        assertConfigured();
        try {
            String encrypted = Sm2Codec.encryptToBase64(objectMapper.writeValueAsString(plain), properties.platformPublicKey());
            String requestBody = objectMapper.writeValueAsString(Map.of("data", encrypted));
            String authorization = OpenBodySig.sign(
                    OpenBodySig.CHINAUMS_SCHEME,
                    properties.appId(),
                    properties.appKey(),
                    requestBody
            );
            String httpBody = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .header("Authorization", authorization)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);
            return parse(200, httpBody, action, requestId);
        } catch (RestClientResponseException e) {
            log.warn("银商 {} HTTP {} requestId={}", action, e.getStatusCode().value(), requestId);
            throw new ChinaumsUpstreamException("银商接口暂时不可用", e);
        } catch (ChinaumsUpstreamException e) {
            throw e;
        } catch (Exception e) {
            log.warn("银商 {} 调用失败 requestId={}", action, requestId);
            throw new ChinaumsUpstreamException("银商接口调用失败", e);
        }
    }

    private ChinaumsCallResult parse(int httpStatus, String httpBody, String action, String requestId) {
        try {
            JsonNode envelope = httpBody == null || httpBody.isBlank()
                    ? objectMapper.createObjectNode()
                    : objectMapper.readTree(httpBody);
            String errCode = text(envelope, "errCode");
            String errInfo = text(envelope, "errInfo");
            String dataCipher = text(envelope, "data");
            JsonNode business = objectMapper.createObjectNode();
            if (dataCipher != null && !dataCipher.isBlank() && properties.privateKey() != null && !properties.privateKey().isBlank()) {
                String decrypted = Sm2Codec.decryptFromBase64(dataCipher, properties.privateKey());
                if (decrypted != null && !decrypted.isBlank()) {
                    business = objectMapper.readTree(decrypted);
                }
            }
            log.info("银商 {} 返回 errCode={} respCode={} detailRespCode={} requestId={}",
                    action, errCode, text(business, "respCode"), text(business, "detailRespCode"), requestId);
            return new ChinaumsCallResult(
                    httpStatus,
                    errCode,
                    errInfo,
                    text(business, "respCode"),
                    text(business, "respMsg"),
                    text(business, "detailRespCode"),
                    text(business, "detailRespMsg"),
                    business
            );
        } catch (Exception e) {
            throw new ChinaumsUpstreamException("银商响应解析失败", e);
        }
    }

    private void assertConfigured() {
        if (isBlank(properties.appId()) || isBlank(properties.appKey()) || isBlank(properties.privateKey())) {
            throw new IllegalStateException("未配置银商 appId/appKey/私钥（测试：CHINAUMS_TEST_*，生产：CHINAUMS_PROD_*）");
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node == null ? null : node.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }
}
