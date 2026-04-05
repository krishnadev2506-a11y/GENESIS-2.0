import { NavLink } from 'react-router-dom'
import { LayoutDashboard, QrCode, Users, MessageSquare, Upload, Calendar, BookOpen, LogOut, X } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { GlitchText } from '../ui/GlitchText'
import { motion, AnimatePresence } from 'framer-motion'

export const ParticipantSidebar = ({ isOpen, setIsOpen }) => {
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

  const SidebarContent = () => (
    <div className="sticky top-0 z-50 flex h-screen w-[256px] flex-shrink-0 flex-col border-r border-white/8 bg-[#0b111a]/88 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-6">
        <div>
          <h2 className="mb-1 font-orbitron text-xl font-semibold text-cp-cyan">
            <GlitchText text="GENESIS" />
          </h2>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-cp-muted">
            OPERATOR: {profile?.full_name?.substring(0, 15) || 'UNKNOWN'}
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden rounded-xl border border-white/8 p-2 text-cp-muted transition-colors hover:border-white/20 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1.5">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink 
              key={label} 
              to={to} 
              end={end}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 rounded-2xl px-4 py-3 font-mono text-[13px] tracking-[0.16em] transition-all duration-200 ease-in-out
                ${isActive ? 'border border-cp-cyan/22 bg-cp-cyan/[0.08] text-cp-cyan shadow-[0_12px_26px_rgba(10,30,42,0.18)]' : 'border border-transparent text-cp-muted hover:border-white/8 hover:bg-white/[0.03] hover:text-cp-text'}
              `}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/8 p-4">
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-mono text-[13px] tracking-[0.16em] text-cp-muted transition-all duration-200 hover:bg-white/[0.03] hover:text-cp-magenta"
        >
          <LogOut size={18} />
          LOGOUT
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/72 backdrop-blur-md md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220, mass: 0.8 }}
              className="fixed inset-y-0 left-0 z-[70] md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
