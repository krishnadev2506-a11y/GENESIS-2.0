import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { NeonButton } from '../../components/ui/NeonButton'
import { Search, ChevronDown, Check, X, Eye } from 'lucide-react'
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="p-8 space-y-6 max-w-7xl">
      <div>
        <h1 className="font-orbitron font-bold text-3xl text-cp-cyan mb-1"><GlitchText text="REGISTRATIONS" /></h1>
        <p className="font-mono text-cp-muted text-sm">{filtered.length} RECORDS</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cp-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, college..."
            className="w-full bg-cp-dark border border-cp-border pl-9 pr-4 py-2 font-mono text-sm text-cp-text outline-none focus:border-cp-cyan placeholder:text-cp-muted" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 font-mono text-xs tracking-widest border transition-all ${filter === s ? 'border-cp-cyan bg-cp-cyan/10 text-cp-cyan' : 'border-cp-border text-cp-muted hover:border-cp-muted'}`}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <HoloPanel className="overflow-x-auto p-0">
        <table className="w-full font-mono text-xs min-w-[800px]">
          <thead>
            <tr className="border-b border-cp-border text-cp-muted whitespace-nowrap">
              <th className="text-left p-4">NAME / EMAIL</th>
              <th className="text-left p-4">REG NO</th>
              <th className="text-left p-4">COLLEGE</th>
              <th className="text-left p-4">TEAM</th>
              <th className="text-left p-4">STATUS</th>
              <th className="text-left p-4">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center p-8 text-cp-muted">LOADING...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center p-8 text-cp-muted">NO RECORDS FOUND</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-b border-cp-border/30 hover:bg-cp-card transition-colors">
                <td className="p-4">
                  <div className="text-white">{r.profiles?.full_name}</div>
                  <div className="text-cp-muted text-[10px]">{r.profiles?.email}</div>
                </td>
                <td className="p-4 text-cp-cyan">{r.registration_no}</td>
                <td className="p-4 text-cp-muted">{r.profiles?.college || '—'}</td>
                <td className="p-4">
                  {r.teams ? <><div className="text-white">{r.teams.name}</div><div className="text-cp-magenta text-[10px]">{r.teams.track}</div></> : <span className="text-cp-muted">SOLO</span>}
                </td>
                <td className="p-4">
                  <span className={`${statusColor[r.status]} font-bold`}>{r.status?.toUpperCase()}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelected(r)} className="text-cp-cyan hover:text-white transition-colors" title="View Details"><Eye size={14} /></button>
                    {r.status !== 'confirmed' && <button onClick={() => updateStatus(r.id, 'confirmed')} className="text-[#39FF14] hover:text-white transition-colors" title="Confirm"><Check size={14} /></button>}
                    {r.status !== 'rejected'  && <button onClick={() => updateStatus(r.id, 'rejected')}  className="text-cp-magenta hover:text-white transition-colors" title="Reject"><X size={14} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </HoloPanel>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#12121A] border border-cp-border max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 md:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-orbitron text-white">{selected.profiles?.full_name}</h2>
              <button onClick={() => setSelected(null)} className="text-cp-muted hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
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
                ['TRACK', selected.teams?.track || '—'],
              ].map(([k, v]) => (
                <div key={k}><span className="text-cp-muted">{k}: </span><span className="text-white">{v || '—'}</span></div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <NeonButton variant="primary"  onClick={() => { updateStatus(selected.id, 'confirmed'); setSelected(null) }} className="flex-1 text-xs">CONFIRM</NeonButton>
              <NeonButton variant="danger"   onClick={() => { updateStatus(selected.id, 'rejected');  setSelected(null) }} className="flex-1 text-xs">REJECT</NeonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
