import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UserCheck, MessageSquare, Upload, Settings, LogOut, X } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { GlitchText } from '../ui/GlitchText'
import { motion, AnimatePresence } from 'framer-motion'

export const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { profile, logout } = useAuthStore()

  const links = [
    { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
    { to: "/admin/registrations", icon: Users, label: "Registrations" },
    { to: "/admin/attendance", icon: UserCheck, label: "Attendance" },
    { to: "/admin/messages", icon: MessageSquare, label: "Messages" },
    { to: "/admin/submissions", icon: Upload, label: "Submissions" },
    { to: "/admin/settings", icon: Settings, label: "Settings" }
  ]

  const SidebarContent = () => (
    <div className="w-[260px] flex-shrink-0 bg-cp-dark border-r border-cp-border flex flex-col h-screen sticky top-0 z-50">
      <div className="p-6 border-b border-cp-border bg-[rgba(255,45,120,0.02)] flex justify-between items-center">
        <div>
          <h2 className="font-orbitron font-bold text-cp-magenta text-xl mb-1">
            <GlitchText text="ADMIN" />_SYS
          </h2>
          <div className="font-mono text-[10px] tracking-widest text-cp-muted uppercase">
            CLEARANCE: LEVEL 5 // {profile?.full_name?.substring(0, 10) || 'UNKNOWN'}
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden text-cp-muted hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink 
              key={label} 
              to={to} 
              end={end}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-6 py-3 font-mono text-sm tracking-wider transition-colors
                ${isActive ? 'bg-[rgba(255,45,120,0.08)] border-l-4 border-cp-magenta text-cp-magenta' : 'border-l-4 border-transparent text-cp-muted hover:bg-cp-card hover:text-cp-text'}
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
              className="fixed inset-0 bg-black/80 z-[60] md:hidden backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
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
