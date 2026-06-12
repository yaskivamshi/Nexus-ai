// frontend/src/components/landing/FinalCTA.tsx
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function FinalCTA() {
  return (
    <section className="relative w-full py-32 px-6 bg-[#050816] overflow-hidden z-10 font-sans text-center">
      {/* Neon Layer Glow Ring Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/5 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto p-12 sm:p-16 rounded-2xl bg-gradient-to-b from-[#0B1220] to-[#050816] border border-[#1E293B] shadow-glass-surface space-y-6 relative">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 text-[10px] font-mono tracking-wider text-[#8B5CF6] uppercase mx-auto">
          <Sparkles className="w-3 h-3" /> Accelerate Production
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white max-w-xl mx-auto leading-tight">
          Ready to Transform Your Workflow?
        </h2>
        
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg mx-auto leading-relaxed">
          Join thousands of users using AI every day to save time, boost productivity, and accomplish more.
        </p>

        <div className="pt-4">
          <button 
            onClick={() => window.location.href = '/login'}
            className="h-11 px-6 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white font-medium text-xs tracking-wide rounded-xl inline-flex items-center gap-2 shadow-md shadow-primary/10 transition-transform active:scale-98"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}