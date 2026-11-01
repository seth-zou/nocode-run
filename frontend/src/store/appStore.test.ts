import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../store/appStore'
import type { App } from '../store/appStore'

const makeApp = (overrides: Partial<App> = {}): App => ({
  id: 'app-1',
  name: 'Test App',
  description: 'A test app',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

describe('appStore', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test.
    useAppStore.setState({
      apps: [],
      currentApp: null,
      loading: false,
      error: null,
    })
  })

  describe('initial state', () => {
    it('starts with an empty app list and no current app', () => {
      const state = useAppStore.getState()
      expect(state.apps).toEqual([])
      expect(state.currentApp).toBeNull()
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('setApps', () => {
    it('replaces the entire app list', () => {
      const apps = [makeApp({ id: '1', name: 'A' }), makeApp({ id: '2', name: 'B' })]
      useAppStore.getState().setApps(apps)
      expect(useAppStore.getState().apps).toEqual(apps)
      expect(useAppStore.getState().apps).toHaveLength(2)
    })
  })

  describe('addApp', () => {
    it('appends a new app to the existing list', () => {
      const existing = makeApp({ id: '1', name: 'Existing' })
      useAppStore.getState().setApps([existing])

      const newApp = makeApp({ id: '2', name: 'New' })
      useAppStore.getState().addApp(newApp)

      const apps = useAppStore.getState().apps
      expect(apps).toHaveLength(2)
      expect(apps[1]).toEqual(newApp)
    })

    it('adds to an empty list correctly', () => {
      const app = makeApp({ name: 'First' })
      useAppStore.getState().addApp(app)
      expect(useAppStore.getState().apps).toEqual([app])
    })
  })

  describe('deleteApp', () => {
    it('removes the app with the matching id', () => {
      const apps = [
        makeApp({ id: '1', name: 'Keep' }),
        makeApp({ id: '2', name: 'Remove' }),
        makeApp({ id: '3', name: 'Keep2' }),
      ]
      useAppStore.getState().setApps(apps)

      useAppStore.getState().deleteApp('2')

      const remaining = useAppStore.getState().apps
      expect(remaining).toHaveLength(2)
      expect(remaining.map((a) => a.id)).toEqual(['1', '3'])
    })

    it('is a no-op when the id does not exist', () => {
      const apps = [makeApp({ id: '1', name: 'A' })]
      useAppStore.getState().setApps(apps)
      useAppStore.getState().deleteApp('nonexistent')
      expect(useAppStore.getState().apps).toHaveLength(1)
    })
  })

  describe('setCurrentApp', () => {
    it('sets the current app', () => {
      const app = makeApp({ name: 'Current' })
      useAppStore.getState().setCurrentApp(app)
      expect(useAppStore.getState().currentApp).toEqual(app)
    })

    it('can clear the current app by passing null', () => {
      const app = makeApp({ name: 'Current' })
      useAppStore.getState().setCurrentApp(app)
      useAppStore.getState().setCurrentApp(null)
      expect(useAppStore.getState().currentApp).toBeNull()
    })
  })

  describe('loading and error flags', () => {
    it('sets and clears the loading flag', () => {
      useAppStore.getState().setLoading(true)
      expect(useAppStore.getState().loading).toBe(true)
      useAppStore.getState().setLoading(false)
      expect(useAppStore.getState().loading).toBe(false)
    })

    it('sets and clears the error message', () => {
      useAppStore.getState().setError('Something went wrong')
      expect(useAppStore.getState().error).toBe('Something went wrong')
      useAppStore.getState().setError(null)
      expect(useAppStore.getState().error).toBeNull()
    })
  })

  describe('selecting a slice of state', () => {
    it('lets consumers subscribe to a single field with a selector', () => {
      useAppStore.getState().setApps([makeApp({ id: '9', name: 'Selector' })])
      // Simulate the selector pattern used in components:
      // const { apps } = useAppStore()
      expect(useAppStore((s) => s.apps)).toHaveLength(1)
    })
  })
})
