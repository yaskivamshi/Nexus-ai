// frontend/src/components/landing/ResumeATS.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle2, AlertTriangle, RefreshCw, Briefcase, ChevronRight, TrendingUp } from 'lucide-react'

export default function ResumeATS() {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [hasOptimized, setHasOptimized] = useState(false)

  const triggerOptimizationMatrix = () => {
    if (isOptimizing) return
    setIsOptimizing(true)
    
    setTimeout(() => {
      setIsOptimizing(false)
      setHasOptimized(true)
    }, 2500) // Simulates background processing and parsing
  }

  return (
    <section id="resume-ats" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Descriptive Product Copy */}
        <div className="lg:col-span-5 space-y-5">
          <div className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-widest font-mono">ATS Optimization</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Engineer the <br />Perfect Resume.
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-normal">
            Optimize your resume for applicant tracking systems. Nexus compares your skills against real job descriptions, uncovers critical formatting issues, and helps you rephrase achievements for maximum impact.
          </p>

          <div className="pt-2">
            <button
              disabled={isOptimizing}
              onClick={triggerOptimizationMatrix}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-medium text-xs tracking-wide flex items-center gap-2 shadow-md shadow-primary/10 hover:opacity-95 transition-opacity disabled:opacity-40 cursor-pointer"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Optimizing Resume Content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Optimize Resume Score</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Premium Dashboard Interface Mockup */}
        <div className="lg:col-span-7 w-full">
          <div className="w-full rounded-2xl bg-[#0B1220]/80 border border-[#1E293B] shadow-glass-surface backdrop-blur-md overflow-hidden p-6 h-[440px] flex flex-col justify-between relative">
            
            {/* Top Row: Core Score Dashboard Meter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#1E293B]/60 pb-5 shrink-0">
              <div className="p-3.5 rounded-xl bg-[#050816]/60 border border-[#1E293B] text-center space-y-1 relative overflow-hidden">
                <span className="text-[10px] font-bold text-[#94A3B8]/50 uppercase tracking-wider block">Keyword Match</span>
                <div className="text-2xl font-extrabold tracking-tight transition-all duration-1000">
                  <motion.span className={hasOptimized ? "text-green-400" : "text-red-400"}>
                    {hasOptimized ? "92%" : "54%"}
                  </motion.span>
                </div>
                {/* Micro trend indicator */}
                <div className="absolute right-2 top-2">
                  {hasOptimized ? <TrendingUp className="w-3 h-3 text-green-400" /> : <AlertTriangle className="w-3 h-3 text-red-400/60" />}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#050816]/60 border border-[#1E293B] text-left space-y-1 sm:col-span-2">
                <span className="text-[10px] font-bold text-[#94A3B8]/50 uppercase tracking-wider block">Target Role</span>
                <div className="flex items-center gap-2 text-white">
                  <Briefcase className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span className="text-xs font-semibold">Senior Frontend Engineer</span>
                </div>
              </div>
            </div>

            {/* Middle Row: Content Stream Layout Views */}
            <div className="flex-1 my-4 overflow-y-auto pr-1 space-y-3 text-xs">
              <AnimatePresence mode="wait">
                {!hasOptimized && !isOptimizing ? (
                  // Pre-Optimization Interface Log Lines
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="space-y-2.5 text-left"
                  >
                    <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider font-mono flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> 3 Missing Core Skills Detected
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Concurrent Rendering', 'Web Vitals Optimization', 'State Management'].map((word) => (
                        <span key={word} className="px-2 py-1 rounded bg-red-500/5 border border-red-500/10 text-[10px] font-mono text-red-400">
                          ✕ {word}
                        </span>
                      ))}
                    </div>
                    
                    <div className="p-3 rounded-xl bg-[#050816]/30 border border-[#1E293B] space-y-1 mt-2">
                      <p className="text-[10px] font-bold text-[#94A3B8]/40 uppercase tracking-wider">Original Experience Line</p>
                      <p className="text-[#94A3B8] italic font-serif text-[11px]">"I write JavaScript web code and manage simple application deployments."</p>
                    </div>
                  </motion.div>
                ) : isOptimizing ? (
                  // Active Optimization State Loader Layout
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-3"
                  >
                    <div className="flex items-center gap-2 text-xs font-mono text-[#3B82F6] bg-[#3B82F6]/5 border border-[#3B82F6]/20 px-3 py-1.5 rounded-xl animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Tailoring bullet points and aligning target skills...</span>
                    </div>
                  </motion.div>
                ) : (
                  // Post-Optimization Successful Resolution Screen
                  <motion.div 
                    initial={{ opacity: 0, y: 6 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 text-left"
                  >
                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Requirements Met Successfully
                    </p>
                    
                    <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 space-y-1.5">
                      <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider font-mono">Suggested Rewrite</p>
                      <p className="text-white text-[11px] leading-relaxed">
                        "Architected scalable frontend solutions using modern <span className="text-[#3B82F6] font-medium underline decoration-primary/40">State Management</span>, optimizing core <span className="text-[#3B82F6] font-medium underline decoration-primary/40">Web Vitals</span> to improve loading speeds by 34% across high-traffic platforms."
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-mono bg-green-500/5 border border-green-500/10 px-2 py-1 rounded-md w-max">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Target skills integrated naturally
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Row Footer Notification Strip */}
            <div className="p-3 rounded-xl bg-[#050816]/60 border border-[#1E293B] flex items-center justify-between text-[11px] text-[#94A3B8] shrink-0 text-left">
              <span className="truncate pr-4">Optimized copy ready for download.</span>
              <div className="flex items-center gap-1 text-[#3B82F6] font-medium font-mono text-[10px] uppercase cursor-pointer hover:underline shrink-0">
                <span>View Full Dashboard</span> <ChevronRight className="w-3 h-3" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}