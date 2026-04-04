import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function check() {
  try {
    const { error: signUpError } = await supabase.auth.signUp({
      email: 'test_trigger_' + Date.now() + '@example.com',
      password: 'TestPassword123!',
      options: { data: { full_name: 'Test User', role: 'participant' } }
    });
    
    fs.writeFileSync('db_error.txt', signUpError ? JSON.stringify(signUpError, null, 2) : 'SUCCESS');
  } catch(e) {
    fs.writeFileSync('db_error.txt', e.toString());
  }
  process.exit(0);
}
check();
