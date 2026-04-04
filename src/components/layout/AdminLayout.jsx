import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-cp-bg overflow-hidden text-cp-text selection:bg-cp-magenta selection:text-white">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
