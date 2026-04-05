import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { NeonButton } from '../../components/ui/NeonButton'
import { TerminalInput } from '../../components/ui/TerminalInput'
import { Send, Users, User, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export const AdminEmails = () => {
  const [targetType, setTargetType] = useState('all') // 'all' or 'specific'
  const [specificEmail, setSpecificEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [processing, setProcessing] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)

  useEffect(() => {
    // Get participant count
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'participant')
      .then(({ count }) => {
        if (count) setParticipantCount(count)
      })
  }, [])

  const sendEmail = async () => {
    if (!subject.trim() || !body.trim()) {
      return toast.error('Subject and Body are required')
    }

    setProcessing(true)

    try {
      let recipients = []
      let isBulk = targetType === 'all'

      if (isBulk) {
        // Fetch all participant emails
        const { data, error } = await supabase.from('profiles').select('email').eq('role', 'participant')
        if (error) throw error
        recipients = data.map(p => p.email).filter(Boolean)
        
        if (recipients.length === 0) {
          throw new Error("No participant emails found")
        }
      } else {
        if (!specificEmail.trim() || !specificEmail.includes('@')) {
          throw new Error('Valid email address required')
        }
        recipients = [specificEmail.trim()]
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: recipients,
          subject,
          body,
          isBulk,
        }),
      })

      let data = null
      try {
        data = await response.json()
      } catch {
        data = null
      }

      if (!response.ok) {
        const errorMessage =
          typeof data?.error === 'string'
            ? data.error
            : data?.error?.message || data?.message || `Edge Function returned status ${response.status}`
        throw new Error(errorMessage)
      }

      if (data && data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : (data.error.message || 'Error from email provider'))
      }

      toast.success(data?.message || 'EMAIL TRANSMITTED SUCCESSFULLY')
      setSubject('')
      setBody('')
      if (!isBulk) setSpecificEmail('')

    } catch (err) {
      console.error(err)
      const message = err?.message || 'Unknown error'
      const normalizedMessage =
        message.includes('Failed to send a request to the Edge Function')
          ? 'Could not reach the deployed email function. Check your internet connection and Supabase project status.'
          : message
      toast.error(`TRANSMISSION FAILED: ${normalizedMessage}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="font-orbitron font-bold text-3xl text-cp-cyan mb-1"><GlitchText text="EMAIL_COMMS" /></h1>
        <p className="font-mono text-cp-muted text-sm">SECURE EXTERNAL TRANSMISSION SYSTEM</p>
      </div>

      <HoloPanel className="border-t-4 border-t-cp-cyan">
        <div className="flex items-center gap-2 mb-6 text-cp-cyan bg-cp-cyan/10 p-3 border border-cp-cyan/20">
          <AlertCircle size={16} />
          <span className="font-mono text-xs">WARNING: THESE EMAILS WILL BE SENT TO REAL INBOXES. NO RECOVERY POSSIBLE ONCE TRANSMITTED.</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <label className="font-mono text-xs text-cp-muted tracking-widest block">TARGET_AUDIENCE://</label>
            <div className="flex gap-4">
              <button 
                onClick={() => setTargetType('all')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 border transition-colors font-mono text-sm tracking-widest ${targetType === 'all' ? 'border-cp-cyan bg-cp-cyan/10 text-cp-cyan' : 'border-cp-border bg-cp-dark text-cp-muted hover:border-cp-muted'}`}
              >
                <Users size={16} />
                ALL PARTICIPANTS ({participantCount})
              </button>
              <button 
                onClick={() => setTargetType('specific')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 border transition-colors font-mono text-sm tracking-widest ${targetType === 'specific' ? 'border-cp-cyan bg-cp-cyan/10 text-cp-cyan' : 'border-cp-border bg-cp-dark text-cp-muted hover:border-cp-muted'}`}
              >
                <User size={16} />
                SPECIFIC ADDRESS
              </button>
            </div>
            {targetType === 'specific' && (
              <div className="pt-2">
                <TerminalInput 
                  label="RECIPIENT_EMAIL://" 
                  value={specificEmail} 
                  onChange={e => setSpecificEmail(e.target.value)} 
                  placeholder="participant@example.com"
                />
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-cp-border border-dashed">
             <TerminalInput 
                label="SUBJECT_LINE://" 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                placeholder="Important Hackathon Update"
              />
              
              <div>
                <label className="font-mono text-xs text-cp-muted tracking-widest mb-2 block">MESSAGE_BODY:// (HTML or Text)</label>
                <textarea 
                  value={body} 
                  onChange={e => setBody(e.target.value)} 
                  rows={8}
                  className="w-full bg-cp-dark border border-cp-border p-4 text-cp-text font-mono text-sm outline-none focus:border-cp-cyan resize-y placeholder:text-cp-border transition-colors"
                  placeholder="Type your message here... <br> tags will work." 
                />
              </div>
          </div>

          <div className="pt-4 flex justify-end">
            <NeonButton 
              variant="primary" 
              onClick={sendEmail} 
              disabled={processing}
              className={`flex items-center gap-2 px-8 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {processing ? (
                <span className="animate-pulse">TRANSMITTING...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>INITIATE TRANSMISSION</span>
                </>
              )}
            </NeonButton>
          </div>
        </div>
      </HoloPanel>
    </div>
  )
}
