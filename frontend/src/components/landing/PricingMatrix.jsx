// frontend/src/components/landing/PricingMatrix.jsx
import { Check } from 'lucide-react'

export default function PricingMatrix() {
  const TIER_FEATURES = [
    "Multi-Model Cross-Routing Access",
    "Grounded AI Web Search with Cited Logs",
    "100MB Document RAG Vectorization Ingestion",
    "Encrypted Session Context Retention Vault"
  ]

  return (
    <section id="pricing" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <div className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-widest font-mono">Subscription Infrastructure</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Transparent, Tierless Access</h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xs mx-auto text-center">Every premium tool. No hidden seat microtransactions. Built for open scale.</p>
        </div>

        <div className="max-w-md mx-auto p-8 rounded-2xl bg-gradient-to-b from-[#0B1220] to-[#050816] border border-[#3B82F6]/30 shadow-glass-surface space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-[#3B82F6]/10 border-b border-l border-[#3B82F6]/20 rounded-bl-xl text-[9px] font-mono font-bold uppercase tracking-wider text-[#3B82F6]">Full Access Pass</div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">Pro Platform Account</h3>
            <div className="flex items-baseline gap-1 pt-2">
              <span className="text-3xl font-extrabold tracking-tight text-white">$0</span>
              <span className="text-xs text-[#94A3B8]/60 font-mono">/ Free Tier Alpha Beta</span>
            </div>
          </div>

          <button onClick={() => window.location.href = '/login'} className="w-full h-10 rounded-xl bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white font-medium text-xs tracking-wide transition-colors cursor-pointer">
            Create Developer Account
          </button>

          <ul className="space-y-3 pt-4 border-t border-[#1E293B]/60 text-xs">
            {TIER_FEATURES.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-[#94A3B8]">
                <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <span className="font-normal">{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}