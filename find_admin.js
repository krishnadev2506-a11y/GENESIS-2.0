import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAdmin() {
  const { data: adminProfiles, error } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('role', 'admin')
    
  if (error) {
    console.error('Error fetching admin profiles:', error)
    return
  }

  console.log('Admin Profiles found:', adminProfiles?.length || 0)
  adminProfiles?.forEach(p => console.log(`- Email: ${p.email} (Role: ${p.role})`))
  
  // also check if registrations table has team_id column
  const { data: cols, error: colError } = await supabase
    .from('registrations')
    .select('team_id')
    .limit(1)
    
  if (colError) {
    console.error('\nRegistrations table check error:', colError.message, colError.details)
  } else {
    console.log('\nRegistrations table correctly responded and has team_id.')
  }
}

checkAdmin()
