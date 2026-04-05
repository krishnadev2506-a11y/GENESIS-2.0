import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { GlitchText } from '../../components/ui/GlitchText'
import { NeonButton } from '../../components/ui/NeonButton'
import { Search, Check, X, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_OPTS = ['all', 'confirmed', 'pending', 'rejected', 'waitlist']

export const Registrations = () => {
  const [regs, setRegs] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    let q = supabase.from('registrations').select('*, profiles!registrations_user_id_fkey(full_name, email, phone, college, year_desig, tshirt_size, dietary), teams(name, track)')
      .order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setRegs(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('registrations').update({ status }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('STATUS UPDATED'); load() }
  }

  const filtered = search.trim()
    ? regs.filter(r => [r.profiles?.full_name, r.profiles?.email, r.registration_no, r.profiles?.college]
        .some(v => v?.toLowerCase().includes(search.toLowerCase())))
    : regs

  const statusColor = { confirmed: 'text-[#39FF14]', pending: 'text-cp-yellow', rejected: 'text-cp-magenta', waitlist: 'text-cp-muted' }

  return (
    <div className="max-w-7xl space-y-6 p-6 md:p-8">
      <div>
        <h1 className="mb-1 font-orbitron text-3xl font-bold tracking-[0.08em] text-cp-cyan"><GlitchText text="REGISTRATIONS" /></h1>
        <p className="font-mono text-sm tracking-[0.2em] text-cp-muted">{filtered.length} RECORDS</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cp-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, college..."
            className="field-shell w-full py-2.5 pl-9 pr-4 font-mono text-sm text-cp-text outline-none placeholder:text-cp-muted"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-2xl border px-4 py-2.5 font-mono text-[11px] tracking-[0.18em] transition-all duration-200 ${filter === s ? 'border-cp-cyan/25 bg-cp-cyan/[0.08] text-cp-cyan' : 'border-white/8 text-cp-muted hover:border-white/16 hover:bg-white/[0.03]'}`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="table-shell overflow-x-auto">
        <table className="w-full min-w-[800px] font-mono text-xs">
          <thead className="bg-white/[0.03]">
            <tr className="whitespace-nowrap border-b border-white/8 text-cp-muted">
              <th className="px-5 py-4 text-left">NAME / EMAIL</th>
              <th className="px-5 py-4 text-left">REG NO</th>
              <th className="px-5 py-4 text-left">COLLEGE</th>
              <th className="px-5 py-4 text-left">TEAM</th>
              <th className="px-5 py-4 text-left">STATUS</th>
              <th className="px-5 py-4 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-cp-muted">LOADING...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-cp-muted">NO RECORDS FOUND</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-b border-white/6 transition-colors hover:bg-white/[0.03]">
                <td className="px-5 py-4">
                  <div className="text-white">{r.profiles?.full_name}</div>
                  <div className="text-[10px] text-cp-muted">{r.profiles?.email}</div>
                </td>
                <td className="px-5 py-4 text-cp-cyan">{r.registration_no}</td>
                <td className="px-5 py-4 text-cp-muted">{r.profiles?.college || '-'}</td>
                <td className="px-5 py-4">
                  {r.teams ? <><div className="text-white">{r.teams.name}</div><div className="text-[10px] text-cp-magenta">{r.teams.track}</div></> : <span className="text-cp-muted">SOLO</span>}
                </td>
                <td className="px-5 py-4">
                  <span className={`font-bold tracking-[0.18em] ${statusColor[r.status]}`}>{r.status?.toUpperCase()}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelected(r)} className="rounded-xl border border-cp-cyan/18 bg-cp-cyan/[0.05] p-2 text-cp-cyan transition-all duration-200 hover:border-cp-cyan/32 hover:text-white" title="View Details"><Eye size={14} /></button>
                    {r.status !== 'confirmed' && <button onClick={() => updateStatus(r.id, 'confirmed')} className="rounded-xl border border-cp-green/20 bg-cp-green/[0.05] p-2 text-[#39FF14] transition-all duration-200 hover:border-cp-green/36 hover:text-white" title="Confirm"><Check size={14} /></button>}
                    {r.status !== 'rejected' && <button onClick={() => updateStatus(r.id, 'rejected')} className="rounded-xl border border-cp-magenta/20 bg-cp-magenta/[0.05] p-2 text-cp-magenta transition-all duration-200 hover:border-cp-magenta/36 hover:text-white" title="Reject"><X size={14} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-4 backdrop-blur-md" onClick={() => setSelected(null)}>
          <div className="panel-surface max-h-[90vh] w-full max-w-lg overflow-y-auto p-4 md:p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <h2 className="font-orbitron text-white">{selected.profiles?.full_name}</h2>
              <button onClick={() => setSelected(null)} className="rounded-xl border border-white/8 p-2 text-cp-muted transition-colors hover:border-white/16 hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 gap-3 font-mono text-xs sm:grid-cols-2">
              {[
                ['REG NO', selected.registration_no],
                ['STATUS', selected.status?.toUpperCase()],
                ['EMAIL', selected.profiles?.email],
                ['PHONE', selected.profiles?.phone],
                ['COLLEGE', selected.profiles?.college],
                ['YEAR', selected.profiles?.year_desig],
                ['T-SHIRT', selected.profiles?.tshirt_size],
                ['DIETARY', selected.profiles?.dietary],
                ['TEAM', selected.teams?.name || 'SOLO'],
                ['TRACK', selected.teams?.track || '-'],
              ].map(([k, v]) => (
                <div key={k} className="panel-muted p-3"><span className="text-cp-muted">{k}: </span><span className="text-white">{v || '-'}</span></div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <NeonButton variant="primary" onClick={() => { updateStatus(selected.id, 'confirmed'); setSelected(null) }} className="flex-1 text-xs">CONFIRM</NeonButton>
              <NeonButton variant="danger" onClick={() => { updateStatus(selected.id, 'rejected'); setSelected(null) }} className="flex-1 text-xs">REJECT</NeonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
