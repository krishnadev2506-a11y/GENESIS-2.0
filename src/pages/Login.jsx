import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TerminalInput } from '../components/ui/TerminalInput'
import { NeonButton } from '../components/ui/NeonButton'
import { HoloPanel } from '../components/ui/HoloPanel'
import { GlitchText } from '../components/ui/GlitchText'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export const Login = () => {
  const [activeTab, setActiveTab] = useState('participant')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data, error } = await login(email, password)
    if (error) { toast.error('ACCESS DENIED: ' + error.message); return }

    // Try fetching profile from DB; fall back to auth metadata if RLS blocks it
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
    const role = profile?.role ?? data.user.user_metadata?.role ?? 'participant'

    if (activeTab === 'admin' && role !== 'admin') {
      toast.error('ACCESS DENIED: Insufficient clearance level')
      await supabase.auth.signOut()
      return
    }
    navigate(role === 'admin' ? '/admin' : '/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <HoloPanel className="w-full max-w-[440px]">
        <div className="flex border-b border-[#2A2A3F] mb-6">
          <button 
            type="button"
            className={`flex-1 py-3 font-mono text-sm tracking-widest transition-colors ${activeTab === 'participant' ? 'border-b-2 border-[#00F5FF] text-[#00F5FF]' : 'text-[#6B6B8A]'}`}
            onClick={() => setActiveTab('participant')}
          >
            PARTICIPANT
          </button>
          <button 
             type="button"
             className={`flex-1 py-3 font-mono text-sm tracking-widest transition-colors ${activeTab === 'admin' ? 'border-b-2 border-[#FF2D78] text-[#FF2D78]' : 'text-[#6B6B8A]'}`}
             onClick={() => setActiveTab('admin')}
          >
            ADMIN
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="text-center mb-4">
            <h1 className="font-orbitron font-bold text-3xl mb-2 text-white">
              <GlitchText text={activeTab === 'admin' ? 'SYSTEM_OVERRIDE' : 'SYS_LOGIN'} />
            </h1>
            <p className="font-mono text-xs text-[#6B6B8A] uppercase tracking-widest">Awaiting Credentials...</p>
          </div>

          <TerminalInput 
            label="EMAIL://" 
            type="email" 
            placeholder="hacker@genesis.dev" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <div className="relative">
            <TerminalInput 
              label="PASS://" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="button"
              className="absolute right-3 top-[38px] text-[#6B6B8A] hover:text-[#00F5FF] font-mono text-xs"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '[HIDE]' : '[SHOW]'}
            </button>
          </div>

          <NeonButton type="submit" variant={activeTab === 'admin' ? 'secondary' : 'primary'} className="w-full">
            ACCESS SYSTEM
          </NeonButton>
        </form>

        <div className="mt-6 text-center flex flex-col gap-2 font-mono text-xs text-[#6B6B8A]">
          <Link to="/forgot-password" className="hover:text-[#FF2D78] hover:underline underline-offset-4">RESET PASSWORD</Link>
          <Link to="/register" className="hover:text-[#00F5FF] hover:underline underline-offset-4">NO ACCOUNT? INITIALIZE ENTITY</Link>
        </div>
      </HoloPanel>
    </div>
  )
}
