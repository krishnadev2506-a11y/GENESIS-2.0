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
    { to: '/dashboard/qr',       icon: QrCode,    label: 'MY QR CODE',   color: 'text-cp-cyan',    border: 'border-cp-cyan'    },
    { to: '/dashboard/team',      icon: Users,     label: 'MY TEAM',      color: 'text-cp-magenta', border: 'border-cp-magenta' },
    { to: '/dashboard/submit',    icon: Upload,    label: 'SUBMIT',        color: 'text-[#39FF14]',  border: 'border-[#39FF14]'  },
    { to: '/dashboard/schedule',  icon: Calendar,  label: 'SCHEDULE',     color: 'text-cp-yellow',  border: 'border-cp-yellow'  },
  ]

  if (loading) return <div className="p-8 font-mono text-cp-cyan animate-pulse">LOADING...</div>
  if (!profile) return (
    <div className="p-8 max-w-5xl">
      <HoloPanel className="text-center py-12 border-cp-magenta">
        <p className="font-mono text-cp-magenta text-sm mb-4">PROFILE SYNC ERROR</p>
        <p className="font-mono text-cp-muted text-xs">Your auth token is active, but your database profile is missing.</p>
        <p className="font-mono text-cp-muted text-xs mt-2">This happens when databases are reset. Please click LOGOUT in the sidebar and register again.</p>
      </HoloPanel>
    </div>
  )

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-orbitron font-bold text-3xl text-cp-cyan mb-1">
          <GlitchText text="OPERATOR_HQ" />
        </h1>
        <p className="font-mono text-cp-muted text-sm">WELCOME BACK, {profile?.full_name?.toUpperCase()}</p>
      </div>

      {/* Registration status */}
      <HoloPanel className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-cp-muted tracking-widest mb-1">REGISTRATION STATUS</p>
          <div className="flex items-center gap-3">
            <StatusBadge status={registration?.status || 'not registered'} />
            {registration && <span className="font-mono text-xs text-cp-muted">{registration.registration_no}</span>}
          </div>
        </div>
        {!registration && (
          <Link to="/register">
            <button className="font-mono text-xs border border-cp-cyan text-cp-cyan px-4 py-2 hover:bg-cp-cyan hover:text-black transition-all">
              REGISTER NOW →
            </button>
          </Link>
        )}
      </HoloPanel>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map(({ to, icon: Icon, label, color, border }) => (
          <Link key={to} to={to}>
            <HoloPanel className={`text-center py-6 border-t-2 ${border} hover:scale-105 transition-transform cursor-pointer`}>
              <Icon size={28} className={`${color} mx-auto mb-2`} />
              <p className={`font-mono text-xs tracking-widest ${color}`}>{label}</p>
            </HoloPanel>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team card */}
        <HoloPanel>
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-cp-magenta" />
            <h2 className="font-orbitron text-sm text-white tracking-widest">TEAM STATUS</h2>
          </div>
          {team ? (
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between"><span className="text-cp-muted">TEAM</span><span className="text-white">{team.name}</span></div>
              <div className="flex justify-between"><span className="text-cp-muted">TRACK</span><span className="text-cp-magenta">{team.track}</span></div>
              <div className="flex justify-between"><span className="text-cp-muted">INVITE CODE</span><span className="text-cp-cyan font-bold tracking-widest">{team.invite_code}</span></div>
              <div className="flex justify-between"><span className="text-cp-muted">MEMBERS</span><span className="text-white">{team.team_members?.[0]?.count ?? '—'} / {team.max_members}</span></div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="font-mono text-cp-muted text-xs mb-3">NO TEAM ASSIGNED — SOLO OPERATOR</p>
              <Link to="/dashboard/team" className="font-mono text-xs text-cp-cyan hover:underline">VIEW TEAM OPTIONS →</Link>
            </div>
          )}
        </HoloPanel>

        {/* Announcements */}
        <HoloPanel>
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={16} className="text-cp-cyan" />
            <h2 className="font-orbitron text-sm text-white tracking-widest">ANNOUNCEMENTS</h2>
          </div>
          {announcements.length === 0 ? (
            <p className="font-mono text-cp-muted text-xs py-4 text-center">NO ANNOUNCEMENTS YET</p>
          ) : (
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className={`border-l-2 pl-3 py-1 ${a.priority === 'critical' ? 'border-[#FF2D78]' : a.priority === 'urgent' ? 'border-cp-yellow' : 'border-cp-cyan'}`}>
                  <p className="font-orbitron text-xs text-white">{a.title}</p>
                  <p className="font-mono text-[10px] text-cp-muted mt-0.5 line-clamp-2">{a.body}</p>
                  <p className="font-mono text-[9px] text-cp-muted/50 mt-1 flex items-center gap-1">
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
