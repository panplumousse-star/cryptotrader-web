'use client'

import { useEffect } from 'react'
import { useSettingsStore, Theme } from '@/stores/settingsStore'

export function useTheme() {
  const theme = useSettingsStore((state) => state.display.theme)
  const setDisplaySetting = useSettingsStore((state) => state.setDisplaySetting)

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (resolvedTheme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
    }

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      applyTheme(systemTheme)

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light')
      }
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      applyTheme(theme)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setDisplaySetting('theme', newTheme)
  }

  const toggleTheme = () => {
    const root = window.document.documentElement
    const isDark = root.classList.contains('dark')
    setTheme(isDark ? 'light' : 'dark')
  }

  const resolvedTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }
    return theme
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    resolvedTheme: resolvedTheme(),
  }
}
