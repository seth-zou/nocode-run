import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

// Mock axios so we control the interceptor behavior without network calls.
vi.mock('axios', () => {
  const handlers = { request: [] as any[], response: [] as any[] }
  const instance = {
    interceptors: {
      request: {
        use: (ful: any, rej: any) => {
          handlers.request.push({ ful, rej })
          return handlers.request.length
        },
      },
      response: {
        use: (ful: any, rej: any) => {
          handlers.response.push({ ful, rej })
          return handlers.response.length
        },
      },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
  const create = vi.fn(() => instance)
  return {
    default: { create },
    __handlers: handlers,
    __instance: instance,
  }
})

import api, { appApi } from './api'
import { __handlers, __instance } from 'axios'

const responseInterceptor = __handlers.response[0]
const requestInterceptor = __handlers.request[0]

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('api axios instance', () => {
  it('creates an axios instance with HTTP verbs', () => {
    expect(api.get).toBeDefined()
    expect(api.post).toBeDefined()
    expect(api.put).toBeDefined()
    expect(api.delete).toBeDefined()
  })
})

describe('request interceptor', () => {
  it('passes the config through unchanged on success', () => {
    const config = { url: '/apps', method: 'get' }
    const result = requestInterceptor.ful(config)

    expect(result).toBe(config)
  })

  it('rejects on request error', async () => {
    const err = new Error('request failed')

    await expect(requestInterceptor.rej(err)).rejects.toThrow('request failed')
  })
})

describe('response interceptor', () => {
  it('unwraps response.data on success', () => {
    const result = responseInterceptor.ful({
      data: [{ id: '1', name: 'App' }],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    })

    expect(result).toEqual([{ id: '1', name: 'App' }])
  })

  it('rejects and logs on error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('Network Error')

    await expect(responseInterceptor.rej(err)).rejects.toThrow('Network Error')
    expect(consoleSpy).toHaveBeenCalledWith('API Error:', err)
  })
})

describe('appApi', () => {
  it('getApps calls GET /apps and returns the data', async () => {
    vi.mocked(__instance.get).mockResolvedValue([{ id: '1' }])
    const result = await appApi.getApps()

    expect(__instance.get).toHaveBeenCalledWith('/apps')
    expect(result).toEqual([{ id: '1' }])
  })

  it('createApp calls POST /apps with the payload', async () => {
    vi.mocked(__instance.post).mockResolvedValue({ id: '1' })
    const payload = { name: 'New', description: 'd' }
    const result = await appApi.createApp(payload)

    expect(__instance.post).toHaveBeenCalledWith('/apps', payload)
    expect(result).toEqual({ id: '1' })
  })

  it('getApp calls GET /apps/:id', async () => {
    vi.mocked(__instance.get).mockResolvedValue({ id: '9' })
    await appApi.getApp('9')

    expect(__instance.get).toHaveBeenCalledWith('/apps/9')
  })

  it('updateApp calls PUT /apps/:id with the payload', async () => {
    vi.mocked(__instance.put).mockResolvedValue({ id: '9' })
    const payload = { name: 'Renamed' }
    await appApi.updateApp('9', payload)

    expect(__instance.put).toHaveBeenCalledWith('/apps/9', payload)
  })

  it('deleteApp calls DELETE /apps/:id', async () => {
    vi.mocked(__instance.delete).mockResolvedValue(undefined)
    await appApi.deleteApp('9')

    expect(__instance.delete).toHaveBeenCalledWith('/apps/9')
  })

  it('propagates a rejection from the underlying instance', async () => {
    vi.mocked(__instance.get).mockRejectedValue(new Error('boom'))

    await expect(appApi.getApps()).rejects.toThrow('boom')
  })
})
