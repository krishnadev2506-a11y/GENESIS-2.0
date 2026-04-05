import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { NeonButton } from '../../components/ui/NeonButton'
import { TerminalInput } from '../../components/ui/TerminalInput'
import { Save, ExternalLink, Star } from 'lucide-react'
import toast from 'react-hot-toast'

export const Submissions = () => {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState(null)
  const [score, setScore] = useState('')
  const [notes, setNotes] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('submissions')
      .select('*, profiles(full_name, email), teams(name, track)')
      .order('submitted_at', { ascending: false })
    setSubs(data || [])
    setLoading(false)
  }

  const saveScore = async (id) => {
    const s = parseInt(score)
    if (isNaN(s) || s < 0 || s > 100) return toast.error('Score must be 0-100')
    const { error } = await supabase.from('submissions').update({ judge_score: s, judge_notes: notes }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('SCORE SAVED'); setScoring(null); setScore(''); setNotes(''); load() }
  }

  const filtered = search.trim()
    ? subs.filter(s => [s.project_name, s.profiles?.full_name, s.teams?.name, s.teams?.track]
        .some(v => v?.toLowerCase().includes(search.toLowerCase())))
    : subs

  const scored = subs.filter(s => s.judge_score !== null).length

  return (
    <div className="max-w-5xl space-y-6 p-6 md:p-8">
      <div>
        <h1 className="mb-1 font-orbitron text-3xl font-bold tracking-[0.08em] text-[#39FF14]"><GlitchText text="SUBMISSIONS" /></h1>
        <p className="font-mono text-sm tracking-[0.2em] text-cp-muted">{subs.length} TOTAL · {scored} SCORED</p>
      </div>

      <div className="relative">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search project, team, track..."
          className="field-shell w-full px-4 py-3 font-mono text-sm text-cp-text outline-none placeholder:text-cp-muted" />
      </div>

      {loading ? (
        <div className="font-mono text-cp-cyan animate-pulse">LOADING...</div>
      ) : filtered.length === 0 ? (
        <HoloPanel className="py-12 text-center"><p className="font-mono text-cp-muted">NO SUBMISSIONS YET</p></HoloPanel>
      ) : (
        <div className="space-y-4">
          {filtered.map(s => (
            <HoloPanel key={s.id} className={s.judge_score !== null ? 'border-l-4 border-[#39FF14]/60' : ''}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-orbitron text-white">{s.project_name}</h3>
                    {s.teams && <span className="rounded-full bg-cp-magenta/10 px-3 py-1 font-mono text-[10px] text-cp-magenta">{s.teams.name} · {s.teams.track}</span>}
                    {s.judge_score !== null && (
                      <span className="flex items-center gap-1 font-orbitron text-sm text-[#39FF14]">
                        <Star size={12} />{s.judge_score}/100
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-cp-muted">By: {s.profiles?.full_name}</p>
                  {s.description && <p className="line-clamp-2 font-mono text-xs text-cp-text">{s.description}</p>}
                  <div className="flex flex-wrap gap-4 pt-1">
                    {s.github_url && <a href={s.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-xs text-cp-cyan hover:underline"><ExternalLink size={10} />GITHUB</a>}
                    {s.demo_url && <a href={s.demo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-xs text-cp-cyan hover:underline"><ExternalLink size={10} />DEMO</a>}
                    {s.video_url && <a href={s.video_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-xs text-cp-cyan hover:underline"><ExternalLink size={10} />VIDEO</a>}
                  </div>
                  {s.judge_notes && <p className="font-mono text-xs italic text-cp-muted">Notes: "{s.judge_notes}"</p>}
                </div>
                <div className="flex-shrink-0">
                  {scoring === s.id ? (
                    <div className="min-w-[180px] space-y-2">
                      <TerminalInput label="SCORE (0-100)://" value={score} onChange={e => setScore(e.target.value)} type="number" min="0" max="100" />
                      <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Judge notes"
                        className="field-shell w-full px-3 py-2 font-mono text-xs text-cp-text outline-none placeholder:text-cp-muted" />
                      <div className="flex gap-2">
                        <NeonButton variant="outline" onClick={() => setScoring(null)} className="flex-1 text-xs !py-1">CANCEL</NeonButton>
                        <NeonButton onClick={() => saveScore(s.id)} className="flex-1 text-xs !py-1" style={{ borderColor: '#39FF14', color: '#39FF14' }}><Save size={12} /> SAVE</NeonButton>
                      </div>
                    </div>
                  ) : (
                    <NeonButton onClick={() => { setScoring(s.id); setScore(s.judge_score ?? ''); setNotes(s.judge_notes ?? '') }}
                      className="text-xs !py-1" style={{ borderColor: '#39FF14', color: '#39FF14' }}>
                      <Star size={12} /> {s.judge_score !== null ? 'RE-SCORE' : 'SCORE'}
                    </NeonButton>
                  )}
                </div>
              </div>
            </HoloPanel>
          ))}
        </div>
      )}
    </div>
  )
}
