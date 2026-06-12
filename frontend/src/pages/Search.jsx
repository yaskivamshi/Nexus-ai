// frontend/src/pages/Search.jsx
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Globe, Loader2, Square, ExternalLink, Copy, Check, Terminal, Command } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ScrollArea } from '../components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useChatStore } from '../store/chatStore'
import { toast } from 'react-hot-toast'

const SEARCH_SUGGESTIONS = [
  'Latest AI models released in 2025',
  'How does quantum computing work?',
  'Best practices for React performance',
  'Climate change solutions 2025',
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [copied, setCopied] = useState(false)
  const controllerRef = useRef(null)
  const { selectedModel } = useChatStore()

  // Dynamic Citation Extraction Helper Engine
  const extractCitations = (text) => {
    if (!text) return []
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const matches = text.match(urlRegex) || []
    return [...new Set(matches)].map((url, index) => {
      try {
        const domain = new URL(url).hostname.replace('www.', '')
        return { id: index + 1, url, domain }
      } catch (e) {
        return { id: index + 1, url, domain: 'source link' }
      }
    })
  }

  const citations = extractCitations(answer)

  const handleSearch = useCallback(async (q) => {
    const searchQuery = q || query.trim()
    if (!searchQuery || isSearching) return

    setQuery(searchQuery)
    setAnswer('')
    setIsSearching(true)
    setHasSearched(true)
    controllerRef.current = new AbortController()

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search/stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery, model: selectedModel }),
          signal: controllerRef.current.signal,
        }
      )

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        
        for (const line of text.split('\n')) {
          if (line.startsWith('data: ')) {
            // FIX: Remove .trim() from the whole slice payload to keep text spaces intact
            const data = line.slice(6)
            
            if (data.trim() === '[DONE]') {
              break
            }
            
            if (data) {
              accumulated += data
              setAnswer(accumulated)
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Search failed. Check backend connection.')
        setAnswer('Search failed. Please try again.')
      }
    } finally {
      setIsSearching(false)
    }
  }, [query, isSearching, selectedModel])

  const stopSearch = () => {
    controllerRef.current?.abort()
    setIsSearching(false)
  }

  const handleCopy = () => {
    if (!answer) return
    navigator.clipboard.writeText(answer)
    setCopied(true)
    toast.success('Grounded summary copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-[#020617] text-[#f8fafc]">

      {/* ── SEARCH LAYERING HUD TRAY ── */}
      <div className="border-b border-white/5 p-6 bg-[#0f172a]/40 backdrop-blur-md shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]/40" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Query real-time web instances for indexed contextual summaries..."
                className="pl-10 h-11 bg-[#0b0f19] border-white/10 rounded-xl text-slate-200 placeholder-[#94a3b8]/20 focus-visible:ring-1 focus-visible:ring-[#3b82f6]/40 focus:outline-none text-sm font-normal"
              />
            </div>
            <Button
              onClick={isSearching ? stopSearch : () => handleSearch()}
              disabled={!isSearching && !query.trim()}
              className="h-11 px-6 gap-2 text-xs font-semibold font-mono uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all shrink-0"
              variant={isSearching ? 'destructive' : 'default'}
            >
              {isSearching ? (
                <><Square className="w-3.5 h-3.5 fill-current animate-pulse text-white" /> Stop</>
              ) : (
                <><Search className="w-3.5 h-3.5 text-white" /> Search</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── CORE ENGINE GRAPH SCREEN AREA ── */}
      <ScrollArea className="flex-1 w-full">
        <div className="max-w-3xl mx-auto p-6 space-y-6">

          {/* Suggestions Layer Interface (Shown before execution) */}
          {!hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-4 text-left"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-[#94a3b8]/40 uppercase tracking-widest">
                <Command className="w-3 h-3" /> Sample Directives Available
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SEARCH_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-[#111827]/40 hover:bg-[#1e293b]/50 text-left text-xs text-[#cbd5e1] hover:text-white transition-all group cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-[#3b82f6]/60 group-hover:text-[#3b82f6] group-hover:scale-105 transition-transform shrink-0" />
                    <span className="truncate pr-2 font-medium">{s}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Active Processing Loader Line */}
          {isSearching && !answer && (
            <div className="flex items-center gap-3 text-[#94a3b8]/60 py-10 justify-center font-mono text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#3b82f6]" />
              <span>Crawling data indexes and grounding web vectors...</span>
            </div>
          )}

          {/* Answer Output Matrix */}
          <AnimatePresence>
            {answer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-left"
              >
                {/* Status indicator pill ribbon */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20 px-2.5 py-1 rounded-md">
                      <Globe className="w-3 h-3" /> Web answer synthesis
                    </Badge>
                    {isSearching && (
                      <span className="text-[11px] font-mono text-[#94a3b8]/40 flex items-center gap-1 animate-pulse">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> Ingesting token arrays...
                      </span>
                    )}
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopy}
                    className="h-7 text-[10px] font-mono text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-md gap-1 px-2 border border-white/5 bg-[#111827]/40 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>

                {/* Grounded Citation Grid (Parsed dynamically out of token lists) */}
                {citations.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold font-mono text-[#94a3b8]/40 uppercase tracking-widest">Verified Citations</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {citations.map((src) => (
                        <a
                          key={src.id}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-[#111827]/40 border border-white/5 hover:border-[#3b82f6]/30 transition-colors flex flex-col justify-between group min-w-0 text-left"
                        >
                          <span className="text-[11px] font-medium text-white truncate mb-1 group-hover:text-[#3b82f6] transition-colors">{src.domain}</span>
                          <span className="text-[9px] font-mono text-[#3b82f6] flex items-center gap-0.5 truncate">
                            [{src.id}] View instance verification <ExternalLink className="w-2 h-2 ml-0.5" />
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Synthesis Content Box */}
                <Card className="p-5 bg-[#111827]/40 border-white/5 shadow-xl backdrop-blur-sm relative overflow-hidden">
                  {/* FIX: Added whitespace-pre-wrap and break-words classes to strictly honor streaming breaks */}
                  <div className="prose prose-sm max-w-none space-y-3.5 pr-1 text-left break-words whitespace-pre-wrap
                    prose-p:text-[#e2e8f0] prose-p:leading-relaxed prose-p:font-normal prose-p:text-xs sm:prose-p:text-sm
                    prose-headings:text-white prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-1.5
                    prose-strong:text-[#3b82f6] prose-strong:font-semibold
                    prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1.5 prose-li:text-[#cbd5e1] prose-li:text-xs sm:prose-li:text-sm
                    prose-code:text-[#3b82f6] prose-code:bg-[#3b82f6]/10 prose-code:px-1 prose-code:rounded">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#3b82f6] underline inline-flex items-center gap-0.5 font-mono text-xs hover:text-white transition-colors break-all"
                          >
                            {children}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ),
                      }}
                    >
                      {answer}
                    </ReactMarkdown>
                  </div>
                  {isSearching && (
                    <span className="inline-block w-1.5 h-4 bg-[#3b82f6] animate-pulse rounded-sm mt-3 align-middle" />
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
}