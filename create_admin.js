import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://fowgmbxddgoiiupgnoce.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvd2dtYnhkZGdvaWl1cGdub2NlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYxMTg5NCwiZXhwIjoyMDkwMTg3ODk0fQ.f34LnHDRJIKP27mQnjvHLISKqaF8Jhc4ZUayMsp0jQs'
)

async function createAdmin() {
  const email = 'admin_genesis@example.com'
  const password = 'GenesisAdmin2026!'
  
  console.log(`Attempting to create admin: ${email}...`)
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Genesis Admin', role: 'admin' }
  })

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already exists. Proceeding to update role...')
    } else {
      console.error('❌ Error creating user:', error.message)
      process.exit(1)
    }
  } else {
    console.log('✅ User created successfully in Auth.')
  }

  // Ensure profile exists and has admin role
  const userId = data?.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email)?.id

  if (!userId) {
    console.error('❌ Could not find user ID.')
    process.exit(1)
  }

  const { error: profError } = await supabase.from('profiles').upsert({
    id: userId,
    email: email,
    full_name: 'Genesis Admin',
    role: 'admin'
  })

  if (profError) {
    console.error('❌ Error updating profile role:', profError.message)
    process.exit(1)
  }

  console.log('✅ Admin profile created/updated with ADMIN role.')
  console.log('\n--- CREDENTIALS ---')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log('-------------------')
}

createAdmin()
