import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock axios before importing the api module so axios.create receives our mock.
const mockInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockInstance),
  },
}))

import { appApi } from '../services/api'
import axios from 'axios'

describe('appApi service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates the axios instance with baseURL /api and a 10s timeout', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: '/api',
      timeout: 10000,
    })
  })

  it('registers request and response interceptors', () => {
    expect(mockInstance.interceptors.request.use).toHaveBeenCalledTimes(1)
    expect(mockInstance.interceptors.response.use).toHaveBeenCalledTimes(1)
  })

  it('getApps calls GET /apps', async () => {
    const apps = [{ id: '1', name: 'A', description: '', createdAt: '', updatedAt: '' }]
    mockInstance.get.mockResolvedValueOnce(apps)

    const result = await appApi.getApps()

    expect(mockInstance.get).toHaveBeenCalledWith('/apps')
    expect(result).toEqual(apps)
  })

  it('createApp calls POST /apps with the provided data', async () => {
    const created = { id: '2', name: 'New', description: 'desc', createdAt: '', updatedAt: '' }
    mockInstance.post.mockResolvedValueOnce(created)

    const payload = { name: 'New', description: 'desc' }
    const result = await appApi.createApp(payload)

    expect(mockInstance.post).toHaveBeenCalledWith('/apps', payload)
    expect(result).toEqual(created)
  })

  it('deleteApp calls DELETE /apps/:id', async () => {
    mockInstance.delete.mockResolvedValueOnce(undefined)

    await appApi.deleteApp('app-123')

    expect(mockInstance.delete).toHaveBeenCalledWith('/apps/app-123')
  })

  it('getApp calls GET /apps/:id', async () => {
    const app = { id: 'app-1', name: 'A', description: '', createdAt: '', updatedAt: '' }
    mockInstance.get.mockResolvedValueOnce(app)

    const result = await appApi.getApp('app-1')

    expect(mockInstance.get).toHaveBeenCalledWith('/apps/app-1')
    expect(result).toEqual(app)
  })

  it('updateApp calls PUT /apps/:id with partial app data', async () => {
    const updated = { id: 'app-1', name: 'Updated', description: '', createdAt: '', updatedAt: '' }
    mockInstance.put.mockResolvedValueOnce(updated)

    const payload = { name: 'Updated' }
    const result = await appApi.updateApp('app-1', payload)

    expect(mockInstance.put).toHaveBeenCalledWith('/apps/app-1', payload)
    expect(result).toEqual(updated)
  })

  it('propagates errors from the underlying request', async () => {
    const error = new Error('Network error')
    mockInstance.get.mockRejectedValueOnce(error)

    await expect(appApi.getApps()).rejects.toThrow('Network error')
  })
})
