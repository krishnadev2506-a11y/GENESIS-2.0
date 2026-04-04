import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use the management API to run SQL directly via the pg endpoint
const projectRef  = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)[1]

const sql = `
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Unknown',
  email TEXT UNIQUE NOT NULL,
  phone TEXT, college TEXT, year_desig TEXT,
  role TEXT DEFAULT 'participant' CHECK (role IN ('participant','admin')),
  tshirt_size TEXT, dietary TEXT DEFAULT 'none',
  avatar_url TEXT, github_url TEXT, linkedin_url TEXT,
  heard_from TEXT, emergency_name TEXT, emergency_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  leader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  track TEXT NOT NULL DEFAULT 'general',
  invite_code TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text,1,8),
  max_members INT DEFAULT 4, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','waitlist')),
  qr_data TEXT UNIQUE, qr_hash TEXT,
  registration_no TEXT UNIQUE DEFAULT 'GEN-' || upper(substring(gen_random_uuid()::text,1,8)),
  notes TEXT, reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  amount INT NOT NULL DEFAULT 50000, currency TEXT DEFAULT 'INR',
  razorpay_order_id TEXT UNIQUE, razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT, status TEXT DEFAULT 'pending',
  gateway TEXT DEFAULT 'razorpay', created_at TIMESTAMPTZ DEFAULT NOW(), paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  checkpoint TEXT NOT NULL DEFAULT 'DAY1_ENTRY'
    CHECK (checkpoint IN ('DAY1_ENTRY','LUNCH_DAY1','DAY2_ENTRY','LUNCH_DAY2','FINAL_DEMO')),
  scanned_at TIMESTAMPTZ DEFAULT NOW(), scanned_by UUID REFERENCES profiles(id),
  is_manual BOOLEAN DEFAULT FALSE, UNIQUE(registration_id, checkpoint)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL, attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE, is_broadcast BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, body TEXT NOT NULL, image_url TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal','urgent','critical')),
  created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL, description TEXT,
  github_url TEXT, demo_url TEXT, video_url TEXT, track TEXT,
  judge_score INT, judge_notes TEXT, submitted_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(team_id)
);

CREATE TABLE IF NOT EXISTS event_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_open BOOLEAN DEFAULT TRUE, max_participants INT DEFAULT 500,
  registration_fee INT DEFAULT 50000,
  event_start TIMESTAMPTZ DEFAULT '2025-08-15 09:00:00+05:30',
  event_end TIMESTAMPTZ DEFAULT '2025-08-17 18:00:00+05:30',
  hack_window_start TIMESTAMPTZ DEFAULT '2025-08-15 11:00:00+05:30',
  hack_window_end TIMESTAMPTZ DEFAULT '2025-08-17 10:00:00+05:30',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO event_settings DEFAULT VALUES ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS \$\$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'participant'))
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email, 
    full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert admin user
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Admin'), 'admin'
FROM auth.users WHERE email = 'kride2506@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

NOTIFY pgrst, 'reload schema';
`

// Try Supabase's pg admin endpoint
const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  },
  body: JSON.stringify({ sql })
})

if (!response.ok) {
  // Fall back to direct pg endpoint via management API
  const mgmtResponse = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    }
  )
  const mgmtResult = await mgmtResponse.text()
  console.log('Management API response:', mgmtResponse.status, mgmtResult)
} else {
  const result = await response.text()
  console.log('✅ RPC response:', response.status, result)
}
