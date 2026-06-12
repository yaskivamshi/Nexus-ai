// frontend/src/pages/Dashboard.jsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  MessageSquare, FileText, Search, Brain, 
  Mic, Sparkles, ArrowRight, CheckCircle2,
  Bot, LayoutDashboard, User2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { NexusLogo } from '../components/ui/NexusLogo'

export default function Dashboard() {
  const navigate = useNavigate()
  const { createChat } = useChatStore()
  const { user } = useAuthStore()

  // Pulling exact active username profiles matching your layout system
  const userDisplayName = user?.email ? user.email.split('@')[0] : 'vamshi'

  // Function to initialize a clean chat state before navigating
  const handleQuickChatStart = () => {
    createChat()
    navigate('/chat')
  }

  // Feature cards data array configured exactly from your layout images
  const FEATURES = [
    {
      title: 'AI Chat',
      desc: 'Chat with GPT-5.2, Claude, or Gemini',
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'hover:border-blue-500/40',
      action: handleQuickChatStart,
      hasLink: true,
    },
    {
      title: 'PDF Chat',
      desc: 'Upload and chat with documents',
      icon: FileText,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'hover:border-green-500/40',
      action: () => navigate('/pdf'),
    },
    {
      title: 'AI Search',
      desc: 'Search with AI-powered insights',
      icon: Search,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'hover:border-amber-500/40',
      action: () => navigate('/search'),
    },
    {
      title: 'Resume ATS',
      desc: 'Optimize your resume for ATS',
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'hover:border-purple-500/40',
      action: () => navigate('/resume'),
    },
    {
      title: 'AI Memory',
      desc: 'Store and recall information',
      icon: Brain,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'hover:border-pink-500/40',
      action: () => navigate('/settings'),
    },
    {
      title: 'Voice Assistant',
      desc: 'Talk to AI with your voice',
      icon: Mic,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'hover:border-cyan-500/40',
      action: () => navigate('/voice'),
    },
  ]

  const MODELS = [
    { name: 'OpenAI GPT-5.2', desc: 'Most capable model', initial: 'GPT' },
    { name: 'Claude Sonnet 4.5', desc: "Anthropic's best", initial: 'C' },
    { name: 'Gemini 3 Flash', desc: 'Fast & efficient', initial: 'G' },
  ]

  return (
    <div className="w-full h-full bg-[#020617] text-[#fafafa] p-6 space-y-6 overflow-y-auto select-none text-left relative">
      
      {/* ── NEW BRAND LAYER: DECORATIVE AMBIENT BACKGROUND VECTOR WATERMARK ── */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none z-0 select-none">
        <NexusLogo className="h-64" showText={false} />
      </div>

      {/* Background Decorative Ambient Vector Mesh */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-[-10%] left-[30%] w-[500px] h-[400px] bg-[#3b82f6]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-[#8b5cf6]/5 rounded-full blur-[120px]" />
      </div>

      {/* Top Header Row Panel */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 z-10 relative">
        <div className="flex items-center gap-3">
          {/* Brand Embedded Primary Signature */}
          <NexusLogo className="h-6" showText={true} />
          <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold font-mono text-[#94a3b8]/40 uppercase tracking-[0.2em] pt-0.5">
            <LayoutDashboard className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>Operational Control Hub</span>
          </div>
        </div>

        {/* Dynamic Connected Node Active Gateway Telemetry HUD */}
        <div className="flex items-center gap-2 bg-[#1e293b]/30 border border-white/5 px-3 py-1.5 rounded-full shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Node Active</span>
        </div>
      </div>

      {/* ── NEW UI LAYER: HIGH CONTRAST PROFILE GREETING MATRIX HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-white/5 bg-[#111827]/40 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative"
      >
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] shrink-0 shadow-inner">
            <User2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-white capitalize">
              Welcome back, {userDisplayName}!
            </h2>
            <p className="text-xs text-[#94a3b8] leading-relaxed font-normal">
              Your multi-model engineering sandbox is fully synchronized. Select an operational route node below to deploy a query.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#020617]/60 border border-white/5 px-3 py-1.5 rounded-lg shrink-0 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono font-medium text-slate-300 uppercase tracking-wider">Gateway Active</span>
        </div>
      </motion.div>

      {/* ── GRID 1: 3x2 Feature Navigation Grid Matrix ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 z-10 relative">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={feat.action}
              className={`bg-[#111827]/40 border border-white/5 rounded-xl p-5 cursor-pointer transition-all duration-200 ${feat.borderColor} hover:bg-[#1e293b]/40 hover:shadow-lg group relative flex flex-col justify-between`}
            >
              <div className="space-y-4">
                {/* Circular Icon Avatar Graphic */}
                <div className={`w-9 h-9 rounded-lg ${feat.bgColor} flex items-center justify-center ${feat.color} shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white tracking-tight">{feat.title}</h3>
                  <p className="text-xs text-[#94a3b8] leading-relaxed font-normal">{feat.desc}</p>
                </div>
              </div>

              {/* Inline Get Started Link if active */}
              {feat.hasLink ? (
                <div className="pt-4 flex items-center gap-1.5 text-xs text-[#3b82f6] font-semibold group-hover:text-white transition-colors">
                  <span>Get started</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              ) : (
                <div className="pt-4 flex items-center gap-1 text-[10px] font-mono font-medium text-[#94a3b8]/20 group-hover:text-[#3b82f6]/40 transition-colors">
                  <span>Launch component</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* ── GRID 2: Two-Column Split Footer (Getting Started & Model Cluster) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 z-10 relative">
        
        {/* Left Column: Getting Started Checklist */}
        <Card className="bg-[#111827]/40 border border-white/5 rounded-xl p-5 shadow-xl backdrop-blur-sm">
          <CardHeader className="p-0 pb-4 flex flex-row items-center gap-2 border-b border-white/5 mb-4">
            <Sparkles className="w-4 h-4 text-[#3b82f6]" />
            <CardTitle className="text-xs font-bold font-mono text-white uppercase tracking-wider">Operational Directives</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {[
              { step: '01', title: 'Start a new chat', desc: 'Ask complex questions, get help with code arrays, or brainstorm startup models.' },
              { step: '02', title: 'Upload a document', desc: 'Analyze technical blueprint PDFs, extract qualifications, and prompt contextual vectors.' },
              { step: '03', title: 'Save to memory', desc: 'Store target baseline preferences and project metadata parameters for future recall.' }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 text-left group">
                <div className="w-6 h-6 rounded-lg bg-[#020617] border border-white/5 flex items-center justify-center text-[10px] font-mono font-bold text-[#3b82f6] shrink-0 group-hover:border-[#3b82f6]/30 transition-colors">
                  {item.step}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-white tracking-tight">{item.title}</h4>
                  <p className="text-[11px] text-[#94a3b8] leading-relaxed font-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Column: Available Clusters Tracker */}
        <Card className="bg-[#111827]/40 border border-white/5 rounded-xl p-5 shadow-xl backdrop-blur-sm">
          <CardHeader className="p-0 pb-4 flex flex-row items-center gap-2 border-b border-white/5 mb-4">
            <Bot className="w-4 h-4 text-[#3b82f6]" />
            <CardTitle className="text-xs font-bold font-mono text-white uppercase tracking-wider">Available Core Clusters</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2.5">
            {MODELS.map((model) => (
              <div 
                key={model.name} 
                className="flex items-center justify-between p-3 rounded-xl bg-[#020617]/50 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 text-left min-w-0">
                  {/* Square Identifier Tag Avatar */}
                  <div className="w-8 h-8 rounded-lg bg-[#111827] border border-white/5 flex items-center justify-center font-mono text-[9px] font-bold text-[#3b82f6] shrink-0 shadow-inner">
                    {model.initial}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold text-white truncate tracking-tight">{model.name}</p>
                    <p className="text-[10px] text-[#94a3b8] truncate font-normal">{model.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Online</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}