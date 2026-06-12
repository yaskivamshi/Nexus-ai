// frontend/src/pages/Login.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { user, setUser, setSession } = useAuthStore()
  const [isSignUp, setIsSignUp] = useState(false) // Dynamic view toggle engine
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Absolute redirect boundary: If an authenticated session is active, push to app
  if (user && !window.location.hash.includes('type=recovery') && window.location.pathname !== '/update-password') {
    return <Navigate to="/app/dashboard" replace />
  }

  // Handle Google OAuth Handshake Redirects
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/app/dashboard' },
      })
      if (error) throw error
    } catch (err) {
      toast.error(err.message || 'OAuth initialization failed')
    }
  }

  // Unified Form Submission Pipeline
  const handleEmailAuth = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please populate all required authentication inputs')
      return
    }
    if (isSignUp && !name) {
      toast.error('Name entry is mandatory for profile initialization')
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: window.location.origin + '/app/dashboard'
          }
        })
        if (error) throw error
        
        if (data?.user && data?.session === null) {
          toast.success('Registration success! Check your inbox for verification links.')
        } else {
          if (data?.session) {
            setSession(data.session)
            setUser(data.user)
          }
          toast.success('Welcome to Nexus AI! Profile deployed.')
          navigate('/app/dashboard')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        setSession(data.session)
        setUser(data.user)
        
        toast.success('Access keys validated. Synchronizing workspace...')
        navigate('/app/dashboard')
      }
    } catch (err) {
      toast.error(err.message || 'Authentication lifecycle crash')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090b] text-[#fafafa] font-sans antialiased selection:bg-[#3B82F6]/30">
      
      {/* ── LEFT PANE: BRAND PRESENTATION & CINEMATIC WALLPAPER ── */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative p-12 flex-col justify-between overflow-hidden border-r border-[#27272a]/30 text-left">
        
        {/* Dynamic Background Mesh Asset Layer */}
        <div className="absolute inset-0 z-0 bg-[#050816]">
          <div className="absolute inset-0 opacity-25 mix-blend-screen bg-cover bg-center bg-no-repeat transition-all duration-700 filter saturate-[0.8] contrast-[1.1]"
               style={{ 
                 backgroundImage: isSignUp 
                   ? `url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200')` 
                   : `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200')` 
               }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#09090b] z-10" />
        </div>

        {/* ── BRAND LOGO HUD HEADER (EMBEDDED VECTOR) ── */}
        <div className="relative z-20 flex items-center gap-2.5 select-none">
          <svg viewBox="0 0 40 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 30V10L22 25V10M30 10V30" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="10" cy="10" r="2.5" fill="#3B82F6" />
            <circle cx="10" cy="30" r="2.5" fill="#3B82F6" />
            <circle cx="22" cy="25" r="2.5" fill="#3B82F6" />
            <circle cx="30" cy="10" r="2.5" fill="#3B82F6" />
            <circle cx="30" cy="30" r="2.5" fill="#3B82F6" />
            <path d="M10 10L30 30" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
          </svg>
          <span className="font-bold tracking-tight text-lg text-white font-sans">
            NEXUS <span className="text-[#3B82F6]">AI</span>
          </span>
        </div>

        {/* Text Presentation Matrix Banner */}
        <div className="relative z-20 max-w-md space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? 'signup-title' : 'signin-title'}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                {isSignUp ? 'Start your AI journey today' : 'Welcome back to your AI command center'}
              </h1>
            </motion.div>
          </AnimatePresence>
          <p className="text-sm text-[#94A3B8] leading-relaxed font-normal opacity-90">
            {isSignUp 
              ? 'Join thousands of users leveraging advanced automation to optimize context parameters and design modern structures.' 
              : 'Access multiple connected model modalities, review real-time indexes, and synchronize your engineering operations.'}
          </p>
        </div>

        {/* Corporate Copyright Stamp Node */}
        <div className="relative z-20 text-[10px] font-mono text-[#94A3B8]/30 tracking-widest uppercase">
          &copy; {new Date().getFullYear()} NEXUS AI INC. // SECURE NODE ENCRYPTION CONNECTED.
        </div>
      </div>

      {/* ── RIGHT PANE: CORE INTERACTIVE AUTH CONSOLE FORM ── */}
      <div className="w-full lg:w-1/2 h-full bg-[#09090b] flex flex-col justify-center px-6 sm:px-16 lg:px-24 xl:px-32 relative overflow-y-auto">
        <div className="w-full max-w-sm mx-auto space-y-7 py-8">
          
          {/* Header Action Routing Prompt Title */}
          <div className="space-y-1.5 text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isSignUp ? 'Create account' : 'Sign in'}
            </h2>
            <p className="text-xs text-[#94A3B8]">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button 
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setPassword(''); }}
                className="text-[#3B82F6] hover:underline font-medium ml-0.5 cursor-pointer bg-transparent border-none"
              >
                {isSignUp ? 'Sign in' : 'Create one'}
              </button>
            </p>
          </div>

          {/* Form Interactive Content Ingestion Stack */}
          <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
            
            {/* NAME INPUT */}
            <AnimatePresence initial={false}>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8] font-mono">Name</label>
                  <div className="relative flex items-center bg-[#121214] border border-[#27272a] rounded-xl focus-within:border-[#3B82F6]/50 transition-colors px-3 py-2.5">
                    <User className="w-4 h-4 text-[#94A3B8]/40 mr-2.5 shrink-0" />
                    <input
                      type="text"
                      required={isSignUp}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-transparent text-xs text-white placeholder-[#94A3B8]/20 focus:outline-none font-normal"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EMAIL INPUT */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8] font-mono">Email Address</label>
              <div className="relative flex items-center bg-[#121214] border border-[#27272a] rounded-xl focus-within:border-[#3B82F6]/50 transition-colors px-3 py-2.5">
                <Mail className="w-4 h-4 text-[#94A3B8]/40 mr-2.5 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-xs text-white placeholder-[#94A3B8]/20 focus:outline-none font-normal"
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8] font-mono">Password</label>
                {!isSignUp && (
                  <button 
                    type="button" 
                    onClick={() => navigate('/forgot-password')}
                    className="text-[10px] text-[#3B82F6] hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center bg-[#121214] border border-[#27272a] rounded-xl focus-within:border-[#3B82F6]/50 transition-colors px-3 py-2.5">
                <Lock className="w-4 h-4 text-[#94A3B8]/40 mr-2.5 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'}
                  className="w-full bg-transparent text-xs text-white placeholder-[#94A3B8]/20 focus:outline-none font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-0.5 text-[#94A3B8]/40 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* PRIMARY BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#3B82F6] hover:bg-[#3B82F6]/90 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#3B82F6]/10 active:scale-98 transition-all pt-0.5 cursor-pointer mt-2"
            >
              <span>{loading ? 'Processing transaction...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* SEPARATOR */}
          <div className="relative flex py-2 items-center">
            <div className="flex-1 border-t border-[#27272a]/40"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono tracking-widest text-[#94A3B8]/30 uppercase">or continue with</span>
            <div className="flex-1 border-t border-[#27272a]/40"></div>
          </div>

          {/* OAUTH SSO BUTTON */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-11 bg-transparent hover:bg-[#121214] text-white border border-[#27272a] rounded-xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer font-medium"
          >
            <svg className="w-3.5 h-3.5 mr-0.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z" />
              <path fill="#4285F4" d="M23.64 12.218c0-.782-.07-1.536-.2-2.264H12v4.516h6.533a5.578 5.578 0 0 1-2.42 3.664l3.766 2.922c2.201-2.03 3.471-5.018 3.471-8.62z" />
              <path fill="#FBBC05" d="M5.266 14.235L1.24 17.35A11.947 11.947 0 0 1 0 12c0-1.926.456-3.741 1.24-5.35l4.026 3.115A7.042 7.042 0 0 0 4.91 12c0 1.574.52 3.03 1.356 4.235z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.955-1.078 7.936-2.915l-3.766-2.922c-1.047.7-2.384 1.116-4.17 1.116-3.217 0-5.934-2.146-6.907-5.035L1.066 17.35C3.024 21.302 7.096 24 12 24z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* LEGAL TERMS */}
          <p className="text-[10px] text-[#94A3B8]/40 leading-relaxed font-normal text-center max-w-xs mx-auto">
            By creating an account, you agree to our{' '}
            <a href="#terms" className="text-[#3B82F6]/60 hover:text-[#3B82F6] underline transition-colors">Terms of Service</a>{' '}
            and{' '}
            <a href="#privacy" className="text-[#3B82F6]/60 hover:text-[#3B82F6] underline transition-colors">Privacy Policy</a>.
          </p>

        </div>
      </div>

    </div>
  )
}