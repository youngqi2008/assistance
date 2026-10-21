package com.open.demo.Test1;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.open.demo.util.ColorUtil;
import com.open.demo.util.SM2;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

public class Test1 {

    /**
     * 	1.发送请求验证或查询;
     * 	2.需要替换的参数:
     * 	    (1) token   : getToken.java获取;
     * 	    (2) priKey  : 商户私钥，用于解密返回的报文;
     * 	    (3) url     : 请求的接口地址;
     * 	    (4) 测试参数 ：main方法里的 map参数;
     * 	3. 直接运行 main方法;
     */

    /*********************************************** 需要替换的参数 start **********************************************/
	// token
    private static final String token = "";
	// 商户私钥
    private static final String priKey = "";
    // 替换成自己的appId
    private static final String appId = "";
    private static final String url = "https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/bankcard/verify"; // eg:银行卡验证接口
    /*********************************************** 需要替换的参数 over ***********************************************/

    // 平台公钥，用于请求数据加密（不需要替换，一般于资料提供的平台公钥一致）
    private static final String pubKey = "0414bb7e9c3914bb65b85079b1dc6e1ca2a0ee04dd9bb55b2f8d31704a6dec0cca695739e128f9c931330e1c0f493be4d56244236434c9d344c4716ba64a4470ba";//填写平台公钥

    public static void main(String[] args) {
        Map<String,String> body = new HashMap<String,String>();
        // eg: 银行卡实名验证接口
        body.put("cardNo","6228480246125491166");
        body.put("certType","01");
        body.put("certNo","140123198109239750");
        body.put("name","曹朵一");
        body.put("phoneNo","13811784067");
        body.put("personalMandate", "1");
        body.put("sceneId","1");
		body.put("appName",     "01测试");	// 一般为数字+公司名称 如：01小米科技
        body.put("ipType",      "04");		
        body.put("sourceIp",    "127.000.000.001");	//不足三位前置补0，如127.0.0.1 -> 127.000.000.001
        body.put("protocolVersion", "11");	// value长度2-64
        body.put("protocolNo", "11");		// value长度2-64
		body.put("sceneId", "1");			// 取值范围1-25
        String encData=SM2.sm2Encrypt(JSON.toJSONString(body), pubKey);
        Map<String,String> data = new HashMap<>();
        data.put("data",encData);
        System.out.println(ColorUtil.log("明文参数") + JSON.toJSONString(body));
        System.out.println(ColorUtil.log("加密结果") + encData);
        System.out.println(ColorUtil.log("上送报文") + JSON.toJSONString(data));
        try{
            String str = post(url,JSON.toJSONString(data));
            JSONObject rspMap = JSONObject.parseObject(str);
            System.out.println(ColorUtil.log("响应报文") + JSON.toJSONString(rspMap));
            String rawData = SM2.sm2Decrypt(rspMap.getString("data"), priKey);
            System.out.println(ColorUtil.log("响应报文data解密") + rawData);
        }catch(Exception e){
            System.out.println(e.getMessage());
        }
    }

    // 发送请求
    static String post(String requestUrl,String params)throws Exception{
        HttpURLConnection connection=null;
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
            connection.setRequestProperty("Content-Type","application/json;charset=UTF-8");             //设定 请求格式 application/json
            connection.setRequestProperty("Accept","application/json");                                 //设定响应的信息的格式为application/json
            connection.setRequestProperty("Authorization","OPEN-ACCESS-TOKEN AccessToken=" + token + ", AppId=" + appId);    //替换成获取到的AccessToken
            connection.connect();
            //添加 请求内容
            OutputStream out = connection.getOutputStream();
            out.write(params.getBytes("utf-8"));
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
}
