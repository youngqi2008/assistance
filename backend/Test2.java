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
        //body.put("userNo","08");
        body.put("requestId","00139cdb314f45b0a4843a3a5fbd1a18078f120260508093855666");
        body.put("token","SFTK01e6eafcba32bd0b3068a740d3887ba353ElementsAuthAssistFill");
        body.put("servidL4","8413");
        body.put("keyA","4306478964394772979737652709713506129612550934137234355137808813102775922136642119078530531914809769612146986747970899745620170250892495590374343947282621228773400118008201152816785371205759623962730737007475037025661809206888935854474153626721395411316844235481332786997942578666462112190484605141866316697832015027847161872011847857596468317953937659672490610271254691462113100328232160952384410189198292255603566868651046693449794126281859532473121077977881413104301954846216208041883317582335275607127560039352822660285554088566503841667998730167573424979262894632196833015489648869313308331766965310635685252662095002612470800123300467311796630665184286587193484064235651838730645013665997680832085799871061538620579285342855044343869849579960553759433183939852155007017210446581380645336573686993700164356806603151075780606322826872198280872073254939343559672855744239915529505607697016009492154926025541251875222845159,18545761070774676361747444971768570384629193759272590315498033182687922971445324811250309693434891043754685935017892366251185002550099995333683644134534017944425495105362408316780919020999218404616880096350241057693652128354602705881134363929858654287056224465325430858975844603004420389568732005642320942928625298818412538588914443027446189114594053108476346343949315327542657182609321126176953442626347985425490970917787437979887264480158260906874439606295135560683900439273096188688500806744833753839090524128028256214976285242892807446376169295166909796762226567526245640554450232533331611176065520748714041774623288108356328086811180071246318578589198844334062244765927957466530784151167949960333059791727435139471114079396874502225263903269075441081932517819795903135564802975680120142760486952312415261799190357863408581361019390955671375865812632421327724011872813865635921183951286661634622140375578510394909769389687490787968290675467821255230753266108823033263607563065977538195500575456490056849959429109732970126229076046144767662682785717979692150104478773884705270210626039887026461107090869432602641495606433131672874092007370422511953981604689716438968967991518691371312076696584129499619267183447263658904024921631624886441910562940882313968752519617622440562395283707969817052235545824618458361406713469318242001007953235296980657795762695451641041919064107735632437194972236936609068373867579052450385695525074404522532033316060107310210485332317218489269453158678957970385884140862123769896035835594871426290356067312502196322743387027834851977990509028001104295196661661585567646158087707774080959067047392073493763989902506554807097435953879008660978725761586015957242901722668968054975017459868038524190379617519097430810110057079777260275623270670675126575520696241758086626847435781916549977594827780972295336506214889735281,2839908386604164508399782799387390313897901506426445411912866799058706726432910722972737956952049309783098218516752361738460947516342338338799984425765179631176880666373041681018652480664385453243189772881340770998851818652500960666595197802041627767705453619759373661984942508319025876927413159688932687415339692919906100104969547844413788842858783687005024030297592177428372453982513025590148722361252125973478007032416013226108535568258811172064095701294129442142832912206387073018821610025111592996591294696302063504664661869665579703967013993546685890534250365632562829815160970602538451806612991147667077110437470294601188044764644558032402285703043301354413201670424449759027613437446020609487255479701399429509303994116495951726673004192141863976169595049111156889173286915303332604016411806567511172765570068038884871486038325995350190410771461129061210661792639687866813118736958921066692470396387558377022153211308,3072");

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
            System.out.println("返回码："+responseCode);
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
