import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Use the admin auth API to find and update user by email
const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

if (listError) {
  console.error('❌ Auth list error:', listError.message)
  process.exit(1)
}

const target = users.find(u => u.email === 'kride2506@gmail.com')
if (!target) {
  console.log('⚠️  User kride2506@gmail.com not found in auth.users — have they registered yet?')
  process.exit(0)
}

console.log('✅ Found user:', target.email, '| ID:', target.id)

// Update via raw SQL using rpc or direct table (hint suggests hackfit_test table exists)
// Try updating with the actual table the error hint suggested
const { data, error } = await supabase
  .from('hackfit_test')
  .update({ role: 'admin' })
  .eq('email', 'kride2506@gmail.com')
  .select('email, role')

if (error) {
  console.error('hackfit_test update error:', error.message)
  console.log('\nTrying to list all available tables...')
  const { data: tables } = await supabase.rpc('get_tables').catch(() => ({ data: null }))
  console.log('Tables:', tables)
} else {
  console.log('✅ Updated in hackfit_test:', data)
}
