// frontend/src/components/landing/MultiModelComparison.jsx
import { Check } from 'lucide-react'

export default function MultiModelComparison() {
  const METRICS = [
    { name: 'OpenAI GPT-4o', speed: '98/100', reasoning: '95/100', coding: '92/100', cost: 'Standard' },
    { name: 'Anthropic Claude 3.5', speed: '94/100', reasoning: '99/100', coding: '97/100', cost: 'Premium' },
    { name: 'Google Gemini 1.5 Pro', speed: '99/100', reasoning: '91/100', coding: '89/100', cost: 'Efficient' }
  ]

  return (
    <section id="models" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <div className="text-center md:text-left space-y-2">
          <div className="text-xs font-semibold text-[#3B82F6] uppercase tracking-widest font-mono">Cross-Model Evaluation</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Dynamic Model Routing Matrix</h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md">Compare metrics or let Nexus route your prompt to the best option automatically.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {METRICS.map((item) => (
            <div key={item.name} className="p-5 rounded-xl bg-[#0B1220]/60 border border-[#1E293B] space-y-4 shadow-md backdrop-blur-sm hover:border-[#3B82F6]/30 transition-all">
              <h3 className="text-sm font-semibold text-white border-b border-[#1E293B] pb-3">{item.name}</h3>
              <div className="space-y-2 text-[11px] font-mono text-[#94A3B8]">
                <div className="flex justify-between"><span>⚡ Speed Context</span> <span className="text-white">{item.speed}</span></div>
                <div className="flex justify-between"><span>🧠 Logic Reasoning</span> <span className="text-white">{item.reasoning}</span></div>
                <div className="flex justify-between"><span>💻 Synthesis Coding</span> <span className="text-white">{item.coding}</span></div>
                <div className="flex justify-between"><span>💎 Resource Cost</span> <span className="text-[#3B82F6]">{item.cost}</span></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}