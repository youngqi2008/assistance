package com.open.demo.Test2;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.open.demo.util.ColorUtil;
import com.open.demo.util.SM2;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.digest.DigestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class Test2 {

    /**
     * 	1.发送请求验证或查询;
     * 	2.需要替换的参数:
     * 	    (1) appId   :
     * 	    (2) appKey  :
     * 	    (3) priKey  : 商户私钥，用于解密返回的报文;
     * 	    (4) url     : 请求的接口地址;
     * 	    (5) 测试参数  : main方法里的 map参数;
     * 	3. 直接运行 main方法;
     */

    /*********************************************** 需要替换的参数 start **********************************************/
    private static final String appId = "10037e6f9512b0b10195401ca57901d1";
    private static final String appKey = "0e609fbbdbde40e5aa467b235eb4c67e";
	// 商户私钥
    private static final String priKey = "33c196da0c7e369025c01796e5dd11528740a7abef0f025309b9b6770367131f";
    //private static final String url = "https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/bankcard/verify";   // eg: 银行卡验证接口
    private static final String url = "https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/check";   // eg: 银行卡验证接口

    /*********************************************** 需要替换的参数 over ***********************************************/

    // 平台公钥，用于请求数据加密（不需要替换，一般于资料提供的平台公钥一致）
    private static final String pubKey = "0414bb7e9c3914bb65b85079b1dc6e1ca2a0ee04dd9bb55b2f8d31704a6dec0cca695739e128f9c931330e1c0f493be4d56244236434c9d344c4716ba64a4470ba";//填写平台公钥

    public static void main(String[] args) {
        Map<String,String> body = new HashMap<String,String>();
        body.put("userNo","08");
        body.put("requestId","00139cdb314f45b0a4843a3a5fbd1a18078f120260508093855666");
        body.put("token","wdexssssdrd140123198109239750");
        body.put("servidL4","1234");
        body.put("keyA","12345685825822222222222222");

        Map<String,String> data = new HashMap<>();
        String encData=SM2.sm2Encrypt(JSON.toJSONString(body), pubKey);
        data.put("data",encData);
        System.out.println(ColorUtil.log("明文参数") + JSON.toJSONString(body));
        System.out.println(ColorUtil.log("加密结果") + encData);
        System.out.println(ColorUtil.log("上送报文") + JSON.toJSONString(data));
        try{
            String authorization =  getOpenBodySig(appId, appKey, JSON.toJSONString(data));
            String str = post(url,JSON.toJSONString(data), authorization);
            JSONObject rspMap = JSONObject.parseObject(str);
            System.out.println(ColorUtil.log("响应报文") + JSON.toJSONString(rspMap));
            String rawData = SM2.sm2Decrypt(rspMap.getString("data"), priKey);
            System.out.println(ColorUtil.log("响应报文data解密") + rawData);
        }catch(Exception e){
            System.out.println(e.getMessage());
        }
    }

    static String post(String requestUrl,String params, String authorization)throws Exception{
        HttpURLConnection connection = null;
        BufferedReader reader=null;
        try {
            //创建连接
            URL url = new URL(requestUrl);
            connection = (HttpURLConnection) url.openConnection();
            //设置http连接属性
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setRequestMethod("POST"); // 提交 POST请求
            connection.setUseCaches(false);
            connection.setInstanceFollowRedirects(true);
            //设置http头 消息
            connection.setRequestProperty("Content-Type","application/json;charset=UTF-8");  //设定 请求格式 application/json
            connection.setRequestProperty("Accept","application/json");//设定响应的信息的格式为application/json
            connection.setRequestProperty("Authorization", authorization);//替换成Test.java返回的token
            connection.connect();
            //添加 请求内容
            OutputStream out = connection.getOutputStream();
            out.write(params.toString().getBytes("utf-8"));
            out.flush();
            out.close();
            // 读取响应
            int responseCode=connection.getResponseCode();
            if(responseCode!=200){
                System.out.println("返回错误");
            }
            reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String lines;
            StringBuffer sb = new StringBuffer("");
            while ((lines = reader.readLine()) != null) {
                lines = new String(lines.getBytes(), "utf-8");
                sb.append(lines);
            }
            reader.close();
            connection.disconnect();
            return sb.toString();
        } catch (Exception e) {
            throw e;
        }finally{
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (connection != null) {
                connection.disconnect();
            }
        }
    }



    public static String getOpenBodySig(String appId, String appKey, String body) throws Exception {
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String nonce = UUID.randomUUID().toString().replace("-", "");
        byte[] data = body.getBytes("UTF-8");
        InputStream is = new ByteArrayInputStream(data);
        String bodyDigest = testSHA256(is);
        String str1_C = appId + timestamp + nonce + bodyDigest;
        byte[] localSignature = hmacSHA256(str1_C.getBytes(), appKey.getBytes());
        String localSignatureStr = Base64.encodeBase64String(localSignature);
        return ("OPEN-BODY-SIG AppId=" + "\"" + appId + "\"" + ", Timestamp=" + "\"" + timestamp + "\"" + ", Nonce=" + "\"" + nonce + "\"" + ", Signature=" + "\"" + localSignatureStr + "\"");
    }

    private static String testSHA256(InputStream is) {
        try {
            return DigestUtils.sha256Hex(is);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static byte[] hmacSHA256(byte[] data, byte[] key) throws NoSuchAlgorithmException, InvalidKeyException {
        String algorithm = "HmacSHA256";
        Mac mac = Mac.getInstance(algorithm);
        mac.init(new SecretKeySpec(key, algorithm));
        return mac.doFinal(data);
    }
}
