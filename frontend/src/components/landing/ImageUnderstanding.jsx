// frontend/src/components/landing/ImageUnderstanding.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, ShieldCheck, Cpu, ArrowRight } from 'lucide-react'

export default function ImageUnderstanding() {
  const [analyzed, setAnalyzed] = useState(false)

  return (
    <section id="image-vision" className="relative w-full py-24 px-6 bg-[#050816] border-b border-[#1E293B]/40 z-10 font-sans text-left">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-7 w-full order-last lg:order-first">
          <div className="w-full rounded-2xl bg-[#0B1220]/80 border border-[#1E293B] p-5 h-[400px] flex flex-col justify-between relative overflow-hidden group">
            
            <div className="flex-1 bg-[#050816]/60 border border-[#1E293B] rounded-xl relative overflow-hidden flex items-center justify-center p-4">
              {/* Dummy Image Box Canvas */}
              <div className="w-full h-full bg-gradient-to-br from-[#1E293B]/20 to-[#050816] rounded-lg border border-[#1E293B]/60 relative flex flex-col items-center justify-center p-4 text-center">
                <Eye className="w-8 h-8 text-[#94A3B8]/20 mb-2" />
                <span className="text-[10px] font-mono text-[#94A3B8]/40 uppercase">Spatial Core Layout Frame Map</span>

                {/* Simulated AI Spatial Bounding Overlays */}
                {analyzed && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-12 left-16 border-2 border-[#06B6D4] bg-[#06B6D4]/5 p-1 text-[9px] font-mono text-[#06B6D4] rounded font-bold"
                  >
                    [Object: Engine_Block_01 - Acc: 99.4%]
                  </motion.div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs shrink-0">
              <span className="text-[#94A3B8] font-mono text-[11px]">telemetry_vision_grid.png</span>
              <button
                onClick={() => setAnalyzed(!analyzed)}
                className="px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white font-medium text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <span>{analyzed ? 'Reset Context' : 'Run Vision Inference'}</span> <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <div className="text-xs font-semibold text-[#06B6D4] uppercase tracking-widest font-mono">Computer Vision</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Spatial Vision <br />& OCR Engines.</h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Upload complex design plans or mechanical assets. Our vision model isolates objects, tracks boundaries, and converts alphanumeric data into semantic vectors instantly.
          </p>
        </div>

      </div>
    </section>
  )
}