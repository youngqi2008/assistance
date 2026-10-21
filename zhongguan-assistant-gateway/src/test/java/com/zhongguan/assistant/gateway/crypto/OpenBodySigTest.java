package com.zhongguan.assistant.gateway.crypto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OpenBodySigTest {

    @Test
    void signAndVerifyRoundTrip() {
        String body = "{\"token\":\"abc\",\"idLast4\":\"1234\",\"keyA\":\"k\"}";
        String header = OpenBodySig.sign(OpenBodySig.ZHONGUAN_SCHEME, "zg-demo", "demo-secret", body);
        OpenBodySig.ParsedHeader parsed = OpenBodySig.parse(header);
        assertThat(parsed).isNotNull();
        assertThat(parsed.scheme()).isEqualTo("ZG-BODY-SIG");
        assertThat(parsed.appId()).isEqualTo("zg-demo");
        assertThat(OpenBodySig.matches(parsed, "demo-secret", body)).isTrue();
        assertThat(OpenBodySig.matches(parsed, "wrong", body)).isFalse();
        assertThat(OpenBodySig.matches(parsed, "demo-secret", body + "x")).isFalse();
    }

    @Test
    void chinaumsSchemeUsesSameAlgorithm() {
        String body = "{\"data\":\"cipher\"}";
        String header = OpenBodySig.sign(
                OpenBodySig.CHINAUMS_SCHEME,
                "app",
                "key",
                body,
                "20261016120000",
                "abc"
        );
        assertThat(header).startsWith("OPEN-BODY-SIG ");
        assertThat(OpenBodySig.parse(header).timestamp()).isEqualTo("20261016120000");
    }
}
