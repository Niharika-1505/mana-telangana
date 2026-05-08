-- ============================================
-- TABLE: mp (Members of Parliament)
-- ============================================
CREATE TABLE IF NOT EXISTS mp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_te text,
  party text,
  constituency_en text NOT NULL,
  constituency_te text,
  lok_sabha_seat_number integer,
  phone text,
  email text,
  photo_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- TABLE: mla (Members of Legislative Assembly)
-- ============================================
CREATE TABLE IF NOT EXISTS mla (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_te text,
  party text,
  constituency_en text NOT NULL,
  constituency_te text,
  constituency_number integer,
  assembly_segment text,
  mp_id uuid REFERENCES mp(id),
  phone text,
  email text,
  photo_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- TABLE: ward_contributions (public submissions)
-- ============================================
CREATE TABLE IF NOT EXISTS ward_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_number integer,
  ward_name_en text,
  ward_name_te text,
  mandal_en text,
  municipality_en text,
  district_en text,
  state_en text DEFAULT 'Telangana',
  councillor_name text,
  councillor_party text,
  councillor_phone text,
  mla_id uuid REFERENCES mla(id),
  contributor_fingerprint text,
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ALTER: wards table — add new columns
-- ============================================
ALTER TABLE wards ADD COLUMN IF NOT EXISTS
  state text DEFAULT 'Telangana';

ALTER TABLE wards ADD COLUMN IF NOT EXISTS
  coverage_status text DEFAULT 'live'
  CHECK (coverage_status IN ('live','coming_soon','requested'));

ALTER TABLE wards ADD COLUMN IF NOT EXISTS
  ward_councillor text;

ALTER TABLE wards ADD COLUMN IF NOT EXISTS
  councillor_party text;

ALTER TABLE wards ADD COLUMN IF NOT EXISTS
  councillor_phone text;

ALTER TABLE wards ADD COLUMN IF NOT EXISTS
  mla_id uuid REFERENCES mla(id);

ALTER TABLE wards ADD COLUMN IF NOT EXISTS
  mp_id uuid REFERENCES mp(id);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE mp ENABLE ROW LEVEL SECURITY;
ALTER TABLE mla ENABLE ROW LEVEL SECURITY;
ALTER TABLE ward_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mp_public_read" ON mp
  FOR SELECT USING (true);

CREATE POLICY "mla_public_read" ON mla
  FOR SELECT USING (true);

CREATE POLICY "ward_contributions_public_insert" ON ward_contributions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "ward_contributions_public_read" ON ward_contributions
  FOR SELECT USING (true);
