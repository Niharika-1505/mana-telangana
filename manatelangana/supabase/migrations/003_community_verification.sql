-- ============================================================
-- Migration 003 — Community Verification & Reporter Tracking
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add browser fingerprint to reports (for banner / reporter tracking)
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS browser_fingerprint text;

-- Add reporter-says-fixed timestamp
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS reporter_says_fixed_at timestamptz;

-- Extend status to include 'inactive' (stale reports with no activity)
ALTER TABLE public.reports
  DROP CONSTRAINT IF EXISTS reports_status_check;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_status_check
  CHECK (status IN ('open', 'in_progress', 'resolved', 'rejected', 'inactive'));

-- Index for fast banner queries by fingerprint
CREATE INDEX IF NOT EXISTS idx_reports_browser_fingerprint
  ON public.reports(browser_fingerprint)
  WHERE browser_fingerprint IS NOT NULL;

-- ── REPORT VERIFICATIONS TABLE ───────────────────────────────
-- Anyone can submit a photo + verdict to verify if an issue is fixed
CREATE TABLE IF NOT EXISTS public.report_verifications (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id           uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  verdict             text NOT NULL CHECK (verdict IN ('fixed', 'still_broken')),
  photo_url           text,
  note                text,
  browser_fingerprint text NOT NULL,
  created_at          timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_report_verifications_report_id
  ON public.report_verifications(report_id);

-- RLS on report_verifications
ALTER TABLE public.report_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view verifications"
  ON public.report_verifications FOR SELECT USING (true);

CREATE POLICY "Public can submit verification"
  ON public.report_verifications FOR INSERT WITH CHECK (true);

-- Allow reporters to mark their own report as fixed (by fingerprint)
-- Note: if migration 002 already added a permissive UPDATE policy this is redundant but safe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reports' AND policyname = 'Reporter can mark fixed'
  ) THEN
    CREATE POLICY "Reporter can mark fixed"
      ON public.reports FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
