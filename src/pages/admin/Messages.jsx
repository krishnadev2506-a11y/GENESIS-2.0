import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { NeonButton } from '../../components/ui/NeonButton'
import { TerminalInput } from '../../components/ui/TerminalInput'
import { Send, Radio, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export const AdminMessages = () => {
  const { profile } = useAuthStore()
  const [tab, setTab] = useState('broadcast')
  const [announcements, setAnnouncements] = useState([])
  const [msgs, setMsgs] = useState([])
  const [participants, setParticipants] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchUser, setSearchUser] = useState('')

  // Broadcast form
  const [annTitle, setAnnTitle]       = useState('')
  const [annBody, setAnnBody]         = useState('')
  const [annPriority, setAnnPriority] = useState('normal')

  // DM form
  const [dmContent, setDmContent] = useState('')

  useEffect(() => {
    loadAnnouncements()
    loadParticipants()
  }, [])

  const loadAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setAnnouncements(data || [])
  }

  const loadParticipants = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'participant').order('full_name')
    setParticipants(data || [])
  }

  const loadDMs = async (userId) => {
    const { data } = await supabase.from('messages').select('*, profiles!messages_sender_id_fkey(full_name)')
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${profile.id})`)
      .order('created_at')
    setMsgs(data || [])
  }

  const sendAnnouncement = async () => {
    if (!annTitle.trim() || !annBody.trim()) return toast.error('Title and body required')
    const { error } = await supabase.from('announcements').insert({ title: annTitle, body: annBody, priority: annPriority, created_by: profile.id })
    if (error) toast.error(error.message)
    else { toast.success('ANNOUNCEMENT SENT'); setAnnTitle(''); setAnnBody(''); loadAnnouncements() }
  }

  const deleteAnnouncement = async (id) => {
    if (!confirm('Delete this announcement?')) return
    await supabase.from('announcements').delete().eq('id', id)
    loadAnnouncements()
  }

  const sendDM = async () => {
    if (!dmContent.trim() || !selectedUser) return
    const { error } = await supabase.from('messages').insert({ sender_id: profile.id, receiver_id: selectedUser.id, content: dmContent, is_broadcast: false })
    if (error) toast.error(error.message)
    else { setDmContent(''); loadDMs(selectedUser.id) }
  }

  const selectUser = (u) => { setSelectedUser(u); loadDMs(u.id) }

  const priorityColor = { normal: 'text-cp-cyan border-cp-cyan', urgent: 'text-cp-yellow border-cp-yellow', critical: 'text-cp-magenta border-cp-magenta' }

  const filteredParticipants = participants.filter(p =>
    [p.full_name, p.email].some(v => v?.toLowerCase().includes(searchUser.toLowerCase()))
  )

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-orbitron font-bold text-3xl text-cp-cyan mb-1"><GlitchText text="COMMS_PANEL" /></h1>
        <p className="font-mono text-cp-muted text-sm">BROADCAST & DIRECT MESSAGES</p>
      </div>

      <div className="flex border-b border-cp-border">
        {[['broadcast', <><Radio size={12} /> BROADCASTS</>], ['dm', <><MessageSquare size={12} /> DIRECT MSG</>]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-6 py-3 font-mono text-xs tracking-widest transition-colors ${tab === key ? 'border-b-2 border-cp-cyan text-cp-cyan' : 'text-cp-muted hover:text-cp-text'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'broadcast' && (
        <div className="space-y-6">
          {/* Compose */}
          <HoloPanel>
            <h2 className="font-orbitron text-sm text-white mb-4 tracking-widest">NEW ANNOUNCEMENT</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2"><TerminalInput label="TITLE://" value={annTitle} onChange={e => setAnnTitle(e.target.value)} /></div>
                <div>
                  <label className="font-mono text-xs text-cp-muted tracking-widest mb-2 block">PRIORITY://</label>
                  <select value={annPriority} onChange={e => setAnnPriority(e.target.value)}
                    className="w-full bg-cp-dark border border-cp-border p-3 text-white font-mono text-sm outline-none focus:border-cp-cyan">
                    <option value="normal">NORMAL</option>
                    <option value="urgent">URGENT</option>
                    <option value="critical">CRITICAL</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-mono text-xs text-cp-muted tracking-widest mb-2 block">BODY://</label>
                <textarea value={annBody} onChange={e => setAnnBody(e.target.value)} rows={3}
                  className="w-full bg-cp-dark border border-cp-border p-3 text-cp-text font-mono text-sm outline-none focus:border-cp-cyan resize-none placeholder:text-cp-muted"
                  placeholder="Message to all participants..." />
              </div>
              <NeonButton variant="primary" onClick={sendAnnouncement} className="flex items-center gap-2">
                <Send size={14} />SEND TO ALL
              </NeonButton>
            </div>
          </HoloPanel>

          {/* History */}
          <div className="space-y-3">
            {announcements.length === 0 && <div className="text-center py-8 font-mono text-cp-muted text-sm">NO ANNOUNCEMENTS YET</div>}
            {announcements.map(a => (
              <HoloPanel key={a.id} className={`border-l-4 ${priorityColor[a.priority]?.split(' ')[1]}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 border ${priorityColor[a.priority]}`}>{a.priority?.toUpperCase()}</span>
                      <span className="font-orbitron text-sm text-white">{a.title}</span>
                    </div>
                    <p className="font-mono text-xs text-cp-muted">{a.body}</p>
                    <p className="font-mono text-[10px] text-cp-muted/50 mt-2">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => deleteAnnouncement(a.id)} className="text-cp-muted hover:text-cp-magenta ml-4 font-mono text-xs">DEL</button>
                </div>
              </HoloPanel>
            ))}
          </div>
        </div>
      )}

      {tab === 'dm' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
          {/* Participant list */}
          <HoloPanel className="overflow-y-auto p-0">
            <div className="p-3 border-b border-cp-border">
              <input value={searchUser} onChange={e => setSearchUser(e.target.value)} placeholder="Search participants..."
                className="w-full bg-cp-dark border border-cp-border px-3 py-2 font-mono text-xs text-cp-text outline-none focus:border-cp-cyan placeholder:text-cp-muted" />
            </div>
            <div className="overflow-y-auto h-[420px]">
              {filteredParticipants.map(p => (
                <button key={p.id} onClick={() => selectUser(p)}
                  className={`w-full text-left px-4 py-3 font-mono text-xs border-b border-cp-border/30 transition-colors ${selectedUser?.id === p.id ? 'bg-cp-cyan/10 text-cp-cyan' : 'text-cp-text hover:bg-cp-card'}`}>
                  <div className="font-bold">{p.full_name}</div>
                  <div className="text-cp-muted text-[10px]">{p.email}</div>
                </button>
              ))}
            </div>
          </HoloPanel>

          {/* Chat */}
          <div className="md:col-span-2 flex flex-col">
            {selectedUser ? (
              <>
                <HoloPanel className="mb-3 py-2 px-4">
                  <span className="font-orbitron text-sm text-white">{selectedUser.full_name}</span>
                </HoloPanel>
                <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-[350px]">
                  {msgs.map(m => (
                    <div key={m.id} className={`flex ${m.sender_id === profile.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 font-mono text-xs ${m.sender_id === profile.id ? 'bg-cp-cyan/10 border border-cp-cyan/30 text-cp-text' : 'bg-cp-card border border-cp-border text-cp-text'}`}>
                        {m.content}
                        <div className="text-[9px] text-cp-muted mt-1">{new Date(m.created_at).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                  {msgs.length === 0 && <div className="text-center py-8 font-mono text-cp-muted text-xs">NO MESSAGES YET</div>}
                </div>
                <div className="flex gap-2">
                  <input value={dmContent} onChange={e => setDmContent(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendDM()}
                    placeholder="Type message..." className="flex-1 bg-cp-dark border border-cp-border px-4 py-2 font-mono text-sm text-cp-text outline-none focus:border-cp-cyan placeholder:text-cp-muted" />
                  <NeonButton variant="primary" onClick={sendDM} className="!py-2 !px-4"><Send size={14} /></NeonButton>
                </div>
              </>
            ) : (
              <HoloPanel className="flex-1 flex items-center justify-center">
                <p className="font-mono text-cp-muted text-sm">SELECT A PARTICIPANT</p>
              </HoloPanel>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
