import type { AgreementDoc } from '../../agreementTypes'

export const DONGFANGDADI_V2_THIRD_PARTY_SHARING_AGREEMENT: AgreementDoc = {
  title: "《第三方共享个人信息清单》",
  blocks: [
  {
    "kind": "h1",
    "text": "第三方对外提供个人信息清单"
  },
  {
    "kind": "table",
    "rows": [
      [
        {
          "kind": "text",
          "text": "合作方",
          "colSpan": 7
        }
      ],
      [
        "合作方名称",
        "共享目的",
        "共享场景",
        "个人信息",
        "提供方式",
        "隐私政策或官网",
        "联系方式"
      ],
      [
        "东方大地（武汉）保险经纪有限公司",
        "核验身份一致性、便利信息填写",
        "银行卡支付绑卡、需实名制验证或管理的金融场景",
        "身份证后四位、授权token、姓名、身份证号前十四位、手机号",
        "API接口",
        {
          "kind": "doc-link",
          "text": "《隐私政策》",
          "docKey": "dongfangdadi-v2-privacy-policy"
        },
        "doc@dfdadi.com"
      ],
      [
        "中移互联网有限公司",
        "核验身份一致性、便利信息填写",
        "银行卡支付绑卡、需实名制验证或管理的金融场景",
        "身份证后四位、授权token",
        "API接口",
        {
          "kind": "doc-link",
          "text": "《中国移动认证梧桐数盾隐私政策》",
          "docKey": "dongfangdadi-v2-cmcc-privacy-policy"
        },
        "10086"
      ]
    ]
  }
],
}
