// frontend/src/components/landing/TrustMarquee.jsx
import { motion } from 'framer-motion'

const LOGO_TEXTS = [
  'OpenAI', 'Anthropic', 'Google AI', 'Meta Llama', 'Microsoft', 
  'AWS', 'NVIDIA', 'GitHub', 'Supabase', 'Stripe', 'MongoDB'
]

export default function TrustMarquee() {
  const doubleLogos = [...LOGO_TEXTS, ...LOGO_TEXTS, ...LOGO_TEXTS]

  return (
    <section className="relative w-full py-10 bg-[#050816] border-y border-[#27272a]/30 overflow-hidden select-none z-10 font-sans">
      <div className="max-w-7xl mx-auto px-6 text-center mb-6">
        <p className="text-[10px] uppercase font-bold tracking-widest text-[#94A3B8]/60">
          Powered by Industry-Leading Foundational Infrastructures
        </p>
      </div>

      <div className="relative flex w-full items-center mask-image-horizontal">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050816] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050816] to-transparent z-10 pointer-events-none" />

        <motion.div 
          className="flex whitespace-nowrap gap-16 items-center flex-nowrap shrink-0 min-w-full"
          animate={{ x: [0, -1000] }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "linear"
          }}
        >
          {doubleLogos.map((logo, idx) => (
            <div 
              key={`${logo}-${idx}`} 
              className="text-sm font-semibold text-[#94A3B8]/40 hover:text-white/80 transition-colors duration-200 tracking-wider font-mono lowercase flex items-center gap-2"
            >
              <span className="text-[#3B82F6] font-sans">✦</span> {logo}
            </div>
          ))}
        </motion.div>
      </div>

      <style>{`
        .mask-image-horizontal {
          mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent);
        }
      `}</style>
    </section>
  )
}