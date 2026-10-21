// 构建后处理：把 Tailwind v4 产物里的 CSS 级联层 @layer 压平成等价的 :not() 选择器。
//
// 业务背景：荣耀(HONOR)等内核 <Chromium 99 的国产浏览器不识别 @layer，会按 CSS 容错规则
// 把整个 @layer{...} 块（≈ 整张 Tailwind 表）连内容一起丢弃 → 基座页/授权 iframe 整页无样式。
// 真实用户表层（基座页 + 授权 iframe）必须覆盖这类老机型，故在 vite build 之后对最终产物 CSS
// 跑一遍 @csstools/postcss-cascade-layers，消除原生 @layer，使老引擎也能套用工具类。
//
// 同步给 dvh（动态视口单位，需 Chrome108+/Safari15.4+）补 vh 回退：旧引擎不认 dvh 会丢该声明
// 导致全屏/弹层容器塌陷高度。注入 `prop:Nvh` 在 `prop:Ndvh` 之前 —— 旧引擎取 vh、现代引擎取 dvh。
// 仅压平 @layer + 补 dvh 回退；color-mix()/@property 仍保留（<111 引擎个别颜色降级，非整页失效）。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import postcss from 'postcss'
import cascadeLayers from '@csstools/postcss-cascade-layers'
import { addV23ContainerUnitFallbacks } from './container-unit-fallbacks.mjs'

const targetDir = process.argv[2] ?? 'dist/assets'
const countLayers = (css) => (css.match(/@layer\b/g) ?? []).length
const countDvh = (css) => (css.match(/dvh\b/g) ?? []).length

// 给 height / min-height / max-height 的 dvh 值补一条 vh 回退声明（单次 replace，不会重复注入）。
function addDvhFallback(css) {
  return css.replace(
    /((?:min-|max-)?height)\s*:\s*([\d.]+)dvh/g,
    (_m, prop, num) => `${prop}:${num}vh;${prop}:${num}dvh`,
  )
}

let files
try {
  files = (await readdir(targetDir)).filter((f) => f.endsWith('.css'))
} catch (e) {
  console.error(`[flatten-layers] 目录不存在或不可读: ${targetDir} (${e.message})`)
  process.exit(1)
}

if (files.length === 0) {
  console.warn(`[flatten-layers] ${targetDir} 下没有 .css 文件，跳过。`)
  process.exit(0)
}

let totalRemaining = 0
for (const file of files) {
  const full = path.join(targetDir, file)
  const css = await readFile(full, 'utf8')
  const before = countLayers(css)
  // process 必须拿到完整 bundle（单文件即满足该插件前提）。
  const result = await postcss([
    cascadeLayers(),
    {
      postcssPlugin: 'v23-container-unit-fallbacks',
      Once(root) {
        addV23ContainerUnitFallbacks(root)
      },
    },
  ]).process(css, { from: full, to: full })
  const flattened = addDvhFallback(result.css)
  const after = countLayers(flattened)
  totalRemaining += after
  await writeFile(full, flattened)
  console.log(
    `[flatten-layers] ${file}: @layer ${before} -> ${after}, dvh ${countDvh(css)} -> 已补 vh 回退, ${css.length} -> ${flattened.length} bytes`,
  )
}

if (totalRemaining > 0) {
  console.error(`[flatten-layers] 仍残留 @layer ${totalRemaining} 处——压平未完全生效，构建失败以免上线坏样式。`)
  process.exit(1)
}
console.log('[flatten-layers] 完成：所有 @layer 已压平。')
