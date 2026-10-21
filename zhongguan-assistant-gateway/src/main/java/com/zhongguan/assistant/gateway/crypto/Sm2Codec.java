package com.zhongguan.assistant.gateway.crypto;

import com.zhongguan.assistant.gateway.crypto.demo.SM2;

public final class Sm2Codec {

    private Sm2Codec() {
    }

    public static String encryptToBase64(String plainText, String platformPublicKey) {
        return SM2.sm2Encrypt(plainText, platformPublicKey);
    }

    public static String decryptFromBase64(String cipherText, String privateKey) {
        return SM2.sm2Decrypt(cipherText, privateKey);
    }
}
