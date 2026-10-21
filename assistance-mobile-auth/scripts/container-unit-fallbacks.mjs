import postcss from 'postcss'

const CONTAINER_UNIT_PATTERN = /(-?(?:\d+\.?\d*|\.\d+))(cqw|cqh|cqi)\b/g

function findOwningRule(declaration) {
  let node = declaration.parent
  while (node && node.type !== 'root') {
    if (node.type === 'rule') {
      return node
    }
    node = node.parent
  }
  return null
}

function isV23Declaration(declaration) {
  let node = declaration.parent
  while (node && node.type !== 'root') {
    if (
      (node.type === 'rule' && node.selector?.includes('chinaums-v23')) ||
      (node.type === 'atrule' && node.params?.includes('chinaums-v23'))
    ) {
      return true
    }
    node = node.parent
  }
  return false
}

function isKeyboardRule(declaration) {
  const selector = findOwningRule(declaration)?.selector ?? ''
  return /chinaums-v23-(?:figma-keyboard|key(?:-|\b)|delete-icon)/.test(selector)
}

function fallbackVariable(unit, declaration) {
  if (unit === 'cqi') {
    return '--v23-dialog-cqi'
  }

  const scope = isKeyboardRule(declaration) ? 'keyboard' : 'stage'
  return `--v23-${scope}-${unit}`
}

/**
 * Keep native container units as the last declaration for modern engines, but
 * prepend equivalent measured-unit declarations for Chromium < 105.
 */
export function addV23ContainerUnitFallbacks(root) {
  const modernOverrides = new Map()

  root.walkDecls((declaration) => {
    if (!CONTAINER_UNIT_PATTERN.test(declaration.value) || !isV23Declaration(declaration)) {
      CONTAINER_UNIT_PATTERN.lastIndex = 0
      return
    }
    CONTAINER_UNIT_PATTERN.lastIndex = 0

    const fallbackValue = declaration.value.replace(
      CONTAINER_UNIT_PATTERN,
      (_match, amount, unit) =>
        `calc(${amount} * var(${fallbackVariable(unit, declaration)}))`,
    )

    const needsCapabilityBranch =
      declaration.prop.startsWith('--') || /\bvar\s*\(/.test(declaration.value)

    if (needsCapabilityBranch) {
      const ownerRule = findOwningRule(declaration)
      if (ownerRule) {
        const overrides = modernOverrides.get(ownerRule) ?? []
        overrides.push(declaration.clone())
        modernOverrides.set(ownerRule, overrides)
        declaration.value = fallbackValue
      }
      return
    }

    declaration.cloneBefore({ value: fallbackValue })
  })

  for (const [ownerRule, overrides] of modernOverrides) {
    const modernRule = ownerRule.clone({ nodes: [] })
    modernRule.append(overrides)
    const supports = postcss.atRule({ name: 'supports', params: '(width: 1cqw)' })
    supports.append(modernRule)
    ownerRule.after(supports)
  }

  return root
}
