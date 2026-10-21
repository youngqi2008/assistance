import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  ANXINGTIANXIA_V2_CMCC_PRIVACY_POLICY_AGREEMENT,
  ANXINGTIANXIA_V2_PRIVACY_POLICY_AGREEMENT,
  ANXINGTIANXIA_V2_THIRD_PARTY_SHARING_AGREEMENT,
  CMCC_PRIVACY_AGREEMENT,
  DONGFANGDADI_V2_CMCC_PRIVACY_POLICY_AGREEMENT,
  DONGFANGDADI_V2_PRIVACY_POLICY_AGREEMENT,
  DONGFANGDADI_V2_THIRD_PARTY_SHARING_AGREEMENT,
  HAIKE_V2_CMCC_PRIVACY_POLICY_AGREEMENT,
  HAIKE_V2_PRIVACY_POLICY_AGREEMENT,
  HAIKE_V2_THIRD_PARTY_SHARING_AGREEMENT,
  HENGDA_V2_CMCC_PRIVACY_POLICY_AGREEMENT,
  HENGDA_V2_PRIVACY_POLICY_AGREEMENT,
  HENGDA_V2_THIRD_PARTY_SHARING_AGREEMENT,
  PERSONAL_INFO_COLLECTION_LIST_AGREEMENT,
  SENSITIVE_INFO_RULES_AGREEMENT,
  SFT_USER_AUTH_AGREEMENT,
  THIRD_PARTY_SHARING_LIST_AGREEMENT,
  TIANTIANYOUBAO_V2_CMCC_PRIVACY_POLICY_AGREEMENT,
  TIANTIANYOUBAO_V2_PRIVACY_POLICY_AGREEMENT,
  TIANTIANYOUBAO_V2_THIRD_PARTY_SHARING_AGREEMENT,
  USER_AUTH_PRIVACY_POLICY_AGREEMENT,
  type AgreementDoc,
  getAgreementDocByKey,
  isAgreementDocKey,
} from './agreementContent'

const VALID_KINDS = new Set(['h1', 'h2', 'h3', 'b', 'p', 'li', 'table'])

