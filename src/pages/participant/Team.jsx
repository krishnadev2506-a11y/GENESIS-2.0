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

  if (loading) return <div className="p-6 font-mono text-cp-cyan animate-pulse md:p-8">LOADING...</div>

  return (
    <div className="max-w-3xl space-y-6 p-6 md:p-8">
      <div>
        <h1 className="mb-1 font-orbitron text-3xl font-bold tracking-[0.08em] text-cp-magenta"><GlitchText text="TEAM_MODULE" /></h1>
        <p className="font-mono text-sm tracking-[0.2em] text-cp-muted">MANAGE YOUR SQUAD</p>
      </div>

      {team ? (
        <>
          <HoloPanel className="border-l-4 border-cp-magenta/60">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="font-orbitron text-xl text-white">{team.name}</h2>
                <p className="mt-1 font-mono text-xs text-cp-magenta">{team.track}</p>
              </div>
              <NeonButton variant="danger" onClick={handleLeave} className="text-xs !px-3 !py-1">LEAVE</NeonButton>
            </div>
            <div className="panel-muted flex items-center gap-3 p-4">
              <div className="flex-1">
                <p className="mb-1 font-mono text-[10px] tracking-[0.18em] text-cp-muted">INVITE CODE</p>
                <p className="font-orbitron text-2xl font-bold tracking-[0.3em] text-cp-cyan">{team.invite_code}</p>
              </div>
              <button onClick={copyCode} className="rounded-xl border border-cp-cyan/18 bg-cp-cyan/[0.05] p-2.5 text-cp-cyan transition-all duration-200 hover:border-cp-cyan/34 hover:text-white">
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <p className="mt-2 font-mono text-[10px] text-cp-muted">Share this code with teammates to join your team</p>
          </HoloPanel>

          <HoloPanel>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-orbitron text-sm tracking-widest text-white">
                <Users size={16} className="text-cp-magenta" /> MEMBERS ({members.length}/{team.max_members})
              </h2>
            </div>
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="panel-muted flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cp-magenta/[0.18] font-mono text-sm text-cp-magenta">
                    {m.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="flex items-center gap-2 font-mono text-sm text-white">
                      {m.profiles?.full_name}
                      {m.user_id === team.leader_id && <Crown size={12} className="text-cp-yellow" />}
                    </p>
                    <p className="font-mono text-[10px] text-cp-muted">{m.profiles?.college}</p>
                  </div>
                </div>
              ))}
              {members.length < team.max_members && (
                <div className="rounded-2xl border border-dashed border-cp-border p-3 text-center font-mono text-xs tracking-[0.16em] text-cp-muted">
                  {team.max_members - members.length} SLOT(S) OPEN - SHARE INVITE CODE
                </div>
              )}
            </div>
          </HoloPanel>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <HoloPanel>
            <h2 className="mb-4 font-orbitron text-sm tracking-widest text-cp-cyan">JOIN A TEAM</h2>
            <div className="space-y-4">
              <TerminalInput label="INVITE CODE://" value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="8-char code" />
              <NeonButton variant="primary" onClick={handleJoin} disabled={submitting} className="w-full">
                {submitting ? 'JOINING...' : 'JOIN TEAM'}
              </NeonButton>
            </div>
          </HoloPanel>

          <HoloPanel>
            <h2 className="mb-4 font-orbitron text-sm tracking-widest text-cp-magenta">CREATE A TEAM</h2>
            <div className="space-y-4">
              <TerminalInput label="TEAM NAME://" value={createName} onChange={e => setCreateName(e.target.value)} />
              <div>
                <label className="mb-2 block font-mono text-[11px] tracking-[0.22em] text-cp-muted">TRACK://</label>
                <select value={createTrack} onChange={e => setCreateTrack(e.target.value)} className="field-shell w-full px-4 py-3 text-sm text-white outline-none">
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
