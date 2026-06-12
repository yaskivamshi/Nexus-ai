// frontend/src/components/landing/HowItWorks.jsx
import { motion } from 'framer-motion'
import { Terminal, Cpu, Zap, ShieldCheck } from 'lucide-react'

const STEPS = [
  { icon: Terminal, title: '01 / Ingestion Layer', desc: 'Securely streams user inputs, raw documents, or ambient audio files into localized volatile memory matrices.' },
  { icon: Cpu, title: '02 / Neural Routing', desc: 'Analyzes prompt parsing weights and seamlessly assigns execution to the optimal specialized LLM node.' },
  { icon: Zap, title: '03 / Vector Synthesis', desc: 'Accelerates real-time web crawling, semantic memory injection, or computer vision processing chains.' },
  { icon: ShieldCheck, title: '04 / Secure Output', desc: 'Applies rigorous guardrails and returns end-to-end encrypted markdown tokens back to your active layout client.' }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center md:text-left space-y-2">
          <div className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-widest font-mono">System Execution</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Under the Hood Architecture</h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-sm">From raw ingestion payload to verified grounded synthesis tokens in less than 200ms.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="p-5 rounded-xl bg-[#0B1220]/40 border border-[#1E293B] flex flex-col justify-between space-y-4 hover:border-[#3B82F6]/20 transition-all group">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-[#050816] border border-[#1E293B] flex items-center justify-center text-[#3B82F6] group-hover:text-white group-hover:bg-[#3B82F6] transition-all">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{step.title}</h3>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed font-normal">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}