// frontend/src/hooks/useResumeStream.js
import { useRef, useCallback, useState } from 'react'
import { useResumeStore } from '../store/resumeStore'
import { useChatStore } from '../store/chatStore' // Pulls currently active dropdown model
import { toast } from 'react-hot-toast'

export function useResumeStream() {
  const controllerRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  
  // Connect cleanly to your unified state storage actions
  const store = useResumeStore()

  const startRewrite = useCallback(async () => {
    // Read exact state properties using your current store structure
    const { resumeText, jobDescription } = useResumeStore.getState()
    const { selectedModel } = useChatStore.getState() // Snag current model choice (e.g. groq/ or openrouter/)

    if (!resumeText || !jobDescription) {
      toast.error('Resume text and job description are required to optimize context')
      return
    }

    // Cancel any existing running stream requests safely
    if (controllerRef.current) controllerRef.current.abort()
    controllerRef.current = new AbortController()

    setIsStreaming(true)
    store.startRewrite()

    try {
      // Targets your production route path matching the backend endpoint layout
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resume/rewrite/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
          model: selectedModel || 'openrouter/free'
        }),
        signal: controllerRef.current.signal,
      })

      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let chunkBuffer = '' // Safe tracking for cut network text packages

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        chunkBuffer += decoder.decode(value, { stream: true })
        const lines = chunkBuffer.split('\n')
        
        // Push incomplete line remnants safely back to buffer space
        chunkBuffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          // FIXED: Extract payload without calling .trim() destructively on rawData 
          // to protect space tokens (" ") and paragraph indentation characters from disappearing!
          const rawData = line.slice(6)
          if (rawData === '') continue

          try {
            // SAFE PARSING: Unwraps our protected JSON chunk mapping configuration
            const parsed = JSON.parse(rawData)

            if (parsed.content === '[DONE]') {
              store.finishRewrite()
              toast.success('Resume optimized successfully!')
              return
            }

            // Detect server error loops embedded natively inside SSE data structures
            if (typeof parsed.content === 'string' && parsed.content.startsWith('[ERROR]')) {
              const cleanedError = parsed.content.replace('[ERROR]', '').trim()
              store.setRewriteError(cleanedError)
              toast.error(cleanedError || 'Stream cutoff by server validation rules.')
              return
            }

            // Yield clean token text exactly down to your store action pipeline
            if (parsed.content) {
              store.appendRewrittenToken(parsed.content)
            }
          } catch (jsonErr) {
            // Fallback safety valve for raw un-stringified text buffers
            const lineText = rawData.trim()
            if (lineText === '[DONE]') {
              store.finishRewrite()
              return
            } else if (lineText.startsWith('[ERROR]')) {
              store.setRewriteError(lineText)
              return
            } else if (rawData) {
              // Yield raw line exactly with layout padding intact
              store.appendRewrittenToken(rawData)
            }
          }
        }
      }

      store.finishRewrite()
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[useResumeStream Exception]', err)
        store.setRewriteError(err.message || 'Network stream dropped.')
        toast.error(`Optimization failed: ${err.message}`)
      }
    } finally {
      setIsStreaming(false)
      controllerRef.current = null
    }
  }, [store])

  const cancelRewrite = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort()
      controllerRef.current = null
    }
    store.setRewriteError(null)
    store.finishRewrite()
    setIsStreaming(false)
  }, [store])

  return { startRewrite, cancelRewrite, isStreaming }
}