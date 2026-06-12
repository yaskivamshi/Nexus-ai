// frontend/src/components/landing/DocumentIntelligence.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileUp, Loader2, CheckCircle2, Shield, Sparkles, AlertCircle } from 'lucide-react'

export default function DocumentIntelligence() {
  const [status, setStatus] = useState('idle') // 'idle' | 'uploading' | 'analyzing' | 'done'
  const [fileName, setFileName] = useState('')
  const [progress, setProgress] = useState(0)

  const simulateAnalysisLifecycle = () => {
    if (status !== 'idle') return
    
    setFileName('Q4_Financial_Execution_Report.pdf')
    setStatus('uploading')
    setProgress(0)

    // Simulate file upload progress
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          setStatus('analyzing')
          // Simulate backend AI extraction engine delay
          setTimeout(() => {
            setStatus('done')
          }, 2000)
          return 100
        }
        return prev + 20
      })
    }, 150)
  }

  const resetUploader = () => {
    setStatus('idle')
    setFileName('')
    setProgress(0)
  }

  return (
    <section id="document-intelligence" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Premium Interactive Showcase Display */}
        <div className="lg:col-span-7 w-full order-last lg:order-first">
          <div className="w-full rounded-2xl bg-[#0B1220]/80 border border-[#1E293B] shadow-glass-surface backdrop-blur-md overflow-hidden p-6 h-[440px] flex flex-col justify-between">
            
            <AnimatePresence mode="wait">
              {/* STATE 1: Dropzone Active Target Entry Area */}
              {status === 'idle' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onClick={simulateAnalysisLifecycle}
                  className="flex-1 border border-dashed border-[#1E293B] hover:border-[#3B82F6]/50 rounded-xl flex flex-col items-center justify-center text-center p-8 bg-[#050816]/30 cursor-pointer group transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0B1220] border border-[#1E293B] group-hover:border-[#3B82F6]/30 flex items-center justify-center text-[#94A3B8] group-hover:text-[#3B82F6] transition-colors mb-4 shadow-sm">
                    <FileUp className="w-5 h-5 group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1">Drag & drop your asset data pool</h3>
                  <p className="text-xs text-[#94A3B8]/60 max-w-xs leading-relaxed">
                    Supports PDF, DOCX, CSV, or raw JSON data configurations up to 100MB per execution.
                  </p>
                  <div className="mt-5 px-3 py-1.5 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg text-[11px] font-medium text-[#3B82F6]">
                    Click to browse simulation file
                  </div>
                </motion.div>
              )}

              {/* STATE 2 & 3: File Transmission Upload / Analysis Layer */}
              {(status === 'uploading' || status === 'analyzing') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6"
                >
                  <div className="w-14 h-14 rounded-full bg-[#050816] border border-[#1E293B] flex items-center justify-center relative">
                    <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
                  </div>
                  
                  <div className="space-y-1.5 max-w-xs">
                    <p className="text-xs font-mono text-[#94A3B8] truncate">{fileName}</p>
                    <h4 className="text-sm font-medium text-white">
                      {status === 'uploading' ? `Uploading vectors... ${progress}%` : 'Parsing semantics & indexing graph...'}
                    </h4>
                  </div>

                  <div className="w-full max-w-xs h-1 bg-[#1E293B] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                      initial={{ width: '0%' }}
                      animate={{ width: status === 'uploading' ? `${progress}%` : '100%' }}
                      transition={{ ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}

              {/* STATE 4: Structural Insights Complete Output Workspace Grid */}
              {status === 'done' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col justify-between h-full space-y-4 text-xs"
                >
                  {/* File Metadata Info Strip */}
                  <div className="flex items-center justify-between border-b border-[#1E293B]/60 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="font-mono text-[#94A3B8] truncate max-w-xs">{fileName}</span>
                    </div>
                    <button 
                      onClick={resetUploader}
                      className="text-[10px] text-[#94A3B8] hover:text-white border border-[#1E293B] bg-[#050816] px-2 py-1 rounded-md transition-colors"
                    >
                      Reset Upload
                    </button>
                  </div>

                  {/* Summary Dashboard Grid Panels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
                    <div className="p-3 rounded-xl bg-[#050816]/40 border border-[#1E293B]/60 space-y-1.5 text-left">
                      <div className="flex items-center gap-1 text-[#3B82F6] font-medium font-mono text-[11px] uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" /> Executive Summary
                      </div>
                      <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                        Q4 showed a 14.2% acceleration in enterprise operational efficiency, driven by automated data ingestion layers. Overhead margins decreased by 6.8% sequentially.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#050816]/40 border border-[#1E293B]/60 space-y-1.5 text-left">
                      <div className="flex items-center gap-1 text-[#8B5CF6] font-medium font-mono text-[11px] uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3" /> Core Action Items
                      </div>
                      <ul className="text-[#94A3B8] text-[11px] space-y-1 list-disc list-inside">
                        <li>Migrate remaining legacy storage weights.</li>
                        <li>Reallocate unspent infrastructure funds.</li>
                        <li>Audit active endpoint encryption matrices.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#3B82F6]/5 border border-[#3B82F6]/20 flex items-center gap-2.5 text-left text-[11px] text-[#94A3B8]">
                    <Shield className="w-4 h-4 text-[#3B82F6] shrink-0" />
                    <span>Document vectorized securely. Zero-data retention protocols active.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Right Column: Platform Information Block Text Layout */}
        <div className="lg:col-span-5 space-y-5">
          <div className="text-xs font-semibold text-[#3B82F6] uppercase tracking-widest font-mono">Knowledge Extraction</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Document <br />Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-normal">
            Drop raw assets right into the browser layer. Our retrieval mechanics break down text walls, extracting immediate, structured summaries, key operational indices, and semantic actions within seconds.
          </p>
        </div>

      </div>
    </section>
  )
}