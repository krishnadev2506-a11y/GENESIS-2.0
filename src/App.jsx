import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import { supabase } from './lib/supabase'

import { ProtectedRoute }    from './components/ui/ProtectedRoute'
import { AdminLayout }       from './components/layout/AdminLayout'
import { ParticipantLayout } from './components/layout/ParticipantLayout'

// Public pages
import { Home }           from './pages/Home'
import { Login }          from './pages/Login'
import { Register }       from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword }  from './pages/ResetPassword'

// Participant pages
import { ParticipantDashboard } from './pages/participant/Dashboard'
import { QRCodePage }           from './pages/participant/QRCode'
import { TeamPage }             from './pages/participant/Team'
import { MessagesPage }         from './pages/participant/Messages'
import { SubmissionPage }       from './pages/participant/Submission'
import { SchedulePage }         from './pages/participant/Schedule'
import { ResourcesPage }        from './pages/participant/Resources'

// Admin pages
import { AdminDashboard }  from './pages/admin/AdminDashboard'
import { Registrations }   from './pages/admin/Registrations'
import { Attendance }      from './pages/admin/Attendance'
import { AdminMessages }   from './pages/admin/Messages'
import { Submissions }     from './pages/admin/Submissions'
import { Settings }        from './pages/admin/Settings'
import { AdminEmails }     from './pages/admin/Emails'

function App() {
  const { setSession, setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => { setProfile(data); setLoading(false) })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => { if (data) setProfile(data); setLoading(false) })
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#12121A', color: '#00F5FF', border: '1px solid #2A2A3F', fontFamily: 'JetBrains Mono', fontSize: '12px' },
        success: { iconTheme: { primary: '#39FF14', secondary: '#0A0A0F' } },
        error:   { iconTheme: { primary: '#FF2D78', secondary: '#0A0A0F' }, style: { color: '#FF2D78' } }
      }} />

      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"                element={<Home />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* Participant dashboard (nested, requires participant role) */}
          <Route path="/dashboard" element={<ProtectedRoute role="participant"><ParticipantLayout /></ProtectedRoute>}>
            <Route index             element={<ParticipantDashboard />} />
            <Route path="qr"         element={<QRCodePage />} />
            <Route path="team"       element={<TeamPage />} />
            <Route path="messages"   element={<MessagesPage />} />
            <Route path="submit"     element={<SubmissionPage />} />
            <Route path="schedule"   element={<SchedulePage />} />
            <Route path="resources"  element={<ResourcesPage />} />
          </Route>

          {/* Admin dashboard (nested, requires admin role) */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index                 element={<AdminDashboard />} />
            <Route path="registrations"  element={<Registrations />} />
            <Route path="attendance"     element={<Attendance />} />
            <Route path="messages"       element={<AdminMessages />} />
            <Route path="emails"         element={<AdminEmails />} />
            <Route path="submissions"    element={<Submissions />} />
            <Route path="settings"       element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
