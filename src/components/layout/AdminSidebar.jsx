import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UserCheck, MessageSquare, Upload, Settings, LogOut, X, Mail } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { GlitchText } from '../ui/GlitchText'
import { AnimatePresence, motion } from 'framer-motion'

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/registrations", icon: Users, label: "Registrations" },
  { to: "/admin/attendance", icon: UserCheck, label: "Attendance" },
  { to: "/admin/messages", icon: MessageSquare, label: "Messages" },
  { to: "/admin/emails", icon: Mail, label: "Emails" },
  { to: "/admin/submissions", icon: Upload, label: "Submissions" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
]

const SidebarContent = ({ profileName, onClose }) => (
  <div className="sticky top-0 z-50 flex h-screen w-[268px] flex-shrink-0 flex-col border-r border-white/8 bg-[#0b111a]/90 backdrop-blur-xl">
    <div className="flex items-center justify-between border-b border-white/8 bg-cp-magenta/[0.03] px-6 py-6">
      <div>
        <h2 className="mb-1 font-orbitron text-xl font-semibold text-cp-magenta">
          <GlitchText text="ADMIN" />_SYS
        </h2>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-cp-muted">
          CLEARANCE: LEVEL 5 // {profileName?.substring(0, 10) || 'UNKNOWN'}
        </div>
      </div>
      <button onClick={onClose} className="md:hidden rounded-xl border border-white/8 p-2 text-cp-muted transition-colors hover:border-white/20 hover:text-white">
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
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 rounded-2xl px-4 py-3 font-mono text-[13px] tracking-[0.16em] transition-all duration-200 ease-in-out
              ${isActive ? 'border border-cp-magenta/22 bg-cp-magenta/[0.08] text-cp-magenta shadow-[0_12px_26px_rgba(31,12,52,0.18)]' : 'border border-transparent text-cp-muted hover:border-white/8 hover:bg-white/[0.03] hover:text-cp-text'}
            `}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>

    <div className="border-t border-white/8 p-4">
      <LogoutButton />
    </div>
  </div>
)

const LogoutButton = () => {
  const { logout } = useAuthStore()
  return (
    <button
      onClick={logout}
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-mono text-[13px] tracking-[0.16em] text-cp-muted transition-all duration-200 hover:bg-white/[0.03] hover:text-cp-magenta"
    >
      <LogOut size={18} />
      LOGOUT
    </button>
  )
}

export const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { profile } = useAuthStore()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarContent profileName={profile?.full_name} onClose={() => setIsOpen(false)} />
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
              <SidebarContent profileName={profile?.full_name} onClose={() => setIsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
