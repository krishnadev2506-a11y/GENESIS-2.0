import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useRealtime = (channelName, table, event, callback, filter = null) => {
  useEffect(() => {
    const config = {
      event,
      schema: 'public',
      table,
    }
    if (filter) {
      config.filter = filter
    }

    const channel = supabase.channel(channelName)
      .on('postgres_changes', config, callback)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, table, event, callback, filter])
}
