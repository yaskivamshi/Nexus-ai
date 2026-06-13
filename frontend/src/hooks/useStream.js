// frontend/src/hooks/useStream.js
import { useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase' // FIXED: Added your Supabase client instance import

// CRITICAL FIX: Explicitly adding 'export' fixes the "does not provide an export named 'useStream'" error!
export function useStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const controllerRef = useRef(null) // AbortController to cancel stream

  const streamChat = useCallback(async ({ messages, model, onToken, onDone, onError }) => {
    // Cancel any in-progress stream before starting a new one
    if (controllerRef.current) controllerRef.current.abort()
    controllerRef.current = new AbortController()

    setIsStreaming(true)

    try {
      // FIXED: Dynamically fetch your active user session token before generating the request
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      // FIXED: Added fallback URL to guarantee server connections if build variables are cached
      const baseUrl = import.meta.env.VITE_API_URL || "https://nexus-ai-api-gamma.vercel.app"

      const response = await fetch(`${baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // FIXED: Appends your Supabase user verification key to clear backend authentication locks
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ messages, model }),
        signal: controllerRef.current.signal,
      })

      if (!response.ok) throw new Error(`HTTP ${response.ok ? 'OK' : response.status}`)

      // Read the stream chunk by chunk
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let chunkBuffer = '' // Keeps track of incomplete network chunks safely

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode new stream chunks and append to buffer tracking lines
        chunkBuffer += decoder.decode(value, { stream: true })
        const lines = chunkBuffer.split('\n')

        // Pop the last incomplete line fragment back into buffer storage
        chunkBuffer = lines.pop()

        for (const line of lines) {
          // Check for valid line start without using destructive trims
          if (!line.startsWith('data: ')) continue

          // Extract the exact payload after "data: " without stripping text margins
          const rawData = line.slice(6)
          if (!rawData.trim()) continue

          try {
            // SAFE PARSING: Parse the protected backend payload packet object
            const parsed = JSON.parse(rawData)

            if (parsed.content === '[DONE]') {
              if (onDone) onDone()
              break
            }

            // Yield the token exactly as the AI spit it out (with spaces & indents intact!)
            if (parsed.content && onToken) {
              onToken(parsed.content)
            }
          } catch (e) {
            // Fallback: If your backend occasionally slips a plain un-stringified text chunk
            const cleanFallback = rawData.trim()
            if (cleanFallback !== '[DONE]' && onToken) {
              onToken(cleanFallback + ' ')
            }
          }
        }
      }

      onDone?.()
    } catch (err) {
      if (err.name !== 'AbortError') {
        onError?.(err)
      }
    } finally {
      setIsStreaming(false)
      controllerRef.current = null
    }
  }, [])

  const stopStream = useCallback(() => {
    controllerRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return { streamChat, stopStream, isStreaming }
}