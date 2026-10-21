import postcss from 'postcss'
import { describe, expect, it } from 'vitest'

import { addV23ContainerUnitFallbacks } from './container-unit-fallbacks.mjs'

function compile(css) {
  const root = postcss.parse(css)
  addV23ContainerUnitFallbacks(root)
  return root.toString()
}

describe('V23 container-unit compatibility', () => {
  it('prepends measured-unit fallbacks and preserves native units for modern engines', () => {
    const css = compile(`
      .chinaums-v23-stage { --dialog: min(85cqw, 47cqh); }
      .chinaums-v23-submit { height: 15.862069cqi; }
      .chinaums-v23-key { font-size: 10.5cqh; column-gap: 1.25cqw; }
    `)

    expect(css).toMatch(
      /\.chinaums-v23-stage\s*\{\s*--dialog: min\(calc\(85 \* var\(--v23-stage-cqw\)\), calc\(47 \* var\(--v23-stage-cqh\)\)\);\s*\}/,
    )
    expect(css).toMatch(
      /@supports \(width: 1cqw\)\s*\{[\s\S]*?\.chinaums-v23-stage\s*\{\s*--dialog: min\(85cqw, 47cqh\);\s*\}/,
    )
    expect(css).toContain('height: calc(15.862069 * var(--v23-dialog-cqi));')
    expect(css).toContain('height: 15.862069cqi;')
    expect(css).toContain('font-size: calc(10.5 * var(--v23-keyboard-cqh));')
    expect(css).toContain('column-gap: calc(1.25 * var(--v23-keyboard-cqw));')
  })

  it('leaves unrelated skins unchanged', () => {
    const source = '.haike-inline-card { width: 90.8cqi; }'
    expect(compile(source)).toBe(source)
  })

  it('isolates native container units in declarations with deferred var validation', () => {
    const output = postcss.parse(compile(`
      .chinaums-v23-dialog {
        max-height: calc(100cqh - var(--v23-keyboard-height) - 16px) !important;
      }
    `))
    const declarations = []
    output.walkDecls('max-height', (declaration) => declarations.push(declaration))

    expect(declarations).toHaveLength(2)
    expect(declarations[0].value).toContain('var(--v23-stage-cqh)')
    expect(declarations[0].important).toBe(true)
    expect(declarations[1].parent.parent.type).toBe('atrule')
    expect(declarations[1].parent.parent.params).toBe('(width: 1cqw)')
    expect(declarations[1].important).toBe(true)
  })
})
