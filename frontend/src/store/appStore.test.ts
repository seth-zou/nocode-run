import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../store/appStore'
import type { App } from '../store/appStore'

const mockApp: App = {
  id: '1',
  name: 'Test App',
  description: 'A test app',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const mockApp2: App = {
  id: '2',
  name: 'Second App',
  description: 'Another app',
  createdAt: '2024-01-02T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
}

// Zustand stores hold global state between tests, so reset the store
// before each test to keep them independent.
beforeEach(() => {
  useAppStore.setState({
    apps: [],
    currentApp: null,
    loading: false,
    error: null,
  })
})

describe('appStore', () => {
  describe('initial state', () => {
    it('starts with an empty apps array', () => {
      expect(useAppStore.getState().apps).toEqual([])
    })

    it('starts with currentApp null', () => {
      expect(useAppStore.getState().currentApp).toBeNull()
    })

    it('starts with loading false', () => {
      expect(useAppStore.getState().loading).toBe(false)
    })

    it('starts with error null', () => {
      expect(useAppStore.getState().error).toBeNull()
    })
  })

  describe('setApps', () => {
    it('replaces the apps array', () => {
      useAppStore.getState().addApp(mockApp)
      useAppStore.getState().setApps([mockApp, mockApp2])

      expect(useAppStore.getState().apps).toEqual([mockApp, mockApp2])
    })

    it('sets an empty array when given one', () => {
      useAppStore.getState().addApp(mockApp)
      useAppStore.getState().setApps([])

      expect(useAppStore.getState().apps).toEqual([])
    })
  })

  describe('addApp', () => {
    it('adds an app to an empty list', () => {
      useAppStore.getState().addApp(mockApp)

      expect(useAppStore.getState().apps).toEqual([mockApp])
    })

    it('appends an app without removing existing ones', () => {
      useAppStore.getState().addApp(mockApp)
      useAppStore.getState().addApp(mockApp2)

      expect(useAppStore.getState().apps).toEqual([mockApp, mockApp2])
    })

    it('does not mutate the previous state array', () => {
      useAppStore.getState().addApp(mockApp)
      const firstSnapshot = useAppStore.getState().apps
      useAppStore.getState().addApp(mockApp2)

      // The previous array reference must be untouched (Zustand immutability).
      expect(firstSnapshot).toEqual([mockApp])
      expect(useAppStore.getState().apps).not.toBe(firstSnapshot)
    })
  })

  describe('deleteApp', () => {
    it('removes the app with the given id', () => {
      useAppStore.getState().addApp(mockApp)
      useAppStore.getState().addApp(mockApp2)
      useAppStore.getState().deleteApp('1')

      expect(useAppStore.getState().apps).toEqual([mockApp2])
    })

    it('leaves the list unchanged when the id does not exist', () => {
      useAppStore.getState().addApp(mockApp)
      useAppStore.getState().deleteApp('nonexistent')

      expect(useAppStore.getState().apps).toEqual([mockApp])
    })

    it('handles deleting from an empty list', () => {
      useAppStore.getState().deleteApp('1')

      expect(useAppStore.getState().apps).toEqual([])
    })
  })

  describe('setCurrentApp', () => {
    it('sets currentApp to a given app', () => {
      useAppStore.getState().setCurrentApp(mockApp)

      expect(useAppStore.getState().currentApp).toBe(mockApp)
    })

    it('resets currentApp to null', () => {
      useAppStore.getState().setCurrentApp(mockApp)
      useAppStore.getState().setCurrentApp(null)

      expect(useAppStore.getState().currentApp).toBeNull()
    })
  })

  describe('setLoading', () => {
    it('sets loading to true', () => {
      useAppStore.getState().setLoading(true)

      expect(useAppStore.getState().loading).toBe(true)
    })

    it('sets loading back to false', () => {
      useAppStore.getState().setLoading(true)
      useAppStore.getState().setLoading(false)

      expect(useAppStore.getState().loading).toBe(false)
    })
  })

  describe('setError', () => {
    it('sets an error message', () => {
      useAppStore.getState().setError('something went wrong')

      expect(useAppStore.getState().error).toBe('something went wrong')
    })

    it('clears the error when given null', () => {
      useAppStore.getState().setError('error')
      useAppStore.getState().setError(null)

      expect(useAppStore.getState().error).toBeNull()
    })
  })

  describe('combined workflow', () => {
    it('supports a realistic create -> delete -> error flow', () => {
      const store = useAppStore.getState

      // Start loading while fetching
      store().setLoading(true)
      store().setApps([mockApp, mockApp2])
      store().setLoading(false)

      expect(store().apps).toHaveLength(2)
      expect(store().loading).toBe(false)

      // User creates a new app
      store().addApp({ ...mockApp2, id: '3', name: 'Third' })
      expect(store().apps).toHaveLength(3)

      // User deletes one
      store().deleteApp('1')
      expect(store().apps).toHaveLength(2)
      expect(store().apps.map((a) => a.id)).toEqual(['2', '3'])

      // An error occurs
      store().setError('网络错误')
      expect(store().error).toBe('网络错误')

      // Error cleared
      store().setError(null)
      expect(store().error).toBeNull()
    })
  })
})
