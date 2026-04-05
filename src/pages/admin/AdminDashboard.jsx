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
    { label: 'TOTAL USERS', value: metrics.totalUsers, icon: Users, color: 'text-cp-cyan', border: 'border-t-cp-cyan' },
    { label: 'CONFIRMED', value: metrics.confirmed, icon: UserCheck, color: 'text-[#39FF14]', border: 'border-t-[#39FF14]' },
    { label: 'PENDING', value: metrics.pending, icon: Clock, color: 'text-cp-yellow', border: 'border-t-cp-yellow' },
    { label: 'TEAMS', value: metrics.totalTeams, icon: Users, color: 'text-cp-magenta', border: 'border-t-cp-magenta' },
    { label: 'CHECK-INS', value: metrics.attendanceCount, icon: Activity, color: 'text-cp-cyan', border: 'border-t-cp-cyan' },
    { label: 'SUBMISSIONS', value: metrics.submissionsCount, icon: Upload, color: 'text-[#39FF14]', border: 'border-t-[#39FF14]' },
  ]

  if (loading) return <div className="p-6 font-mono text-cp-cyan animate-pulse md:p-8">LOADING METRICS...</div>

  return (
    <div className="max-w-6xl space-y-8 p-4 md:p-8">
      <div>
        <h1 className="mb-1 font-orbitron text-3xl font-bold tracking-[0.08em] text-cp-magenta"><GlitchText text="ADMIN_OVERVIEW" /></h1>
        <p className="font-mono text-sm tracking-[0.2em] text-cp-muted">REAL-TIME EVENT METRICS</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <HoloPanel key={i} className={`border-t-4 py-6 text-center ${c.border}`}>
              <Icon size={20} className={`${c.color} mx-auto mb-3`} />
              <div className={`font-orbitron text-2xl font-bold ${c.color}`}>{c.value}</div>
              <div className="mt-1 font-mono text-[9px] tracking-[0.22em] text-cp-muted">{c.label}</div>
            </HoloPanel>
          )
        })}
      </div>

      <HoloPanel className="p-0">
        <div className="px-5 pt-5">
          <h2 className="mb-4 flex items-center gap-2 font-orbitron text-sm tracking-widest text-white">
            <Megaphone size={14} className="text-cp-magenta" /> LATEST REGISTRATIONS
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] font-mono text-xs">
            <thead className="bg-white/[0.03]">
              <tr className="whitespace-nowrap border-b border-white/8 text-cp-muted">
                <th className="px-5 py-3 text-left">NAME</th>
                <th className="px-5 py-3 text-left">EMAIL</th>
                <th className="px-5 py-3 text-left">COLLEGE</th>
                <th className="px-5 py-3 text-left">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(r => (
                <tr key={r.id} className="border-b border-white/6 transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-3 text-white">{r.profiles?.full_name}</td>
                  <td className="px-5 py-3 text-cp-muted">{r.profiles?.email}</td>
                  <td className="px-5 py-3 text-cp-muted">{r.profiles?.college || '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-[9px] tracking-[0.18em] ${r.status === 'confirmed' ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-cp-yellow/10 text-cp-yellow'}`}>
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
