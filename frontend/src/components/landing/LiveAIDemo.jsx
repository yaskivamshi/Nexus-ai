// frontend/src/components/landing/LiveAIDemo.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, CornerDownLeft, Terminal, Check, Copy, RefreshCw } from 'lucide-react'

const SUGGESTIONS = [
  "Optimize an engineering database pipeline architecture",
  "Write an optimized React 19 concurrent hook handler",
  "Debug a race condition loop inside a Go routine map"
]

const SIMULATED_RESPONSE = `### Optimized Dynamic Hook Architecture

To handle high-throughput telemetry data arrays inside concurrent rendering spaces without dropping frame rates, register an isolated memory-retained ref model:

\`\`\`javascript
// custom Concurrent Buffer Engine Hook
export function useTelemetryStream(dataSource, allocationSize) {
  const [metrics, setMetrics] = useState([]);
  const telemetryBuffer = useRef([]);

  useEffect(() => {
    const channel = dataSource.subscribe((payload) => {
      telemetryBuffer.current.push(payload);
      if (telemetryBuffer.current.length >= allocationSize) {
        setMetrics([...telemetryBuffer.current]);
        telemetryBuffer.current = []; // Clear local allocation pools
      }
    });
    return () => channel.unsubscribe();
  }, [dataSource, allocationSize]);

  return metrics;
}
\`\`\`

### Sources & Reference Citations
* [1] Vercel Core Telemetry Pipelines — Engine Optimizations 
* [2] React 19 Engine Internals — Fiber Allocation Handlers`

export default function LiveAIDemo() {
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [hasRun, setHasRun] = useState(false)
  const [copied, setCopied] = useState(false)

  const triggerSimulation = (promptText) => {
    if (isStreaming) return
    const targetedPrompt = promptText || input || "Optimize an engineering database pipeline architecture"
    
    setInput(targetedPrompt)
    setIsStreaming(true)
    setHasRun(true)
    setStreamedText('')

    let currentIdx = 0
    const tokenChunks = SIMULATED_RESPONSE.split(" ")

    const interval = setInterval(() => {
      if (currentIdx < tokenChunks.length) {
        setStreamedText((prev) => prev + (currentIdx === 0 ? "" : " ") + tokenChunks[currentIdx])
        currentIdx++
      } else {
        clearInterval(interval)
        setIsStreaming(false)
      }
    }, 65) // Simulates lightning-fast streaming speeds (like Claude 3.5 Sonnet or GPT-4o)
  }

  const handleCopyAxis = () => {
    navigator.clipboard.writeText(SIMULATED_RESPONSE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="demo" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Grid Column: Descriptive Marketing Messaging */}
        <div className="lg:col-span-5 space-y-5">
          <div className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-widest font-mono">Live Simulation</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Unified Interface. <br />Real-Time Speed.
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-normal">
            Interact with our cross-model routing engine. Nexus parses input complexities, shifts parameters dynamically into optimal configurations, and streams responses instantly.
          </p>

          {/* Quick-select Suggested Prompts List */}
          <div className="space-y-2.5 pt-2">
            <p className="text-[10px] font-bold text-[#94A3B8]/40 uppercase tracking-wider font-mono">Select a sample workflow</p>
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                disabled={isStreaming}
                onClick={() => triggerSimulation(sug)}
                className="w-full text-left p-3 text-xs rounded-xl bg-[#0B1220]/40 border border-[#1E293B]/60 hover:border-[#3B82F6]/40 hover:bg-[#0B1220] transition-all text-[#94A3B8] hover:text-white flex items-center justify-between group disabled:opacity-50"
              >
                <span className="truncate pr-4">{sug}</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 text-[#3B82F6]" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Grid Column: High-Fidelity Interactive Chat Screen Mockup */}
        <div className="lg:col-span-7 w-full">
          <div className="w-full rounded-2xl bg-[#0B1220]/80 border border-[#1E293B] shadow-glass-surface backdrop-blur-md overflow-hidden flex flex-col h-[460px]">
            
            {/* Header Status Controls Bar */}
            <div className="px-4 py-3 bg-[#050816]/60 border-b border-[#1E293B]/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6] flex items-center justify-center animate-pulse">
                  <div className="w-1 h-1 rounded-full bg-[#3B82F6]" />
                </div>
                <span className="text-[11px] font-mono tracking-wider text-[#94A3B8]">nexus-routing-v1.6</span>
              </div>

              {hasRun && !isStreaming && (
                <button 
                  onClick={() => triggerSimulation()}
                  className="text-[10px] font-medium text-[#94A3B8] hover:text-white flex items-center gap-1 bg-[#050816] border border-[#1E293B] px-2 py-1 rounded-md transition-colors"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Re-run Stream
                </button>
              )}
            </div>

            {/* Simulated Chat History Canvas Viewport */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
              <AnimatePresence mode="wait">
                {!hasRun ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-2 text-[#94A3B8]/40"
                  >
                    <Terminal className="w-8 h-8 stroke-[1.2]" />
                    <p className="font-mono text-[11px]">System standby. Enter a pipeline command above to spin up weights.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-5">
                    {/* Spoken/Typed User Message Row */}
                    <div className="flex gap-3 justify-end">
                      <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#fafafa] px-3.5 py-2 rounded-xl rounded-tr-sm max-w-[85%] font-medium">
                        {input}
                      </div>
                    </div>

                    {/* AI Streaming Response Core Bubble Block */}
                    {(streamedText || isStreaming) && (
                      <div className="flex gap-3 items-start justify-start animate-fade-up">
                        <div className="w-6 h-6 rounded-md bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] flex items-center justify-center text-[10px] font-bold tracking-tight shrink-0">
                          N
                        </div>
                        <div className="bg-[#050816]/40 border border-[#1E293B]/60 text-[#fafafa]/90 px-4 py-3 rounded-xl rounded-tl-sm max-w-[88%] space-y-4 relative leading-relaxed font-normal group">
                          
                          {/* Copy code floating hook trigger button */}
                          {!isStreaming && (
                            <button 
                              onClick={handleCopyAxis}
                              className="absolute top-2.5 right-2.5 p-1 rounded bg-[#0B1220] border border-[#1E293B] text-[#94A3B8] hover:text-white transition-colors"
                            >
                              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          )}

                          {/* Render streaming code text layers */}
                          <div className="whitespace-pre-wrap font-sans prose prose-invert prose-xs max-w-none">
                            {streamedText}
                            {isStreaming && (
                              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#8B5CF6] animate-pulse-dot align-middle" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Persistent Ground Input Submission Tray */}
            <form 
              onSubmit={(e) => { e.preventDefault(); if (input.trim()) triggerSimulation() }}
              className="p-3 bg-[#050816]/40 border-t border-[#1E293B]/80 shrink-0"
            >
              <div className="relative flex items-center bg-[#050816] border border-[#1E293B] rounded-xl focus-within:border-[#3B82F6]/40 transition-colors px-3 py-2">
                <input
                  type="text"
                  disabled={isStreaming}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask any code logic or prompt parameters..."
                  className="w-full bg-transparent text-xs text-white placeholder-[#94A3B8]/30 focus:outline-none pr-8 font-normal"
                />
                <button
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  className="absolute right-2 p-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white disabled:opacity-30 disabled:hover:bg-[#3B82F6] transition-all cursor-pointer"
                >
                  <CornerDownLeft className="w-3 h-3" />
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </section>
  )
}