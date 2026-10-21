package com.open.demo.Test1;

import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.open.demo.util.ColorUtil;
import com.open.demo.util.GetRandomNum;
import org.apache.http.ParseException;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import java.io.IOException;
import java.lang.reflect.Type;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class getToken {

	/**
	 * 	1.token方式发送请求,需要先获取token,需要替换的参数：
	 * 		(1) appId
	 * 	  	(2)	appKey
	 * 	2.运行 main方法返回token值,并复制token到 Test1使用;
	 */

	/*********************************************** 需要替换的参数 start **********************************************/
	// 替换成自己的appId
	private static final String appId = "";
	//替换成自己的appKey
	private static final String appKey = "";
	/*********************************************** 需要替换的参数 over ***********************************************/


	private static final String url = "https://test-api-open.chinaums.com/v2/token/access";				// 获取token的url
	private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");			// 时间格式
	private static final String timestamp = sdf.format(new Date());										// 当前时间
	private static final String nonce = GetRandomNum.createData(3);								// 随机数
	private static final String signature = SHA1(appId + timestamp + nonce + appKey);			// 签名方式

	public static void main(String[] args) {
		Map<String, String> params = new HashMap<String, String>();
		params.put("appId", appId);
		params.put("timestamp", timestamp);
		params.put("nonce", nonce);
		params.put("signature", signature);
		getAccessToken(params);
	}

	private static void getAccessToken(Map<String, String> params){
		Gson gson = new Gson();
		String gsonString = gson.toJson(params);
		Map<String, String> mapResponse = null;
		@SuppressWarnings("serial")
		Type mapGson = new TypeToken<Map<String, String>>() {}.getType();
		String result = post(url, gsonString);
		if ("Error".equals(result)) {
			System.err.println("Error");
		}
		mapResponse = gson.fromJson(result, mapGson);
		String accessToken = mapResponse.get("accessToken");
		System.out.println(ColorUtil.log("返回的token") + accessToken);
	}

	// 发送请求
	private static String post(String url,String gsonString) {
		System.out.println(ColorUtil.log("请求参数") + gsonString);
		CloseableHttpClient httpclient = HttpClients.custom().build();
		HttpPost httppost = new HttpPost(url);
		httppost.addHeader("Authorization", "03bdb149b9bb4832a4a475e166a5bcaa"); //认证token
		httppost.addHeader("Content-Type","application/json;charset=UTF-8");
		httppost.addHeader("Accept","application/json");
		httppost.addHeader("Charset","UTF-8");
		StringEntity se = new StringEntity(gsonString, "UTF-8");
		se.setContentType("application/json");
		se.setContentEncoding( "UTF-8");
		httppost.setEntity(se);
		CloseableHttpResponse response = null;
		String respStr=null;
		try {
			response = httpclient.execute(httppost);
		} catch (ClientProtocolException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		int code = response.getStatusLine().getStatusCode();
		if (code == 200) {
			try {
				respStr = EntityUtils.toString(response.getEntity(),"utf-8");
			} catch (ParseException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			return respStr;
		}else{
			return "Error";
		}
	}

	private static String SHA1(String decript) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-1");
			digest.update(decript.getBytes());
			byte messageDigest[] = digest.digest();
			StringBuffer hexString = new StringBuffer();
			for (int i = 0; i < messageDigest.length; i++) {
				String shaHex = Integer.toHexString(messageDigest[i] & 0xFF);
				if (shaHex.length() < 2) {
					hexString.append(0);
				}
				hexString.append(shaHex);
			}
			return hexString.toString();

		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
			return "ERROR";
		}
	}
}
