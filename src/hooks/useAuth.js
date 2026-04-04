import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'

export const useAuth = () => {
  const { user, profile, session, loading, setUser, setProfile, setSession, setLoading, logout } = useAuthStore()

  const login = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const register = async (email, password, metadata) => {
    return await supabase.auth.signUp({
      email, password, options: { data: metadata }
    })
  }

  return { user, profile, session, loading, login, register, logout }
}
