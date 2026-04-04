import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { LoadingScreen } from './LoadingScreen'

export const ProtectedRoute = ({ children, role }) => {
  const { user, profile, loading } = useAuthStore()

  if (loading) return <LoadingScreen />

  // Not authenticated at all
  if (!user) return <Navigate to="/login" replace />

  // Profile may be null if RLS hasn't loaded it yet — fall back to user metadata
  const effectiveRole = profile?.role ?? user?.user_metadata?.role ?? 'participant'

  if (role && effectiveRole !== role) return <Navigate to="/login" replace />

  return children
}
