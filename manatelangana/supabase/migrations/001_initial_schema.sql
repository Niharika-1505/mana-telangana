-- ============================================================
-- Mana Telangana (మన తెలంగాణ) — Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── WARDS TABLE ──────────────────────────────────────────────
create table public.wards (
  id              uuid primary key default uuid_generate_v4(),
  ward_number     integer not null,
  ward_name_en    text not null,
  ward_name_te    text not null,
  mandal_en       text not null,
  mandal_te       text not null,
  constituency_en text not null,
  mla_name        text not null,
  mla_party       text not null,
  mp_name         text not null,
  mp_constituency text not null,
  district        text not null default 'Nalgonda',
  lat             decimal(10, 8),
  lng             decimal(11, 8),
  created_at      timestamptz default now()
);

-- ── ISSUE TYPES TABLE ────────────────────────────────────────
create table public.issue_types (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name_en     text not null,
  name_te     text not null,
  emoji       text not null,
  description text,
  sort_order  integer default 0,
  is_active   boolean default true
);

-- ── REPORTS TABLE ────────────────────────────────────────────
create table public.reports (
  id              uuid primary key default uuid_generate_v4(),
  ward_id         uuid references public.wards(id),
  issue_type_id   uuid references public.issue_types(id),
  severity        text check (severity in ('low', 'medium', 'high')) default 'medium',
  status          text check (status in ('open', 'in_progress', 'resolved', 'rejected')) default 'open',
  photo_url       text,
  description     text,
  lat             decimal(10, 8),
  lng             decimal(11, 8),
  landmark        text,
  upvotes         integer default 1,
  resolved_at     timestamptz,
  resolution_note text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── REPORT CONFIRMATIONS (upvotes by other citizens) ─────────
create table public.report_confirmations (
  id          uuid primary key default uuid_generate_v4(),
  report_id   uuid references public.reports(id) on delete cascade,
  fingerprint text not null, -- anonymous browser fingerprint
  created_at  timestamptz default now(),
  unique(report_id, fingerprint)
);

-- ── CITIZEN FUND CONTRIBUTIONS ───────────────────────────────
create table public.contributions (
  id              uuid primary key default uuid_generate_v4(),
  amount_paise    integer not null, -- store in paise (1 rupee = 100 paise)
  razorpay_id     text unique,
  status          text check (status in ('pending', 'captured', 'failed')) default 'pending',
  message         text,
  created_at      timestamptz default now()
);

-- ── FUND PROPOSALS (citizen ideas for spending) ───────────────
create table public.fund_proposals (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text not null,
  amount_paise integer not null,
  status       text check (status in ('voting', 'approved', 'completed', 'rejected')) default 'voting',
  votes        integer default 0,
  created_at   timestamptz default now()
);

-- ── PROPOSAL VOTES ───────────────────────────────────────────
create table public.proposal_votes (
  id          uuid primary key default uuid_generate_v4(),
  proposal_id uuid references public.fund_proposals(id) on delete cascade,
  fingerprint text not null,
  created_at  timestamptz default now(),
  unique(proposal_id, fingerprint)
);

-- ── PLATFORM COSTS (for transparency footer) ─────────────────
create table public.platform_costs (
  id             uuid primary key default uuid_generate_v4(),
  item           text not null,
  provider       text not null,
  monthly_paise  integer not null default 0,
  annual_paise   integer not null default 0,
  notes          text,
  is_active      boolean default true
);

-- ── ADMIN USERS ──────────────────────────────────────────────
create table public.admin_users (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.wards                enable row level security;
alter table public.issue_types          enable row level security;
alter table public.reports              enable row level security;
alter table public.report_confirmations enable row level security;
alter table public.contributions        enable row level security;
alter table public.fund_proposals       enable row level security;
alter table public.proposal_votes       enable row level security;
alter table public.platform_costs       enable row level security;
alter table public.admin_users          enable row level security;

-- Public read access
create policy "Public can read wards"         on public.wards         for select using (true);
create policy "Public can read issue_types"   on public.issue_types   for select using (true);
create policy "Public can read reports"       on public.reports       for select using (true);
create policy "Public can read proposals"     on public.fund_proposals for select using (true);
create policy "Public can read costs"         on public.platform_costs for select using (true);

-- Public write access (anonymous reporting)
create policy "Public can insert reports"     on public.reports       for insert with check (true);
create policy "Public can insert confirmations" on public.report_confirmations for insert with check (true);
create policy "Public can insert contributions" on public.contributions for insert with check (true);
create policy "Public can insert votes"       on public.proposal_votes for insert with check (true);

-- ============================================================
-- SEED DATA — Issue Types
-- ============================================================

insert into public.issue_types (slug, name_en, name_te, emoji, description, sort_order) values
  ('garbage',      'Garbage Dump',       'చెత్త కుప్ప',          '🗑',  'Uncleared garbage or waste pile', 1),
  ('pothole',      'Pothole',            'గుంత',                  '🕳',  'Road pothole or damaged surface', 2),
  ('drainage',     'Drainage Issue',     'డ్రైనేజ్ సమస్య',        '💧',  'Blocked or overflowing drain', 3),
  ('streetlight',  'Street Light Out',   'వీధి దీపం పాడైంది',    '💡',  'Non-functioning street light', 4),
  ('open-drain',   'Open Drain / Nala',  'తెరిచిన నాలా',          '🌊',  'Uncovered open drain hazard', 5),
  ('waterlogging', 'Waterlogging',       'నీటి నిల్వ',            '🌧',  'Stagnant water after rain', 6),
  ('dumping',      'Illegal Dumping',    'అక్రమ చెత్త',           '🚯',  'Illegally dumped waste', 7),
  ('stray',        'Stray Animals',      'వీధి జంతువులు',         '🐕',  'Stray dog or cattle menace', 8),
  ('tree',         'Tree / Branch Fall', 'చెట్టు పడటం',           '🌳',  'Fallen tree or dangerous branch', 9),
  ('encroachment', 'Encroachment',       'అక్రమ నిర్మాణం',        '🏗',  'Illegal encroachment on public land', 10),
  ('water',        'Water Supply Issue', 'నీటి సరఫరా సమస్య',     '🚰',  'No water / contamination / pipe burst', 11),
  ('toilet',       'Public Toilet',      'పబ్లిక్ టాయిలెట్',     '🚻',  'Unclean or broken public toilet', 12);

-- ============================================================
-- SEED DATA — Platform Costs
-- ============================================================

insert into public.platform_costs (item, provider, monthly_paise, annual_paise, notes) values
  ('Domain (manatelangana.org.in)', 'GoDaddy',        25000, 300000, '2 year registration — Rs. 3000 total'),
  ('Frontend Hosting',              'Vercel',          0,     0,      'Free forever for civic projects'),
  ('Database',                      'Supabase',        0,     0,      'Free tier: 500MB, 2GB bandwidth/month'),
  ('Photo Storage',                 'Cloudinary',      0,     0,      'Free tier: 25GB storage + bandwidth'),
  ('Maps',                          'Leaflet + OSM',   0,     0,      '100% free open source maps'),
  ('Email',                         'Resend.com',      0,     0,      'Free: 3000 emails/month'),
  ('Analytics',                     'Umami',           0,     0,      'Free, privacy-friendly'),
  ('SSL Certificate',               'Vercel',          0,     0,      'Free, auto-renewed');

-- ============================================================
-- SEED DATA — Sample Wards (Nalgonda)
-- ============================================================

insert into public.wards (ward_number, ward_name_en, ward_name_te, mandal_en, mandal_te, constituency_en, mla_name, mla_party, mp_name, mp_constituency, lat, lng) values
  (1,  'Nalgonda Ward 1',    'నల్గొండ వార్డు 1',    'Nalgonda',      'నల్గొండ',      'Nalgonda',      'T. Jayaprakash Reddy',    'INC', 'N. Uttam Kumar Reddy',        'Nalgonda', 17.0575, 79.2667),
  (2,  'Nalgonda Ward 2',    'నల్గొండ వార్డు 2',    'Nalgonda',      'నల్గొండ',      'Nalgonda',      'T. Jayaprakash Reddy',    'INC', 'N. Uttam Kumar Reddy',        'Nalgonda', 17.0600, 79.2700),
  (3,  'Nalgonda Ward 3',    'నల్గొండ వార్డు 3',    'Nalgonda',      'నల్గొండ',      'Nalgonda',      'T. Jayaprakash Reddy',    'INC', 'N. Uttam Kumar Reddy',        'Nalgonda', 17.0550, 79.2650),
  (4,  'Nalgonda Ward 4',    'నల్గొండ వార్డు 4',    'Nalgonda',      'నల్గొండ',      'Nalgonda',      'T. Jayaprakash Reddy',    'INC', 'N. Uttam Kumar Reddy',        'Nalgonda', 17.0525, 79.2625),
  (5,  'Bhongir Town',       'భువనగిరి',             'Bhongir',       'భువనగిరి',     'Bhongir',       'V. Sunitha Lakshma Reddy','INC', 'Chamala Kiran Kumar Reddy',   'Bhongir',  17.5106, 78.8836),
  (6,  'Yadagirigutta',      'యాదాద్రి',            'Yadagirigutta', 'యాదాద్రి',     'Bhongir',       'V. Sunitha Lakshma Reddy','INC', 'Chamala Kiran Kumar Reddy',   'Bhongir',  17.5774, 79.0278),
  (7,  'Miryalaguda Ward 1', 'మిర్యాలగూడ వార్డు 1', 'Miryalaguda',   'మిర్యాలగూడ',  'Miryalaguda',   'G. Lasya Nanditha',       'INC', 'N. Uttam Kumar Reddy',        'Nalgonda', 16.8726, 79.5650),
  (8,  'Huzurnagar',         'హుజూర్నగర్',          'Huzurnagar',    'హుజూర్నగర్',  'Huzurnagar',    'S. Rajender Reddy',       'INC', 'N. Uttam Kumar Reddy',        'Nalgonda', 16.8969, 79.8848),
  (9,  'Kodad',              'కోడాడ',               'Kodad',         'కోడాడ',        'Kodad',         'Beeram Harshavardhan R.', 'INC', 'N. Uttam Kumar Reddy',        'Nalgonda', 16.9986, 79.9714),
  (10, 'Suryapet',           'సూర్యాపేట',           'Suryapet',      'సూర్యాపేట',   'Suryapet',      'Jagadish Reddy',          'BRS', 'N. Uttam Kumar Reddy',        'Nalgonda', 17.1392, 79.6210),
  (11, 'Devarakonda',        'దేవరకొండ',            'Devarakonda',   'దేవరకొండ',    'Devarakonda',   'P. Sudarshan Reddy',      'BRS', 'N. Uttam Kumar Reddy',        'Nalgonda', 16.6897, 79.5547),
  (12, 'Nagarjunasagar',     'నాగార్జున సాగర్',     'Nagarjunasagar','నాగార్జున సాగర్','Nagarjunasagar','B. Mahesh Kumar Goud',  'INC', 'N. Uttam Kumar Reddy',        'Nalgonda', 16.5746, 79.3190);

-- ============================================================
-- HELPFUL VIEWS
-- ============================================================

-- MLA leaderboard view
create view public.mla_leaderboard as
select
  w.mla_name,
  w.mla_party,
  w.constituency_en,
  count(r.id)                                           as total_reports,
  count(r.id) filter (where r.status = 'resolved')     as resolved,
  count(r.id) filter (where r.status = 'open')         as open_issues,
  count(r.id) filter (where r.status = 'in_progress')  as in_progress,
  case
    when count(r.id) = 0 then 0
    else round(
      count(r.id) filter (where r.status = 'resolved')::numeric
      / count(r.id)::numeric * 100, 1
    )
  end as resolution_score
from public.wards w
left join public.reports r on r.ward_id = w.id
group by w.mla_name, w.mla_party, w.constituency_en
order by resolution_score desc;

-- Fund summary view
create view public.fund_summary as
select
  coalesce(sum(amount_paise) filter (where status = 'captured'), 0) as total_collected_paise,
  count(*) filter (where status = 'captured')                        as total_contributors,
  coalesce(sum(monthly_paise), 0)                                   as monthly_cost_paise,
  coalesce(sum(annual_paise), 0)                                    as annual_cost_paise
from public.contributions, public.platform_costs
where public.platform_costs.is_active = true;
