import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { Users, UserCheck, Clock, Upload, Megaphone, Activity } from 'lucide-react'

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({ totalUsers: 0, confirmed: 0, pending: 0, totalTeams: 0, attendanceCount: 0, submissionsCount: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [
        { count: users },
        { data: regs },
        { count: teams },
        { count: attendance },
        { count: submissions },
        { data: recentRegs }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('status'),
        supabase.from('teams').select('*', { count: 'exact', head: true }),
        supabase.from('attendance').select('*', { count: 'exact', head: true }),
        supabase.from('submissions').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('*, profiles!registrations_user_id_fkey(full_name, email, college)').order('created_at', { ascending: false }).limit(5)
      ])
      setMetrics({
        totalUsers: users || 0,
        confirmed: regs?.filter(r => r.status === 'confirmed').length || 0,
        pending: regs?.filter(r => r.status === 'pending').length || 0,
        totalTeams: teams || 0,
        attendanceCount: attendance || 0,
        submissionsCount: submissions || 0
      })
      setRecent(recentRegs || [])
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'TOTAL USERS',     value: metrics.totalUsers,      icon: Users,      color: 'text-cp-cyan',    border: 'border-t-cp-cyan'    },
    { label: 'CONFIRMED',       value: metrics.confirmed,        icon: UserCheck,  color: 'text-[#39FF14]',  border: 'border-t-[#39FF14]'  },
    { label: 'PENDING',         value: metrics.pending,          icon: Clock,      color: 'text-cp-yellow',  border: 'border-t-cp-yellow'  },
    { label: 'TEAMS',           value: metrics.totalTeams,       icon: Users,      color: 'text-cp-magenta', border: 'border-t-cp-magenta' },
    { label: 'CHECK-INS',       value: metrics.attendanceCount,  icon: Activity,   color: 'text-cp-cyan',    border: 'border-t-cp-cyan'    },
    { label: 'SUBMISSIONS',     value: metrics.submissionsCount, icon: Upload,     color: 'text-[#39FF14]',  border: 'border-t-[#39FF14]'  },
  ]

  if (loading) return <div className="p-8 font-mono text-cp-cyan animate-pulse">LOADING METRICS...</div>

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="font-orbitron font-bold text-3xl text-cp-magenta mb-1"><GlitchText text="ADMIN_OVERVIEW" /></h1>
        <p className="font-mono text-cp-muted text-sm">REAL-TIME EVENT METRICS</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <HoloPanel key={i} className={`border-t-4 ${c.border} text-center py-6`}>
              <Icon size={20} className={`${c.color} mx-auto mb-2`} />
              <div className={`font-orbitron text-2xl font-bold ${c.color}`}>{c.value}</div>
              <div className="font-mono text-[9px] text-cp-muted mt-1 tracking-widest">{c.label}</div>
            </HoloPanel>
          )
        })}
      </div>

      {/* Recent registrations */}
      <HoloPanel>
        <h2 className="font-orbitron text-sm text-white mb-4 tracking-widest flex items-center gap-2">
          <Megaphone size={14} className="text-cp-magenta" /> LATEST REGISTRATIONS
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-cp-border text-cp-muted whitespace-nowrap">
                <th className="text-left py-2 pr-4">NAME</th>
                <th className="text-left py-2 pr-4">EMAIL</th>
                <th className="text-left py-2 pr-4">COLLEGE</th>
                <th className="text-left py-2">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(r => (
                <tr key={r.id} className="border-b border-cp-border/50 hover:bg-cp-card transition-colors">
                  <td className="py-2 pr-4 text-white">{r.profiles?.full_name}</td>
                  <td className="py-2 pr-4 text-cp-muted">{r.profiles?.email}</td>
                  <td className="py-2 pr-4 text-cp-muted">{r.profiles?.college || '—'}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 text-[9px] ${r.status === 'confirmed' ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-cp-yellow/10 text-cp-yellow'}`}>
                      {r.status?.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HoloPanel>
    </div>
  )
}
