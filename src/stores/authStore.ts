import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'

export interface User {
  id: string
  email: string
  name: string
  mfaEnabled: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  lastActivityTime: number | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateActivity: () => void
  checkInactivity: (timeoutMinutes: number) => boolean
}

// Custom cookie storage for Zustand persist
// This ensures cookies are accessible by Next.js middleware
const cookieStorage = {
  getItem: (name: string): string | null => {
    return Cookies.get(name) ?? null
  },
  setItem: (name: string, value: string): void => {
    Cookies.set(name, value, {
      expires: 7, // 7 days
      sameSite: 'strict', // Strict for financial application security
      secure: process.env.NODE_ENV === 'production',
    })
  },
  removeItem: (name: string): void => {
    Cookies.remove(name)
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      lastActivityTime: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => set({ token }),

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          lastActivityTime: Date.now(),
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          lastActivityTime: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      updateActivity: () => set({ lastActivityTime: Date.now() }),

      checkInactivity: (timeoutMinutes: number) => {
        const { lastActivityTime, isAuthenticated } = get()
        if (!isAuthenticated || !lastActivityTime) {
          return false
        }
        const inactiveTime = Date.now() - lastActivityTime
        const timeoutMs = timeoutMinutes * 60 * 1000
        return inactiveTime >= timeoutMs
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        lastActivityTime: state.lastActivityTime,
      }),
      onRehydrateStorage: () => (state) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AuthStore] State rehydrated from cookies:', state ? { hasToken: !!state.token, hasUser: !!state.user } : 'empty')
        }
      },
    }
  )
)
