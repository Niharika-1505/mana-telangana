-- ============================================================
-- Migration 004 — Volunteer / Contact Interest Table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.volunteers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text,
  roles      text[] NOT NULL DEFAULT '{}',
  area       text,           -- ward / locality they live in
  message    text,           -- optional "tell us more"
  status     text NOT NULL DEFAULT 'new'
               CHECK (status IN ('new', 'contacted', 'active', 'inactive')),
  notes      text,           -- internal admin notes
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_volunteers_status ON public.volunteers(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_created ON public.volunteers(created_at DESC);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Anyone can submit the form
CREATE POLICY "Public can submit volunteer interest"
  ON public.volunteers FOR INSERT WITH CHECK (true);

-- Admin reads via anon key (protected by app-level password gate)
CREATE POLICY "Public can view volunteers"
  ON public.volunteers FOR SELECT USING (true);

-- Status and notes updates from admin
CREATE POLICY "Public can update volunteer"
  ON public.volunteers FOR UPDATE USING (true);
