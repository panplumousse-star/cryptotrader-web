import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api'
import type { ChartType } from './portfolioStore'

// Debounce timer for saving chart preferences
let chartPreferencesSaveTimer: ReturnType<typeof setTimeout> | null = null

export type Theme = 'light' | 'dark' | 'system'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'BTC'
export type AutoRefreshInterval = null | 60000 | 300000 | 600000 | 3600000

export interface PortfolioChartPreferences {
  chartType: ChartType
  timeRange: {
    type: 'relative' | 'absolute'
    relativeValue?: string
  }
  autoRefreshInterval?: AutoRefreshInterval
}

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
  userSettingsLoading: boolean
  userSettingsError: string | null
  hasLoadedUserSettings: boolean
  portfolioVisibleAssets: string[]
  portfolioChartPreferences: PortfolioChartPreferences | null
  setNotificationSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => void
  setDisplaySetting: <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => void
  resetSettings: () => void
  setPortfolioVisibleAssets: (symbols: string[]) => void
  fetchUserSettings: () => Promise<void>
  saveUserSettings: () => Promise<boolean>
  savePortfolioChartPreferences: (prefs: PortfolioChartPreferences) => void
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
      userSettingsLoading: false,
      userSettingsError: null,
      hasLoadedUserSettings: false,
      portfolioVisibleAssets: [],
      portfolioChartPreferences: null,

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

      setPortfolioVisibleAssets: (symbols: string[]) =>
        set({
          // Deduplicate while preserving order
          portfolioVisibleAssets: Array.from(new Set(symbols)),
        }),

      fetchUserSettings: async () => {
        set({ userSettingsLoading: true, userSettingsError: null })
        try {
          const response = await apiClient.get('/user/settings')
          const symbols: string[] = response.data?.portfolio_visible_assets || []
          const chartPrefs = response.data?.portfolio_chart_preferences || null

          // Parse chart preferences from backend
          let portfolioChartPreferences: PortfolioChartPreferences | null = null
          if (chartPrefs) {
            portfolioChartPreferences = {
              chartType: chartPrefs.chart_type || 'area',
              timeRange: {
                type: chartPrefs.time_range?.type || 'relative',
                relativeValue: chartPrefs.time_range?.relative_value,
              },
              autoRefreshInterval: chartPrefs.auto_refresh_interval ?? null,
            }
          }

          set({
            portfolioVisibleAssets: Array.from(new Set(symbols)),
            portfolioChartPreferences,
            userSettingsLoading: false,
            hasLoadedUserSettings: true,
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user settings'
          set({
            userSettingsError: errorMessage,
            userSettingsLoading: false,
            hasLoadedUserSettings: false,
          })
        }
      },

      saveUserSettings: async () => {
        set({ userSettingsLoading: true, userSettingsError: null })
        try {
          const { portfolioVisibleAssets, portfolioChartPreferences } = get()

          // Build payload with chart preferences in snake_case for backend
          const payload: Record<string, unknown> = {
            portfolio_visible_assets: portfolioVisibleAssets,
          }

          if (portfolioChartPreferences) {
            payload.portfolio_chart_preferences = {
              chart_type: portfolioChartPreferences.chartType,
              time_range: {
                type: portfolioChartPreferences.timeRange.type,
                relative_value: portfolioChartPreferences.timeRange.relativeValue,
              },
            }
          }

          await apiClient.post('/user/settings', payload)
          set({
            userSettingsLoading: false,
            hasLoadedUserSettings: true,
          })
          return true
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save user settings'
          set({
            userSettingsError: errorMessage,
            userSettingsLoading: false,
          })
          return false
        }
      },

      savePortfolioChartPreferences: (prefs: PortfolioChartPreferences) => {
        // Update state immediately
        set({ portfolioChartPreferences: prefs })

        // Debounce the API call to avoid excessive requests
        if (chartPreferencesSaveTimer) {
          clearTimeout(chartPreferencesSaveTimer)
        }

        chartPreferencesSaveTimer = setTimeout(async () => {
          try {
            const { portfolioVisibleAssets } = get()
            await apiClient.post('/user/settings', {
              portfolio_visible_assets: portfolioVisibleAssets,
              portfolio_chart_preferences: {
                chart_type: prefs.chartType,
                time_range: {
                  type: prefs.timeRange.type,
                  relative_value: prefs.timeRange.relativeValue,
                },
                auto_refresh_interval: prefs.autoRefreshInterval ?? null,
              },
            })
          } catch (error) {
            // Silently fail - preferences will be re-saved on next change
            console.error('Failed to save chart preferences:', error)
          }
        }, 500)
      },

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
        portfolioVisibleAssets: state.portfolioVisibleAssets,
        portfolioChartPreferences: state.portfolioChartPreferences,
      }),
    }
  )
)
