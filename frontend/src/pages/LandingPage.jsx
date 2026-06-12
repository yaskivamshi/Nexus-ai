// frontend/src/pages/LandingPage.jsx
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

// Layout Foundations
import Navbar from '../components/landing/Navbar'
import ThreeBackground from '../components/landing/ThreeBackground'
import Footer from '../components/landing/Footer'

// Redesigned Cinematic Structural Sections
import Hero from '../components/landing/Hero'
import TrustMarquee from '../components/landing/TrustMarquee'
import FeaturesGrid from '../components/landing/FeaturesGrid'
import About from '../components/landing/About' // Core Platform Profile Identity Layer
import LiveAIDemo from '../components/landing/LiveAIDemo'
import DocumentIntelligence from '../components/landing/DocumentIntelligence'
import ResumeATS from '../components/landing/ResumeATS'
import AISearchShowcase from '../components/landing/AISearchShowcase'
import VoiceAIDemo from '../components/landing/VoiceAIDemo'
import ImageUnderstanding from '../components/landing/ImageUnderstanding'
import MultiModelComparison from '../components/landing/MultiModelComparison'
import HowItWorks from '../components/landing/HowItWorks'
import UseCases from '../components/landing/UseCases'
import Testimonials from '../components/landing/Testimonials'
import PricingMatrix from '../components/landing/PricingMatrix'
import FAQAccordion from '../components/landing/FAQAccordion'
import FinalCTA from '../components/landing/FinalCTA'

export default function LandingPage() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScrollLifecycle = () => {
      // Calculate Scroll Vector Tracking Progress Metrics
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100)
      }
      setShowScrollTop(window.scrollY > 600)
    }

    window.addEventListener('scroll', handleScrollLifecycle, { passive: true })
    return () => window.removeEventListener('scroll', handleScrollLifecycle)
  }, [])

  const scrollToTopAxis = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen w-screen bg-[#050816] text-[#fafafa] font-sans antialiased selection:bg-[#3B82F6]/30 overflow-x-hidden scroll-smooth">
      
      {/* ── GROUND ENGINE: WEBGL MATRIX LAYER ── */}
      <ThreeBackground />

      {/* ── FLOATING HUD: GLOBAL SCROLL PROGRESS TRACKER INDICATOR ── */}
      <div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#06B6D4] z-50 transform origin-left" 
        style={{ transform: `scaleX(${scrollProgress / 100})` }} 
      />

      {/* Content Mount Layout Structure */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 w-full flex flex-col">
          {/* Main Visual Funnel Sections */}
          <Hero />
          <TrustMarquee />
          <FeaturesGrid />
          
          {/* Corporate Profile, Strategic Intent & Performance Statistics */}
          <About />
          
          {/* Deep Functional Interactive Showcases */}
          <div className="w-full relative space-y-0 bg-[#050816]/30">
            <LiveAIDemo />
            <DocumentIntelligence />
            <ResumeATS />
            <AISearchShowcase />
            <VoiceAIDemo />
            <ImageUnderstanding />
          </div>

          {/* Pricing, Trust Matrices, and Conversions */}
          <MultiModelComparison />
          <HowItWorks />
          <UseCases />
          <Testimonials />
          <PricingMatrix />
          <FAQAccordion />
          <FinalCTA />
        </main>

        <Footer />
      </div>

      {/* ── BACK-TO-TOP SCROLL ACCELERATION INTERFACE NODE ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTopAxis}
            className="fixed bottom-6 right-6 w-9 h-9 rounded-xl bg-[#0B1220]/80 backdrop-blur-md border border-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:text-white hover:border-[#3B82F6]/40 shadow-neon-blue transition-all z-50 cursor-pointer"
            aria-label="Scroll to top layer axis"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  )
}