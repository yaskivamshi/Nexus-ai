// frontend/src/components/landing/VoiceAIDemo.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square, Radio, Sparkles } from 'lucide-react'

export default function VoiceAIDemo() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  useEffect(() => {
    if (!isRecording) return
    setTranscript('Listening for structural command parameters...')
    
    const t1 = setTimeout(() => setTranscript('"Analyze recent market data grids..."'), 1200)
    const t2 = setTimeout(() => setTranscript('Nexus Processing: "Running comprehensive web vector matrices over edge nodes..."'), 2600)
    
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [isRecording])

  return (
    <section id="voice-demo" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-5 space-y-5">
          <div className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-widest font-mono">Voice AI Pipeline</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Continuous Voice <br />Inference.</h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Speak naturally. Nexus streams raw audio arrays through low-latency transformers to execute workflows hands-free.
          </p>
        </div>

        <div className="lg:col-span-7 w-full">
          <div className="w-full rounded-2xl bg-[#0B1220]/80 border border-[#1E293B] shadow-glass-surface p-6 h-[400px] flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
            
            <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] font-mono text-[#94A3B8]">
              <Radio className={`w-3 h-3 ${isRecording ? 'text-red-400 animate-pulse' : ''}`} /> status: engine-standby
            </div>

            {/* Glowing Audio Node Node */}
            <div className="relative flex items-center justify-center w-36 h-36">
              {isRecording && (
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/40"
                />
              )}
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all z-10 cursor-pointer ${
                  isRecording ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-[#050816] border-[#1E293B] text-[#3B82F6] hover:border-[#3B82F6]/40'
                }`}
              >
                {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {/* Simulated Live Transcript Text Area */}
            <div className="w-full max-w-sm h-14 bg-[#050816]/60 border border-[#1E293B] rounded-xl p-3 text-center flex items-center justify-center text-[11px] font-mono text-[#94A3B8]">
              {isRecording ? (
                <span className="text-white flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#3B82F6] animate-spin" /> {transcript}</span>
              ) : (
                'Click microphone node to initialize ambient voice stream'
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}