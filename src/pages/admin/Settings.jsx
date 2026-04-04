import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { NeonButton } from '../../components/ui/NeonButton'
import { Save, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

export const Settings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('event_settings').select('*').limit(1).single()
      .then(({ data }) => { setSettings(data); setLoading(false) })
  }, [])

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from('event_settings').update({
      registration_open: settings.registration_open,
      updated_at:        new Date().toISOString()
    }).eq('id', settings.id)

    setSaving(false)
    if (error) toast.error(error.message)
    else toast.success('SETTINGS SAVED')
  }

  const set = (k, v) => setSettings(prev => ({ ...prev, [k]: v }))

  if (loading) return <div className="p-8 font-mono text-cp-cyan animate-pulse">LOADING...</div>

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-orbitron font-bold text-3xl text-cp-muted mb-1"><GlitchText text="SETTINGS" /></h1>
        <p className="font-mono text-cp-muted text-sm">EVENT CONFIGURATION</p>
      </div>

      <HoloPanel className="space-y-6">
        {/* Toggle registration */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-orbitron text-sm text-white">REGISTRATION</h3>
            <p className="font-mono text-[10px] text-cp-muted mt-0.5">Allow new participants to register</p>
          </div>
          <button onClick={() => set('registration_open', !settings.registration_open)}
            className={`transition-colors ${settings.registration_open ? 'text-[#39FF14]' : 'text-cp-muted'}`}>
            {settings.registration_open ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
          </button>
        </div>

        <div className={`text-center py-2 font-mono text-xs border ${settings.registration_open ? 'border-[#39FF14]/30 text-[#39FF14] bg-[#39FF14]/5' : 'border-cp-magenta/30 text-cp-magenta bg-cp-magenta/5'}`}>
          REGISTRATION IS {settings.registration_open ? 'OPEN' : 'CLOSED'}
        </div>

        <NeonButton variant="primary" onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2">
          <Save size={14} />{saving ? 'SAVING...' : 'SAVE CONFIGURATION'}
        </NeonButton>
      </HoloPanel>

      <p className="font-mono text-[10px] text-cp-muted text-center">Last updated: {settings.updated_at ? new Date(settings.updated_at).toLocaleString() : '—'}</p>
    </div>
  )
}
