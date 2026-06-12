// frontend/src/components/landing/FAQAccordion.jsx
import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const ITEMS = [
  { q: "How does the automated multi-model routing engine calculate weight paths?", a: "Nexus analyzes input token parameters, complexity structures, and requested operational tags. It dynamically routes simple processing prompts to ultra-low-cost nodes and diverts deep reasoning requirements to high-parameter intelligence engines seamlessly." },
  { q: "Are my uploaded PDFs and documentation assets safely stored or indexed?", a: "Security is built into our core framework. Every file is instantly parsed, vectorized into an ephemeral cache, and indexed via point-to-point zero-knowledge boundaries. We enforce zero data retention policies—your corporate payloads are never used for downstream model fine-tuning." },
  { q: "Can I embed the real-time cited search or voice pipeline into my own platform layouts?", a: "Yes. All modular UI showcases active on this landing frame are mapped directly from our client edge API. Development access keys and schema configuration paths can be unlocked cleanly through the system settings portal." }
]

export default function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <section id="faq" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <div className="text-xs font-semibold text-[#06B6D4] uppercase tracking-widest font-mono">Compliance Registry</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-center">Frequently Answered Queries</h2>
        </div>

        <div className="space-y-3">
          {ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx
            return (
              <div key={idx} className="rounded-xl border border-[#1E293B] bg-[#0B1220]/40 overflow-hidden transition-all">
                <button onClick={() => setOpenIdx(isOpen ? null : idx)} className="w-full p-5 text-left flex items-center justify-between text-white font-medium text-xs sm:text-sm gap-4 hover:bg-[#0B1220]/80 transition-colors cursor-pointer">
                  <span>{item.q}</span>
                  {isOpen ? <Minus className="w-4 h-4 text-[#3B82F6] shrink-0" /> : <Plus className="w-4 h-4 text-[#94A3B8]/60 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#94A3B8] leading-relaxed border-t border-[#1E293B]/30 bg-[#050816]/20 font-normal">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}