import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { loadRrwebResource } = vi.hoisted(() => ({ loadRrwebResource: vi.fn() }))
vi.mock('./rrwebResource', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./rrwebResource')>()),
  loadRrwebResource,
}))

import { startRrwebRecorder } from './rrwebRecorder'

describe('startRrwebRecorder', () => {
  beforeEach(() => loadRrwebResource.mockReset())

  it('starts with cross-origin mode and no masking', async () => {
    const stopRecord = vi.fn()
    const record = vi.fn(() => stopRecord)
    const emit = vi.fn()
    loadRrwebResource.mockResolvedValue({ status: 'ready', source: 'cdn', rrweb: { record } })

    const result = await startRrwebRecorder({ emit })

    expect(result).toMatchObject({ status: 'recording', source: 'cdn' })
    expect(record).toHaveBeenCalledWith({
      emit,
      recordCrossOriginIframes: true,
    })

    result.stop()
    result.stop()
    expect(stopRecord).toHaveBeenCalledTimes(1)
  })

  it('returns unavailable when loading or record startup fails', async () => {
    loadRrwebResource.mockResolvedValueOnce({
      status: 'unavailable',
      error: new Error('blocked'),
    })
    await expect(startRrwebRecorder({ emit: vi.fn() })).resolves.toMatchObject({
      status: 'unavailable',
    })

    const warn = vi.fn()
    loadRrwebResource.mockResolvedValueOnce({
      status: 'ready',
      source: 'local',
      rrweb: { record: vi.fn(() => { throw new Error('record failed') }) },
    })
    await expect(startRrwebRecorder({ emit: vi.fn(), warn })).resolves.toMatchObject({
      status: 'unavailable',
    })
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('accepts a recorder with no stop function', async () => {
    loadRrwebResource.mockResolvedValue({
      status: 'ready',
      source: 'cdn',
      rrweb: { record: vi.fn(() => undefined) },
    })
    const result = await startRrwebRecorder({ emit: vi.fn() })
    expect(() => result.stop()).not.toThrow()
  })
})
