import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  setUser:    (user)    => set({ user }),
  setProfile: (profile) => set({ profile }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null })
  }
}))

export default useAuthStore
