import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'

export const useProfile = () => {
  const { user, profile: authProfile, setProfile: setAuthProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const updateProfile = async (updates) => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', user?.id).select().single()
    if (!error && data) {
      setAuthProfile(data)
    }
    setLoading(false)
    return { data, error }
  }

  return { profile: authProfile, updateProfile, loading }
}
