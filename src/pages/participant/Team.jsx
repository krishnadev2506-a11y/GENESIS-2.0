import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { NeonButton } from '../../components/ui/NeonButton'
import { TerminalInput } from '../../components/ui/TerminalInput'
import { Users, Copy, Check, Crown } from 'lucide-react'
import toast from 'react-hot-toast'

export const TeamPage = () => {
  const { profile } = useAuthStore()
  const [registration, setRegistration] = useState(null)
  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [joinCode, setJoinCode] = useState('')
  const [createName, setCreateName] = useState('')
  const [createTrack, setCreateTrack] = useState('AI / ML')
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const tracks = ['AI / ML', 'WEB3 / DEFI', 'CYBERSECURITY', 'HEALTHTECH', 'EDTECH', 'SMART CITY', 'FINTECH', 'IoT / ROBOTICS']

  const load = async () => {
    if (!profile) return
    setLoading(true)
    const { data: reg } = await supabase.from('registrations').select('*').eq('user_id', profile.id).maybeSingle()
    setRegistration(reg)
    if (reg?.team_id) {
      const { data: t } = await supabase.from('teams').select('*').eq('id', reg.team_id).single()
      setTeam(t)
      const { data: mems } = await supabase.from('team_members').select('*, profiles(full_name, email, college)').eq('team_id', reg.team_id)
      setMembers(mems || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [profile])

  const copyCode = () => {
    navigator.clipboard.writeText(team.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('INVITE CODE COPIED')
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return toast.error('Enter invite code')
    setSubmitting(true)
    const { data: t } = await supabase.from('teams').select('*').eq('invite_code', joinCode.trim()).maybeSingle()
    if (!t) { toast.error('INVALID CODE'); setSubmitting(false); return }
    const { count } = await supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('team_id', t.id)
    if (count >= t.max_members) { toast.error('TEAM IS FULL'); setSubmitting(false); return }
    const { error } = await supabase.from('team_members').insert({ team_id: t.id, user_id: profile.id })
    if (error) { toast.error(error.message); setSubmitting(false); return }
    await supabase.from('registrations').update({ team_id: t.id }).eq('user_id', profile.id)
    toast.success('JOINED TEAM: ' + t.name)
    load(); setSubmitting(false)
  }

  const handleCreate = async () => {
    if (!createName.trim()) return toast.error('Enter team name')
    setSubmitting(true)
    const { data: t, error } = await supabase.from('teams').insert({ name: createName, leader_id: profile.id, track: createTrack }).select().single()
    if (error) { toast.error(error.message); setSubmitting(false); return }
    await supabase.from('team_members').insert({ team_id: t.id, user_id: profile.id })
    await supabase.from('registrations').update({ team_id: t.id }).eq('user_id', profile.id)
    toast.success('TEAM CREATED: ' + t.name)
    load(); setSubmitting(false)
  }

  const handleLeave = async () => {
    if (!confirm('Leave team?')) return
    await supabase.from('team_members').delete().eq('team_id', team.id).eq('user_id', profile.id)
    await supabase.from('registrations').update({ team_id: null }).eq('user_id', profile.id)
    toast.success('LEFT TEAM')
    setTeam(null); setMembers([]); load()
  }

  if (loading) return <div className="p-8 font-mono text-cp-cyan animate-pulse">LOADING...</div>

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="font-orbitron font-bold text-3xl text-cp-magenta mb-1"><GlitchText text="TEAM_MODULE" /></h1>
        <p className="font-mono text-cp-muted text-sm">MANAGE YOUR SQUAD</p>
      </div>

      {team ? (
        <>
          {/* Team info */}
          <HoloPanel className="border-l-4 border-cp-magenta">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-orbitron text-xl text-white">{team.name}</h2>
                <p className="font-mono text-cp-magenta text-xs mt-1">{team.track}</p>
              </div>
              <NeonButton variant="danger" onClick={handleLeave} className="text-xs !py-1 !px-3">LEAVE</NeonButton>
            </div>
            <div className="flex items-center gap-3 bg-cp-dark border border-cp-border p-3 rounded-sm">
              <div className="flex-1">
                <p className="font-mono text-[10px] text-cp-muted mb-1">INVITE CODE</p>
                <p className="font-orbitron text-2xl text-cp-cyan tracking-[0.3em] font-bold">{team.invite_code}</p>
              </div>
              <button onClick={copyCode} className="text-cp-cyan hover:text-white transition-colors p-2">
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <p className="font-mono text-[10px] text-cp-muted mt-2">Share this code with teammates to join your team</p>
          </HoloPanel>

          {/* Members */}
          <HoloPanel>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron text-sm text-white tracking-widest flex items-center gap-2">
                <Users size={16} className="text-cp-magenta" /> MEMBERS ({members.length}/{team.max_members})
              </h2>
            </div>
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-cp-dark border border-cp-border">
                  <div className="w-8 h-8 rounded-full bg-[rgba(255,45,120,0.2)] flex items-center justify-center font-mono text-cp-magenta text-sm">
                    {m.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-sm text-white flex items-center gap-2">
                      {m.profiles?.full_name}
                      {m.user_id === team.leader_id && <Crown size={12} className="text-cp-yellow" />}
                    </p>
                    <p className="font-mono text-[10px] text-cp-muted">{m.profiles?.college}</p>
                  </div>
                </div>
              ))}
              {members.length < team.max_members && (
                <div className="p-3 border border-dashed border-cp-border text-center font-mono text-xs text-cp-muted">
                  {team.max_members - members.length} SLOT(S) OPEN — SHARE INVITE CODE
                </div>
              )}
            </div>
          </HoloPanel>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Join team */}
          <HoloPanel>
            <h2 className="font-orbitron text-sm text-cp-cyan mb-4 tracking-widest">JOIN A TEAM</h2>
            <div className="space-y-4">
              <TerminalInput label="INVITE CODE://" value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="8-char code" />
              <NeonButton variant="primary" onClick={handleJoin} disabled={submitting} className="w-full">
                {submitting ? 'JOINING...' : 'JOIN TEAM'}
              </NeonButton>
            </div>
          </HoloPanel>

          {/* Create team */}
          <HoloPanel>
            <h2 className="font-orbitron text-sm text-cp-magenta mb-4 tracking-widest">CREATE A TEAM</h2>
            <div className="space-y-4">
              <TerminalInput label="TEAM NAME://" value={createName} onChange={e => setCreateName(e.target.value)} />
              <div>
                <label className="font-mono text-xs text-cp-muted tracking-widest mb-2 block">TRACK://</label>
                <select value={createTrack} onChange={e => setCreateTrack(e.target.value)}
                  className="w-full bg-cp-dark border border-cp-border p-3 text-white font-mono text-sm outline-none focus:border-cp-magenta">
                  {tracks.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <NeonButton variant="secondary" onClick={handleCreate} disabled={submitting} className="w-full">
                {submitting ? 'CREATING...' : 'CREATE TEAM'}
              </NeonButton>
            </div>
          </HoloPanel>
        </div>
      )}
    </div>
  )
}
