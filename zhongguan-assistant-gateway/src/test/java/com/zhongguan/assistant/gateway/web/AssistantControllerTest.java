package com.zhongguan.assistant.gateway.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.zhongguan.assistant.gateway.chinaums.ChinaumsAssistantClient;
import com.zhongguan.assistant.gateway.chinaums.ChinaumsCallResult;
import com.zhongguan.assistant.gateway.crypto.OpenBodySig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AssistantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChinaumsAssistantClient chinaumsAssistantClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void checkSuccessThenQuery() throws Exception {
        when(chinaumsAssistantClient.check(anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(okResult());
        when(chinaumsAssistantClient.query(anyString(), anyString(), anyString()))
                .thenReturn(okQueryResult());

        String checkBody = """
                {"token":"T1","idLast4":"1234","keyA":"KA"}
                """;
        mockMvc.perform(post("/v1/assistant/info/check")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", sign(checkBody))
                        .content(checkBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        String queryBody = """
                {"token":"T1"}
                """;
        mockMvc.perform(post("/v1/assistant/info/query")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", sign(queryBody))
                        .content(queryBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.encryptedMobile").value("13800000000"));
    }

    @Test
    void queryWithoutCheckIsRejected() throws Exception {
        String queryBody = """
                {"token":"never-checked"}
                """;
        mockMvc.perform(post("/v1/assistant/info/query")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", sign(queryBody))
                        .content(queryBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errCode").value("ZG40001"));
    }

    @Test
    void missingSignatureIsUnauthorized() throws Exception {
        mockMvc.perform(post("/v1/assistant/info/check")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"T1\",\"idLast4\":\"1234\",\"keyA\":\"KA\"}"))
                .andExpect(status().isUnauthorized());
    }

    private static String sign(String body) {
        return OpenBodySig.sign(OpenBodySig.ZHONGUAN_SCHEME, "zg-demo", "demo-secret", body);
    }

    private ChinaumsCallResult okResult() {
        return new ChinaumsCallResult(
                200,
                "20000000",
                "ok",
                "00",
                "pass",
                "0000",
                "pass",
                JsonNodeFactory.instance.objectNode()
        );
    }

    private ChinaumsCallResult okQueryResult() {
        var data = objectMapper.createObjectNode();
        data.put("respCode", "00");
        data.put("detailRespCode", "0000");
        data.put("name", "张三");
        data.put("mobile", "13800000000");
        data.put("idCard", "110101199001011234");
        return new ChinaumsCallResult(200, "20000000", "ok", "00", "ok", "0000", "ok", data);
    }
}
