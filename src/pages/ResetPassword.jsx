import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { HoloPanel } from '../components/ui/HoloPanel'
import { GlitchText } from '../components/ui/GlitchText'
import { TerminalInput } from '../components/ui/TerminalInput'
import { NeonButton } from '../components/ui/NeonButton'
import toast from 'react-hot-toast'

export const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Supabase sends the user back with an access token in the URL hash
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is authenticated via the recovery link — ready to set new password
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('PASSWORDS DO NOT MATCH')
      return
    }
    if (password.length < 8) {
      toast.error('PASSWORD TOO SHORT — MIN 8 CHARS')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      toast.error('RESET FAILED: ' + error.message)
    } else {
      toast.success('PASSWORD UPDATED — ACCESS RESTORED')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <HoloPanel className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <h1 className="font-orbitron font-bold text-3xl mb-2 text-white">
            <GlitchText text="NEW_CREDENTIALS" />
          </h1>
          <p className="font-mono text-xs text-[#6B6B8A] tracking-widest">
            SET YOUR NEW PASSWORD
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <TerminalInput
            label="NEW PASS://"
            type="password"
            placeholder="Min 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <TerminalInput
            label="CONFIRM://"
            type="password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          <NeonButton type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'UPDATING...' : 'SET NEW PASSWORD'}
          </NeonButton>
          <div className="text-center font-mono text-xs text-[#6B6B8A]">
            <Link to="/login" className="hover:text-[#00F5FF]">← RETURN TO LOGIN</Link>
          </div>
        </form>
      </HoloPanel>
    </div>
  )
}
