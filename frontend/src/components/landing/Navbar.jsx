// frontend/src/components/landing/Navbar.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'

const LINKS = [
  { name: 'Features', href: '#features' },
  { name: 'Models', href: '#models' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Docs', href: '#docs' },
  { name: 'About', href: '#about' }
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* ── GROUND ENGINE: INFINITE LOOP TYPING INFRASTRUCTURE ── */}
      <style>{`
        @keyframes infiniteTyping {
          0% { width: 0; }
          25% { width: 130px; } /* Finishes typing in ~1.75 seconds */
          85% { width: 130px; } /* Holds perfectly still for ~4.2 seconds (25% to 85%) */
          95%, 100% { width: 0; } /* Instantly wipes out/resets to loop back again */
        }
        @keyframes blinkCursor {
          from, to { border-color: transparent }
          50% { border-color: #3B82F6 }
        }
        .animate-typing-slogan {
          display: block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 1.5px solid #3B82F6;
          width: 0;
          /* Stretched execution over 7 seconds total to allow for the holding interval */
          animation: 
            infiniteTyping 7s steps(23, end) infinite,
            blinkCursor 0.75s step-end infinite;
        }
      `}</style>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 font-sans ${
          scrolled 
            ? 'bg-[#050816]/70 backdrop-blur-xl border-b border-[#27272a]/40 py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* ── PREMIUM VECTOR LOGO WITH TYPING SUBTEXT ── */}
          <a href="#" className="flex items-center gap-2.5 group select-none">
            <svg 
              viewBox="0 0 40 40" 
              className="w-9 h-9 transition-transform duration-300 group-hover:scale-105 shrink-0" 
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
            
            {/* Text Lockup Stack */}
            <div className="flex flex-col items-start justify-center text-left">
              <span className="font-bold text-[15px] tracking-wider text-white uppercase block leading-none">
                NEXUS <span className="text-[#3B82F6]">AI</span>
              </span>
              
              {/* Dynamic Slogan Node Layer */}
              <div className="h-[14px] mt-1 flex items-center overflow-hidden">
                <span className="text-[9px] font-mono tracking-wider text-[#3B82F6] uppercase font-bold animate-typing-slogan">
                  Intelligence Connected.
                </span>
              </div>
            </div>
          </a>

          {/* Desktop Anchor Navigation Link Array */}
          <nav className="hidden md:flex items-center gap-7">
            {LINKS.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-xs font-medium text-[#94A3B8] hover:text-white transition-colors duration-150 tracking-wide"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action triggers rows */}
          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-xs font-medium text-[#94A3B8] hover:text-white transition-colors">
              Sign In
            </a>
            <ButtonPrimary onClick={() => { window.location.href = '/login' }}>
              <span>Get Started</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </ButtonPrimary>
          </div>

          {/* Mobile responsive drawer toggle hamburger button */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1c1c1f]/40 md:hidden"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer Slide Panel Backdrop Context Portal */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-14 bg-[#050816]/95 backdrop-blur-2xl border-b border-[#27272a] z-40 px-6 py-8 flex flex-col gap-6 md:hidden text-left"
          >
            <div className="flex flex-col gap-4">
              {LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-[#94A3B8] hover:text-white py-1.5 border-b border-[#1E293B]/40"
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <a 
                href="/login" 
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 text-center text-sm font-medium border border-[#27272a] rounded-xl text-[#fafafa] bg-[#121214]"
              >
                Sign In
              </a>
              <button 
                onClick={() => { setMobileOpen(false); window.location.href = '/login' }}
                className="w-full py-2.5 text-center text-sm font-medium rounded-xl text-white bg-[#3B82F6] font-semibold transition-transform active:scale-[0.98]"
              >
                Get Started Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ButtonPrimary({ children, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="group flex items-center gap-1.5 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-sm shadow-[#3B82F6]/10 transition-all duration-150 active:scale-[0.98]"
    >
      {children}
    </button>
  )
}