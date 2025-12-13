'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/lib/api/client'
import { useInactivityTimeout } from '@/lib/hooks/useInactivityTimeout'

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, user, setUser, logout, setLoading } = useAuthStore()
  const [isRestoring, setIsRestoring] = useState(false)

  // Enable inactivity timeout tracking
  useInactivityTimeout()

  useEffect(() => {
    // Skip if already restoring or if user is already set
    if (isRestoring || user) {
      setLoading(false)
      return
    }

    // If we have a token but no user, try to restore user from token
    if (token && !user) {
      setIsRestoring(true)
      setLoading(true)

      apiClient
        .get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const restoredUser = {
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            mfaEnabled: response.data.mfa_enabled || false,
          }
          setUser(restoredUser)
          console.log('[AuthProvider] User restored from token')
        })
        .catch((error) => {
          console.error('[AuthProvider] Failed to restore user, logging out:', error)
          logout()
        })
        .finally(() => {
          setIsRestoring(false)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [token, user, setUser, logout, setLoading, isRestoring])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
