-- Migration 002: Admin dashboard improvements
-- Run once in Supabase SQL Editor

-- New columns on reports
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS is_test      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_duplicate boolean NOT NULL DEFAULT false;

-- Unique constraint on ward_number (required for CSV upsert)
ALTER TABLE public.wards
  DROP CONSTRAINT IF EXISTS wards_ward_number_unique;
ALTER TABLE public.wards
  ADD CONSTRAINT wards_ward_number_unique UNIQUE (ward_number);

-- Reports: update + delete (admin operations via anon key)
DROP POLICY IF EXISTS "Admin can update reports" ON public.reports;
DROP POLICY IF EXISTS "Admin can delete reports" ON public.reports;
CREATE POLICY "Admin can update reports" ON public.reports FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admin can delete reports" ON public.reports FOR DELETE USING (true);

-- Wards: insert + update + delete
DROP POLICY IF EXISTS "Admin can insert wards" ON public.wards;
DROP POLICY IF EXISTS "Admin can update wards" ON public.wards;
DROP POLICY IF EXISTS "Admin can delete wards" ON public.wards;
CREATE POLICY "Admin can insert wards" ON public.wards FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update wards" ON public.wards FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admin can delete wards" ON public.wards FOR DELETE USING (true);

-- Issue types: insert + update
DROP POLICY IF EXISTS "Admin can insert issue_types" ON public.issue_types;
DROP POLICY IF EXISTS "Admin can update issue_types" ON public.issue_types;
CREATE POLICY "Admin can insert issue_types" ON public.issue_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update issue_types" ON public.issue_types FOR UPDATE USING (true) WITH CHECK (true);
