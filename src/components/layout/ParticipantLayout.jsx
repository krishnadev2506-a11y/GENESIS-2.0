import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ParticipantSidebar } from './ParticipantSidebar'
import { Menu } from 'lucide-react'

export const ParticipantLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-cp-bg overflow-hidden text-cp-text selection:bg-cp-cyan selection:text-black relative">
      <ParticipantSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-cp-border bg-cp-dark z-40">
          <button onClick={() => setSidebarOpen(true)} className="text-cp-cyan">
            <Menu size={24} />
          </button>
          <span className="font-orbitron font-bold text-cp-cyan tracking-widest text-sm">GENESIS_DASH</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
