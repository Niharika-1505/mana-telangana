# Mana Telangana — Complete Deployment Guide
# మన తెలంగాణ · Step-by-Step Launch Instructions

---

## WHAT YOU HAVE BUILT

A full civic accountability platform with:
- Live map of Nalgonda district with issue pins
- Anonymous photo reporting (no login needed)
- 12 civic issue types in English + Telugu
- MLA / MP accountability leaderboard
- Admin dashboard with status management
- Transparency footer (live costs + citizen fund)
- PWA (works like a mobile app)

---

## STEP 1 — Set Up GitHub Repository (10 mins)

1. Go to github.com and log in as Niharika-1505
2. Click the "+" button (top right) → "New repository"
3. Repository name: `mana-telangana`
4. Set to **Public** (important — Vercel free tier needs public repos)
5. Click "Create repository"
6. GitHub will show you a page with instructions — keep it open

Now upload the code:
- Click "uploading an existing file" link on that page
- Drag and drop ALL the project files Claude gave you
- Click "Commit changes"

---

## STEP 2 — Run Database Schema (5 mins)

1. Go to supabase.com → your mana-telangana project
2. Click "SQL Editor" in the left sidebar (looks like a terminal icon)
3. Click "New query"
4. Open the file: `supabase/migrations/001_initial_schema.sql`
5. Copy ALL the contents and paste into the SQL editor
6. Click "Run" (green button)
7. You should see "Success. No rows returned" — that means it worked!

This creates all your tables, security rules, and seed data.

---

## STEP 3 — Deploy to Vercel (10 mins)

1. Go to vercel.com → Sign up free with your GitHub account (Niharika-1505)
2. Click "Add New Project"
3. Find and select your `mana-telangana` repository
4. Vercel will detect it's a Next.js project automatically

**Add Environment Variables** (click "Environment Variables" section):

Add each of these:

| Variable Name | Value |
|--------------|-------|
| NEXT_PUBLIC_SUPABASE_URL | https://vkrlzxemdloojmltupei.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrcmx6eGVtZGxvb2ptbHR1cGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODQ3NTIsImV4cCI6MjA5MzY2MDc1Mn0.yp8uSRIrFC_01tDauWW5DrxnbTqJ1hNKGy-prCp6GGM |
| NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME | ds0tvr3ib |
| NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET | mana-telangana-uploads |
| NEXT_PUBLIC_ADMIN_PASSWORD | ManaTelangana@2026 |

5. Click "Deploy"
6. Wait 2-3 minutes — Vercel builds and deploys automatically
7. You'll get a URL like: `mana-telangana.vercel.app` — your site is LIVE!

---

## STEP 4 — Connect Your Domain (10 mins)

1. In Vercel, go to your project → Settings → Domains
2. Add domain: `manatelangana.org.in`
3. Vercel will show you DNS records to add — something like:
   - Type: `A`, Name: `@`, Value: `76.76.21.21`
   - Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`

4. Go to GoDaddy → My Products → DNS → Manage (for manatelangana.org.in)
5. Add those two records
6. Wait 10-30 minutes for DNS to propagate
7. Visit manatelangana.org.in — it should load your site!

SSL certificate is added automatically by Vercel. Free.

---

## STEP 5 — Test Everything (30 mins)

Test these on your phone:

[ ] Homepage loads with map
[ ] Map shows Nalgonda district area
[ ] Click "+ Report Issue" — form opens
[ ] Select an issue type
[ ] Take a photo with your phone camera
[ ] Tap "Auto-detect location" — it finds your ward
[ ] Submit the report
[ ] Check the map — your pin should appear
[ ] Check /leaderboard — see the MLA table
[ ] Check /admin — log in with your admin password
[ ] In admin, change your test report status to "Resolved"

---

## STEP 6 — Change Admin Password (2 mins)

The default password is `ManaTelangana@2026`

To change it:
1. Go to Vercel → your project → Settings → Environment Variables
2. Find `NEXT_PUBLIC_ADMIN_PASSWORD`
3. Change to your own secure password
4. Click Save → Redeploy

---

## FUTURE UPDATES — How to Change the Code

Whenever you want to change anything (add a ward, fix a bug, update text):
1. Tell Claude what to change
2. Claude gives you updated code
3. Go to GitHub → find the file → click pencil icon → paste new code → Commit
4. Vercel automatically redeploys in 2 minutes

No developer needed for most changes!

---

## ADDING MORE WARDS

When you fill in the ward spreadsheet:
1. Go to Supabase → SQL Editor
2. Run INSERT statements like:
```sql
INSERT INTO public.wards (ward_number, ward_name_en, ward_name_te, mandal_en, mandal_te, constituency_en, mla_name, mla_party, mp_name, mp_constituency, lat, lng)
VALUES (21, 'Your Ward', 'మీ వార్డు', 'Mandal', 'మండల్', 'Constituency', 'MLA Name', 'INC', 'MP Name', 'Nalgonda', 17.0575, 79.2667);
```
Tell Claude the ward details and I'll generate the SQL for you.

---

## PLATFORM COSTS SUMMARY

| Item | Cost |
|------|------|
| Domain (2 years) | £37.92 paid |
| Hosting (Vercel) | FREE |
| Database (Supabase) | FREE |
| Photos (Cloudinary) | FREE |
| Maps (Leaflet/OSM) | FREE |
| **Total monthly** | **~Rs. 125/month** (domain amortised) |

---

## WHAT TO DO NEXT (after launch)

1. Share in Nalgonda WhatsApp groups
2. Contact local colleges — students love civic tech
3. Reach out to local journalists
4. Fill in all ward data in the spreadsheet
5. When fund reaches Rs. 500+ → create first community proposal

---

## GETTING HELP

For any bugs, new features, or changes — come back to Claude and describe what you need.
Bring: a screenshot of the error OR a description of what's not working.

मन तेलंगाना · మన తెలంగాణ · Our Telangana, Our Voice 🌿
