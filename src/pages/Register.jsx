import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TerminalInput } from '../components/ui/TerminalInput'
import { NeonButton } from '../components/ui/NeonButton'
import { HoloPanel } from '../components/ui/HoloPanel'
import { GlitchText } from '../components/ui/GlitchText'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  full_name:  z.string().min(2, 'Name too short'),
  email:      z.string().email('Invalid email'),
  password:   z.string().min(8, 'Min 8 chars').regex(/[A-Z]/, 'Missing uppercase').regex(/[0-9]/, 'Missing number'),
  confirm:    z.string(),
  phone:      z.string().regex(/^\d{10}$/, '10 digits required'),
  college:    z.string().min(2, 'Required'),
  year_desig: z.string().min(1, 'Required')
}).refine(d => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] })

const tracks = [
  { id: 'ai',       icon: '[≈≈]',   name: 'AI / ML'        },
  { id: 'web3',     icon: '[⬡⬡]',   name: 'WEB3 / DEFI'    },
  { id: 'security', icon: '[(o)]',  name: 'CYBERSECURITY'  },
  { id: 'health',   icon: '[+──+]', name: 'HEALTHTECH'     },
  { id: 'edtech',   icon: '[►||]',  name: 'EDTECH'         },
  { id: 'smart',    icon: '[⊞⊞]',   name: 'SMART CITY'     },
  { id: 'fintech',  icon: '[¥€$]',  name: 'FINTECH'        },
  { id: 'iot',      icon: '[○─○]',  name: 'IoT / ROBOTICS' }
]

