import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'

export const useRegistration = () => {
  const { user } = useAuthStore()
  const [registration, setRegistration] = useState(null)
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchRegistration = async () => {
      const { data: reg } = await supabase.from('registrations').select('*').eq('user_id', user.id).maybeSingle()
      setRegistration(reg)
      
      if (reg?.team_id) {
        const { data: teamData } = await supabase.from('teams').select('*').eq('id', reg.team_id).maybeSingle()
        setTeam(teamData)
      }
      setLoading(false)
    }

    fetchRegistration()
  }, [user])

  return { registration, team, loading }
}