describe('agreement content', () => {
  const docs: [string, AgreementDoc][] = [
    ['SFT_USER_AUTH_AGREEMENT', SFT_USER_AUTH_AGREEMENT],
    ['CMCC_PRIVACY_AGREEMENT', CMCC_PRIVACY_AGREEMENT],
    ['SENSITIVE_INFO_RULES_AGREEMENT', SENSITIVE_INFO_RULES_AGREEMENT],
    ['THIRD_PARTY_SHARING_LIST_AGREEMENT', THIRD_PARTY_SHARING_LIST_AGREEMENT],
    ['PERSONAL_INFO_COLLECTION_LIST_AGREEMENT', PERSONAL_INFO_COLLECTION_LIST_AGREEMENT],
    ['USER_AUTH_PRIVACY_POLICY_AGREEMENT', USER_AUTH_PRIVACY_POLICY_AGREEMENT],
    ['HAIKE_V2_THIRD_PARTY_SHARING_AGREEMENT', HAIKE_V2_THIRD_PARTY_SHARING_AGREEMENT],
    ['HAIKE_V2_PRIVACY_POLICY_AGREEMENT', HAIKE_V2_PRIVACY_POLICY_AGREEMENT],
    ['HAIKE_V2_CMCC_PRIVACY_POLICY_AGREEMENT', HAIKE_V2_CMCC_PRIVACY_POLICY_AGREEMENT],
    [
      'TIANTIANYOUBAO_V2_THIRD_PARTY_SHARING_AGREEMENT',
      TIANTIANYOUBAO_V2_THIRD_PARTY_SHARING_AGREEMENT,
    ],
    [
      'TIANTIANYOUBAO_V2_PRIVACY_POLICY_AGREEMENT',
      TIANTIANYOUBAO_V2_PRIVACY_POLICY_AGREEMENT,
    ],
    [
      'TIANTIANYOUBAO_V2_CMCC_PRIVACY_POLICY_AGREEMENT',
      TIANTIANYOUBAO_V2_CMCC_PRIVACY_POLICY_AGREEMENT,
    ],
    [
      'DONGFANGDADI_V2_THIRD_PARTY_SHARING_AGREEMENT',
      DONGFANGDADI_V2_THIRD_PARTY_SHARING_AGREEMENT,
    ],
    [
      'DONGFANGDADI_V2_PRIVACY_POLICY_AGREEMENT',
      DONGFANGDADI_V2_PRIVACY_POLICY_AGREEMENT,
    ],
    [
      'DONGFANGDADI_V2_CMCC_PRIVACY_POLICY_AGREEMENT',
      DONGFANGDADI_V2_CMCC_PRIVACY_POLICY_AGREEMENT,
    ],
    [
      'ANXINGTIANXIA_V2_THIRD_PARTY_SHARING_AGREEMENT',
      ANXINGTIANXIA_V2_THIRD_PARTY_SHARING_AGREEMENT,
    ],
    [
      'ANXINGTIANXIA_V2_PRIVACY_POLICY_AGREEMENT',
      ANXINGTIANXIA_V2_PRIVACY_POLICY_AGREEMENT,
    ],
    [
      'ANXINGTIANXIA_V2_CMCC_PRIVACY_POLICY_AGREEMENT',
      ANXINGTIANXIA_V2_CMCC_PRIVACY_POLICY_AGREEMENT,
    ],
    ['HENGDA_V2_THIRD_PARTY_SHARING_AGREEMENT', HENGDA_V2_THIRD_PARTY_SHARING_AGREEMENT],
    ['HENGDA_V2_PRIVACY_POLICY_AGREEMENT', HENGDA_V2_PRIVACY_POLICY_AGREEMENT],
    ['HENGDA_V2_CMCC_PRIVACY_POLICY_AGREEMENT', HENGDA_V2_CMCC_PRIVACY_POLICY_AGREEMENT],
  ]

  it.each(docs)('%s has a 书名号 title and non-empty blocks', (_name, doc) => {
    expect(doc.title.startsWith('《')).toBe(true)
    expect(doc.title.endsWith('》')).toBe(true)
    expect(doc.blocks.length).toBeGreaterThan(0)
  })

  it.each(docs)('%s first block is the h1 title', (_name, doc) => {
    expect(doc.blocks[0]?.kind).toBe('h1')
  })

  it.each(docs)('%s blocks only use known kinds and carry content', (_name, doc) => {
    for (const block of doc.blocks) {
      expect(VALID_KINDS.has(block.kind)).toBe(true)
      if (block.kind === 'table') {
        expect(Array.isArray(block.rows)).toBe(true)
        expect(block.rows.length).toBeGreaterThan(0)
        for (const row of block.rows) {
          expect(row.length).toBeGreaterThan(0)
          for (const cell of row) {
            if (typeof cell === 'string') {
              continue
            }
            if (cell.kind === 'text') {
              expect(cell.text.trim().length).toBeGreaterThan(0)
              expect(cell.colSpan).toBeGreaterThan(1)
              continue
            }
            expect(cell).toEqual({
              kind: 'doc-link',
              text: expect.stringMatching(/^《.+》$/),
              docKey: expect.any(String),
            })
          }
        }
      } else {
        expect(block.text.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('binds the exact customer-facing names', () => {
    expect(SFT_USER_AUTH_AGREEMENT.title).toBe('《收付通用户信息认证授权协议》')
    expect(CMCC_PRIVACY_AGREEMENT.title).toBe('《中国移动认证梧桐数盾隐私政策》')
    expect(SENSITIVE_INFO_RULES_AGREEMENT.title).toBe('《敏感个人信息处理规则》')
    expect(THIRD_PARTY_SHARING_LIST_AGREEMENT.title).toBe('《第三方共享个人信息清单》')
    expect(PERSONAL_INFO_COLLECTION_LIST_AGREEMENT.title).toBe('《个人信息收集清单》')
    expect(USER_AUTH_PRIVACY_POLICY_AGREEMENT.title).toBe('《用户认证服务隐私政策》')
  })

  it('keeps distinctive content from the four source documents', () => {
    expect(SENSITIVE_INFO_RULES_AGREEMENT.blocks.some((block) => block.kind === 'table')).toBe(true)
    expect(THIRD_PARTY_SHARING_LIST_AGREEMENT.blocks.some((block) => block.kind === 'table')).toBe(true)
    expect(PERSONAL_INFO_COLLECTION_LIST_AGREEMENT.blocks.some((block) => block.kind !== 'table' && block.text.includes('收集目的'))).toBe(true)
    expect(USER_AUTH_PRIVACY_POLICY_AGREEMENT.blocks.some((block) => block.kind !== 'table' && block.text.includes('发布日期'))).toBe(true)
    expect(USER_AUTH_PRIVACY_POLICY_AGREEMENT.blocks.some((block) => block.kind !== 'table' && block.text === '发布日期：【2026】年【7】月【3】日')).toBe(true)
    expect(USER_AUTH_PRIVACY_POLICY_AGREEMENT.blocks.some((block) => block.kind !== 'table' && block.text === '生效日期：【2026】年【7】月【3】日')).toBe(true)
    expect(USER_AUTH_PRIVACY_POLICY_AGREEMENT.blocks.some((block) => block.kind !== 'table' && block.text === '版本号：V1.0_2026')).toBe(true)
    expect(THIRD_PARTY_SHARING_LIST_AGREEMENT.blocks.some((block) => block.kind !== 'table' && block.text === '第三方对外提供个人信息清单')).toBe(true)
    expect(THIRD_PARTY_SHARING_LIST_AGREEMENT.blocks).toEqual([
      { kind: 'h1', text: '第三方对外提供个人信息清单' },
      { kind: 'table', rows: [
        ['合作方名称', '共享目的', '共享场景', '个人信息', '提供方式'],
        ['您具体使用的保险场景的合作商户', '核验身份一致性、便利信息填写', '银行卡支付绑卡、需实名制验证或管理的金融场景', '身份证后四位、授权token、姓名、身份证号前十四位、手机号', 'API接口'],
        ['中移互联网有限公司', '核验身份一致性、便利信息填写', '银行卡支付绑卡、需实名制验证或管理的金融场景', '身份证后四位、授权token', 'API接口'],
      ] },
    ])
    expect(USER_AUTH_PRIVACY_POLICY_AGREEMENT.blocks.some((block) => block.kind !== 'table' && block.text === '在法律要求或允许的范围内，为了保护用户或社会公众的利益、财产或安全免遭损害而有必要向第三方提供您的个人信息；')).toBe(true)
  })

  it('generates refreshed agreements from the latest supplied docx files', () => {
    const script = readFileSync(resolve(process.cwd(), 'scripts/extract-agreement-docx.py'), 'utf8')

    expect(script).toContain('docs/1-协议原文/附件一 用户认证服务隐私政策 发布版V1.0_206.docx')
    expect(script).toContain('docs/1-协议原文/附件三 第三方共享个人信息清单 V2-通用(1).docx')
  })

  it('reproduces every generic V2 table cell from its archived DOCX without attachment links', () => {
    const extracted = execFileSync('python3', ['-c',
      'import json,runpy,sys; m=runpy.run_path(sys.argv[1]); s=next(s for s in m["SOURCE_DOCS"] if s.export_name=="THIRD_PARTY_SHARING_LIST_AGREEMENT"); print(json.dumps(m["parse_docx"](s.path),ensure_ascii=False))',
      resolve(process.cwd(), 'scripts/extract-agreement-docx.py'),
    ], { encoding: 'utf8' })
    expect(JSON.parse(extracted)).toEqual(THIRD_PARTY_SHARING_LIST_AGREEMENT.blocks)
    expect(extracted).not.toContain('doc-link')
    expect(extracted).not.toContain('http')
  })

  it('keeps the audited Haike source and reproducibly extracts all three profile documents', () => {
    const source = resolve(
      process.cwd(),
      'docs/1-协议原文/app-profiles/haike-v2/附件三 第三方共享个人信息清单 V2-海客.docx',
    )
    const digest = createHash('sha256').update(readFileSync(source)).digest('hex')
    expect(digest).toBe('23af3c05efcf62ce570bc0fa3a9123813731edc5ebb55dd9422cb6da47818f84')

    const outputDir = mkdtempSync(resolve(tmpdir(), 'haike-v2-agreements-'))
    try {
      const stdout = execFileSync('python3', [
        resolve(process.cwd(), 'scripts/extract-agreement-docx.py'),
        '--profile',
        'haike-v2',
        '--source',
        source,
        '--output-dir',
        outputDir,
      ], { encoding: 'utf8' })

      expect(stdout).toContain(
        'Document1.docx  7035d9cfe38758731d5a1b0c02328b9bbb39d924f5eace0dcb5bae9e8c5a5185',
      )
      expect(stdout).toContain(
        'oleObject1.bin  4a6166efab527d28a4704e0ec0df305406d3de1ba0685de73dba85039be1e4f0',
      )
      for (const file of [
        'thirdPartySharing.ts',
        'haikePrivacyPolicy.ts',
        'cmccPrivacyPolicy.ts',
        'index.ts',
      ]) {
        expect(readFileSync(resolve(outputDir, file), 'utf8').trim().length).toBeGreaterThan(0)
      }
    } finally {
      rmSync(outputDir, { recursive: true, force: true })
    }
  })

  it('keeps the audited Tiantianyoubao source and reproducibly extracts all three profile documents', () => {
    const source = resolve(
      process.cwd(),
      'docs/1-协议原文/app-profiles/tiantianyoubao-v2/附件三 第三方共享个人信息清单 V2-天天有保.docx',
    )
    const digest = createHash('sha256').update(readFileSync(source)).digest('hex')
    expect(digest).toBe('ba2059cc100d11eae776c29b0baaa181053bf1351bb0e461a4a02178bfc61e54')

    const outputDir = mkdtempSync(resolve(tmpdir(), 'tiantianyoubao-v2-agreements-'))
    try {
      const stdout = execFileSync('python3', [
        resolve(process.cwd(), 'scripts/extract-agreement-docx.py'),
        '--profile',
        'tiantianyoubao-v2',
        '--source',
        source,
        '--output-dir',
        outputDir,
      ], { encoding: 'utf8' })

      expect(stdout).toContain(
        'Document1.docx  7035d9cfe38758731d5a1b0c02328b9bbb39d924f5eace0dcb5bae9e8c5a5185',
      )
      expect(stdout).toContain(
        'oleObject1.bin  d8439d55d18cff6ba89f40924dee45651ca280c53ac5f3b4fc478583caa31fd7',
      )
      for (const file of [
        'thirdPartySharing.ts',
        'tiantianyoubaoPrivacyPolicy.ts',
        'cmccPrivacyPolicy.ts',
        'index.ts',
      ]) {
        expect(readFileSync(resolve(outputDir, file), 'utf8')).toBe(
          readFileSync(
            resolve(process.cwd(), 'src/agreements/profiles/tiantianyoubaoV2', file),
            'utf8',
          ),
        )
      }
    } finally {
      rmSync(outputDir, { recursive: true, force: true })
    }
  })

  it('keeps the audited Dongfangdadi source and reproducibly extracts all three profile documents', () => {
    const source = resolve(
      process.cwd(),
      'docs/1-协议原文/app-profiles/dongfangdadi-v2/附件三 第三方共享个人信息清单 V2-东方大地.docx',
    )

    const outputDir = mkdtempSync(resolve(tmpdir(), 'dongfangdadi-v2-agreements-'))
    try {
      const stdout = execFileSync('python3', [
        resolve(process.cwd(), 'scripts/extract-agreement-docx.py'),
        '--profile',
        'dongfangdadi-v2',
        '--source',
        source,
        '--output-dir',
        outputDir,
      ], { encoding: 'utf8' })

      expect(stdout).toContain(
        'Microsoft_Word_Document.docx  e04cd43bb8a833898ae35ca133c415aa1d36a0c0f9db548d04f978a3ea3016e9',
      )
      expect(stdout).toContain(
        'Microsoft_Word_Document1.docx  7035d9cfe38758731d5a1b0c02328b9bbb39d924f5eace0dcb5bae9e8c5a5185',
      )
      for (const file of [
        'thirdPartySharing.ts',
        'dongfangdadiPrivacyPolicy.ts',
        'cmccPrivacyPolicy.ts',
        'index.ts',
      ]) {
        expect(readFileSync(resolve(outputDir, file), 'utf8')).toBe(
          readFileSync(
            resolve(process.cwd(), 'src/agreements/profiles/dongfangdadiV2', file),
            'utf8',
          ),
        )
      }
    } finally {
      rmSync(outputDir, { recursive: true, force: true })
    }
  })

  it('keeps the audited Anxingtianxia source and reproducibly extracts all three profile documents', () => {
    const source = resolve(
      process.cwd(),
      'docs/1-协议原文/app-profiles/anxingtianxia-v2/附件三 第三方共享个人信息清单 V2-安行天下.docx',
    )
    const digest = createHash('sha256').update(readFileSync(source)).digest('hex')
    expect(digest).toBe('4ae4d62f8abbb2f22f379a0d8e32a1354ba9acdd88bd7e7dfb308717de03d030')

    const outputDir = mkdtempSync(resolve(tmpdir(), 'anxingtianxia-v2-agreements-'))
    try {
      const stdout = execFileSync('python3', [
        resolve(process.cwd(), 'scripts/extract-agreement-docx.py'),
        '--profile',
        'anxingtianxia-v2',
        '--source',
        source,
        '--output-dir',
        outputDir,
      ], { encoding: 'utf8' })

      expect(stdout).toContain(
        'Microsoft_Word_Document.docx  b8bd31afa8c17c132396649386a0264d5a4216f7c233bc0120da6131f3af1613',
      )
      expect(stdout).toContain(
        'Microsoft_Word_Document1.docx  7035d9cfe38758731d5a1b0c02328b9bbb39d924f5eace0dcb5bae9e8c5a5185',
      )
      for (const file of [
        'thirdPartySharing.ts',
        'anxingtianxiaPrivacyPolicy.ts',
        'cmccPrivacyPolicy.ts',
        'index.ts',
      ]) {
        expect(readFileSync(resolve(outputDir, file), 'utf8')).toBe(
          readFileSync(
            resolve(process.cwd(), 'src/agreements/profiles/anxingtianxiaV2', file),
            'utf8',
          ),
        )
      }
    } finally {
      rmSync(outputDir, { recursive: true, force: true })
    }
  })

  it('keeps the audited Hengda source and reproducibly extracts all three profile documents', () => {
    const source = resolve(
      process.cwd(),
      'docs/1-协议原文/app-profiles/hengda-v2/附件三 第三方共享个人信息清单 V2-恒大.docx',
    )
    const digest = createHash('sha256').update(readFileSync(source)).digest('hex')
    expect(digest).toBe('39160ba29fe2a287724a303cba844337180e7f4befd17f2638c960196e6f69fa')

    const outputDir = mkdtempSync(resolve(tmpdir(), 'hengda-v2-agreements-'))
    try {
      const stdout = execFileSync('python3', [
        resolve(process.cwd(), 'scripts/extract-agreement-docx.py'),
        '--profile',
        'hengda-v2',
        '--source',
        source,
        '--output-dir',
        outputDir,
      ], { encoding: 'utf8' })

      expect(stdout).toContain(
        'Microsoft_Word_Document.docx  ce9ef9fd1a4a5e9472a353ef4d2638e32b40927aebf8375f919e9842d7c8a7c5',
      )
      expect(stdout).toContain(
        'Microsoft_Word_Document1.docx  7035d9cfe38758731d5a1b0c02328b9bbb39d924f5eace0dcb5bae9e8c5a5185',
      )
      for (const file of [
        'thirdPartySharing.ts',
        'hengdaPrivacyPolicy.ts',
        'cmccPrivacyPolicy.ts',
        'index.ts',
      ]) {
        expect(readFileSync(resolve(outputDir, file), 'utf8')).toBe(
          readFileSync(resolve(process.cwd(), 'src/agreements/profiles/hengdaV2', file), 'utf8'),
        )
      }
    } finally {
      rmSync(outputDir, { recursive: true, force: true })
    }
  })

  it('preserves the locked Haike table rows and internal privacy-policy links', () => {
    const table = HAIKE_V2_THIRD_PARTY_SHARING_AGREEMENT.blocks.find(
      (block) => block.kind === 'table',
    )
    expect(table?.kind).toBe('table')
    if (table?.kind !== 'table') {
      throw new Error('Expected the Haike third-party sharing table')
    }

    expect(table.rows[0]).toEqual([{
      kind: 'text',
      text: '合作方',
      colSpan: 7,
    }])
    expect(table.rows).toContainEqual([
      '海客（天津）保险经纪有限公司',
      '核验身份一致性、便利信息填写',
      '银行卡支付绑卡、需实名制验证或管理的金融场景',
      '身份证后四位、授权token、姓名、身份证号前十四位、手机号',
      'API接口',
      {
        kind: 'doc-link',
        text: '《蓝鲸保隐私政策》',
        docKey: 'haike-v2-privacy-policy',
      },
      '4000-161-100',
    ])
    expect(table.rows).toContainEqual([
      '中移互联网有限公司',
      '核验身份一致性、便利信息填写',
      '银行卡支付绑卡、需实名制验证或管理的金融场景',
      '身份证后四位、授权token',
      'API接口',
      {
        kind: 'doc-link',
        text: '《中国移动认证梧桐数盾隐私政策》',
        docKey: 'haike-v2-cmcc-privacy-policy',
      },
      '10086',
    ])
  })

  it('preserves distinctive content from both embedded Haike policies', () => {
    const haikeText = HAIKE_V2_PRIVACY_POLICY_AGREEMENT.blocks
      .filter((block) => block.kind !== 'table')
      .map((block) => block.text)
      .join('\n')
    const cmccText = HAIKE_V2_CMCC_PRIVACY_POLICY_AGREEMENT.blocks
      .filter((block) => block.kind !== 'table')
      .map((block) => block.text)
      .join('\n')

    expect(haikeText).toContain('2026年1月23日')
    expect(haikeText).toContain('海客（天津）保险经纪有限公司')
    expect(cmccText).toContain('2026年6月3日')
    expect(HAIKE_V2_CMCC_PRIVACY_POLICY_AGREEMENT.blocks.some(
      (block) => block.kind === 'table',
    )).toBe(true)
  })

  it('preserves the locked Tiantianyoubao rows and embedded policy content', () => {
    expect(TIANTIANYOUBAO_V2_THIRD_PARTY_SHARING_AGREEMENT.blocks).toHaveLength(2)
    expect(TIANTIANYOUBAO_V2_PRIVACY_POLICY_AGREEMENT.blocks).toHaveLength(128)
    expect(TIANTIANYOUBAO_V2_CMCC_PRIVACY_POLICY_AGREEMENT.blocks).toHaveLength(139)

    const table = TIANTIANYOUBAO_V2_THIRD_PARTY_SHARING_AGREEMENT.blocks.find(
      (block) => block.kind === 'table',
    )
    expect(table?.kind).toBe('table')
    if (table?.kind !== 'table') {
      throw new Error('Expected the Tiantianyoubao third-party sharing table')
    }
    expect(table.rows).toHaveLength(4)

    expect(table.rows).toContainEqual([
      '天天有保（湖南）保险经纪服务有限公司',
      '核验身份一致性、便利信息填写',
      '银行卡支付绑卡、需实名制验证或管理的金融场景',
      '身份证后四位、授权token、姓名、身份证号前十四位、手机号',
      'API接口',
      {
        kind: 'doc-link',
        text: '《个人隐私协议》',
        docKey: 'tiantianyoubao-v2-privacy-policy',
      },
      '010-87227385',
    ])
    expect(table.rows).toContainEqual([
      '中移互联网有限公司',
      '核验身份一致性、便利信息填写',
      '银行卡支付绑卡、需实名制验证或管理的金融场景',
      '身份证后四位、授权token',
      'API接口',
      {
        kind: 'doc-link',
        text: '《中国移动认证梧桐数盾隐私政策》',
        docKey: 'tiantianyoubao-v2-cmcc-privacy-policy',
      },
      '10086',
    ])

    const privacyText = TIANTIANYOUBAO_V2_PRIVACY_POLICY_AGREEMENT.blocks
      .filter((block) => block.kind !== 'table')
      .map((block) => block.text)
      .join('\n')
    const cmccText = TIANTIANYOUBAO_V2_CMCC_PRIVACY_POLICY_AGREEMENT.blocks
      .filter((block) => block.kind !== 'table')
      .map((block) => block.text)
      .join('\n')

    expect(privacyText).toContain('天天有保（湖南）保险经纪服务有限公司')
    expect(privacyText).toContain('电话：010-87227385')
    expect(cmccText).toContain('2026年6月3日')
  })

  it('preserves the Dongfangdadi rows and embedded policy content', () => {
    const table = DONGFANGDADI_V2_THIRD_PARTY_SHARING_AGREEMENT.blocks.find(
      (block) => block.kind === 'table',
    )
    expect(table?.kind).toBe('table')
    if (table?.kind !== 'table') {
      throw new Error('Expected the Dongfangdadi third-party sharing table')
    }

    expect(table.rows).toContainEqual([
      '东方大地（武汉）保险经纪有限公司',
      '核验身份一致性、便利信息填写',
      '银行卡支付绑卡、需实名制验证或管理的金融场景',
      '身份证后四位、授权token、姓名、身份证号前十四位、手机号',
      'API接口',
      {
        kind: 'doc-link',
        text: '《隐私政策》',
        docKey: 'dongfangdadi-v2-privacy-policy',
      },
      'doc@dfdadi.com',
    ])
    expect(table.rows).toContainEqual([
      '中移互联网有限公司',
      '核验身份一致性、便利信息填写',
      '银行卡支付绑卡、需实名制验证或管理的金融场景',
      '身份证后四位、授权token',
      'API接口',
      {
        kind: 'doc-link',
        text: '《中国移动认证梧桐数盾隐私政策》',
        docKey: 'dongfangdadi-v2-cmcc-privacy-policy',
      },
      '10086',
    ])

    const privacyText = DONGFANGDADI_V2_PRIVACY_POLICY_AGREEMENT.blocks
      .filter((block) => block.kind !== 'table')
      .map((block) => block.text)
      .join('\n')
    const cmccText = DONGFANGDADI_V2_CMCC_PRIVACY_POLICY_AGREEMENT.blocks
      .filter((block) => block.kind !== 'table')
      .map((block) => block.text)
      .join('\n')

    expect(privacyText).toContain('东方大地（武汉）保险经纪有限公司')
    expect(privacyText).toContain('【更新日期】2026年8月12日')
    expect(cmccText).toContain('2026年6月3日')
  })

  it('preserves the Anxingtianxia rows and embedded policy content', () => {
    const table = ANXINGTIANXIA_V2_THIRD_PARTY_SHARING_AGREEMENT.blocks.find(
      (block) => block.kind === 'table',
    )
    expect(table?.kind).toBe('table')
    if (table?.kind !== 'table') {
      throw new Error('Expected the Anxingtianxia third-party sharing table')
    }

    expect(table.rows).toContainEqual([
      '安行天下保险经纪（上海）有限公司',
      '核验身份一致性、便利信息填写',
      '银行卡支付绑卡、需实名制验证或管理的金融场景',
      '身份证后四位、授权token、姓名、身份证号前十四位、手机号',
      'API接口',
      {
        kind: 'doc-link',
        text: '《安行天下个人信息保护政策》',
        docKey: 'anxingtianxia-v2-privacy-policy',
      },
      '4006-199-588',
    ])
    expect(table.rows).toContainEqual([
      '中移互联网有限公司',
      '核验身份一致性、便利信息填写',
      '银行卡支付绑卡、需实名制验证或管理的金融场景',
      '身份证后四位、授权token',
      'API接口',
      {
        kind: 'doc-link',
        text: '《中国移动认证梧桐数盾隐私政策》',
        docKey: 'anxingtianxia-v2-cmcc-privacy-policy',
      },
      '10086',
    ])

    const privacyText = ANXINGTIANXIA_V2_PRIVACY_POLICY_AGREEMENT.blocks
      .filter((block) => block.kind !== 'table')
      .map((block) => block.text)
      .join('\n')
    const cmccText = ANXINGTIANXIA_V2_CMCC_PRIVACY_POLICY_AGREEMENT.blocks
      .filter((block) => block.kind !== 'table')
      .map((block) => block.text)
      .join('\n')

    expect(privacyText).toContain('安行天下保险经纪（上海）有限公司')
    expect(cmccText).toContain('2026年6月3日')
  })

  it('preserves the Hengda rows and embedded policy content', () => {
    const table = HENGDA_V2_THIRD_PARTY_SHARING_AGREEMENT.blocks.find(
      (block) => block.kind === 'table',
    )
    expect(table?.kind).toBe('table')
    if (table?.kind !== 'table') {
      throw new Error('Expected the Hengda third-party sharing table')
    }

    expect(table.rows).toContainEqual([
      '恒大保险经纪有限公司',
      '核验身份一致性、便利信息填写',
      '银行卡支付绑卡、需实名制验证或管理的金融场景',
      '身份证后四位、授权token、姓名、身份证号前十四位、手机号',
      'API接口',
      { kind: 'doc-link', text: '《恒大保险经纪隐私政策》', docKey: 'hengda-v2-privacy-policy' },
      '0769-33551837',
    ])
    expect(table.rows).toContainEqual([
      '中移互联网有限公司',
      '核验身份一致性、便利信息填写',
      '银行卡支付绑卡、需实名制验证或管理的金融场景',
      '身份证后四位、授权token',
      'API接口',
      { kind: 'doc-link', text: '《中国移动认证梧桐数盾隐私政策》', docKey: 'hengda-v2-cmcc-privacy-policy' },
      '10086',
    ])

    const privacyText = HENGDA_V2_PRIVACY_POLICY_AGREEMENT.blocks
      .filter((block) => block.kind !== 'table')
      .map((block) => block.text)
      .join('\n')
    const cmccText = HENGDA_V2_CMCC_PRIVACY_POLICY_AGREEMENT.blocks
      .filter((block) => block.kind !== 'table')
      .map((block) => block.text)
      .join('\n')

    expect(privacyText).toContain('恒大保险经纪有限公司')
    expect(privacyText).toContain('【更新日期】2026年7月1日')
    expect(cmccText).toContain('2026年6月3日')
  })
})

describe('getAgreementDocByKey', () => {
  it('returns the legacy docs for existing keys', () => {
    expect(getAgreementDocByKey('sft')).toBe(SFT_USER_AUTH_AGREEMENT)
    expect(getAgreementDocByKey('cmcc')).toBe(CMCC_PRIVACY_AGREEMENT)
  })

  it('returns the new user information authorization docs by key', () => {
    expect(getAgreementDocByKey('sensitive-info-rules')).toBe(SENSITIVE_INFO_RULES_AGREEMENT)
    expect(getAgreementDocByKey('third-party-sharing-list')).toBe(THIRD_PARTY_SHARING_LIST_AGREEMENT)
    expect(getAgreementDocByKey('personal-info-collection-list')).toBe(PERSONAL_INFO_COLLECTION_LIST_AGREEMENT)
    expect(getAgreementDocByKey('user-auth-privacy-policy')).toBe(USER_AUTH_PRIVACY_POLICY_AGREEMENT)
    expect(getAgreementDocByKey('haike-v2-third-party-sharing'))
      .toBe(HAIKE_V2_THIRD_PARTY_SHARING_AGREEMENT)
    expect(getAgreementDocByKey('haike-v2-privacy-policy'))
      .toBe(HAIKE_V2_PRIVACY_POLICY_AGREEMENT)
    expect(getAgreementDocByKey('haike-v2-cmcc-privacy-policy'))
      .toBe(HAIKE_V2_CMCC_PRIVACY_POLICY_AGREEMENT)
    expect(getAgreementDocByKey('tiantianyoubao-v2-third-party-sharing'))
      .toBe(TIANTIANYOUBAO_V2_THIRD_PARTY_SHARING_AGREEMENT)
    expect(getAgreementDocByKey('tiantianyoubao-v2-privacy-policy'))
      .toBe(TIANTIANYOUBAO_V2_PRIVACY_POLICY_AGREEMENT)
    expect(getAgreementDocByKey('tiantianyoubao-v2-cmcc-privacy-policy'))
      .toBe(TIANTIANYOUBAO_V2_CMCC_PRIVACY_POLICY_AGREEMENT)
    expect(getAgreementDocByKey('dongfangdadi-v2-third-party-sharing'))
      .toBe(DONGFANGDADI_V2_THIRD_PARTY_SHARING_AGREEMENT)
    expect(getAgreementDocByKey('dongfangdadi-v2-privacy-policy'))
      .toBe(DONGFANGDADI_V2_PRIVACY_POLICY_AGREEMENT)
    expect(getAgreementDocByKey('dongfangdadi-v2-cmcc-privacy-policy'))
      .toBe(DONGFANGDADI_V2_CMCC_PRIVACY_POLICY_AGREEMENT)
    expect(getAgreementDocByKey('anxingtianxia-v2-third-party-sharing'))
      .toBe(ANXINGTIANXIA_V2_THIRD_PARTY_SHARING_AGREEMENT)
    expect(getAgreementDocByKey('anxingtianxia-v2-privacy-policy'))
      .toBe(ANXINGTIANXIA_V2_PRIVACY_POLICY_AGREEMENT)
    expect(getAgreementDocByKey('anxingtianxia-v2-cmcc-privacy-policy'))
      .toBe(ANXINGTIANXIA_V2_CMCC_PRIVACY_POLICY_AGREEMENT)
    expect(getAgreementDocByKey('hengda-v2-third-party-sharing'))
      .toBe(HENGDA_V2_THIRD_PARTY_SHARING_AGREEMENT)
    expect(getAgreementDocByKey('hengda-v2-privacy-policy'))
      .toBe(HENGDA_V2_PRIVACY_POLICY_AGREEMENT)
    expect(getAgreementDocByKey('hengda-v2-cmcc-privacy-policy'))
      .toBe(HENGDA_V2_CMCC_PRIVACY_POLICY_AGREEMENT)
  })

  it('returns null for unknown or inherited Object.prototype keys', () => {
    expect(getAgreementDocByKey('nope')).toBeNull()
    expect(getAgreementDocByKey('toString')).toBeNull()
    expect(getAgreementDocByKey('constructor')).toBeNull()
  })

  it('exposes a doc key type guard for same-origin agreement links', () => {
    expect(isAgreementDocKey('entry')).toBe(true)
    expect(isAgreementDocKey('sensitive-info-rules')).toBe(true)
    expect(isAgreementDocKey('third-party-sharing-list')).toBe(true)
    expect(isAgreementDocKey('personal-info-collection-list')).toBe(true)
    expect(isAgreementDocKey('user-auth-privacy-policy')).toBe(true)
    expect(isAgreementDocKey('haike-v2-third-party-sharing')).toBe(true)
    expect(isAgreementDocKey('haike-v2-privacy-policy')).toBe(true)
    expect(isAgreementDocKey('haike-v2-cmcc-privacy-policy')).toBe(true)
    expect(isAgreementDocKey('tiantianyoubao-v2-third-party-sharing')).toBe(true)
    expect(isAgreementDocKey('tiantianyoubao-v2-privacy-policy')).toBe(true)
    expect(isAgreementDocKey('tiantianyoubao-v2-cmcc-privacy-policy')).toBe(true)
    expect(isAgreementDocKey('dongfangdadi-v2-third-party-sharing')).toBe(true)
    expect(isAgreementDocKey('dongfangdadi-v2-privacy-policy')).toBe(true)
    expect(isAgreementDocKey('dongfangdadi-v2-cmcc-privacy-policy')).toBe(true)
    expect(isAgreementDocKey('anxingtianxia-v2-third-party-sharing')).toBe(true)
    expect(isAgreementDocKey('anxingtianxia-v2-privacy-policy')).toBe(true)
    expect(isAgreementDocKey('anxingtianxia-v2-cmcc-privacy-policy')).toBe(true)
    expect(isAgreementDocKey('hengda-v2-third-party-sharing')).toBe(true)
    expect(isAgreementDocKey('hengda-v2-privacy-policy')).toBe(true)
    expect(isAgreementDocKey('hengda-v2-cmcc-privacy-policy')).toBe(true)
    expect(isAgreementDocKey('nope')).toBe(false)
    expect(isAgreementDocKey('toString')).toBe(false)
  })
})
