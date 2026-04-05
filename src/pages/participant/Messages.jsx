import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'
import { GlitchText } from '../../components/ui/GlitchText'
import { Clock, Megaphone, AlertTriangle } from 'lucide-react'

const priorityConfig = {
  critical: { icon: AlertTriangle, border: 'border-[#FF2D78]', text: 'text-[#FF2D78]', bg: 'bg-[rgba(255,45,120,0.05)]', badge: 'bg-[#FF2D78]/20 text-[#FF2D78]' },
  urgent: { icon: AlertTriangle, border: 'border-cp-yellow', text: 'text-cp-yellow', bg: 'bg-[rgba(245,230,66,0.05)]', badge: 'bg-cp-yellow/20 text-cp-yellow' },
  normal: { icon: Megaphone, border: 'border-cp-cyan', text: 'text-cp-cyan', bg: 'bg-[rgba(0,245,255,0.05)]', badge: 'bg-cp-cyan/20 text-cp-cyan' },
}

export const MessagesPage = () => {
  const { profile } = useAuthStore()
  const [announcements, setAnnouncements] = useState([])
  const [messages, setMessages] = useState([])
  const [tab, setTab] = useState('announcements')
  const [loading, setLoading] = useState(true)
  const [adminId, setAdminId] = useState(null)
  const [composeText, setComposeText] = useState('')

  useEffect(() => {
    if (!profile) return
    const load = async () => {
      const { data: ann } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
      setAnnouncements(ann || [])
      const { data: msg } = await supabase.from('messages')
        .select('*, profiles!messages_sender_id_fkey(full_name)')
        .or(`receiver_id.eq.${profile.id},is_broadcast.eq.true,sender_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
      setMessages(msg || [])

      const { data: adm } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1).maybeSingle()
      if (adm) {
        setAdminId(adm.id)
      } else {
        setAdminId('df1ed7cc-8b43-4f9e-a0e2-66ccfb1a0bb6')
      }

      setLoading(false)
    }
    load()

    const channel = supabase.channel('participant-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
        setAnnouncements(prev => [payload.new, ...prev])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${profile.id}` }, payload => {
        setMessages(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [profile])

  const sendMessage = async () => {
    if (!composeText.trim() || !adminId) return
    const { error } = await supabase.from('messages').insert({
      sender_id: profile.id,
      receiver_id: adminId,
      content: composeText,
      is_broadcast: false
    })
    if (error) {
      alert(error.message)
    } else {
      setComposeText('')
      const newMsg = {
        id: crypto.randomUUID(),
        sender_id: profile.id,
        receiver_id: adminId,
        content: composeText,
        created_at: new Date().toISOString(),
        is_read: true,
        profiles: { full_name: profile.full_name }
      }
      setMessages(prev => [newMsg, ...prev])
    }
  }

  if (loading) return <div className="p-6 font-mono text-cp-cyan animate-pulse md:p-8">LOADING...</div>

  return (
    <div className="max-w-3xl space-y-6 p-6 md:p-8">
      <div>
        <h1 className="mb-1 font-orbitron text-3xl font-bold tracking-[0.08em] text-cp-cyan"><GlitchText text="COMMS_CENTER" /></h1>
        <p className="font-mono text-sm tracking-[0.2em] text-cp-muted">INCOMING TRANSMISSIONS</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/8 pb-2">
        {[['announcements', `ANNOUNCEMENTS (${announcements.length})`], ['messages', `MESSAGES (${messages.filter(m => !m.is_read).length} unread)`]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-2xl px-4 py-2.5 font-mono text-[11px] tracking-[0.18em] transition-all duration-200 ${tab === key ? 'border border-cp-cyan/25 bg-cp-cyan/[0.08] text-cp-cyan' : 'border border-transparent text-cp-muted hover:border-white/8 hover:bg-white/[0.03] hover:text-cp-text'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'announcements' && (
        <div className="space-y-4">
          {announcements.length === 0 && <div className="py-12 text-center font-mono text-sm text-cp-muted">NO ANNOUNCEMENTS YET</div>}
          {announcements.map(a => {
            const cfg = priorityConfig[a.priority] || priorityConfig.normal
            const Icon = cfg.icon
            return (
              <div key={a.id} className={`panel-surface border-l-4 p-4 ${cfg.border} ${cfg.bg}`}>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={cfg.text} />
                    <h3 className={`font-orbitron text-sm ${cfg.text}`}>{a.title}</h3>
                  </div>
                  <span className={`rounded-full px-3 py-1 font-mono text-[9px] uppercase ${cfg.badge}`}>{a.priority}</span>
                </div>
                <p className="font-mono text-sm leading-relaxed text-cp-text">{a.body}</p>
                <p className="mt-2 flex items-center gap-1 font-mono text-[10px] text-cp-muted">
                  <Clock size={9} />{new Date(a.created_at).toLocaleString()}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'messages' && (
        <div className="flex h-[500px] flex-col">
          <div className="panel-surface mb-4 flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && <div className="py-12 text-center font-mono text-sm text-cp-muted">NO MESSAGES</div>}
            {[...messages].reverse().map(m => (
              <div key={m.id} className={`flex ${m.sender_id === profile.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 font-mono text-xs ${m.sender_id === profile.id ? 'border border-cp-cyan/26 bg-cp-cyan/[0.08] text-cp-text' : 'border border-white/8 bg-white/[0.04] text-cp-text'}`}>
                  <div className="mb-1 flex items-center gap-2 border-b border-white/10 pb-1 opacity-70">
                    <span className="font-bold">{m.sender_id === profile.id ? 'YOU' : m.profiles?.full_name || 'ADMIN'}</span>
                    {m.is_broadcast && <span className="rounded-full bg-cp-magenta/20 px-2 py-0.5 text-[8px] text-cp-magenta">BROADCAST</span>}
                  </div>
                  {m.content}
                  <div className="mt-1 text-right text-[9px] text-cp-muted">{new Date(m.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={composeText}
              onChange={e => setComposeText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Message organizers..."
              className="field-shell flex-1 px-4 py-3 font-mono text-sm text-cp-text outline-none placeholder:text-cp-muted"
            />
            <button onClick={sendMessage} className="rounded-2xl border border-cp-cyan/28 bg-cp-cyan/[0.08] px-6 font-mono text-sm tracking-[0.18em] text-cp-cyan transition-all duration-200 hover:-translate-y-0.5 hover:border-cp-cyan/45 hover:bg-cp-cyan/[0.14]">
              SEND
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
