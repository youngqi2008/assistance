import { Trash2 } from 'lucide-react'
import { useSyncExternalStore } from 'react'

import {
  isStagingRrwebMonitorPage,
  rrwebTestMonitorStore,
  type RrwebMonitorState,
  type RrwebMonitorStore,
} from '../../recording/rrwebTestMonitorStore'
import type { RrwebEvent } from '../../recording/rrwebResource'

const EVENT_TYPE_NAMES: Record<number, string> = {
  0: 'DOMContentLoaded',
  1: 'Load',
  2: 'FullSnapshot',
  3: 'IncrementalSnapshot',
  4: 'Meta',
  5: 'Custom',
  6: 'Plugin',
}

function statusText(state: RrwebMonitorState) {
  if (state.status === 'recording') {
    return state.source === 'cdn' ? '录制中 · CDN' : '录制中 · 本地 fallback'
  }
  if (state.status === 'loading') return '正在加载 rrweb'
  if (state.status === 'unavailable') return `rrweb 不可用${state.message ? ` · ${state.message}` : ''}`
  return '尚未启动'
}

function safeEventJson(event: RrwebEvent) {
  try {
    return JSON.stringify(event, null, 2)
  } catch {
    return '[事件无法序列化]'
  }
}

export function RrwebEventMonitor({
  store = rrwebTestMonitorStore,
  enabled = isStagingRrwebMonitorPage(),
}: {
  store?: RrwebMonitorStore
  enabled?: boolean
}) {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  // The store lifecycle is owned by startStagingRrwebMonitor (pagehide/beforeunload).
  // Unmounting this view must NOT call store.stop(): StrictMode mounts, unmounts, and
  // remounts effects in dev, and a stop there would permanently kill the singleton
  // recorder (its started/stopped guards make stop irreversible), leaving the monitor
  // stuck in the loading state.
  if (!enabled) return null

  return (
    <section
      className="rr-block mt-4 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
      aria-label="rrweb 事件监视器"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[#111827]">rrweb 事件监视器</h2>
          <p data-testid="rrweb-monitor-status" className="mt-1 break-words text-xs text-[#6b7280]">
            {statusText(state)}
          </p>
        </div>
        <button
          type="button"
          aria-label="清空 rrweb 事件"
          title="清空 rrweb 事件"
          onClick={store.clear}
          className="grid size-9 shrink-0 place-items-center rounded-[8px] border border-[#d1d5db] text-[#4b5563]"
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-[#8a8f98]">事件总数</dt>
          <dd data-testid="rrweb-total-events" className="mt-1 font-semibold text-[#111827]">
            {state.totalEvents}
          </dd>
        </div>
        <div>
          <dt className="text-[#8a8f98]">iframe attach</dt>
          <dd data-testid="rrweb-iframe-attach-events" className="mt-1 font-semibold text-[#111827]">
            {state.iframeAttachEvents}
          </dd>
        </div>
      </dl>

      <div className="mt-3 max-h-80 overflow-auto rounded-[8px] bg-[#111827] p-3 text-[#e5e7eb]">
        {state.recentEvents.length === 0 ? (
          <p className="text-xs text-[#9ca3af]">暂无事件</p>
        ) : state.recentEvents.map((event, index) => (
          <div key={`${event.timestamp}-${index}`} className="border-b border-[#374151] py-2 last:border-b-0">
            <p className="text-xs font-semibold text-[#7dd3fc]">
              {EVENT_TYPE_NAMES[event.type] ?? `Event ${event.type}`} · {event.timestamp}
            </p>
            <pre data-testid="rrweb-event-json" className="mt-1 whitespace-pre-wrap break-all text-[11px] leading-5">
              {safeEventJson(event)}
            </pre>
          </div>
        ))}
      </div>
    </section>
  )
}
