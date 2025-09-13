import { create } from 'zustand'

export interface App {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

interface AppState {
  apps: App[]
  currentApp: App | null
  loading: boolean
  error: string | null
  
  // Actions
  setApps: (apps: App[]) => void
  addApp: (app: App) => void
  deleteApp: (id: string) => void
  setCurrentApp: (app: App | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  apps: [],
  currentApp: null,
  loading: false,
  error: null,
  
  setApps: (apps) => set({ apps }),
  addApp: (app) => set((state) => ({ apps: [...state.apps, app] })),
  deleteApp: (id) => set((state) => ({ 
    apps: state.apps.filter(app => app.id !== id) 
  })),
  setCurrentApp: (app) => set({ currentApp: app }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}))