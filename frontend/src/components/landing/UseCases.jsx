// frontend/src/components/landing/UseCases.jsx
import { Layers, Workflow, Code2 } from 'lucide-react'

const CASES = [
  { icon: Code2, title: 'Engineering & Logic', desc: 'Automate boilerplate code composition, parse micro-frontend errors, or validate complex API interface parameters.' },
  { icon: Workflow, title: 'Strategic Automation', desc: 'Chain file uploads with cited web searches to create autonomous real-time intelligence feeds.' },
  { icon: Layers, title: 'Knowledge Management', desc: 'Ingest multi-page balance sheets, company wikis, or legal PDFs to run continuous RAG matrix lookups.' }
]

export default function UseCases() {
  return (
    <section id="use-cases" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center md:text-left space-y-2">
          <div className="text-xs font-semibold text-[#06B6D4] uppercase tracking-widest font-mono">Tailored Scaling</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Built for High-Growth Teams</h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-sm">Eliminate fragmentation. Run your entire operations stack through a unified autonomous hub.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CASES.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="p-6 rounded-xl bg-[#0B1220]/60 border border-[#1E293B] space-y-3 shadow-glass-surface backdrop-blur-sm">
                <Icon className="w-5 h-5 text-[#06B6D4]" />
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed font-normal">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}