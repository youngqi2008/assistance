import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, ExternalLink } from 'lucide-react'

import { AgreementBlocks } from '../components/feedback/AgreementBlocks'
import { getAgreementDocByKey, isAgreementDocKey, type AgreementDocKey } from '../agreements/agreementContent'
import { buildUserServiceChildArr } from '../agreements/agreementAggregation'
import { HAIKE_V2_APP_ID } from '../agreements/appAgreementRegistry'
import type { MobileAuthSdkAgreementEntry } from '../sdk/types'
import { isYuanbaoFeedbackProfile } from './appProfiles'

function getDocKey(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  return new URLSearchParams(window.location.search).get('doc') ?? ''
}

function getEntryChildDocKey(): AgreementDocKey | null {
  if (typeof window === 'undefined') {
    return null
  }

  const key = new URLSearchParams(window.location.search).get('childDoc')
  if (key !== null && key !== 'entry' && isAgreementDocKey(key)) {
    return key
  }

  return null
}

type EntryNavigation = {
  childDocKey: AgreementDocKey | null
  nestedDocKey: AgreementDocKey | null
  hasInvalidNestedDoc: boolean
}

function isNestedDocLinkedFromChild(
  childDocKey: AgreementDocKey,
  nestedDocKey: AgreementDocKey,
): boolean {
  const childDoc = getAgreementDocByKey(childDocKey)
  return childDoc?.blocks.some((block) => (
    block.kind === 'table' && block.rows.some((row) => (
      row.some((cell) => (
        typeof cell !== 'string'
        && cell.kind === 'doc-link'
        && cell.docKey === nestedDocKey
      ))
    ))
  )) ?? false
}

function getEntryNavigation(): EntryNavigation {
  const childDocKey = getEntryChildDocKey()
  if (typeof window === 'undefined') {
    return { childDocKey, nestedDocKey: null, hasInvalidNestedDoc: false }
  }

  const nestedDoc = new URLSearchParams(window.location.search).get('nestedDoc')
  const nestedDocKey = nestedDoc !== null && nestedDoc !== 'entry' && isAgreementDocKey(nestedDoc)
    ? nestedDoc
    : null

  return {
    childDocKey,
    nestedDocKey,
    hasInvalidNestedDoc: nestedDoc !== null && (
      !childDocKey ||
      !nestedDocKey ||
      !isNestedDocLinkedFromChild(childDocKey, nestedDocKey)
    ),
  }
}

function getAppId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return new URLSearchParams(window.location.search).get('appId')
}

function isHaikeInlineAgreementEntry(appId: string | null): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return appId?.trim() === HAIKE_V2_APP_ID
    && new URLSearchParams(window.location.search).get('layout') === 'inline'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeAgreementEntries(value: unknown): MobileAuthSdkAgreementEntry[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.name !== 'string') {
      return []
    }

    const name = item.name.trim()
    const link = typeof item.link === 'string' ? item.link.trim() : ''
    if (!name || !link) {
      return []
    }

    return [{ name, link }]
  })
}

function getAgreementDocKeyFromLink(link: string): AgreementDocKey | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const url = new URL(link, window.location.href)
    const key = url.searchParams.get('doc')
    if (
      url.origin === window.location.origin &&
      url.pathname === window.location.pathname &&
      url.searchParams.get('flow') === 'agreement' &&
      key !== null &&
      key !== 'entry' &&
      isAgreementDocKey(key)
    ) {
      return key
    }
  } catch {
    return null
  }

  return null
}

function getResolvedAgreementUrl(link: string): string {
  try {
    return new URL(link, window.location.href).href
  } catch {
    return link
  }
}

function filterCompleteSdkAgreements(
  entries: MobileAuthSdkAgreementEntry[],
  appId: string | null,
): MobileAuthSdkAgreementEntry[] {
  const builtInDocKeys = new Set(
    buildUserServiceChildArr({ appId }).flatMap((agreement) => {
      const docKey = getAgreementDocKeyFromLink(agreement.link ?? '')
      return docKey ? [docKey] : []
    }),
  )
  const seenCallerAgreements = new Set<string>()

  return entries.filter((agreement) => {
    const docKey = getAgreementDocKeyFromLink(agreement.link ?? '')
    if (docKey && builtInDocKeys.has(docKey)) {
      return false
    }

    const normalizedName = agreement.name.trim().replace(/\s+/g, ' ')
    const key = `${normalizedName}\u0000${getResolvedAgreementUrl(agreement.link ?? '')}`
    if (seenCallerAgreements.has(key)) {
      return false
    }

    seenCallerAgreements.add(key)
    return true
  })
}

