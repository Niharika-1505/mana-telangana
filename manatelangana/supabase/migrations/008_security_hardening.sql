-- ============================================================
-- Migration 008 — Security Hardening: RLS & Rate Limiting
-- Run this in Supabase SQL Editor after deploying this PR.
-- ============================================================

-- ── FIX 1: Reports — remove open UPDATE/DELETE, add restricted policies ──────

-- Drop the completely permissive update/delete policies added in migration 002
-- and the permissive reporter-update policy added in migration 003.
DROP POLICY IF EXISTS "Admin can update reports"  ON public.reports;
DROP POLICY IF EXISTS "Admin can delete reports"  ON public.reports;
DROP POLICY IF EXISTS "Reporter can mark fixed"   ON public.reports;

-- Allow UPDATE only on rows whose stored fingerprint matches the fingerprint
-- the client sends in the X-Fingerprint request header.
-- This means a reporter can only mark THEIR OWN report as fixed.
-- (USING = which rows can be targeted; WITH CHECK = what the row may look like after)
CREATE POLICY "reports_update_own_fixed" ON public.reports
  FOR UPDATE
  USING (
    browser_fingerprint = current_setting('request.headers', true)::json->>'x-fingerprint'
  )
  WITH CHECK (
    browser_fingerprint = current_setting('request.headers', true)::json->>'x-fingerprint'
  );

-- Block all DELETE from the anon key.
-- Admin hard-deletes require the service role key (future improvement).
CREATE POLICY "reports_no_delete_anon" ON public.reports
  FOR DELETE USING (false);


-- ── FIX 2: Wards — read-only for anon ───────────────────────────────────────

DROP POLICY IF EXISTS "Admin can insert wards" ON public.wards;
DROP POLICY IF EXISTS "Admin can update wards" ON public.wards;
DROP POLICY IF EXISTS "Admin can delete wards" ON public.wards;

CREATE POLICY "wards_no_insert_anon" ON public.wards FOR INSERT WITH CHECK (false);
CREATE POLICY "wards_no_update_anon" ON public.wards FOR UPDATE  USING (false);
CREATE POLICY "wards_no_delete_anon" ON public.wards FOR DELETE  USING (false);


-- ── FIX 3: issue_types — read-only for anon ─────────────────────────────────

DROP POLICY IF EXISTS "Admin can insert issue_types" ON public.issue_types;
DROP POLICY IF EXISTS "Admin can update issue_types" ON public.issue_types;

CREATE POLICY "issue_types_no_insert_anon" ON public.issue_types FOR INSERT WITH CHECK (false);
CREATE POLICY "issue_types_no_update_anon" ON public.issue_types FOR UPDATE  USING (false);
CREATE POLICY "issue_types_no_delete_anon" ON public.issue_types FOR DELETE  USING (false);


-- ── FIX 4: Submission rate limit (max 5 reports per fingerprint per hour) ────

CREATE OR REPLACE FUNCTION public.check_submission_rate(fp text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Reject null / empty fingerprints outright — a bot skipping the JS
  -- cannot accumulate a history, so we must block them explicitly.
  IF fp IS NULL OR fp = '' THEN
    RETURN false;
  END IF;

  SELECT COUNT(*) INTO recent_count
  FROM public.reports
  WHERE browser_fingerprint = fp
    AND created_at > NOW() - INTERVAL '1 hour';

  RETURN recent_count < 5;
END;
$$;

-- RESTRICTIVE policy: combined with permissive policies using AND (not OR).
-- Even though "Public can insert reports" allows all inserts, this additional
-- gate must also pass — so the effective rule is: INSERT is allowed AND
-- the fingerprint has fewer than 5 reports in the last hour.
CREATE POLICY "reports_rate_limit" ON public.reports
  AS RESTRICTIVE
  FOR INSERT
  WITH CHECK (public.check_submission_rate(browser_fingerprint));
