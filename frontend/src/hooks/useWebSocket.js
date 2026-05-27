import { useState, useEffect, useRef, useCallback } from 'react'

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 3000

export function useWebSocket(token) {
  const [data, setData]           = useState(null)
  const [status, setStatus]       = useState('connecting') // connecting | open | closed | error
  const wsRef                     = useRef(null)
  const reconnectAttempts         = useRef(0)
  const reconnectTimeout          = useRef(null)

  const connect = useCallback(() => {
    if (!token) return
    try {
      // Pasa el token en la URL del WebSocket
      const ws = new WebSocket(`${WS_BASE}?token=${token}`)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('open')
        reconnectAttempts.current = 0
      }

      ws.onmessage = (event) => {
        try {
          setData(JSON.parse(event.data))
        } catch (e) {
          console.error('Error parseando mensaje:', e)
        }
      }

      ws.onclose = () => {
        setStatus('closed')
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current += 1
          reconnectTimeout.current = setTimeout(connect, RECONNECT_DELAY)
        }
      }

      ws.onerror = () => {
        setStatus('error')
        ws.close()
      }

    } catch (e) {
      setStatus('error')
    }
  }, [token])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimeout.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { data, status }
}