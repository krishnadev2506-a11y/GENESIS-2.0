import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { Clock, Megaphone, AlertTriangle } from 'lucide-react'

const priorityConfig = {
  critical: { icon: AlertTriangle, border: 'border-[#FF2D78]', text: 'text-[#FF2D78]', bg: 'bg-[rgba(255,45,120,0.05)]', badge: 'bg-[#FF2D78]/20 text-[#FF2D78]' },
  urgent:   { icon: AlertTriangle, border: 'border-cp-yellow',  text: 'text-cp-yellow',  bg: 'bg-[rgba(245,230,66,0.05)]', badge: 'bg-cp-yellow/20 text-cp-yellow' },
  normal:   { icon: Megaphone,     border: 'border-cp-cyan',    text: 'text-cp-cyan',    bg: 'bg-[rgba(0,245,255,0.05)]',  badge: 'bg-cp-cyan/20 text-cp-cyan' },
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
        setAdminId('df1ed7cc-8b43-4f9e-a0e2-66ccfb1a0bb6') // Fallback to System Admin
      }

      setLoading(false)
    }
    load()

    // Realtime subscription
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

  const markRead = async (id) => {
    await supabase.from('messages').update({ is_read: true }).eq('id', id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
  }

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
      // Message will auto-insert via realtime subscription if it's sent to self?
      // Wait, realtime filter is receiver_id=eq.profile.id, so it won't catch outgoing.
      // We manually add it or let a wider realtime filter catch it.
      // Let's manually trigger a reload or append.
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

  if (loading) return <div className="p-8 font-mono text-cp-cyan animate-pulse">LOADING...</div>

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="font-orbitron font-bold text-3xl text-cp-cyan mb-1"><GlitchText text="COMMS_CENTER" /></h1>
        <p className="font-mono text-cp-muted text-sm">INCOMING TRANSMISSIONS</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cp-border">
        {[['announcements', `ANNOUNCEMENTS (${announcements.length})`], ['messages', `MESSAGES (${messages.filter(m => !m.is_read).length} unread)`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-6 py-3 font-mono text-xs tracking-widest transition-colors ${tab === key ? 'border-b-2 border-cp-cyan text-cp-cyan' : 'text-cp-muted hover:text-cp-text'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'announcements' && (
        <div className="space-y-4">
          {announcements.length === 0 && <div className="text-center py-12 font-mono text-cp-muted text-sm">NO ANNOUNCEMENTS YET</div>}
          {announcements.map(a => {
            const cfg = priorityConfig[a.priority] || priorityConfig.normal
            const Icon = cfg.icon
            return (
              <div key={a.id} className={`border-l-4 ${cfg.border} ${cfg.bg} p-4`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={cfg.text} />
                    <h3 className={`font-orbitron text-sm ${cfg.text}`}>{a.title}</h3>
                  </div>
                  <span className={`font-mono text-[9px] px-2 py-0.5 rounded-sm uppercase ${cfg.badge}`}>{a.priority}</span>
                </div>
                <p className="font-mono text-sm text-cp-text leading-relaxed">{a.body}</p>
                <p className="font-mono text-[10px] text-cp-muted mt-2 flex items-center gap-1">
                  <Clock size={9} />{new Date(a.created_at).toLocaleString()}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'messages' && (
        <div className="flex flex-col h-[500px]">
          <div className="space-y-3 flex-1 overflow-y-auto mb-4 border border-cp-border p-4 bg-cp-dark/50">
            {messages.length === 0 && <div className="text-center py-12 font-mono text-cp-muted text-sm">NO MESSAGES</div>}
            {[...messages].reverse().map(m => ( // reverse to show oldest top, newest bottom visually if we want? Actually, ordered by created_at DESC from DB. So reverse for chat view
              <div key={m.id} className={`flex ${m.sender_id === profile.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 font-mono text-xs ${m.sender_id === profile.id ? 'bg-cp-cyan/10 border border-cp-cyan/30 text-cp-text' : 'bg-cp-card border border-cp-border text-cp-text'}`}>
                  <div className="flex items-center gap-2 mb-1 opacity-70 border-b border-white/10 pb-1">
                    <span className="font-bold">{m.sender_id === profile.id ? 'YOU' : m.profiles?.full_name || 'ADMIN'}</span>
                    {m.is_broadcast && <span className="text-[8px] bg-cp-magenta/20 text-cp-magenta px-1">BROADCAST</span>}
                  </div>
                  {m.content}
                  <div className="text-[9px] text-cp-muted mt-1 text-right">{new Date(m.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input value={composeText} onChange={e => setComposeText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Message organizers..." className="flex-1 bg-cp-dark border border-cp-border px-4 py-3 font-mono text-sm text-cp-text outline-none focus:border-cp-cyan placeholder:text-cp-muted" />
            <button onClick={sendMessage} className="px-6 font-mono text-sm border border-cp-cyan text-cp-cyan hover:bg-cp-cyan hover:text-black transition-colors">
              SEND
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
