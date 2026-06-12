// src/components/layout/Sidebar.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, Plus, Trash2, FileText, 
  Search, Mic, Settings, ChevronLeft, Menu, X,
  LayoutDashboard, LogOut
} from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { TooltipProvider } from '../ui/tooltip'
import { toast } from 'react-hot-toast'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageSquare,   label: 'AI Chat',    path: '/chat' },
  { icon: FileText,        label: 'PDF Chat',   path: '/pdf' },
  { icon: FileText,        label: 'Resume ATS',  path: '/resume' },
  { icon: Search,          label: 'AI Search',  path: '/search' },
  { icon: Mic,             label: 'Voice',      path: '/voice' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { chats, activeChatId, createChat, deleteChat, setActiveChatId } = useChatStore()
  const { user, setUser, setSession } = useAuthStore()

  // Close mobile navigation drawer cleanly on route shift
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleNewChat = () => {
    createChat()
    navigate('/chat')
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      useChatStore.getState().clearChatStoreUI()
      setSession(null)
      setUser(null)
      toast.success('Signed out cleanly')
      navigate('/')
    } catch (error) {
      toast.error('Failed to log out.')
    }
  }

  const userDisplayName = user?.email ? user.email.split('@')[0] : 'vamshi'
  const userDisplayEmail = user?.email ? user.email : 'vamshiyaski66@gmail.com'

  // Reusable Premium Vector Logo Monogram Block
  const BrandMonogram = () => (
    <svg viewBox="0 0 40 40" className="h-5 w-auto shrink-0 transition-transform duration-300 hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 30V10L22 25V10M30 10V30" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="10" r="2.5" fill="#3B82F6" />
      <circle cx="10" cy="30" r="2.5" fill="#3B82F6" />
      <circle cx="22" cy="25" r="2.5" fill="#3B82F6" />
      <circle cx="30" cy="10" r="2.5" fill="#3B82F6" />
      <circle cx="30" cy="30" r="2.5" fill="#3B82F6" />
    </svg>
  )

  const SidebarContent = ({ isMobileMode = false }) => (
    <div className="flex flex-col h-full w-full overflow-hidden select-none bg-[#020617]">
      {/* ── STATIC SECTION: HEADER & GLOBAL CONTROLS ── */}
      <div className="flex flex-col shrink-0">
        {/* Header Branding Row */}
        <div className="flex items-center justify-between p-3 h-14 border-b border-white/5">
          <div className="flex items-center gap-2.5 pl-1.5">
            <BrandMonogram />
            {(!collapsed || isMobileMode) && (
              <span className="font-bold text-xs tracking-[0.15em] text-white pt-0.5">NEXUS AI</span>
            )}
          </div>
          
          {!isMobileMode ? (
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 rounded-xl text-[#71717a] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5"
              onClick={() => setCollapsed(!collapsed)}
            >
              <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronLeft className="w-4 h-4" />
              </motion.div>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 rounded-xl text-[#71717a] hover:text-white hover:bg-white/5"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Action Button: Initialize new conversation */}
        <div className="px-3 mt-4 mb-3">
          <Button
            onClick={handleNewChat}
            className={cn(
              "w-full justify-start gap-2 text-xs font-medium transition-all cursor-pointer",
              (collapsed && !isMobileMode)
                ? "bg-transparent text-[#3b82f6] border border-white/10 hover:border-[#3b82f6]/40 hover:bg-white/5 justify-center p-0 w-9 h-9 mx-auto rounded-xl" 
                : "bg-[#3b82f6] text-white hover:bg-[#3b82f6]/90 rounded-xl h-9 shadow-md shadow-[#3b82f6]/10"
            )}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {(!collapsed || isMobileMode) && <span>New Chat</span>}
          </Button>
        </div>

        {/* Global Hub Navigation Route Links */}
        <nav className="px-3 space-y-1 mb-2">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs transition-all duration-150 group text-left cursor-pointer',
                  active
                    ? 'bg-white/5 text-white font-semibold border border-white/10 shadow-inner'
                    : 'text-[#71717a] hover:bg-white/[0.02] hover:text-white border border-transparent',
                  (collapsed && !isMobileMode) && 'justify-center px-0'
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 shrink-0 transition-colors", 
                  active ? "text-[#3b82f6]" : "text-[#71717a] group-hover:text-white"
                )} />
                {(!collapsed || isMobileMode) && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="px-3 mb-2">
          <div className="h-[1px] bg-white/5" />
        </div>

        {/* Dynamic Context History Title */}
        {(!collapsed || isMobileMode) && (
          <div className="px-4.5 mb-2">
            <p className="text-[9px] font-bold text-[#71717a] uppercase tracking-[0.2em] font-mono">Recent Logs</p>
          </div>
        )}
      </div>

      {/* ── ISOLATED MIDDLE SECTION: RECENT CHAT SCROLL WINDOW ── */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <div className="h-full w-full overflow-y-auto overflow-x-hidden px-3 scrollbar-none">
          <div className="space-y-1 pb-4">
            <AnimatePresence initial={false}>
              {chats.map((chat) => {
                const isActiveChat = activeChatId === chat.id
                return (
                  <div
                    key={chat.id}
                    className={cn(
                      'group flex items-center gap-2.5 w-full pl-3 pr-10 py-2 rounded-xl text-xs cursor-pointer transition-all relative overflow-hidden',
                      isActiveChat
                        ? 'bg-white/[0.03] text-white font-medium border border-white/5'
                        : 'text-[#71717a] hover:bg-white/[0.01] hover:text-white border border-transparent',
                      (collapsed && !isMobileMode) && 'justify-center px-0'
                    )}
                    onClick={() => {
                      setActiveChatId(chat.id)
                      navigate('/chat')
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70 text-[#3b82f6]" />
                    
                    {(!collapsed || isMobileMode) ? (
                      <>
                        <div className="flex-1 overflow-x-auto min-w-0 flex items-center pr-2 thin-horizontal-scrollbar pb-0.5">
                          <span className="text-xs font-normal tracking-wide text-left whitespace-nowrap w-max block">
                            {chat.title}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChat(chat.id)
                          }}
                          className="md:hidden group-hover:flex flex items-center justify-center p-1 text-[#71717a] hover:text-rose-400 absolute right-2 top-1/2 -translate-y-1/2 bg-[#020617] border border-white/5 rounded-lg shadow-md z-30 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChat(chat.id)
                        }}
                        className="absolute right-1 top-1 hidden group-hover:flex p-0.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-400 rounded-full shadow-md backdrop-blur-sm z-30"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── FIXED BOTTOM SECTION: ACCOUNT CONTROLS & PROFILE MATRIX ── */}
      <div className="mt-auto shrink-0 p-3 border-t border-white/5 space-y-1 bg-[#020617] z-20 w-full relative">
        <button
          onClick={() => navigate('/settings')}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-[#71717a] hover:bg-white/5 hover:text-white transition-colors text-left cursor-pointer border border-transparent',
            location.pathname === '/settings' && 'bg-white/5 text-white border-white/5',
            (collapsed && !isMobileMode) && 'justify-center px-0'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobileMode) && <span>Settings</span>}
        </button>

        {(!collapsed || isMobileMode) ? (
          <div className="flex flex-col gap-2 p-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5 w-full text-left">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#3b82f6] shrink-0 font-bold text-xs uppercase shadow-inner">
                {userDisplayName.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0 flex flex-col text-left">
                <span className="text-xs font-semibold text-white truncate capitalize tracking-wide">{userDisplayName}</span>
                <span className="text-[10px] text-[#71717a] truncate font-mono tracking-tight">{userDisplayEmail}</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 mt-0.5 text-[11px] font-medium text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg border border-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Log out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center w-full px-2 py-2 mt-1 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <TooltipProvider delayDuration={0}>
      <style>{`
        .thin-horizontal-scrollbar::-webkit-scrollbar { height: 3px !important; }
        .thin-horizontal-scrollbar::-webkit-scrollbar-track { background: transparent !important; }
        .thin-horizontal-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05) !important; border-radius: 99px !important; }
        .thin-horizontal-scrollbar { scrollbar-width: thin !important; scrollbar-color: rgba(255,255,255,0.05) transparent !important; }
      `}</style>

      {/* ── 1. FLOATING MOBILE NAVBAR HEADER ── */}
      <div className="md:hidden flex items-center justify-between w-full h-14 px-4 bg-[#020617]/80 border-b border-white/5 backdrop-blur-md fixed top-0 left-0 z-40 select-none">
        <div className="flex items-center gap-2.5">
          <BrandMonogram />
          <span className="font-bold text-xs text-white uppercase tracking-[0.15em] font-sans">NEXUS AI</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="text-[#71717a] hover:text-white rounded-xl"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* ── 2. MOBILE OVERLAY RESPONSIVE DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
            />
            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-[260px] bg-[#020617] border-r border-white/5 z-50 md:hidden flex flex-col h-full shadow-2xl"
            >
              <SidebarContent isMobileMode={true} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 3. STANDARD DESKTOP STRUCTURAL ASIDE ── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="relative md:flex hidden flex-col h-screen max-h-screen bg-[#020617] border-r border-white/5 shrink-0 select-none overflow-visible"
      >
        <SidebarContent isMobileMode={false} />
      </motion.aside>
    </TooltipProvider>
  )
}