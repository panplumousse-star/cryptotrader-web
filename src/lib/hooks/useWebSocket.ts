'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useAuthStore } from '@/stores'
import type { WebSocketMessage } from '@/types'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001'

type MessageHandler = (message: WebSocketMessage) => void

interface UseWebSocketOptions {
  channels?: string[]
  onMessage?: MessageHandler
  autoConnect?: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { channels = [], onMessage, autoConnect = true } = options
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const token = useAuthStore((state) => state.token)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      // SECURITY: Never send token in URL - use WebSocket message instead
      wsRef.current = new WebSocket(WS_URL)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0

        // SECURITY: Send token via WebSocket message after connection
        if (token) {
          wsRef.current?.send(JSON.stringify({
            action: 'authenticate',
            token: token
          }))
        }

        // Subscribe to channels
        channels.forEach((channel) => {
          wsRef.current?.send(JSON.stringify({ action: 'subscribe', channel }))
        })
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage
          onMessage?.(message)
        } catch {
          console.error('Failed to parse WebSocket message')
        }
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)

        // Auto reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        }
      }

      wsRef.current.onerror = () => {
        setError('WebSocket connection error')
      }
    } catch {
      setError('Failed to create WebSocket connection')
    }
  }, [token, channels, onMessage])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  const send = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  const subscribe = useCallback((channel: string) => {
    send({ action: 'subscribe', channel })
  }, [send])

  const unsubscribe = useCallback((channel: string) => {
    send({ action: 'unsubscribe', channel })
  }, [send])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    isConnected,
    error,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
  }
}
