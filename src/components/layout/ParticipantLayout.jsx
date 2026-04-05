import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ParticipantSidebar } from './ParticipantSidebar'
import { Menu } from 'lucide-react'

export const ParticipantLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="dashboard-shell relative flex h-screen overflow-hidden text-cp-text selection:bg-cp-cyan selection:text-black">
      <ParticipantSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="z-40 flex items-center justify-between border-b border-white/8 bg-[#0c121c]/88 px-4 py-4 backdrop-blur-xl md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-cp-cyan transition-colors hover:border-cp-cyan/30 hover:text-cp-text">
            <Menu size={24} />
          </button>
          <span className="font-orbitron text-sm font-semibold tracking-[0.26em] text-cp-cyan">GENESIS_DASH</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
