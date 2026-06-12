// frontend/src/components/landing/Hero.tsx
import { motion } from 'framer-motion'
import { Sparkles, Play, ArrowRight, Bot, Cpu, Zap, Activity } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center pt-24 px-6 overflow-hidden z-10 font-sans">
      
      {/* Absolute Ambient Background Radial Neon Blur Overlay Flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10 rounded-full blur-3xl opacity-40 pointer-events-none animate-pulse-glow" />

      <div className="max-w-5xl mx-auto text-center space-y-7 relative z-10">
        
        {/* Eyebrow Platform Badge pill element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/5 text-[11px] font-medium tracking-wide text-[#3B82F6]"
        >
          <Sparkles className="w-3 h-3" /> Multi-Model AI Platform
        </motion.div>

        {/* Headline block containing gradient animation parameters */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
        >
          Your Complete <br />
          <span className="bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] hover:bg-right transition-all duration-1000">
            AI Command Center
          </span>
        </motion.h1>

        {/* Platform Sub-description text column layout block mapping specs */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-normal tracking-wide"
        >
          Chat with multiple AI models, search the web, analyze documents, optimize resumes, generate code, create content, understand images, and automate workflows — all from one intelligent platform.
        </motion.p>

        {/* Hero Interactive Action Buttons Call-To-Action array footer layout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90 font-medium text-xs tracking-wide flex items-center justify-center gap-2 shadow-md shadow-primary/10 transition-all active:scale-98"
          >
            <span>Start Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          
          <button className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#121214] border border-[#27272a] hover:border-[#71717a]/50 text-[#fafafa] font-medium text-xs tracking-wide flex items-center justify-center gap-2 transition-colors duration-150">
            <Play className="w-3.5 h-3.5 text-[#06B6D4] fill-current" />
            <span>Watch Demo</span>
          </button>
        </motion.div>

        {/* ── METRICS COUNTERS BLOCK ROW ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-14 border-t border-[#27272a]/30"
        >
          {[
            { label: 'AI Models Connected', value: '3+', icon: Bot },
            { label: 'Intelligent Modalities', value: '10+', icon: Cpu },
            { label: 'Free Tier Standard Access', value: '100%', icon: Zap },
            { label: 'Platform Availability', value: '24/7', icon: Activity }
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="p-4 rounded-xl bg-[#0B1220]/40 border border-[#27272a]/40 text-left space-y-1.5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold tracking-tight text-white">{stat.value}</span>
                  <Icon className="w-3.5 h-3.5 text-[#3B82F6]/70" />
                </div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]/80 leading-none">{stat.label}</p>
              </div>
            )
          })}
        </motion.div>

      </div>
    </section>
  )
}