import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { NeonButton } from '../../components/ui/NeonButton'
import { TerminalInput } from '../../components/ui/TerminalInput'
import { Check, X, UserCheck, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

const CHECKPOINTS = ['DAY1_ENTRY', 'LUNCH_DAY1', 'DAY2_ENTRY', 'LUNCH_DAY2', 'FINAL_DEMO']

export const Attendance = () => {
  const { profile } = useAuthStore()
  const [checkpoint, setCheckpoint] = useState('DAY1_ENTRY')
  const [manualInput, setManualInput] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState('')
  const [recentScans, setRecentScans] = useState([])
  const [stats, setStats] = useState({})

  useEffect(() => {
    loadRecentScans()
    loadStats()
  }, [checkpoint])

  const loadRecentScans = async () => {
    const { data } = await supabase.from('attendance')
      .select('*, profiles(full_name), registrations(registration_no)')
      .eq('checkpoint', checkpoint)
      .order('scanned_at', { ascending: false })
      .limit(10)
    setRecentScans(data || [])
  }

  const loadStats = async () => {
    const counts = {}
    for (const cp of CHECKPOINTS) {
      const { count } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('checkpoint', cp)
      counts[cp] = count || 0
    }
    setStats(counts)
  }

  const processCheckIn = async (regNo) => {
    setScanError(''); setScanResult(null)
    if (!regNo?.trim()) { setScanError('No registration number'); return }

    // Find registration
    const { data: reg } = await supabase.from('registrations')
      .select('*, profiles(full_name, email)')
      .eq('registration_no', regNo.trim().toUpperCase())
      .maybeSingle()

    if (!reg) { setScanError(`REGISTRATION NOT FOUND: ${regNo}`); return }
    if (reg.status !== 'confirmed') { setScanError(`NOT CONFIRMED — Status: ${reg.status}`); return }

    // Check duplicate
    const { data: existing } = await supabase.from('attendance')
      .select('id').eq('registration_id', reg.id).eq('checkpoint', checkpoint).maybeSingle()
    if (existing) { setScanError(`ALREADY SCANNED AT ${checkpoint}`); return }

    // Record attendance
    const { error } = await supabase.from('attendance').insert({
      user_id: reg.user_id, registration_id: reg.id,
      checkpoint, scanned_by: profile.id, is_manual: true
    })
    if (error) { setScanError(error.message); return }

    setScanResult({ name: reg.profiles?.full_name, regNo: reg.registration_no, status: 'SUCCESS' })
    toast.success(`✓ ${reg.profiles?.full_name} CHECKED IN`)
    setManualInput('')
    loadRecentScans(); loadStats()
  }

  const handleManualSubmit = (e) => { e.preventDefault(); processCheckIn(manualInput) }

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-orbitron font-bold text-3xl text-cp-cyan mb-1"><GlitchText text="ATTENDANCE" /></h1>
        <p className="font-mono text-cp-muted text-sm">QR SCAN & MANUAL CHECK-IN</p>
      </div>

      {/* Checkpoint selector */}
      <HoloPanel>
        <h2 className="font-orbitron text-xs text-cp-muted mb-3 tracking-widest">SELECT CHECKPOINT:</h2>
        <div className="flex flex-wrap gap-2">
          {CHECKPOINTS.map(cp => (
            <button key={cp} onClick={() => setCheckpoint(cp)}
              className={`px-4 py-2 font-mono text-xs border transition-all ${checkpoint === cp ? 'border-cp-cyan bg-cp-cyan/10 text-cp-cyan' : 'border-cp-border text-cp-muted hover:border-cp-muted'}`}>
              {cp.replace(/_/g, ' ')}
              <span className="ml-2 text-[10px]">({stats[cp] || 0})</span>
            </button>
          ))}
        </div>
      </HoloPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manual check-in */}
        <HoloPanel>
          <h2 className="font-orbitron text-sm text-white mb-4 tracking-widest flex items-center gap-2">
            <UserCheck size={16} className="text-cp-cyan" /> MANUAL CHECK-IN
          </h2>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <TerminalInput
              label="REGISTRATION NO://"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="GEN-XXXXXXXX"
            />
            <NeonButton type="submit" variant="primary" className="w-full">CHECK IN</NeonButton>
          </form>

          {/* Feedback */}
          {scanResult && (
            <div className="mt-4 p-4 border border-[#39FF14] bg-[#39FF14]/5 flex items-center gap-3">
              <Check size={24} className="text-[#39FF14]" />
              <div className="font-mono text-sm">
                <div className="text-[#39FF14] font-bold">{scanResult.name}</div>
                <div className="text-cp-muted text-xs">{scanResult.regNo} · ADMITTED</div>
              </div>
            </div>
          )}
          {scanError && (
            <div className="mt-4 p-4 border border-cp-magenta bg-cp-magenta/5 flex items-center gap-3">
              <X size={24} className="text-cp-magenta" />
              <div className="font-mono text-sm text-cp-magenta">{scanError}</div>
            </div>
          )}
        </HoloPanel>

        {/* Stats */}
        <HoloPanel>
          <h2 className="font-orbitron text-sm text-white mb-4 tracking-widest flex items-center gap-2">
            <Activity size={16} className="text-cp-magenta" /> CHECKPOINT STATS
          </h2>
          <div className="space-y-3">
            {CHECKPOINTS.map(cp => (
              <div key={cp} className="flex justify-between items-center py-2 border-b border-cp-border font-mono text-xs">
                <span className={cp === checkpoint ? 'text-cp-cyan' : 'text-cp-muted'}>{cp.replace(/_/g, ' ')}</span>
                <span className={`font-bold ${cp === checkpoint ? 'text-cp-cyan' : 'text-white'}`}>{stats[cp] || 0}</span>
              </div>
            ))}
          </div>
        </HoloPanel>
      </div>

      {/* Recent scans */}
      <HoloPanel>
        <h2 className="font-orbitron text-sm text-white mb-4 tracking-widest">RECENT AT {checkpoint.replace(/_/g, ' ')}</h2>
        {recentScans.length === 0 ? (
          <p className="font-mono text-cp-muted text-xs text-center py-4">NO SCANS YET</p>
        ) : (
          <div className="space-y-2">
            {recentScans.map(s => (
              <div key={s.id} className="flex justify-between items-center font-mono text-xs py-2 border-b border-cp-border/30">
                <div>
                  <span className="text-white">{s.profiles?.full_name}</span>
                  <span className="text-cp-muted ml-2">{s.registrations?.registration_no}</span>
                </div>
                <span className="text-cp-muted">{new Date(s.scanned_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </HoloPanel>
    </div>
  )
}
