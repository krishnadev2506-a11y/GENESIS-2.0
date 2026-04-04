import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useEventSettings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('event_settings').select('*').limit(1).maybeSingle()
      setSettings(data)
      setLoading(false)
    }
    fetchSettings()
  }, [])

  return { settings, loading }
}
