import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { QrCode, Users, Upload, Calendar, Megaphone, Clock } from 'lucide-react'

export const ParticipantDashboard = () => {
  const { profile } = useAuthStore()
  const [registration, setRegistration] = useState(null)
  const [team, setTeam] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) {
      setLoading(false)
      return
    }
    const load = async () => {
      const { data: reg } = await supabase.from('registrations').select('*').eq('user_id', profile.id).maybeSingle()
      setRegistration(reg)
      if (reg?.team_id) {
        const { data: t } = await supabase.from('teams').select('*, team_members(count)').eq('id', reg.team_id).single()
        setTeam(t)
      }
      const { data: ann } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3)
      setAnnouncements(ann || [])
      setLoading(false)
    }
    load()
  }, [profile])

  const quickLinks = [
    { to: '/dashboard/qr', icon: QrCode, label: 'MY QR CODE', color: 'text-cp-cyan', border: 'border-cp-cyan' },
    { to: '/dashboard/team', icon: Users, label: 'MY TEAM', color: 'text-cp-magenta', border: 'border-cp-magenta' },
    { to: '/dashboard/submit', icon: Upload, label: 'SUBMIT', color: 'text-[#39FF14]', border: 'border-[#39FF14]' },
    { to: '/dashboard/schedule', icon: Calendar, label: 'SCHEDULE', color: 'text-cp-yellow', border: 'border-cp-yellow' },
  ]

  if (loading) return <div className="p-6 font-mono text-cp-cyan animate-pulse md:p-8">LOADING...</div>
  if (!profile) return (
    <div className="max-w-5xl p-6 md:p-8">
      <HoloPanel className="border-cp-magenta text-center py-12">
        <p className="mb-4 font-mono text-sm text-cp-magenta">PROFILE SYNC ERROR</p>
        <p className="font-mono text-xs text-cp-muted">Your auth token is active, but your database profile is missing.</p>
        <p className="mt-2 font-mono text-xs text-cp-muted">This happens when databases are reset. Please click LOGOUT in the sidebar and register again.</p>
      </HoloPanel>
    </div>
  )

  return (
    <div className="max-w-5xl space-y-8 p-4 md:p-8">
      <div className="space-y-2">
        <h1 className="mb-1 font-orbitron text-3xl font-bold tracking-[0.08em] text-cp-cyan">
          <GlitchText text="OPERATOR_HQ" />
        </h1>
        <p className="font-mono text-sm tracking-[0.2em] text-cp-muted">WELCOME BACK, {profile?.full_name?.toUpperCase()}</p>
      </div>

      <HoloPanel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-[11px] tracking-[0.22em] text-cp-muted">REGISTRATION STATUS</p>
          <div className="flex items-center gap-3">
            <StatusBadge status={registration?.status || 'not registered'} />
            {registration && <span className="font-mono text-xs tracking-[0.18em] text-cp-muted">{registration.registration_no}</span>}
          </div>
        </div>
        {!registration && (
          <Link to="/register">
            <button className="rounded-2xl border border-cp-cyan/28 bg-cp-cyan/[0.08] px-4 py-2.5 font-mono text-[11px] tracking-[0.2em] text-cp-cyan transition-all duration-200 hover:-translate-y-0.5 hover:border-cp-cyan/45 hover:bg-cp-cyan/[0.14]">
              REGISTER NOW -&gt;
            </button>
          </Link>
        )}
      </HoloPanel>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {quickLinks.map(({ to, icon: Icon, label, color, border }) => (
          <Link key={to} to={to}>
            <HoloPanel className={`cursor-pointer border-t-2 py-6 text-center ${border}`}>
              <Icon size={26} className={`${color} mx-auto mb-3`} />
              <p className={`font-mono text-[11px] tracking-[0.18em] ${color}`}>{label}</p>
            </HoloPanel>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <HoloPanel>
          <div className="mb-4 flex items-center gap-2">
            <Users size={16} className="text-cp-magenta" />
            <h2 className="font-orbitron text-sm tracking-widest text-white">TEAM STATUS</h2>
          </div>
          {team ? (
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between gap-4 border-b border-white/6 pb-2"><span className="text-cp-muted">TEAM</span><span className="text-right text-white">{team.name}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/6 pb-2"><span className="text-cp-muted">TRACK</span><span className="text-right text-cp-magenta">{team.track}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/6 pb-2"><span className="text-cp-muted">INVITE CODE</span><span className="text-right font-bold tracking-[0.2em] text-cp-cyan">{team.invite_code}</span></div>
              <div className="flex justify-between gap-4"><span className="text-cp-muted">MEMBERS</span><span className="text-right text-white">{team.team_members?.[0]?.count ?? '-'} / {team.max_members}</span></div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="mb-3 font-mono text-xs text-cp-muted">NO TEAM ASSIGNED - SOLO OPERATOR</p>
              <Link to="/dashboard/team" className="font-mono text-xs tracking-[0.18em] text-cp-cyan hover:underline">VIEW TEAM OPTIONS -&gt;</Link>
            </div>
          )}
        </HoloPanel>

        <HoloPanel>
          <div className="mb-4 flex items-center gap-2">
            <Megaphone size={16} className="text-cp-cyan" />
            <h2 className="font-orbitron text-sm tracking-widest text-white">ANNOUNCEMENTS</h2>
          </div>
          {announcements.length === 0 ? (
            <p className="py-4 text-center font-mono text-xs text-cp-muted">NO ANNOUNCEMENTS YET</p>
          ) : (
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className={`rounded-r-2xl border-l-2 py-2 pl-4 pr-2 ${a.priority === 'critical' ? 'border-[#FF2D78] bg-[#FF2D78]/[0.04]' : a.priority === 'urgent' ? 'border-cp-yellow bg-cp-yellow/[0.03]' : 'border-cp-cyan bg-cp-cyan/[0.03]'}`}>
                  <p className="font-orbitron text-xs text-white">{a.title}</p>
                  <p className="mt-0.5 line-clamp-2 font-mono text-[10px] text-cp-muted">{a.body}</p>
                  <p className="mt-1 flex items-center gap-1 font-mono text-[9px] text-cp-muted/50">
                    <Clock size={8} />{new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </HoloPanel>
      </div>
    </div>
  )
}
