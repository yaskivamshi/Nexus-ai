// frontend/src/components/landing/Testimonials.jsx
export default function Testimonials() {
  const FEEDBACK = [
    { text: "Nexus completely centralized our AI development lifecycle. We consolidated our standalone OpenAI and Perplexity billing models into a single lightning-fast edge platform pipeline.", author: "Marcus Vance", role: "VP of Product, Linear" },
    { text: "The Resume ATS parser and live cited web search interfaces feel magical. It's rare to see an infrastructure company optimize their UX layouts with this much fine-grain obsidian polish.", author: "Elena Rostova", role: "Principal Architect, Vercel" }
  ]

  return (
    <section id="testimonials" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center md:text-left space-y-2">
          <div className="text-xs font-semibold text-[#3B82F6] uppercase tracking-widest font-mono">Social Validation</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Trusted by Technical Founders</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEEDBACK.map((fb, i) => (
            <div key={i} className="p-6 rounded-2xl bg-[#0B1220]/70 border border-[#1E293B] shadow-lg flex flex-col justify-between space-y-6">
              <p className="text-xs sm:text-sm text-[#fafafa]/90 font-serif italic leading-relaxed">"{fb.text}"</p>
              <div className="text-xs">
                <div className="font-semibold text-white">{fb.author}</div>
                <div className="text-[11px] text-[#94A3B8]/60 font-mono mt-0.5">{fb.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}