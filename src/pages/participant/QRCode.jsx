import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { NeonButton } from '../../components/ui/NeonButton'
import { Download, RefreshCw } from 'lucide-react'

export const QRCodePage = () => {
  const { profile } = useAuthStore()
  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase.from('registrations').select('*').eq('user_id', profile.id).maybeSingle()
      .then(({ data }) => { setRegistration(data); setLoading(false) })
  }, [profile])

  const downloadQR = () => {
    const svg = document.getElementById('participant-qr')
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      canvas.width = 300; canvas.height = 300
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#0A0A0F'
      ctx.fillRect(0, 0, 300, 300)
      ctx.drawImage(img, 25, 25, 250, 250)
      const a = document.createElement('a')
      a.download = `genesis-qr-${registration?.registration_no}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)))
  }

  if (loading) return <div className="p-8 font-mono text-cp-cyan animate-pulse">LOADING...</div>

  if (!registration) return (
    <div className="p-8 max-w-lg">
      <HoloPanel className="text-center py-12">
        <p className="font-mono text-cp-muted text-sm mb-4">NO REGISTRATION FOUND</p>
        <p className="font-mono text-[#6B6B8A] text-xs">Complete your registration to get your QR code.</p>
      </HoloPanel>
    </div>
  )

  const qrValue = JSON.stringify({
    reg_no:   registration.registration_no,
    reg_id:   registration.id,
    user_id:  profile.id,
    name:     profile.full_name,
    qr_data:  registration.qr_data
  })

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="font-orbitron font-bold text-3xl text-cp-cyan mb-1">
          <GlitchText text="ACCESS_TOKEN" />
        </h1>
        <p className="font-mono text-cp-muted text-sm">SCAN AT CHECKPOINTS FOR ENTRY & MEALS</p>
      </div>

      <HoloPanel className="flex flex-col items-center py-10 gap-6">
        {/* Scan frame */}
        <div className="relative p-4 bg-white rounded-sm">
          <QRCodeSVG
            id="participant-qr"
            value={qrValue}
            size={220}
            bgColor="#FFFFFF"
            fgColor="#0A0A0F"
            level="H"
          />
          {/* Corner overlays */}
          <div className="absolute top-1 left-1 w-6 h-6 border-t-4 border-l-4 border-[#00F5FF]" />
          <div className="absolute top-1 right-1 w-6 h-6 border-t-4 border-r-4 border-[#00F5FF]" />
          <div className="absolute bottom-1 left-1 w-6 h-6 border-b-4 border-l-4 border-[#00F5FF]" />
          <div className="absolute bottom-1 right-1 w-6 h-6 border-b-4 border-r-4 border-[#00F5FF]" />
        </div>

        <div className="text-center">
          <p className="font-orbitron text-2xl text-cp-cyan tracking-widest font-bold">{registration.registration_no}</p>
          <p className="font-mono text-cp-muted text-xs mt-1">{profile.full_name?.toUpperCase()}</p>
        </div>

        <div className={`font-mono text-xs px-4 py-2 border rounded-sm ${registration.status === 'confirmed' ? 'border-[#39FF14] text-[#39FF14] bg-[#39FF14]/10' : 'border-cp-yellow text-cp-yellow bg-cp-yellow/10'}`}>
          STATUS: {registration.status?.toUpperCase()}
        </div>

        <div className="flex gap-4">
          <NeonButton variant="primary" onClick={downloadQR} className="flex items-center gap-2">
            <Download size={14} />DOWNLOAD
          </NeonButton>
        </div>
      </HoloPanel>

      {/* Checkpoints info */}
      <HoloPanel>
        <h2 className="font-orbitron text-sm text-white mb-4 tracking-widest">SCAN CHECKPOINTS</h2>
        <div className="space-y-2">
          {['DAY1_ENTRY', 'LUNCH_DAY1', 'DAY2_ENTRY', 'LUNCH_DAY2', 'FINAL_DEMO'].map(cp => (
            <div key={cp} className="flex justify-between items-center font-mono text-xs py-2 border-b border-cp-border">
              <span className="text-cp-muted">{cp.replace(/_/g, ' ')}</span>
              <span className="text-[#6B6B8A]">SHOW QR AT GATE</span>
            </div>
          ))}
        </div>
      </HoloPanel>
    </div>
  )
}
