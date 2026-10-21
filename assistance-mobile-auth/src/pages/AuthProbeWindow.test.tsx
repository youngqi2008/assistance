import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadMobileAuthSdkResources } from '../sdk/resourceLoader'

const { showAuthPage, initControl, detectNetworkType, resolveAuthParams } = vi.hoisted(() => ({
  showAuthPage: vi.fn(),
  initControl: vi.fn(),
  detectNetworkType: vi.fn(),
  resolveAuthParams: vi.fn(),
}))

vi.mock('../sdk/authParamsProvider', () => ({
  createAuthParamsProvider: () => ({
    resolve: resolveAuthParams,
  }),
}))
vi.mock('../sdk/config', () => ({ getMobileAuthSdkConfig: () => ({ enabled: true, mode: 'live' }) }))
vi.mock('../sdk/resourceLoader', () => ({ loadMobileAuthSdkResources: vi.fn().mockResolvedValue({ state: 'ready' }) }))
vi.mock('../sdk/mobileAuthFacade', () => ({ createMobileAuthSdkFacade: () => ({ showAuthPage, initControl, clearControl: vi.fn() }) }))
vi.mock('../sdk/networkType', () => ({ detectNetworkType }))

import { AuthProbeWindow } from './AuthProbeWindow'

const ALL_CARRIERS_FAILED_PAYLOAD = { YDData: { code: '103111' }, CTData: { code: '103124' }, CUData: { code: '103125' } }

function lastProbePayload(spy: ReturnType<typeof vi.spyOn>) {
  const call = spy.mock.calls.at(-1)
  return (call?.[0] as { payload?: unknown }).payload as { eligible: boolean; reason: string; raw?: Record<string, unknown> }
}

describe('AuthProbeWindow', () => {
  beforeEach(() => {
    showAuthPage.mockReset()
    initControl.mockReset()
    detectNetworkType.mockReset()
    resolveAuthParams.mockReset()
    detectNetworkType.mockResolvedValue('unknown')
    resolveAuthParams.mockReturnValue({ status: 'ready', source: 'manual', data: { appId: 'x' } })
    window.history.replaceState(null, '', '/verification?mode=probe&assistanceAuthSessionId=s1')
  })
  afterEach(() => vi.clearAllMocks())

  it('loads resources and posts ok without launchToken when showAuthPage succeeds with 103000', async () => {
    const post = vi.spyOn(window.parent, 'postMessage')
    showAuthPage.mockImplementation(({ success }) => success({ code: '103000' }))
    render(<AuthProbeWindow />)
    await waitFor(() => expect(post).toHaveBeenCalled())
    expect(vi.mocked(loadMobileAuthSdkResources)).toHaveBeenCalled()
    expect(resolveAuthParams).toHaveBeenCalledWith({ forceFrontend: true })
    expect(showAuthPage).toHaveBeenCalled()
    expect(lastProbePayload(post)).toEqual({ eligible: true, reason: 'ok' })
    expect(initControl).not.toHaveBeenCalled()
    expect(detectNetworkType).not.toHaveBeenCalled()
  })

  it('refines ALL_CARRIERS_FAILED to wifi when network type is wifi, and surfaces per-carrier codes', async () => {
    detectNetworkType.mockResolvedValue('wifi')
    const post = vi.spyOn(window.parent, 'postMessage')
    showAuthPage.mockImplementation(({ error }) => error(ALL_CARRIERS_FAILED_PAYLOAD))
    render(<AuthProbeWindow />)
    await waitFor(() => expect(post).toHaveBeenCalled())
    const payload = lastProbePayload(post)
    expect(payload.reason).toBe('wifi')
    expect(payload.raw).toMatchObject({
      code: 'ALL_CARRIERS_FAILED',
      networkType: 'wifi',
      carriers: { YD: '103111', CT: '103124', CU: '103125' },
    })
  })

  it('refines ALL_CARRIERS_FAILED to non-mobile when on cellular', async () => {
    detectNetworkType.mockResolvedValue('cellular')
    const post = vi.spyOn(window.parent, 'postMessage')
    showAuthPage.mockImplementation(({ error }) => error(ALL_CARRIERS_FAILED_PAYLOAD))
    render(<AuthProbeWindow />)
    await waitFor(() => expect(post).toHaveBeenCalled())
    const payload = lastProbePayload(post)
    expect(payload.reason).toBe('non-mobile')
    expect(payload.raw?.networkType).toBe('cellular')
  })

  it('keeps ALL_CARRIERS_FAILED as ambiguous when network type is unknown', async () => {
    detectNetworkType.mockResolvedValue('unknown')
    const post = vi.spyOn(window.parent, 'postMessage')
    showAuthPage.mockImplementation(({ error }) => error(ALL_CARRIERS_FAILED_PAYLOAD))
    render(<AuthProbeWindow />)
    await waitFor(() => expect(post).toHaveBeenCalled())
    expect(lastProbePayload(post).reason).toBe('ambiguous')
    expect(lastProbePayload(post).raw?.networkType).toBe('unknown')
  })

  it('posts non-mobile for a definitive carrier-mismatch code without probing network', async () => {
    const post = vi.spyOn(window.parent, 'postMessage')
    showAuthPage.mockImplementation(({ success }) => success({ code: '110031' }))
    render(<AuthProbeWindow />)
    await waitFor(() => expect(post).toHaveBeenCalled())
    expect(lastProbePayload(post).reason).toBe('non-mobile')
    expect(detectNetworkType).not.toHaveBeenCalled()
  })

  it('posts unknown when frontend auth params are not ready', async () => {
    resolveAuthParams.mockReturnValue({ status: 'missing', source: 'manual' })
    const post = vi.spyOn(window.parent, 'postMessage')
    render(<AuthProbeWindow />)
    await waitFor(() => expect(post).toHaveBeenCalled())
    expect(lastProbePayload(post)).toEqual({ eligible: false, reason: 'unknown' })
    expect(showAuthPage).not.toHaveBeenCalled()
    expect(vi.mocked(loadMobileAuthSdkResources)).not.toHaveBeenCalled()
  })
})
