// frontend/src/pages/UpdatePassword.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function UpdatePassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Supabase sets a recovery hash fragment in the URL when clicking the email link.
    // We check if we are in an recovery session context.
    const checkRecovery = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Session expired or invalid reset link.')
        navigate('/login')
      }
    }
    checkRecovery()
  }, [navigate])

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    try {
      // Pushes the newly configured password string securely to Supabase auth tables
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      toast.success('Password updated successfully! Redirecting to workspace...')
      
      // Since Supabase automatically signs them in during recovery, send them straight to dashboard!
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen bg-[#09090b] text-[#fafafa] font-sans antialiased items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-7 bg-[#121214]/40 border border-[#27272a]/60 p-8 rounded-2xl backdrop-blur-md shadow-xl">
        <div className="space-y-1.5 text-left">
          <h2 className="text-xl font-bold tracking-tight text-white">Create New Password</h2>
          <p className="text-xs text-[#94A3B8]">
            Please input your new secure authentication password keys framework below.
          </p>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8] font-mono">New Password</label>
            <div className="relative flex items-center bg-[#121214] border border-[#27272a] rounded-xl focus-within:border-[#3B82F6]/50 transition-colors px-3 py-2.5">
              <Lock className="w-4 h-4 text-[#94A3B8]/40 mr-2.5 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#3B82F6] hover:bg-[#3B82F6]/90 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center justify-center shadow-md active:scale-98 transition-all cursor-pointer mt-2"
          >
            <span>{loading ? 'Updating credentials...' : 'Save & Open Dashboard'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}