export const Register = () => {
  const [step, setStep] = useState(1)
  const [isTeam, setIsTeam] = useState(false)
  const [teamMode, setTeamMode] = useState('create') // 'create' or 'join'
  const [teamName, setTeamName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [selectedTrack, setSelectedTrack] = useState('')
  const [teamErr, setTeamErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [prefs, setPrefs] = useState({
    tshirt_size: 'M', dietary: 'none',
    github_url: '', linkedin_url: '',
    emergency_name: '', emergency_phone: ''
  })
  const [identityData, setIdentityData] = useState({})
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onIdentitySubmit = (data) => { setIdentityData(data); setStep(2) }

  const handleTeamNext = async () => {
    if (isTeam) {
      if (teamMode === 'create' && (!teamName.trim() || !selectedTrack)) {
        setTeamErr('Provide team name and track'); return
      }
      if (teamMode === 'join' && !inviteCode.trim()) {
        setTeamErr('Enter invite code'); return
      }
      if (teamMode === 'join') {
        const { data, error } = await supabase.from('teams').select('*').eq('invite_code', inviteCode.trim()).maybeSingle()
        if (error || !data) { setTeamErr('Invalid invite code'); return }
        setSelectedTrack(data.track)
      }
    } else {
      if (!selectedTrack) { setTeamErr('Select a track'); return }
    }
    setTeamErr(''); setStep(3)
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    const loader = toast.loading('REGISTERING...')
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: identityData.email,
        password: identityData.password,
        options: { data: { full_name: identityData.full_name, role: 'participant' } }
      })
      if (authErr) throw authErr
      const uid = authData.user.id

      // Update profile with extra fields
      await supabase.from('profiles').update({
        phone: identityData.phone, college: identityData.college,
        year_desig: identityData.year_desig, ...prefs
      }).eq('id', uid)

      let tId = null
      if (isTeam) {
        if (teamMode === 'create') {
          const { data: team, error: tErr } = await supabase.from('teams').insert({
            name: teamName, leader_id: uid, track: selectedTrack
          }).select().single()
          if (tErr) throw tErr
          tId = team.id
          await supabase.from('team_members').insert({ team_id: tId, user_id: uid })
        } else {
          const { data: team } = await supabase.from('teams').select('id').eq('invite_code', inviteCode.trim()).single()
          tId = team.id
          await supabase.from('team_members').insert({ team_id: tId, user_id: uid })
        }
      }

      const { error: regError } = await supabase.from('registrations').insert({
        user_id: uid, team_id: tId, status: 'confirmed'
      })
      if (regError) throw regError

      toast.dismiss(loader)
      toast.success('REGISTRATION COMPLETE — WELCOME TO GENESIS')
      navigate('/login')
    } catch (err) {
      toast.dismiss(loader)
      toast.error(err.message || 'REGISTRATION FAILED')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = ['IDENTITY', 'TEAM', 'PREFS', 'CONFIRM']

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[600px] flex flex-col gap-6">

        {/* Step tracker */}
        <HoloPanel className="flex justify-between items-center px-8 relative overflow-hidden">
          <div className="absolute top-1/2 left-8 right-8 h-[1px] bg-[#2A2A3F] -translate-y-1/2 z-0" />
          {steps.map((label, idx) => {
            const num = idx + 1
            const done = step > num; const active = step === num
            return (
              <div key={label} className="relative z-10 flex flex-col items-center gap-2 bg-[#12121A] px-2">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-orbitron text-xs transition-all ${done ? 'bg-[#00F5FF] border-[#00F5FF] text-[#0A0A0F]' : active ? 'border-[#00F5FF] text-[#00F5FF] shadow-[0_0_10px_#00F5FF]' : 'border-[#2A2A3F] text-[#6B6B8A]'}`}>
                  {done ? '✓' : num}
                </div>
                <span className={`text-[10px] font-mono tracking-widest ${active ? 'text-[#00F5FF]' : 'text-[#6B6B8A]'}`}>{label}</span>
              </div>
            )
          })}
        </HoloPanel>

        <HoloPanel>
          <div className="text-center mb-8">
            <h1 className="font-orbitron font-bold text-2xl text-white">
              <GlitchText text={`INIT_${steps[step - 1]}`} />
            </h1>
          </div>

          {/* STEP 1: Identity */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onIdentitySubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><TerminalInput label="NAME://" {...register('full_name')} />{errors.full_name && <p className="text-[#FF2D78] font-mono text-[10px] mt-1">{errors.full_name.message}</p>}</div>
                <div><TerminalInput label="EMAIL://" type="email" {...register('email')} />{errors.email && <p className="text-[#FF2D78] font-mono text-[10px] mt-1">{errors.email.message}</p>}</div>
                <div><TerminalInput label="PASS://" type="password" {...register('password')} />{errors.password && <p className="text-[#FF2D78] font-mono text-[10px] mt-1">{errors.password.message}</p>}</div>
                <div><TerminalInput label="CONFIRM://" type="password" {...register('confirm')} />{errors.confirm && <p className="text-[#FF2D78] font-mono text-[10px] mt-1">{errors.confirm.message}</p>}</div>
                <div><TerminalInput label="PHONE://" {...register('phone')} />{errors.phone && <p className="text-[#FF2D78] font-mono text-[10px] mt-1">{errors.phone.message}</p>}</div>
                <div><TerminalInput label="COLLEGE://" {...register('college')} />{errors.college && <p className="text-[#FF2D78] font-mono text-[10px] mt-1">{errors.college.message}</p>}</div>
                <div className="md:col-span-2"><TerminalInput label="YEAR/DESIGNATION://" {...register('year_desig')} />{errors.year_desig && <p className="text-[#FF2D78] font-mono text-[10px] mt-1">{errors.year_desig.message}</p>}</div>
              </div>
              <NeonButton type="submit" className="mt-4">PROCEED</NeonButton>
            </form>
          )}

          {/* STEP 2: Team */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <button onClick={() => setIsTeam(false)} className={`flex-1 py-4 border transition-all font-orbitron tracking-widest ${!isTeam ? 'border-[#00F5FF] bg-[rgba(0,245,255,0.1)] text-[#00F5FF]' : 'border-[#2A2A3F] text-[#6B6B8A]'}`}>SOLO</button>
                <button onClick={() => setIsTeam(true)}  className={`flex-1 py-4 border transition-all font-orbitron tracking-widest ${isTeam  ? 'border-[#00F5FF] bg-[rgba(0,245,255,0.1)] text-[#00F5FF]' : 'border-[#2A2A3F] text-[#6B6B8A]'}`}>TEAM</button>
              </div>

              {isTeam && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <button onClick={() => setTeamMode('create')} className={`flex-1 py-2 text-xs font-mono border transition-all ${teamMode === 'create' ? 'border-[#FF2D78] text-[#FF2D78]' : 'border-[#2A2A3F] text-[#6B6B8A]'}`}>CREATE TEAM</button>
                    <button onClick={() => setTeamMode('join')}   className={`flex-1 py-2 text-xs font-mono border transition-all ${teamMode === 'join'   ? 'border-[#FF2D78] text-[#FF2D78]' : 'border-[#2A2A3F] text-[#6B6B8A]'}`}>JOIN WITH CODE</button>
                  </div>
                  {teamMode === 'create'
                    ? <TerminalInput label="TEAM NAME://" value={teamName} onChange={e => setTeamName(e.target.value)} />
                    : <TerminalInput label="INVITE CODE://" value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="8-char code" />
                  }
                </div>
              )}

              {(!isTeam || teamMode === 'create') && (
                <div>
                  <label className="text-cp-muted text-sm tracking-widest font-mono mb-2 block">SELECT TRACK://</label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {tracks.map(t => (
                      <button key={t.id} onClick={() => setSelectedTrack(t.name)}
                        className={`flex flex-col items-center p-3 border transition-all relative ${selectedTrack === t.name ? 'border-[#00F5FF] bg-[rgba(0,245,255,0.08)] text-[#00F5FF]' : 'border-[#2A2A3F] hover:border-[#6B6B8A] text-[#6B6B8A]'}`}>
                        {selectedTrack === t.name && <span className="absolute top-1 right-1 text-[8px]">✓</span>}
                        <span className="font-mono text-[#FF2D78] mb-1">{t.icon}</span>
                        <span className="font-orbitron text-[7px] text-center">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {teamErr && <p className="text-[#FF2D78] font-mono text-xs">{teamErr}</p>}
              <div className="flex gap-4">
                <NeonButton variant="outline" onClick={() => setStep(1)} className="flex-1">BACK</NeonButton>
                <NeonButton variant="primary" onClick={handleTeamNext} className="flex-1">PROCEED</NeonButton>
              </div>
            </div>
          )}

          {/* STEP 3: Prefs */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-cp-muted text-sm tracking-widest font-mono mb-2 block">T-SHIRT SIZE://</label>
                  <select value={prefs.tshirt_size} onChange={e => setPrefs({...prefs, tshirt_size: e.target.value})}
                    className="w-full bg-[#12121A] border border-[#2A2A3F] p-3 text-white font-mono outline-none focus:border-[#00F5FF]">
                    {['XS','S','M','L','XL','XXL'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-cp-muted text-sm tracking-widest font-mono mb-2 block">DIETARY://</label>
                  <select value={prefs.dietary} onChange={e => setPrefs({...prefs, dietary: e.target.value})}
                    className="w-full bg-[#12121A] border border-[#2A2A3F] p-3 text-white font-mono outline-none focus:border-[#00F5FF]">
                    {['none','Vegetarian','Vegan','Jain','Gluten-Free'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <TerminalInput label="GITHUB URL://" value={prefs.github_url} onChange={e => setPrefs({...prefs, github_url: e.target.value})} />
                <TerminalInput label="LINKEDIN URL://" value={prefs.linkedin_url} onChange={e => setPrefs({...prefs, linkedin_url: e.target.value})} />
                <TerminalInput label="EMERGENCY NAME://" value={prefs.emergency_name} onChange={e => setPrefs({...prefs, emergency_name: e.target.value})} />
                <TerminalInput label="EMERGENCY PHONE://" value={prefs.emergency_phone} onChange={e => setPrefs({...prefs, emergency_phone: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <NeonButton variant="outline" onClick={() => setStep(2)} className="flex-1">BACK</NeonButton>
                <NeonButton variant="primary" onClick={() => setStep(4)} className="flex-1">PROCEED</NeonButton>
              </div>
            </div>
          )}

          {/* STEP 4: Confirm */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#0A0A0F] border border-[#2A2A3F] p-6 font-mono text-xs space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[#6B6B8A]">
                  <div>NAME: <span className="text-white">{identityData.full_name}</span></div>
                  <div>EMAIL: <span className="text-white">{identityData.email}</span></div>
                  <div>PHONE: <span className="text-white">{identityData.phone}</span></div>
                  <div>COLLEGE: <span className="text-white">{identityData.college}</span></div>
                  <div>YEAR: <span className="text-white">{identityData.year_desig}</span></div>
                  <div>MODE: <span className="text-white">{isTeam ? `TEAM${teamMode === 'create' ? ` — ${teamName}` : ' (JOIN)'}` : 'SOLO'}</span></div>
                  <div>TRACK: <span className="text-[#FF2D78]">{selectedTrack}</span></div>
                  <div>T-SHIRT: <span className="text-white">{prefs.tshirt_size}</span></div>
                </div>
              </div>
              <div className="text-center font-mono text-xs text-[#39FF14] border border-[#39FF14]/30 bg-[#39FF14]/5 p-3">
                ✓ REGISTRATION IS FREE — NO PAYMENT REQUIRED
              </div>
              <div className="flex gap-4">
                <NeonButton variant="outline" onClick={() => setStep(3)} className="w-[100px]">BACK</NeonButton>
                <NeonButton variant="primary" onClick={handleConfirm} disabled={submitting} className="flex-1">
                  {submitting ? 'INITIALIZING...' : 'CONFIRM REGISTRATION'}
                </NeonButton>
              </div>
            </div>
          )}
        </HoloPanel>

        <div className="text-center">
          <Link to="/login" className="font-mono text-xs text-[#6B6B8A] hover:text-[#00F5FF]">
            ALREADY IN THE MATRIX? LOG IN
          </Link>
        </div>
      </div>
    </div>
  )
}
