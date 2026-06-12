// frontend/src/pages/ForgotPassword.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, KeyRound } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please input your email address')
      return
    }

    setLoading(true)
    try {
      // Sends a secure recovery handshake to the user's inbox
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login', // Fallback return redirect target
      })

      if (error) throw error

      setSubmitted(true)
      toast.success('Recovery link dispatched successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch recovery link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090b] text-[#fafafa] font-sans antialiased items-center justify-center relative px-4">
      {/* Background Decorative Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[400px] h-[300px] bg-[#3b82f6]/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-sm mx-auto space-y-7 z-10 relative bg-[#121214]/40 border border-[#27272a]/60 p-8 rounded-2xl backdrop-blur-md shadow-xl">
        {/* Back navigation button link wrapper */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors bg-transparent border-none cursor-pointer group text-left p-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to sign in</span>
        </button>

        {!submitted ? (
          <>
            <div className="space-y-1.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] mb-3">
                <KeyRound className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Reset password</h2>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Enter your email address below and we'll transmit a secure recovery security key to reset your credentials framework.
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4 text-left">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#3B82F6] hover:bg-[#3B82F6]/90 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center justify-center shadow-md active:scale-98 transition-all cursor-pointer mt-2"
              >
                <span>{loading ? 'Sending key data...' : 'Send Reset Link'}</span>
              </button>
            </form>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 text-center py-4"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mx-auto mb-2">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-md font-semibold text-white">Check your email</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-xs mx-auto">
              We have dispatched security token keys to <span className="text-white font-medium">{email}</span>. Please execute the embedded link authorization inside your inbox.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-4 text-xs font-semibold text-[#3B82F6] hover:underline bg-transparent border-none cursor-pointer"
            >
              Return to Login Interface
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}