import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://fowgmbxddgoiiupgnoce.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvd2dtYnhkZGdvaWl1cGdub2NlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYxMTg5NCwiZXhwIjoyMDkwMTg3ODk0fQ.f34LnHDRJIKP27mQnjvHLISKqaF8Jhc4ZUayMsp0jQs';

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
