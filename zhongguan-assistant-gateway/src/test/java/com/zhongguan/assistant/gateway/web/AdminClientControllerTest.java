package com.zhongguan.assistant.gateway.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhongguan.assistant.gateway.chinaums.ChinaumsAssistantClient;
import com.zhongguan.assistant.gateway.crypto.OpenBodySig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "zhongguan.admin-token=test-admin",
        "zhongguan.clients-file=target/test-clients.json"
})
class AdminClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChinaumsAssistantClient chinaumsAssistantClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void createListAndDisableClient() throws Exception {
        Files.deleteIfExists(Path.of("target/test-clients.json"));
        String name = "客户" + System.nanoTime();
        MvcResult created = mockMvc.perform(post("/admin/clients")
                        .header("X-Admin-Token", "test-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\",\"userNo\":\"08\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appId").isNotEmpty())
                .andExpect(jsonPath("$.appKey").isNotEmpty())
                .andReturn();
        JsonNode body = objectMapper.readTree(created.getResponse().getContentAsString());
        String appId = body.get("appId").asText();
        assertThat(appId).startsWith("zg-");

        mockMvc.perform(get("/admin/clients").header("X-Admin-Token", "test-admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.appId=='" + appId + "')].name").value(name))
                .andExpect(jsonPath("$[?(@.appId=='" + appId + "')].appKey").doesNotExist());

        mockMvc.perform(delete("/admin/clients/" + appId).header("X-Admin-Token", "test-admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));

        String checkBody = "{\"token\":\"T1\",\"idLast4\":\"1234\",\"keyA\":\"KA\"}";
        mockMvc.perform(post("/v1/assistant/info/check")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", OpenBodySig.sign(
                                OpenBodySig.ZHONGUAN_SCHEME,
                                appId,
                                body.get("appKey").asText(),
                                checkBody
                        ))
                        .content(checkBody))
                .andExpect(status().isUnauthorized());
    }
}
