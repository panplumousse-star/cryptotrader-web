import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api'

export type Theme = 'light' | 'dark' | 'system'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'BTC'

export interface NotificationSettings {
  priceAlerts: boolean
  tradeExecuted: boolean
  botStatus: boolean
  dailySummary: boolean
  email: boolean
  push: boolean
}

export interface DisplaySettings {
  theme: Theme
  currency: Currency
  language: string
  compactMode: boolean
}

export interface ApiKeysStatus {
  hasKeys: boolean
  apiKeyId: string | null
  label: string | null
  isVerified: boolean
  lastVerifiedAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

interface SettingsState {
  notifications: NotificationSettings
  display: DisplaySettings
  apiKeys: ApiKeysStatus | null
  apiKeysLoading: boolean
  apiKeysError: string | null
  setNotificationSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => void
  setDisplaySetting: <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => void
  resetSettings: () => void
  // API Keys actions
  fetchApiKeys: () => Promise<void>
  saveApiKeys: (apiKey: string, apiSecret: string, label?: string) => Promise<boolean>
  deleteApiKeys: () => Promise<boolean>
  testApiKeys: (apiKey?: string, apiSecret?: string) => Promise<{ success: boolean; message: string; accountCount?: number }>
}

const defaultNotifications: NotificationSettings = {
  priceAlerts: true,
  tradeExecuted: true,
  botStatus: true,
  dailySummary: false,
  email: true,
  push: true,
}

const defaultDisplay: DisplaySettings = {
  theme: 'system',
  currency: 'USD',
  language: 'fr',
  compactMode: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      notifications: defaultNotifications,
      display: defaultDisplay,
      apiKeys: null,
      apiKeysLoading: false,
      apiKeysError: null,

      setNotificationSetting: (key, value) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        })),

      setDisplaySetting: (key, value) =>
        set((state) => ({
          display: { ...state.display, [key]: value },
        })),

      resetSettings: () =>
        set({
          notifications: defaultNotifications,
          display: defaultDisplay,
        }),

      fetchApiKeys: async () => {
        set({ apiKeysLoading: true, apiKeysError: null })
        try {
          const response = await apiClient.get('/user/api-keys')
          const data = response.data
          set({
            apiKeys: {
              hasKeys: data.has_keys,
              apiKeyId: data.api_key_id,
              label: data.label,
              isVerified: data.is_verified,
              lastVerifiedAt: data.last_verified_at,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            },
            apiKeysLoading: false,
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch API keys'
          set({ apiKeysError: errorMessage, apiKeysLoading: false })
        }
      },

      saveApiKeys: async (apiKey: string, apiSecret: string, label?: string) => {
        set({ apiKeysLoading: true, apiKeysError: null })
        try {
          const response = await apiClient.post('/user/api-keys', {
            api_key: apiKey,
            api_secret: apiSecret,
            label: label || 'Coinbase CDP',
          })
          const data = response.data
          set({
            apiKeys: {
              hasKeys: data.has_keys,
              apiKeyId: data.api_key_id,
              label: data.label,
              isVerified: data.is_verified,
              lastVerifiedAt: data.last_verified_at,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            },
            apiKeysLoading: false,
          })
          return true
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save API keys'
          set({ apiKeysError: errorMessage, apiKeysLoading: false })
          return false
        }
      },

      deleteApiKeys: async () => {
        set({ apiKeysLoading: true, apiKeysError: null })
        try {
          await apiClient.delete('/user/api-keys')
          set({
            apiKeys: {
              hasKeys: false,
              apiKeyId: null,
              label: null,
              isVerified: false,
              lastVerifiedAt: null,
              createdAt: null,
              updatedAt: null,
            },
            apiKeysLoading: false,
          })
          return true
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete API keys'
          set({ apiKeysError: errorMessage, apiKeysLoading: false })
          return false
        }
      },

      testApiKeys: async (apiKey?: string, apiSecret?: string) => {
        set({ apiKeysLoading: true, apiKeysError: null })
        try {
          const payload = apiKey && apiSecret
            ? { api_key: apiKey, api_secret: apiSecret }
            : {}
          const response = await apiClient.post('/user/api-keys/test', payload)
          set({ apiKeysLoading: false })
          // Refresh status if testing stored keys
          if (!apiKey && !apiSecret) {
            get().fetchApiKeys()
          }
          return {
            success: response.data.success,
            message: response.data.message,
            accountCount: response.data.account_count,
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to test API keys'
          set({ apiKeysError: errorMessage, apiKeysLoading: false })
          return { success: false, message: errorMessage }
        }
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        display: state.display,
      }),
    }
  )
)
