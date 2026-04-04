import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { HoloPanel } from '../components/ui/HoloPanel'
import { GlitchText } from '../components/ui/GlitchText'
import { TerminalInput } from '../components/ui/TerminalInput'
import { NeonButton } from '../components/ui/NeonButton'
import toast from 'react-hot-toast'

export const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    setLoading(false)
    if (error) {
      toast.error('RESET FAILED: ' + error.message)
    } else {
      setSent(true)
      toast.success('RESET LINK DISPATCHED — check your inbox')
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <HoloPanel className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <h1 className="font-orbitron font-bold text-3xl mb-2 text-white">
            <GlitchText text="PWD_RESET" />
          </h1>
          <p className="font-mono text-xs text-[#6B6B8A] tracking-widest">
            CREDENTIAL RECOVERY PROTOCOL
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-[#00F5FF] font-mono text-4xl mb-4">✓</div>
            <p className="font-mono text-[#E0E0FF] text-sm">
              RESET LINK DISPATCHED TO
            </p>
            <p className="font-orbitron text-[#00F5FF] text-sm break-all">{email}</p>
            <p className="font-mono text-[#6B6B8A] text-xs mt-4">
              Check your inbox. The link expires in 1 hour.
            </p>
            <p className="font-mono text-[#6B6B8A] text-xs">
              ⚠ If you hit rate limits, wait 60 minutes and try again.
            </p>
            <Link to="/login">
              <NeonButton variant="outline" className="w-full mt-4">RETURN TO LOGIN</NeonButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <TerminalInput
              label="EMAIL://"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <NeonButton type="submit" variant="secondary" className="w-full" disabled={loading}>
              {loading ? 'DISPATCHING...' : 'SEND RESET LINK'}
            </NeonButton>
            <div className="text-center font-mono text-xs text-[#6B6B8A]">
              <Link to="/login" className="hover:text-[#00F5FF]">← RETURN TO LOGIN</Link>
            </div>
          </form>
        )}
      </HoloPanel>
    </div>
  )
}
