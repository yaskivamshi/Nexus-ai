// frontend/src/components/landing/Footer.jsx
export default function Footer() {
  return (
    <footer className="w-full bg-[#050816] border-t border-[#1E293B]/60 py-8 px-6 text-xs text-[#94A3B8] z-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* ── PREMIUM VECTOR LOGO FOOTER INTEGRATION ── */}
        <div className="flex items-center gap-2.5 group">
          <svg 
            viewBox="0 0 40 40" 
            className="w-5 h-5 transition-transform duration-300 group-hover:scale-105" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M10 30V10L22 25V10M30 10V30" 
              stroke="#3B82F6" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <circle cx="10" cy="10" r="2.5" fill="#3B82F6" />
            <circle cx="10" cy="30" r="2.5" fill="#3B82F6" />
            <circle cx="22" cy="25" r="2.5" fill="#3B82F6" />
            <circle cx="30" cy="10" r="2.5" fill="#3B82F6" />
            <circle cx="30" cy="30" r="2.5" fill="#3B82F6" />
            <path 
              d="M10 10L30 30" 
              stroke="#3B82F6" 
              strokeWidth="1" 
              strokeDasharray="2 2" 
              opacity="0.4"
            />
          </svg>
          <span className="font-bold text-[13px] tracking-wider text-white">
            NEXUS <span className="text-[#3B82F6]">AI</span>
          </span>

          {/* Dynamic Slogan Node Layer */}
            <div className="h-[14px] mt-1 flex items-center overflow-hidden"></div>
              <span className="text-[9px] font-mono tracking-wider text-[#3B82F6] uppercase font-bold animate-typing-slogan">
                Intelligence Connected.
              </span>
            


     
        </div>

        {/* Dynamic Year Attribution Layer */}
        <p className="text-[11px] font-normal text-[#94A3B8]/60">
          &copy; {new Date().getFullYear()} NEXUS AI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}