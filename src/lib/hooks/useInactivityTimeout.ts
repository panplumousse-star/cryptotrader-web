import { useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'

// Inactivity timeout in minutes (1 hour)
const INACTIVITY_TIMEOUT_MINUTES = 60

// Warning before logout (5 minutes before timeout)
const WARNING_BEFORE_LOGOUT_MINUTES = 5

// Debounce time for activity updates (30 seconds to avoid excessive updates)
const ACTIVITY_UPDATE_DEBOUNCE_MS = 30000

// Check interval for inactivity (every 60 seconds)
const CHECK_INTERVAL_MS = 60000

/**
 * Hook to handle automatic logout after inactivity period.
 *
 * Features:
 * - Tracks user activity (mouse, keyboard, touch, scroll)
 * - Debounces activity updates to prevent excessive state changes
 * - Checks for inactivity every minute
 * - Auto-logout after 1 hour of inactivity
 * - Respects Page Visibility API (pauses when tab is hidden)
 *
 * @param timeoutMinutes - Optional custom timeout in minutes (default: 60)
 */
export function useInactivityTimeout(timeoutMinutes: number = INACTIVITY_TIMEOUT_MINUTES) {
  const { isAuthenticated, updateActivity, checkInactivity, logout } = useAuthStore()
  const lastUpdateRef = useRef<number>(0)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const warningShownRef = useRef<boolean>(false)

  // Debounced activity update
  const handleActivity = useCallback(() => {
    if (!isAuthenticated) return

    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateRef.current

    // Only update if enough time has passed (debounce)
    if (timeSinceLastUpdate >= ACTIVITY_UPDATE_DEBOUNCE_MS) {
      updateActivity()
      lastUpdateRef.current = now
      warningShownRef.current = false // Reset warning flag on activity
    }
  }, [isAuthenticated, updateActivity])

  // Check for inactivity and logout if needed
  const checkAndLogout = useCallback(() => {
    if (!isAuthenticated) return

    // Check if user has been inactive
    const isInactive = checkInactivity(timeoutMinutes)

    if (isInactive) {
      console.warn('[InactivityTimeout] User inactive for', timeoutMinutes, 'minutes. Logging out...')
      logout()

      // Show notification to user (optional - can be improved with toast/notification system)
      if (typeof window !== 'undefined') {
        alert('Votre session a expiré après 1 heure d\'inactivité. Veuillez vous reconnecter.')
        window.location.href = '/login'
      }
      return
    }

    // Check if we should show warning (5 minutes before timeout)
    const warningThreshold = timeoutMinutes - WARNING_BEFORE_LOGOUT_MINUTES
    const shouldWarn = checkInactivity(warningThreshold)

    if (shouldWarn && !warningShownRef.current) {
      warningShownRef.current = true
      console.warn('[InactivityTimeout] Warning: Session will expire in', WARNING_BEFORE_LOGOUT_MINUTES, 'minutes due to inactivity.')

      // Optional: Show toast notification instead of console
      // toast.warning(`Votre session expirera dans ${WARNING_BEFORE_LOGOUT_MINUTES} minutes d'inactivité.`)
    }
  }, [isAuthenticated, checkInactivity, logout, timeoutMinutes])

  // Handle visibility change (pause tracking when tab is hidden)
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Tab is hidden - stop checking (optional: could keep checking)
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    } else {
      // Tab is visible - resume checking
      if (isAuthenticated && !checkIntervalRef.current) {
        checkIntervalRef.current = setInterval(checkAndLogout, CHECK_INTERVAL_MS)
      }
    }
  }, [isAuthenticated, checkAndLogout])

  useEffect(() => {
    // Only activate if user is authenticated
    if (!isAuthenticated) {
      // Clear interval if user logs out
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
      return
    }

    // Activity events to track
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Start interval to check inactivity
    checkIntervalRef.current = setInterval(checkAndLogout, CHECK_INTERVAL_MS)

    // Initial activity update
    updateActivity()
    lastUpdateRef.current = Date.now()

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    }
  }, [isAuthenticated, handleActivity, handleVisibilityChange, checkAndLogout, updateActivity])
}
