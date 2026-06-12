// frontend/src/components/landing/About.jsx
import { motion } from 'framer-motion'
import { Shield, Target, Users, Code2, Sparkles, Command } from 'lucide-react'

const METRICS = [
  { value: '200ms', label: 'Inference Latency' },
  { value: 'Zero', label: 'Data Retention' },
  { value: '100%', label: 'Cloud Redundancy' },
  { value: '24/7', label: 'Mesh Availability' }
]

const VALUES = [
  { 
    icon: Target, 
    title: 'Precision Routing', 
    desc: 'We believe fragmentation is an engineering failure. Our systems are built to parse intent and execute tasks with absolute structural efficiency.' 
  },
  { 
    icon: Shield, 
    title: 'Zero-Knowledge Security', 
    desc: 'Data privacy is non-negotiable. We enforce strict enterprise-grade guardrails where your data never leaves volatile memory.' 
  },
  { 
    icon: Users, 
    title: 'Distributed Excellence', 
    desc: 'Operating without physical workspace constraints, our consultant-driven mesh network coordinates seamlessly to deploy top-tier code architectures.' 
  }
]

export default function About() {
  return (
    <section id="about" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      {/* Ambient decorative glow ring */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-20">
        
        {/* ── PART 1: THE MISSION GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/5 text-[10px] font-mono tracking-wider text-[#3B82F6] uppercase">
              <Command className="w-3 h-3" /> Our Profile
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              A Intelligent <br />Command Center.
            </h2>
          </div>
          
          <div className="lg:col-span-7 space-y-6 text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-normal">
            <p>
              Nexus AI was founded on a simple premise: professional technical workflows shouldn't be scattered across a dozen fragmented interfaces. We engineered a cohesive ecosystem that unifies conversational logic, spatial vision calculations, real-time cited web indices, and deep document parsing under a single secure platform layer.
            </p>
            <p>
              Headquartered as a modern, office-less enterprise within Hyderabad's growing technology cluster, we operate an ultra-lean, consultant-driven operational model. By eliminating physical overhead, we redirect 100% of our focus toward refining core algorithm parameters, ensuring your workflows execute with elite speed and precision.
            </p>
          </div>
        </div>

        {/* ── PART 2: ANIMATED STATISTICS BAND ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {METRICS.map((metric, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-[#0B1220]/40 border border-[#1E293B]/60 text-center space-y-1">
              <div className="text-2xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-[#fafafa] to-[#3B82F6] bg-clip-text text-transparent">
                {metric.value}
              </div>
              <div className="text-[10px] font-bold text-[#94A3B8]/50 uppercase tracking-wider font-mono">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── PART 3: CORE ARCHITECTURAL VALUES ── */}
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-widest font-mono">Core Ideals</div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">How We Build</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((val, i) => {
              const Icon = val.icon
              return (
                <div key={i} className="p-6 rounded-xl bg-[#0B1220]/60 border border-[#1E293B] space-y-4 hover:border-[#3B82F6]/30 transition-all shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-[#050816] border border-[#1E293B] flex items-center justify-center text-[#3B82F6]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{val.title}</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed font-normal">{val.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}