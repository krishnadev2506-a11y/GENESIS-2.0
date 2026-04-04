import { NavLink } from 'react-router-dom'
import { LayoutDashboard, QrCode, Users, MessageSquare, Upload, Calendar, BookOpen, LogOut } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { GlitchText } from '../ui/GlitchText'

export const ParticipantSidebar = () => {
  const { profile, logout } = useAuthStore()

  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/dashboard/qr", icon: QrCode, label: "My QR Code" },
    { to: "/dashboard/team", icon: Users, label: "Team" },
    { to: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
    { to: "/dashboard/submit", icon: Upload, label: "Submission" },
    { to: "/dashboard/schedule", icon: Calendar, label: "Schedule" },
    { to: "/dashboard/resources", icon: BookOpen, label: "Resources" }
  ]

  return (
    <div className="w-[240px] flex-shrink-0 bg-cp-dark border-r border-cp-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-cp-border">
        <h2 className="font-orbitron font-bold text-cp-cyan text-xl mb-1">
          <GlitchText text="GENESIS" />
        </h2>
        <div className="font-mono text-[10px] tracking-widest text-cp-muted uppercase">
          OPERATOR: {profile?.full_name?.substring(0, 15) || 'UNKNOWN'}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink 
              key={label} 
              to={to} 
              end={end}
              className={({ isActive }) => `
                flex items-center gap-3 px-6 py-3 font-mono text-sm tracking-wider transition-colors
                ${isActive ? 'bg-[rgba(0,245,255,0.08)] border-l-4 border-cp-cyan text-cp-cyan' : 'border-l-4 border-transparent text-cp-muted hover:bg-cp-card hover:text-cp-text'}
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-cp-border">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-6 py-3 font-mono text-sm tracking-wider text-cp-muted hover:text-cp-magenta transition-colors w-full"
        >
          <LogOut size={18} />
          LOGOUT
        </button>
      </div>
    </div>
  )
}
