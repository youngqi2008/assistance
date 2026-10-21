1.替换Test中的appId和appKey，运行可获取token；
2.将获取到的token填入替换openflat1demo中的connection.setRequestProperty("Authorization","OPEN-ACCESS-TOKEN AccessToken="+"XXXX")；
3.替换openflat1demo中的pubKeyStr（平台公钥，用于请求报文加密），priKeyStr（商户SM2公钥，用于返回报文解密），运行可测试平台交易；
4.单独运行SM2可测试SM2公私钥。