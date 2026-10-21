export type AgreementDocKey =
  | 'entry'
  | 'sft'
  | 'cmcc'
  | 'sensitive-info-rules'
  | 'third-party-sharing-list'
  | 'personal-info-collection-list'
  | 'user-auth-privacy-policy'
  | 'haike-v2-third-party-sharing'
  | 'haike-v2-privacy-policy'
  | 'haike-v2-cmcc-privacy-policy'
  | 'tiantianyoubao-v2-third-party-sharing'
  | 'tiantianyoubao-v2-privacy-policy'
  | 'tiantianyoubao-v2-cmcc-privacy-policy'
  | 'dongfangdadi-v2-third-party-sharing'
  | 'dongfangdadi-v2-privacy-policy'
  | 'dongfangdadi-v2-cmcc-privacy-policy'
  | 'anxingtianxia-v2-third-party-sharing'
  | 'anxingtianxia-v2-privacy-policy'
  | 'anxingtianxia-v2-cmcc-privacy-policy'
  | 'hengda-v2-third-party-sharing'
  | 'hengda-v2-privacy-policy'
  | 'hengda-v2-cmcc-privacy-policy'

export type AgreementTableCell =
  | string
  | {
      kind: 'text'
      text: string
      colSpan: number
    }
  | {
      kind: 'doc-link'
      text: string
      docKey: AgreementDocKey
    }

export type AgreementBlock =
  | { kind: 'h1' | 'h2' | 'h3' | 'b' | 'p' | 'li'; text: string }
  | { kind: 'table'; rows: AgreementTableCell[][] }

export interface AgreementDoc {
  /** 页面展示用协议名（带书名号） */
  title: string
  blocks: AgreementBlock[]
}
