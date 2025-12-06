import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

interface SettingsState {
  notifications: NotificationSettings
  display: DisplaySettings
  setNotificationSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => void
  setDisplaySetting: <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => void
  resetSettings: () => void
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
    (set) => ({
      notifications: defaultNotifications,
      display: defaultDisplay,

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
    }),
    {
      name: 'settings-storage',
    }
  )
)
