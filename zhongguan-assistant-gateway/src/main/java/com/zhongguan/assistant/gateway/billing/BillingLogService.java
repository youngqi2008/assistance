package com.zhongguan.assistant.gateway.billing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * 计费业务日志。只记客户、动作、成败，不写 token / keyA / 身份证 / 三要素。
 */
@Service
public class BillingLogService {

    public static final String LOGGER_NAME = "BILLING";

    private static final Logger billing = LoggerFactory.getLogger(LOGGER_NAME);

    private final ObjectMapper mapper;

    public BillingLogService(ObjectMapper objectMapper) {
        this.mapper = objectMapper.copy()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    public void record(BillingEvent event) {
        try {
            ObjectNode node = mapper.createObjectNode();
            node.put("at", event.at().toString());
            node.put("action", event.action());
            node.put("appId", event.appId());
            node.put("userNo", event.userNo());
            node.put("requestId", event.requestId());
            node.put("success", event.success());
            node.put("chinaumsCalled", event.chinaumsCalled());
            node.put("billable", event.billable());
            node.put("errCode", event.errCode());
            node.put("respCode", event.respCode());
            node.put("detailRespCode", event.detailRespCode());
            node.put("outcome", event.outcome());
            billing.info(mapper.writeValueAsString(node));
        } catch (Exception e) {
            billing.warn("billing-log-failed action={}", event == null ? "" : event.action());
        }
    }
}
