import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { NeonButton } from '../../components/ui/NeonButton'
import { TerminalInput } from '../../components/ui/TerminalInput'
import { Upload, Check, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export const SubmissionPage = () => {
  const { profile } = useAuthStore()
  const [submission, setSubmission] = useState(null)
  const [registration, setRegistration] = useState(null)
  const [form, setForm] = useState({ project_name: '', description: '', github_url: '', demo_url: '', video_url: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!profile) return
    const load = async () => {
      const { data: reg } = await supabase.from('registrations').select('*').eq('user_id', profile.id).maybeSingle()
      setRegistration(reg)
      if (reg?.team_id) {
        const { data: sub } = await supabase.from('submissions').select('*').eq('team_id', reg.team_id).maybeSingle()
        if (sub) { setSubmission(sub); setForm({ project_name: sub.project_name, description: sub.description || '', github_url: sub.github_url || '', demo_url: sub.demo_url || '', video_url: sub.video_url || '' }) }
      } else {
        const { data: sub } = await supabase.from('submissions').select('*').eq('user_id', profile.id).maybeSingle()
        if (sub) { setSubmission(sub); setForm({ project_name: sub.project_name, description: sub.description || '', github_url: sub.github_url || '', demo_url: sub.demo_url || '', video_url: sub.video_url || '' }) }
      }
      setLoading(false)
    }
    load()
  }, [profile])

  const handleSubmit = async () => {
    if (!form.project_name.trim()) return toast.error('Project name required')
    setSubmitting(true)
    const payload = { ...form, user_id: profile.id, team_id: registration?.team_id || null, track: registration?.team_id ? undefined : 'SOLO' }

    let error
    if (submission) {
      const { error: e } = await supabase.from('submissions').update(payload).eq('id', submission.id)
      error = e
    } else {
      const { data, error: e } = await supabase.from('submissions').insert(payload).select().single()
      if (!e) setSubmission(data)
      error = e
    }

    if (error) toast.error(error.message)
    else { toast.success(submission ? 'SUBMISSION UPDATED' : 'PROJECT SUBMITTED'); setEditing(false) }
    setSubmitting(false)
  }

  if (loading) return <div className="p-8 font-mono text-cp-cyan animate-pulse">LOADING...</div>

  if (!registration) return (
    <div className="p-8">
      <HoloPanel className="text-center py-12">
        <p className="font-mono text-cp-muted text-sm">COMPLETE REGISTRATION FIRST</p>
      </HoloPanel>
    </div>
  )

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="font-orbitron font-bold text-3xl text-[#39FF14] mb-1"><GlitchText text="SUBMISSION" /></h1>
        <p className="font-mono text-cp-muted text-sm">UPLOAD YOUR HACK BEFORE THE DEADLINE</p>
      </div>

      {submission && !editing ? (
        <HoloPanel className="border-l-4 border-[#39FF14]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 text-[#39FF14]">
              <Check size={20} />
              <h2 className="font-orbitron text-lg">SUBMITTED</h2>
            </div>
            <NeonButton variant="outline" onClick={() => setEditing(true)} className="text-xs !py-1 !px-3">EDIT</NeonButton>
          </div>
          <div className="space-y-3 font-mono text-sm">
            <div><span className="text-cp-muted">PROJECT: </span><span className="text-white font-bold">{submission.project_name}</span></div>
            {submission.description && <p className="text-cp-text text-xs leading-relaxed border-l-2 border-cp-border pl-3">{submission.description}</p>}
            <div className="flex gap-4 flex-wrap pt-2">
              {submission.github_url && <a href={submission.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cp-cyan hover:underline text-xs"><ExternalLink size={12} />GITHUB</a>}
              {submission.demo_url   && <a href={submission.demo_url}   target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cp-cyan hover:underline text-xs"><ExternalLink size={12} />DEMO</a>}
              {submission.video_url  && <a href={submission.video_url}  target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cp-cyan hover:underline text-xs"><ExternalLink size={12} />VIDEO</a>}
            </div>
          </div>
          {submission.judge_score !== null && (
            <div className="mt-4 pt-4 border-t border-cp-border flex items-center gap-3">
              <span className="font-mono text-cp-muted text-xs">JUDGE SCORE:</span>
              <span className="font-orbitron text-2xl text-[#39FF14]">{submission.judge_score}/100</span>
              {submission.judge_notes && <span className="font-mono text-xs text-cp-muted italic">"{submission.judge_notes}"</span>}
            </div>
          )}
        </HoloPanel>
      ) : (
        <HoloPanel>
          <h2 className="font-orbitron text-sm text-white mb-6 tracking-widest flex items-center gap-2">
            <Upload size={16} className="text-[#39FF14]" />{submission ? 'EDIT SUBMISSION' : 'NEW SUBMISSION'}
          </h2>
          <div className="space-y-4">
            <TerminalInput label="PROJECT NAME://" value={form.project_name} onChange={e => setForm({...form, project_name: e.target.value})} placeholder="My Awesome Hack" />
            <div>
              <label className="font-mono text-xs text-cp-muted tracking-widest mb-2 block">DESCRIPTION://</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                placeholder="What does your project do? What problem does it solve?"
                rows={4} className="w-full bg-cp-dark border border-cp-border p-3 text-cp-text font-mono text-sm outline-none focus:border-[#39FF14] resize-none placeholder:text-cp-muted" />
            </div>
            <TerminalInput label="GITHUB URL://" value={form.github_url} onChange={e => setForm({...form, github_url: e.target.value})} placeholder="https://github.com/..." />
            <TerminalInput label="DEMO URL://" value={form.demo_url} onChange={e => setForm({...form, demo_url: e.target.value})} placeholder="https://..." />
            <TerminalInput label="VIDEO URL://" value={form.video_url} onChange={e => setForm({...form, video_url: e.target.value})} placeholder="https://youtube.com/..." />
            <div className="flex gap-4 pt-2">
              {editing && <NeonButton variant="outline" onClick={() => setEditing(false)} className="flex-1">CANCEL</NeonButton>}
              <NeonButton variant="primary" onClick={handleSubmit} disabled={submitting} className="flex-1" style={{ borderColor: '#39FF14', color: '#39FF14' }}>
                {submitting ? 'SUBMITTING...' : submission ? 'UPDATE' : 'SUBMIT PROJECT'}
              </NeonButton>
            </div>
          </div>
        </HoloPanel>
      )}
    </div>
  )
}
