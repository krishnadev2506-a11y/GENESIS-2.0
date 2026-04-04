-- ═══════════════════════════════════════════════════════════════
-- GENESIS 2.0 — CLEAN SCHEMA (NO PAYMENTS)
-- Order: DROP → TABLES → HELPER FUNCTION → RLS → POLICIES → TRIGGER → REALTIME
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- STEP 1: DROP ALL PUBLIC TABLES & OLD FUNCTIONS
-- ─────────────────────────────────────────────
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ─────────────────────────────────────────────
-- STEP 2: PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL DEFAULT 'Unknown',
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  college         TEXT,
  year_desig      TEXT,
  role            TEXT DEFAULT 'participant' CHECK (role IN ('participant','admin')),
  tshirt_size     TEXT CHECK (tshirt_size IN ('XS','S','M','L','XL','XXL')),
  dietary         TEXT DEFAULT 'none',
  avatar_url      TEXT,
  github_url      TEXT,
  linkedin_url    TEXT,
  heard_from      TEXT,
  emergency_name  TEXT,
  emergency_phone TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- STEP 3: TEAMS
-- ─────────────────────────────────────────────
CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  leader_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  track       TEXT NOT NULL,
  invite_code TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  max_members INT DEFAULT 4,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- STEP 4: TEAM MEMBERS
-- ─────────────────────────────────────────────
CREATE TABLE team_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id   UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- ─────────────────────────────────────────────
-- STEP 5: REGISTRATIONS
-- ─────────────────────────────────────────────
CREATE TABLE registrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  team_id         UUID REFERENCES teams(id) ON DELETE SET NULL,
  status          TEXT DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','rejected','waitlist')),
  qr_data         TEXT UNIQUE DEFAULT 'GEN-QR-' || upper(substring(gen_random_uuid()::text,1,12)),
  registration_no TEXT UNIQUE DEFAULT 'GEN-' || upper(substring(gen_random_uuid()::text,1,8)),
  notes           TEXT,
  reviewed_by     UUID REFERENCES profiles(id),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- STEP 6: ATTENDANCE
-- ─────────────────────────────────────────────
CREATE TABLE attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  checkpoint      TEXT NOT NULL DEFAULT 'DAY1_ENTRY'
                    CHECK (checkpoint IN ('DAY1_ENTRY','LUNCH_DAY1','DAY2_ENTRY','LUNCH_DAY2','FINAL_DEMO')),
  scanned_at      TIMESTAMPTZ DEFAULT NOW(),
  scanned_by      UUID REFERENCES profiles(id),
  is_manual       BOOLEAN DEFAULT FALSE,
  UNIQUE(registration_id, checkpoint)
);

-- ─────────────────────────────────────────────
-- STEP 7: MESSAGES
-- ─────────────────────────────────────────────
CREATE TABLE messages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  attachment_url TEXT,
  is_read        BOOLEAN DEFAULT FALSE,
  is_broadcast   BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- STEP 8: ANNOUNCEMENTS
-- ─────────────────────────────────────────────
CREATE TABLE announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  image_url  TEXT,
  priority   TEXT DEFAULT 'normal' CHECK (priority IN ('normal','urgent','critical')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- STEP 9: SUBMISSIONS
-- ─────────────────────────────────────────────
CREATE TABLE submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id      UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  description  TEXT,
  github_url   TEXT,
  demo_url     TEXT,
  video_url    TEXT,
  track        TEXT,
  judge_score  INT CHECK (judge_score BETWEEN 0 AND 100),
  judge_notes  TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id)
);

-- ─────────────────────────────────────────────
-- STEP 10: EVENT SETTINGS
-- ─────────────────────────────────────────────
CREATE TABLE event_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_open BOOLEAN DEFAULT TRUE,
  max_participants  INT DEFAULT 500,
  event_name        TEXT DEFAULT 'GENESIS 2.0',
  event_start       TIMESTAMPTZ DEFAULT '2025-08-15 09:00:00+05:30',
  event_end         TIMESTAMPTZ DEFAULT '2025-08-17 18:00:00+05:30',
  hack_window_start TIMESTAMPTZ DEFAULT '2025-08-15 11:00:00+05:30',
  hack_window_end   TIMESTAMPTZ DEFAULT '2025-08-17 10:00:00+05:30',
  venue             TEXT DEFAULT 'TBD',
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO event_settings DEFAULT VALUES;

-- ─────────────────────────────────────────────
-- STEP 11: ADMIN ROLE HELPER (BEFORE policies)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_role(uid UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

-- ─────────────────────────────────────────────
-- STEP 12: ENABLE ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams          ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- STEP 13: RLS POLICIES
-- ─────────────────────────────────────────────

-- Profiles
CREATE POLICY "Users can view own profile or admins" 
ON profiles FOR SELECT TO authenticated 
USING (id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'judge') OR role = 'admin');
CREATE POLICY "users_own_profile_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_all_profiles" ON profiles FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Teams
CREATE POLICY "read_teams"         ON teams FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "leader_manage_team" ON teams FOR ALL    USING (auth.uid() = leader_id);
CREATE POLICY "admin_all_teams"    ON teams FOR ALL    USING (public.get_user_role(auth.uid()) = 'admin');

-- Team members
CREATE POLICY "team_member_access"     ON team_members FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "team_member_read"       ON team_members FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_all_team_members" ON team_members FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Registrations
CREATE POLICY "user_own_registration"   ON registrations FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "admin_all_registrations" ON registrations FOR ALL    USING (public.get_user_role(auth.uid()) = 'admin');

-- Attendance
CREATE POLICY "user_own_attendance" ON attendance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_attendance"    ON attendance FOR ALL    USING (public.get_user_role(auth.uid()) = 'admin');

-- Messages
CREATE POLICY "message_participants" ON messages FOR ALL USING (
  auth.uid() = sender_id OR
  auth.uid() = receiver_id OR
  public.get_user_role(auth.uid()) = 'admin'
);

-- Announcements
CREATE POLICY "read_announcements"         ON announcements FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_write_announcements"  ON announcements FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "admin_update_announcements" ON announcements FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "admin_delete_announcements" ON announcements FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- Submissions
CREATE POLICY "team_submission"       ON submissions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "read_all_submissions"  ON submissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_all_submissions" ON submissions FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Event settings
CREATE POLICY "read_settings"  ON event_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_settings" ON event_settings FOR ALL    USING (public.get_user_role(auth.uid()) = 'admin');

-- ─────────────────────────────────────────────
-- STEP 14: AUTO-PROFILE TRIGGER ON SIGNUP
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'participant')
  )
  ON CONFLICT (id) DO UPDATE SET
    email     = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- STEP 15: SEED ADMIN ROLE
-- ─────────────────────────────────────────────
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'kride2506@gmail.com';

-- ─────────────────────────────────────────────
-- STEP 16: REALTIME
-- ─────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