function AgreementEntryList({
  agreements,
  onOpen,
}: {
  agreements: MobileAuthSdkAgreementEntry[]
  onOpen: (agreement: MobileAuthSdkAgreementEntry) => void
}) {
  return (
    <ul>
      {agreements.map((agreement) => {
        const isBuiltIn = getAgreementDocKeyFromLink(agreement.link ?? '') !== null
        const Icon = isBuiltIn ? ChevronRight : ExternalLink

        return (
          <li key={`${agreement.name}-${agreement.link ?? ''}`}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 py-4 text-left text-[15px] font-medium leading-snug text-[var(--color-text-primary)]"
              onClick={() => onOpen(agreement)}
            >
              <span>{agreement.name}</span>
              <Icon aria-hidden="true" className="size-4 shrink-0 text-[var(--color-text-secondary)]" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function AgreementDocPage() {
  const docKey = getDocKey()
  const doc = getAgreementDocByKey(docKey)
  const appId = getAppId()
  const isHaikeInline = isHaikeInlineAgreementEntry(appId)
  const enableYuanbaoFeedback = isYuanbaoFeedbackProfile(appId)
  const [messageChildAgreements, setMessageChildAgreements] = useState<MobileAuthSdkAgreementEntry[]>([])
  const [entryNavigation, setEntryNavigation] = useState<EntryNavigation>(() => (
    docKey === 'entry'
      ? getEntryNavigation()
      : { childDocKey: null, nestedDocKey: null, hasInvalidNestedDoc: false }
  ))
  const selectedDoc = entryNavigation.childDocKey
    ? getAgreementDocByKey(entryNavigation.childDocKey)
    : null
  const nestedDoc = entryNavigation.nestedDocKey
    ? getAgreementDocByKey(entryNavigation.nestedDocKey)
    : null
  const isEntryPage = docKey === 'entry'
  const childAgreements = useMemo(
    () => buildUserServiceChildArr({
      appId,
      callerAgreements: messageChildAgreements,
      preserveReservedCallerAgreement: isHaikeInline || enableYuanbaoFeedback,
    }),
    [appId, isHaikeInline, enableYuanbaoFeedback, messageChildAgreements],
  )

  useLayoutEffect(() => {
    if (!enableYuanbaoFeedback) return
    const root = document.documentElement
    const previous = root.getAttribute('data-assistance-yuanbao-feedback')
    root.setAttribute('data-assistance-yuanbao-feedback', 'true')
    return () => {
      if (previous === null) root.removeAttribute('data-assistance-yuanbao-feedback')
      else root.setAttribute('data-assistance-yuanbao-feedback', previous)
    }
  }, [enableYuanbaoFeedback])

  useLayoutEffect(() => {
    const previousFlow = document.documentElement.dataset.appFlow
    document.documentElement.dataset.appFlow = 'agreement'

    return () => {
      if (previousFlow === undefined) {
        delete document.documentElement.dataset.appFlow
        return
      }

      document.documentElement.dataset.appFlow = previousFlow
    }
  }, [])

  useEffect(() => {
    if (!isEntryPage) {
      return undefined
    }

    function handleMessage(event: MessageEvent) {
      if (!isRecord(event.data)) {
        return
      }

      if (
        (isHaikeInline || enableYuanbaoFeedback)
        && (
          !Object.prototype.hasOwnProperty.call(event.data, 'option')
          || !Array.isArray(event.data.option)
        )
      ) {
        return
      }

      const entries = normalizeAgreementEntries(event.data.option)
      if (isHaikeInline || enableYuanbaoFeedback) {
        setMessageChildAgreements(filterCompleteSdkAgreements(entries, appId))
      } else if (entries.length > 0) {
        setMessageChildAgreements(entries)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [appId, isEntryPage, isHaikeInline, enableYuanbaoFeedback])

  useEffect(() => {
    if (!isEntryPage) {
      return undefined
    }

    function handlePopState() {
      setEntryNavigation(getEntryNavigation())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isEntryPage])

  function setEntryNavigationState(
    nextNavigation: EntryNavigation,
    historyMode: 'push' | 'replace' = 'push',
  ) {
    const url = new URL(window.location.href)
    if (nextNavigation.childDocKey) {
      url.searchParams.set('childDoc', nextNavigation.childDocKey)
    } else {
      url.searchParams.delete('childDoc')
    }
    if (nextNavigation.childDocKey && nextNavigation.nestedDocKey) {
      url.searchParams.set('nestedDoc', nextNavigation.nestedDocKey)
    } else {
      url.searchParams.delete('nestedDoc')
    }

    if (historyMode === 'replace') {
      window.history.replaceState({}, '', url)
    } else {
      window.history.pushState({}, '', url)
    }
    setEntryNavigation(nextNavigation)
  }

  function handleOpenChildAgreement(agreement: MobileAuthSdkAgreementEntry) {
    const link = agreement.link ?? ''
    const childDocKey = getAgreementDocKeyFromLink(link)
    if (childDocKey) {
      setEntryNavigationState({
        childDocKey,
        nestedDocKey: null,
        hasInvalidNestedDoc: false,
      })
      return
    }

    if (link) {
      window.location.href = link
    }
  }

  if (!doc) {
    return (
      <main className="flex h-dvh items-center justify-center bg-white px-6 text-center text-[14px] text-[var(--color-text-secondary)]">
        协议不存在
      </main>
    )
  }

  if (isEntryPage && entryNavigation.hasInvalidNestedDoc) {
    return (
      <main className="flex h-dvh items-center justify-center bg-white px-6 text-center text-[14px] text-[var(--color-text-secondary)]">
        协议不存在
      </main>
    )
  }

  if (isEntryPage && selectedDoc && nestedDoc) {
    return (
      <main className="flex h-dvh flex-col bg-white text-[var(--color-text-primary)]">
        <header className="flex shrink-0 items-center gap-2 border-b border-[#eef1f4] px-4 py-3">
          <button
            type="button"
            aria-label="返回协议列表"
            className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--color-text-primary)]"
            onClick={() => setEntryNavigationState({
              childDocKey: entryNavigation.childDocKey,
              nestedDocKey: null,
              hasInvalidNestedDoc: false,
            }, 'replace')}
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-[16px] font-semibold leading-tight">{nestedDoc.title}</h1>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <AgreementBlocks blocks={nestedDoc.blocks} />
        </div>
      </main>
    )
  }

  if (isEntryPage && selectedDoc) {
    return (
      <main className="flex h-dvh flex-col bg-white text-[var(--color-text-primary)]">
        <header className="flex shrink-0 items-center gap-2 border-b border-[#eef1f4] px-4 py-3">
          <button
            type="button"
            aria-label="返回协议列表"
            className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--color-text-primary)]"
            onClick={() => setEntryNavigationState({
              childDocKey: null,
              nestedDocKey: null,
              hasInvalidNestedDoc: false,
            }, 'replace')}
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-[16px] font-semibold leading-tight">{selectedDoc.title}</h1>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <AgreementBlocks
            blocks={selectedDoc.blocks}
            onOpenDoc={(nestedDocKey) => setEntryNavigationState({
              childDocKey: entryNavigation.childDocKey,
              nestedDocKey,
              hasInvalidNestedDoc: false,
            })}
          />
        </div>
      </main>
    )
  }

  if (isEntryPage) {
    return (
      <main className="flex h-dvh flex-col bg-white text-[var(--color-text-primary)]">
        <div className={`min-h-0 flex-1 overflow-y-auto px-5 py-4${enableYuanbaoFeedback ? ' yuanbao-agreement-list' : ''}`}>
          <AgreementEntryList agreements={childAgreements} onOpen={handleOpenChildAgreement} />
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-dvh flex-col bg-white text-[var(--color-text-primary)]">
      <header className="shrink-0 border-b border-[#eef1f4] px-5 py-4">
        <h1 className="text-[16px] font-semibold leading-tight">{doc.title}</h1>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <AgreementBlocks blocks={doc.blocks} />
      </div>
    </main>
  )
}
