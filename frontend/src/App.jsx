// frontend/src/App.jsx
import UpdatePassword from './pages/UpdatePassword'
import ForgotPassword from './pages/ForgotPassword'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import { useChatStore } from './store/chatStore' // Import the chat store to manage cross-user cache isolation

// Core Layout Shell Components
import Sidebar from './components/layout/Sidebar'
import { Skeleton } from './components/ui/skeleton'

// Master App Platform Pages
import LandingPage from './pages/LandingPage' // Modern Premium Landing Screen
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import PdfChatPage from './pages/PdfChat'
import ResumePage from './pages/Resume'
import SearchPage from './pages/Search'
import Settings from './pages/Settings'
import Voice from './pages/Voice'
import Login from './pages/Login'

// Protected route wrapper — redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <AppSkeleton />
  
  // FIXED: Do not lock out or bounce a user trying to finalize their credentials via update-password path
  if (!user && window.location.pathname !== '/update-password') {
    return <Navigate to="/login" replace />
  }
  return children
}

// Reconstructed high-fidelity obsidian layout skeleton loader matching new responsive theme specs
function AppSkeleton() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-[#09090b] overflow-hidden">
      {/* Sidebar Placeholder: Pinned on desktop, hidden on mobile */}
      <div className="hidden md:block w-64 h-full border-r border-[#27272a] bg-[#09090b] p-4 space-y-6 shrink-0">
        <Skeleton className="h-8 w-32 bg-[#1c1c1f]" />
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full bg-[#1c1c1f] rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Mobile Top Loading Header Placeholder */}
      <div className="md:hidden flex items-center justify-between w-full h-14 px-4 border-b border-[#27272a] bg-[#09090b] shrink-0">
        <Skeleton className="h-6 w-24 bg-[#1c1c1f]" />
        <Skeleton className="h-8 w-8 bg-[#1c1c1f] rounded-md" />
      </div>

      {/* View Content Loader */}
      <div className="flex-1 p-4 sm:p-8 space-y-6 overflow-hidden pt-20 md:pt-8">
        <Skeleton className="h-10 w-1/2 sm:w-1/4 bg-[#1c1c1f]" />
        <Skeleton className="h-44 w-full bg-[#1c1c1f] rounded-xl" />
      </div>
    </div>
  )
}

// Main app layout shell: Adaptive sidebar paired with borderless, max-height window views
function AppLayout({ children }) {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[#09090b] font-sans antialiased text-[#fafafa] relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* 
          FIX: Added 'pt-14 md:pt-0' to push content down cleanly on mobile/tablet viewports, 
          leaving room for the floating top sticky header without overlapping metrics.
        */}
        <main className="flex-1 overflow-y-auto bg-[#09090b] pt-14 md:pt-0 w-full h-full">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { setUser, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    // Check initial user session block on page rehydration
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // FIXED: Swapped out database call hooks to fetch isolated localStorage partitions on refresh initialization
      if (session?.user && useChatStore.getState().loadUserChats) {
        useChatStore.getState().loadUserChats(session.user.id)
      }
    })

    // Listen to real-time auth change events (Login, Signup, Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // FIXED: Intercept automated dashboard rules if an explicit password recovery thread event is received
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/update-password'
        return
      }

      if (session?.user) {
        // FIXED: Automatically fetch this user's private localStorage partitioned cache profiles
        if (useChatStore.getState().loadUserChats) {
          useChatStore.getState().loadUserChats(session.user.id)
        }
      } else if (event === 'SIGNED_OUT') {
        // Safe UI flush: hide history tracks from view layout containers without deleting stored folders
        if (useChatStore.getState().clearChatStoreUI) {
          useChatStore.getState().clearChatStoreUI()
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setLoading])

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          className: 'bg-[#121214] border border-[#27272a] text-[#fafafa] text-sm rounded-xl' 
        }} 
      />
      <Routes>
        {/* ── PUBLIC ROUTE: The Website Landing Page ── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── PUBLIC ROUTE: Authentication Onboarding Form ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* ── PROTECTED DASHBOARD CORE ROUTES ── */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  {/* FIXED: Keeps application from rendering a blank view on alternative login callbacks */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/app/dashboard" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Standard application workspace layout pages */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/pdf" element={<PdfChatPage />} />
                  <Route path="/resume" element={<ResumePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/voice" element={<Voice />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}