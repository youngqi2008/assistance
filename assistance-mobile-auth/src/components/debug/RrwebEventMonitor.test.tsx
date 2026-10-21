import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { RrwebMonitorState, RrwebMonitorStore } from '../../recording/rrwebTestMonitorStore'
import { RrwebEventMonitor } from './RrwebEventMonitor'

function createStore(state: RrwebMonitorState): RrwebMonitorStore {
  return {
    start: vi.fn(),
    stop: vi.fn(),
    clear: vi.fn(),
    subscribe: vi.fn(() => () => undefined),
    getSnapshot: vi.fn(() => state),
  }
}

describe('RrwebEventMonitor', () => {
  it('renders bounded diagnostic state in an rr-block region', () => {
    const store = createStore({
      status: 'recording',
      source: 'local',
      totalEvents: 12,
      iframeAttachEvents: 2,
      recentEvents: [{ type: 3, timestamp: 100, data: { source: 0 } }],
    })
    const { unmount } = render(<RrwebEventMonitor store={store} enabled />)

    const region = screen.getByRole('region', { name: 'rrweb 事件监视器' })
    expect(region).toHaveClass('rr-block')
    expect(screen.getByTestId('rrweb-monitor-status')).toHaveTextContent('本地 fallback')
    expect(screen.getByTestId('rrweb-total-events')).toHaveTextContent('12')
    expect(screen.getByTestId('rrweb-iframe-attach-events')).toHaveTextContent('2')
    expect(screen.getByTestId('rrweb-event-json')).toHaveTextContent('"timestamp": 100')

    fireEvent.click(screen.getByRole('button', { name: '清空 rrweb 事件' }))
    expect(store.clear).toHaveBeenCalledTimes(1)

    // Unmount must not stop the shared recorder: StrictMode remounts effects in dev,
    // and the store lifecycle is owned by startStagingRrwebMonitor (pagehide/beforeunload).
    unmount()
    expect(store.stop).not.toHaveBeenCalled()
  })

  it('renders nothing when disabled', () => {
    render(<RrwebEventMonitor store={createStore({
      status: 'idle',
      totalEvents: 0,
      iframeAttachEvents: 0,
      recentEvents: [],
    })} enabled={false} />)
    expect(screen.queryByRole('region', { name: 'rrweb 事件监视器' })).toBeNull()
  })
})
