// frontend/src/components/landing/AISearchShowcase.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Globe, FileText, CheckCircle2, ArrowRight, Loader2, Link2, ExternalLink } from 'lucide-react'

const MOCK_SOURCES = [
  { id: 1, title: 'W3C Web Transport Wire Protocol Specification', domain: 'w3.org' },
  { id: 2, title: 'IETF RFC 9114: HTTP/3 Core Transport Framework', domain: 'ietf.org' },
  { id: 3, title: 'Vercel Edge Ingestion Engine Tuning Records', domain: 'vercel.com' }
]

export default function AISearchShowcase() {
  const [query, setQuery] = useState('')
  const [searchPhase, setSearchPhase] = useState('idle') // 'idle' | 'crawling' | 'synthesizing' | 'complete'
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    'Parsing query intent and extraction targets...',
    'Crawling w3.org and ietf.org live network sockets...',
    'Scraping payload arrays & cross-referencing citations...'
  ]

  const runNeuralSearch = (e) => {
    e.preventDefault()
    if (searchPhase === 'crawling' || searchPhase === 'synthesizing') return
    
    setQuery(query || 'Explain HTTP/3 connection pooling mechanics over edge endpoints')
    setSearchPhase('crawling')
    setActiveStep(0)

    // Cycle through live crawling logs step-by-step
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval)
          setSearchPhase('synthesizing')
          
          // Trigger final structured data composition drop
          setTimeout(() => {
            setSearchPhase('complete')
          }, 1500)
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }

  const clearCanvas = () => {
    setSearchPhase('idle')
    setQuery('')
    setActiveStep(0)
  }

  return (
    <section id="ai-search" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Grid Column: Perplexity-Style Interactive Console Workspace */}
        <div className="lg:col-span-7 w-full order-last lg:order-first">
          <div className="w-full rounded-2xl bg-[#0B1220]/80 border border-[#1E293B] shadow-glass-surface backdrop-blur-md overflow-hidden p-5 h-[450px] flex flex-col justify-between relative">
            
            {/* Top Interactive Submission Bar */}
            <form onSubmit={runNeuralSearch} className="shrink-0 relative">
              <div className="relative flex items-center bg-[#050816] border border-[#1E293B] rounded-xl focus-within:border-[#3B82F6]/40 transition-colors px-3 py-2.5">
                <Search className="w-4 h-4 text-[#94A3B8]/40 mr-2 shrink-0" />
                <input
                  type="text"
                  disabled={searchPhase !== 'idle'}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a real-time web-crawled research prompt..."
                  className="w-full bg-transparent text-xs text-white placeholder-[#94A3B8]/30 focus:outline-none pr-6 font-normal"
                />
                {searchPhase === 'idle' ? (
                  <button
                    type="submit"
                    className="absolute right-2 p-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  searchPhase === 'complete' && (
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="absolute right-2 text-[10px] font-mono text-[#94A3B8] hover:text-white border border-[#1E293B] px-2 py-1 rounded bg-[#0B1220]"
                    >
                      Clear
                    </button>
                  )
                )}
              </div>
            </form>

            {/* Main Interactive Content Canvas */}
            <div className="flex-1 my-4 overflow-y-auto pr-1 text-xs text-left">
              <AnimatePresence mode="wait">
                {searchPhase === 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-2 text-[#94A3B8]/30"
                  >
                    <Globe className="w-8 h-8 stroke-[1.2] animate-pulse-glow" />
                    <p className="font-mono text-[10px] uppercase tracking-wider">Neural Engine Standing By</p>
                  </motion.div>
                )}

                {(searchPhase === 'crawling' || searchPhase === 'synthesizing') && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="space-y-4 pt-2"
                  >
                    {/* Live Processing Step Indicators */}
                    <div className="space-y-2.5">
                      {steps.map((step, idx) => (
                        <div key={idx} className={`flex items-center gap-2.5 transition-all duration-300 ${idx > activeStep ? 'opacity-20' : 'opacity-100'}`}>
                          {idx < activeStep || searchPhase === 'synthesizing' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                          ) : idx === activeStep ? (
                            <Loader2 className="w-3.5 h-3.5 text-[#3B82F6] animate-spin shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-[#1E293B] shrink-0" />
                          )}
                          <span className={`text-[11px] font-mono ${idx === activeStep ? 'text-[#3B82F6]' : 'text-[#94A3B8]'}`}>{step}</span>
                        </div>
                      ))}
                    </div>

                    {searchPhase === 'synthesizing' && (
                      <div className="p-3 rounded-xl bg-[#3B82F6]/5 border border-[#3B82F6]/20 flex items-center gap-2 text-[#3B82F6] font-mono text-[11px] max-w-max animate-pulse">
                        <FileText className="w-3.5 h-3.5" /> Composing comprehensive response summary...
                      </div>
                    )}
                  </motion.div>
                )}

                {searchPhase === 'complete' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="space-y-4"
                  >
                    {/* Source citation cards top horizontal band */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-[#94A3B8]/40 uppercase tracking-wider font-mono">Scraped Citations Verified</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {MOCK_SOURCES.map((src) => (
                          <div key={src.id} className="p-2 rounded-lg bg-[#050816]/60 border border-[#1E293B] flex flex-col justify-between hover:border-[#3B82F6]/30 transition-colors cursor-pointer group">
                            <span className="font-medium text-white truncate text-[11px] mb-1">{src.title}</span>
                            <span className="text-[9px] font-mono text-[#3B82F6] flex items-center gap-1">
                              <Link2 className="w-2.5 h-2.5" /> {src.domain}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Synthesized Answer Output Box */}
                    <div className="p-4 rounded-xl bg-[#050816]/40 border border-[#1E293B] space-y-3 leading-relaxed">
                      <div className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Grounded Synthesis Complete
                      </div>
                      <p className="text-[#fafafa]/90 font-normal text-[11px]">
                        HTTP/3 replaces legacy TCP connection layouts by running over UDP via the <span className="text-[#3B82F6] font-mono bg-[#3B82F6]/5 px-1 rounded border border-[#3B82F6]/10">QUIC protocol</span> <span className="text-[#3B82F6] font-mono text-[10px] cursor-pointer hover:underline">[1]</span>. 
                        This change eliminates Head-of-Line blocking (HoL). If a packet drops, streams inside the transport socket continue processing unaffected <span className="text-[#3B82F6] font-mono text-[10px] cursor-pointer hover:underline">[2]</span>.
                      </p>
                      <p className="text-[#fafafa]/90 font-normal text-[11px]">
                        Connection pooling at the edge reuses TLS 1.3 cryptographic handshakes. This lowers connection establishment overhead down to a true **0-RTT** latency profile <span className="text-[#3B82F6] font-mono text-[10px] cursor-pointer hover:underline">[3]</span>.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Console Static Footer */}
            <div className="p-2.5 border-t border-[#1E293B]/60 flex items-center justify-between text-[10px] font-mono text-[#94A3B8]/40 shrink-0">
              <span>status: cluster-online</span>
              <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                open developer api docs <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>

          </div>
        </div>

        {/* Right Grid Column: Marketing Section Text Blocks */}
        <div className="lg:col-span-5 space-y-5">
          <div className="text-xs font-semibold text-[#3B82F6] uppercase tracking-widest font-mono">Real-Time Web Search</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Grounded AI Search. <br />Full Citations.
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-normal">
            Run precise research pipelines with confidence. Nexus scrapes and indexes live networks in real-time to generate factual, up-to-date responses tied directly to verifiable source citations.
          </p>
        </div>

      </div>
    </section>
  )
}