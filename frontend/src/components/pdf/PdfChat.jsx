// frontend/src/components/pdf/PdfChat.jsx
// The actual Q&A chat interface once a PDF is loaded
import { useCallback, useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Square, Sparkles, FileSearch,
  BookOpen, User2, Bot, Lightbulb, Copy, Check
} from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { ScrollArea } from '../ui/scroll-area'
import { Badge } from '../ui/badge'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { usePdfStore } from '../../store/pdfStore'
import { useChatStore } from '../../store/chatStore'
import { cn } from '../../lib/utils'
import { toast } from 'react-hot-toast'

// Quick-action prompt starters for PDF chat
const PDF_STARTERS = [
  { icon: BookOpen,   label: 'Summarize',         query: 'summarize' },
  { icon: Sparkles,   label: 'Extract skills',       query: 'skills' },
  { icon: Lightbulb,  label: 'Interview questions',  query: 'interview_questions' },
]

export default function PdfChat() {
  const { activeSession, messages, addMessage, updateLastMessage } = usePdfStore()
  const { selectedModel } = useChatStore()
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const controllerRef = useRef(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const [copiedId, setCopiedId] = useState(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  const handleInput = (e) => {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 160) + 'px'
    }
  }

  const triggerCopy = (id, txt) => {
    navigator.clipboard.writeText(txt)
    setCopiedId(id)
    toast.success('Response copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── Send a regular question ──────────────────────────────────────────────
  const handleSend = useCallback(async (questionText) => {
    const q = questionText ?? input.trim()
    if (!q || isStreaming || !activeSession) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    // Add user message
    addMessage({ role: 'user', content: q, id: crypto.randomUUID() })

    // Add placeholder assistant message
    addMessage({ role: 'assistant', content: '', id: crypto.randomUUID() })

    setIsStreaming(true)
    controllerRef.current = new AbortController()

    try {
      const history = usePdfStore.getState().messages
        .slice(0, -1)
        .map(({ role, content }) => ({ role, content }))

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pdf/chat/stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collection_name: activeSession.collection_name,
            question: q,
            chat_history: history,
            model: selectedModel,
          }),
          signal: controllerRef.current.signal,
        }
      )

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.slice(6).trim()
            if (!rawData) continue

            try {
              const parsed = JSON.parse(rawData)
              if (parsed.content === '[DONE]') break
              if (parsed.content) {
                accumulated += parsed.content
                updateLastMessage(accumulated)
              }
            } catch (e) {
              if (rawData !== '[DONE]') {
                accumulated += rawData
                updateLastMessage(accumulated)
              }
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to get response. Check your backend connection.')
        updateLastMessage('Sorry, something went wrong. Please try again.')
      }
    } finally {
      setIsStreaming(false)
    }
  }, [input, isStreaming, activeSession, selectedModel, addMessage, updateLastMessage])

  // ── Run a special query (summarize, skills, interview Qs) ────────────────
  const handleSpecialQuery = useCallback(async (queryType, label) => {
    if (isStreaming || !activeSession) return

    addMessage({ role: 'user', content: `[${label}]`, id: crypto.randomUUID() })
    addMessage({ role: 'assistant', content: '', id: crypto.randomUUID() })

    setIsStreaming(true)
    controllerRef.current = new AbortController()

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pdf/special-query/stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collection_name: activeSession.collection_name,
            model: selectedModel,
            query_type: queryType,
          }),
          signal: controllerRef.current.signal,
        }
      )

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.slice(6).trim()
            if (!rawData) continue

            try {
              const parsed = JSON.parse(rawData)
              if (parsed.content === '[DONE]') break
              if (parsed.content) {
                accumulated += parsed.content
                updateLastMessage(accumulated)
              }
            } catch (e) {
              if (rawData !== '[DONE]') {
                accumulated += rawData
                updateLastMessage(accumulated)
              }
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Query failed.')
        updateLastMessage('Something went wrong.')
      }
    } finally {
      setIsStreaming(false)
    }
  }, [isStreaming, activeSession, selectedModel, addMessage, updateLastMessage])

  const stopStream = () => {
    controllerRef.current?.abort()
    setIsStreaming(false)
  }

  if (!activeSession) return null

  return (
    <div className="flex flex-col h-full bg-[#020617]">

      {/* PDF Session Header */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileSearch className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate text-white">{activeSession.filename}</p>
            <div className="flex gap-1.5 mt-0.5">
              <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 bg-white/5 border border-white/5 text-[#94a3b8]">
                {activeSession.page_count} pages
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 bg-white/5 border border-white/5 text-[#94a3b8]">
                {activeSession.chunk_count} chunks indexed
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2 px-5 py-2.5 border-b border-white/5 bg-[#0b0f19]/40 overflow-x-auto shrink-0 scrollbar-none items-center">
        {PDF_STARTERS.map(({ icon: Icon, label, query }) => (
          <Button
            key={query}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs whitespace-nowrap h-8 rounded-lg bg-[#111827] hover:bg-[#1e293b] border border-white/5 text-[#cbd5e1] hover:text-white transition-all"
            onClick={() => handleSpecialQuery(query, label)}
            disabled={isStreaming}
          >
            <Icon className="w-3.5 h-3.5 text-[#3b82f6]" />
            {label}
          </Button>
        ))}
      </div>

      {/* Message list workspace view */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="w-full h-full py-4">
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground px-8 space-y-2"
              >
                <Bot className="w-8 h-8 text-[#94a3b8]/20 animate-pulse" />
                <p className="text-xs font-mono uppercase tracking-wider text-[#94a3b8]/40">Console Awaiting Ingestion</p>
                <p className="text-xs text-[#94a3b8]/30 max-w-xs">Ask anything about your PDF, or deploy an automated breakdown chip above.</p>
              </motion.div>
            )}

            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex gap-3.5 px-6 py-3.5 w-full text-left',
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 shadow-sm',
                  msg.role === 'user'
                    ? 'bg-[#3b82f6] border-[#3b82f6]/30 text-white'
                    : 'bg-gradient-to-br from-[#8b5cf6]/10 to-[#3b82f6]/5 border-[#8b5cf6]/20 text-[#8b5cf6] font-bold text-[10px]'
                )}>
                  {msg.role === 'user' ? <User2 className="w-3.5 h-3.5" /> : 'N'}
                </div>

                {/* Bubble Container */}
                <div className={cn(
                  'rounded-2xl px-5 py-4 text-xs sm:text-sm relative leading-relaxed group transition-all text-left',
                  msg.role === 'user'
                    ? 'bg-[#3b82f6] text-white rounded-tr-sm max-w-[85%] shadow-md font-medium'
                    : 'bg-[#111827] border border-white/10 text-[#f1f5f9] rounded-tl-sm max-w-[88%] font-normal shadow-xl'
                )}>
                  
                  {/* FLOATING ACTION HUDS: Fixed operator logic check here */}
                  {msg.role !== 'user' && msg.content && (
                    <button
                      type="button"
                      onClick={() => triggerCopy(msg.id, msg.content)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#020617]/80 backdrop-blur-sm border border-white/5 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-all duration-150 hover:text-white hover:border-white/10 cursor-pointer z-10"
                      title="Copy response payload"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {msg.role === 'user' ? (
                    <p className="text-white font-normal">{msg.content || '...'}</p>
                  ) : (
                    /* EXPLICIT TYPOGRAPHY MATRIX: Overrides dark low-contrast text loops */
                    <div className="prose prose-sm max-w-none space-y-3 pr-4
                      prose-p:text-[#e2e8f0] prose-p:leading-relaxed prose-p:font-normal
                      prose-headings:text-white prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
                      prose-strong:text-[#3b82f6] prose-strong:font-semibold
                      prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1.5 prose-li:text-[#cbd5e1]
                      prose-code:text-[#3b82f6] prose-code:bg-[#3b82f6]/10 prose-code:px-1 prose-code:rounded">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content || '▍'}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </ScrollArea>
      </div>

      {/* Chat Input */}
      <div className="px-5 pb-5 pt-2 bg-[#020617]">
        <div className={cn(
          'flex items-end gap-2 p-2 rounded-xl border border-white/10 bg-[#0b0f19] transition-all',
          'focus-within:border-[#3b82f6]/40 focus-within:ring-1 focus-within:ring-[#3b82f6]/10'
        )}>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask about this PDF..."
            className="flex-1 min-h-[36px] max-h-[160px] resize-none border-0 bg-transparent focus-visible:ring-0 text-xs sm:text-sm placeholder-[#94a3b8]/30 py-1.5 focus:outline-none font-normal text-white"
            rows={1}
            disabled={isStreaming}
          />
          <Button
            size="icon"
            className="w-8 h-8 shrink-0 rounded-xl cursor-pointer"
            onClick={isStreaming ? stopStream : () => handleSend()}
            disabled={!isStreaming && !input.trim()}
            variant={isStreaming ? 'destructive' : 'default'}
          >
            {isStreaming ? (
              <Square className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}