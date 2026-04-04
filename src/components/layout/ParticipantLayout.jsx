import { Outlet } from 'react-router-dom'
import { ParticipantSidebar } from './ParticipantSidebar'

export const ParticipantLayout = () => {
  return (
    <div className="flex h-screen bg-cp-bg overflow-hidden text-cp-text selection:bg-cp-cyan selection:text-black">
      <ParticipantSidebar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
