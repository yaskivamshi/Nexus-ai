// frontend/src/components/landing/FeaturesGrid.jsx
import { motion } from 'framer-motion'
import { 
  MessageSquare, FileText, Search, Brain, Mic, 
  Eye, Code2, Cpu, Globe, Layers, Share2 
} from 'lucide-react'

const CARDS = [
  { title: 'AI Chat', desc: 'ChatGPT-style conversations across multi-cluster active weights.', icon: MessageSquare, color: 'text-blue-500', glow: 'shadow-[#3B82F6]/5' },
  { title: 'PDF Chat', desc: 'Deep parsing retrieval augmented semantic index document queries.', icon: FileText, color: 'text-green-500', glow: 'shadow-green-500/5' },
  { title: 'AI Search', desc: 'Perplexity-style real-time neural web crawling with full citations.', icon: Search, color: 'text-amber-500', glow: 'shadow-amber-500/5' },
  { title: 'Resume ATS', desc: 'Optimize structural layouts, scoring layers, and missing keywords.', icon: FileText, color: 'text-purple-500', glow: 'shadow-purple-500/5' },
  { title: 'AI Memory', desc: 'Continuous cross-session contextual graph memory storage nodes.', icon: Brain, color: 'text-pink-500', glow: 'shadow-pink-500/5' },
  { title: 'Voice Assistant', desc: 'Continuous hands-free pipeline loop backed by active wake radar.', icon: Mic, color: 'text-cyan-500', glow: 'shadow-cyan-500/5' },
  { title: 'Image Vision', desc: 'OCR parsing syntax extraction and spatial bounding evaluations.', icon: Eye, color: 'text-emerald-500', glow: 'shadow-emerald-500/5' },
  { title: 'Coding Assistant', desc: 'Production-level code compilation, runtime logic, and diagnostics.', icon: Code2, color: 'text-indigo-500', glow: 'shadow-indigo-500/5' },
  { title: 'Doc Intelligence', desc: 'Isolate key items, auto-summaries, and action matrices cleanly.', icon: Cpu, color: 'text-red-500', glow: 'shadow-red-500/5' },
  { title: 'Workflow Chains', desc: 'Connect nested multi-step pipeline parameters sequentially.', icon: Globe, color: 'text-teal-500', glow: 'shadow-teal-500/5' },
  { title: 'Knowledge Base', desc: 'Vectorized custom file vaults mapping high-retrieval metrics.', icon: Layers, color: 'text-orange-500', glow: 'shadow-orange-500/5' },
  { title: 'Multi-Agent Mesh', desc: 'Coordinated sovereign worker threads handling parallel execution.', icon: Share2, color: 'text-violet-500', glow: 'shadow-violet-500/5' }
]

export default function FeaturesGrid() {
  return (
    <section id="features" className="relative w-full py-24 px-6 bg-[#050816] z-10 font-sans text-left">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <div className="space-y-3 text-center md:text-left">
          <div className="text-xs font-semibold text-[#3B82F6] uppercase tracking-widest font-mono">Capabilities</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Everything You Need</h2>
          <p className="text-sm text-[#94A3B8] max-w-md">One cohesive platform. Every advanced autonomous AI system capability integrated seamlessly.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className={`p-6 rounded-xl bg-[#0B1220]/60 border border-[#1E293B] shadow-lg ${card.glow} backdrop-blur-md group transition-all duration-200 cursor-default flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className={`w-8 h-8 rounded-lg bg-[#050816] border border-[#1E293B] group-hover:border-[#3B82F6]/30 flex items-center justify-center ${card.color} transition-colors`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-[14px] font-medium text-white">{card.title}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed font-normal">{card.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}