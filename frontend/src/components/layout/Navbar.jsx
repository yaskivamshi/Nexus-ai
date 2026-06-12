// frontend/src/components/layout/Navbar.jsx
import { Moon, Sun, User, LogOut } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { useState, useEffect } from 'react'
import ModelSelector from '../ModelSelector'

export default function Navbar() {
  const { user } = useAuthStore()
  const [dark, setDark] = useState(
    () => localStorage.getItem('theme') === 'dark'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-14 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md select-none">
      
      {/* ── LEFT PANE: BRAND SIGNATURE & INTEGRATED VECTOR MONOGRAM ── */}
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 40 40" className="h-5 w-auto shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 30V10L22 25V10M30 10V30" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="10" cy="10" r="2.5" fill="#3B82F6" />
          <circle cx="10" cy="30" r="2.5" fill="#3B82F6" />
          <circle cx="22" cy="25" r="2.5" fill="#3B82F6" />
          <circle cx="30" cy="10" r="2.5" fill="#3B82F6" />
          <circle cx="30" cy="30" r="2.5" fill="#3B82F6" />
        </svg>
        <span className="font-bold tracking-wider text-xs text-white uppercase hidden sm:inline-block pt-0.5">
          NEXUS <span className="text-[#3B82F6]">AI</span>
        </span>
      </div>

      {/* Center: Mounted Model Selector Layer */}
      <ModelSelector />

      {/* Right: Theme toggle + user menu */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark(!dark)}
          className="w-8 h-8 rounded-xl text-[#94a3b8] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative w-8 h-8 rounded-xl p-0 border border-white/10 hover:border-[#3B82F6]/40 transition-colors cursor-pointer">
              <Avatar className="w-8 h-8 rounded-xl">
                <AvatarImage src={user?.user_metadata?.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-[#111827] text-xs text-white font-mono font-bold rounded-xl">
                  {user?.email?.[0]?.toUpperCase() ?? <User className="w-3.5 h-3.5" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-52 bg-[#111827] border border-white/5 rounded-xl shadow-2xl p-1.5 text-left text-white backdrop-blur-md">
            <div className="px-2.5 py-2 text-[11px] font-mono text-[#94a3b8] truncate border-b border-white/5 mb-1 select-all">
              {user?.email}
            </div>
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-rose-400 focus:text-rose-400 bg-transparent focus:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign out operations</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}