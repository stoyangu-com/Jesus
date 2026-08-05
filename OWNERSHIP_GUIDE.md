# Make StoYangu 100% yours — full non-technical guide

Follow this **in order**. Tick each box as you finish it.  
You already own **stoyangu.com**. Good.

This app needs three online accounts working together:

| Piece | Job | Website |
|--------|-----|---------|
| **GitHub** | Holds your code safely | https://github.com |
| **Supabase** | Database, logins, image storage | https://supabase.com |
| **Vercel** | Hosts the live website | https://vercel.com |

---

# PART 1 — Get the code onto your computer / GitHub

## 1.1 Download this project
1. Download / copy the full project folder (all files).
2. On your computer, put it somewhere easy, e.g. `Desktop/stoyangu-hub`.

### Files you must keep (do not delete)
- `src/` (the website screens)
- `api/` (server functions)
- `public/` (logo, images, robots.txt)
- `package.json`
- `vite.config.ts`
- `vercel.json`
- `index.html`
- `supabase-setup.sql` ← you will paste this into Supabase
- `OWNERSHIP_GUIDE.md` (this file)

### Files you should NOT put secrets into
- Do **not** commit real secret keys into a public GitHub repo.
- `.env` should stay private (this project already ignores it).

## 1.2 Create a GitHub account + repo
1. Go to https://github.com → Sign up.
2. Click **+ → New repository**.
3. Name: `stoyangu-hub`
4. Set to **Private** (recommended).
5. Create repository (**empty** — no README needed).

## 1.3 Upload the code to GitHub

### Easiest for non-technical people: GitHub website
1. Open your empty repo on GitHub.
2. Click **uploading an existing file**.
3. Drag **all project files and folders** in.
4. Scroll down → **Commit changes**.

### Or use GitHub Desktop (also easy)
1. Install https://desktop.github.com
2. File → Add Local Repository → choose your folder  
   (or create repo from folder)
3. Publish repository to GitHub (private).

When finished, your GitHub repo should show folders like `src`, `api`, `public`.

---

# PART 2 — Create YOUR Supabase project (database + logins)

Right now the demo uses a temporary database. For your company you need **your own**.

## 2.1 Create project
1. Go to https://supabase.com → Start your project.
2. Sign in (GitHub login is fine).
3. **New project**
   - Name: `stoyangu`
   - Database password: invent a strong one → **save it**
   - Region: pick closest available (EU is fine if Africa isn’t listed)
4. Wait until status is healthy / ready.

## 2.2 Copy your API keys
Go to: **Project Settings (gear) → API**

Copy and save these 3 things in a notes app / password manager:

1. **Project URL**  
   looks like: `https://xxxxxxxx.supabase.co`
2. **anon public** key  
   long key starting with `eyJ...` or `sb_publishable_...`
3. **service_role** key  
   long secret key — **never share publicly**, never put in frontend code chat

## 2.3 Create all tables + storage (one paste)
1. In Supabase left menu → **SQL Editor**
2. Click **New query**
3. Open the file `supabase-setup.sql` from your project
4. Copy **everything**
5. Paste into SQL Editor
6. Click **Run**
7. You should see success (no red errors)

This creates:
- `profiles`
- `stores`
- `products`
- `daily_stats`
- `product_daily_stats`
- `report_logs`
- `applications`
- storage bucket `stoyangu-assets` (public images)

### Check it worked
- **Table Editor** should list those tables
- **Storage** should show bucket `stoyangu-assets` (public)

## 2.4 Create your founder login user
1. Supabase → **Authentication → Users**
2. **Add user** → **Create new user**
3. Email: use one you control  
   examples: `founder@stoyangu.com` or your Gmail
4. Password: strong password → save it
5. Turn **Auto Confirm User** ON if you see it
6. Create user
7. Click the user → copy the **User UID** (long id like `dd46f9b3-...`)

## 2.5 Link founder profile in the database
1. Supabase → **Table Editor → profiles → Insert row**
2. Fill:
   - `id` = the User UID you copied
   - `email` = same email
   - `full_name` = your name
   - `role` = `founder`   ← must be exactly founder
   - `store_id` = leave empty
3. Save

## 2.6 Auth URL settings (so login works on your domain)
Supabase → **Authentication → URL Configuration**

Set:
- **Site URL:** `https://stoyangu.com`
- **Redirect URLs** (add all of these):
  - `https://stoyangu.com/**`
  - `https://www.stoyangu.com/**`
  - `http://localhost:5173/**` (optional, for later local testing)
  - your temporary Vercel URL once you have it, e.g. `https://stoyangu-hub.vercel.app/**`

Save.

## 2.7 (Optional but recommended) Email templates
Authentication → Email templates  
You can leave defaults for now.

---

# PART 3 — Host on Vercel (make the website live)

## 3.1 Create Vercel account
1. https://vercel.com
2. Continue with **GitHub**
3. Allow access to your `stoyangu-hub` repo

## 3.2 Import project
1. Vercel dashboard → **Add New… → Project**
2. Import `stoyangu-hub`
3. Framework Preset should detect **Vite**
4. Root directory: `./` (default)
5. Build command: `npm run build` (default)
6. Output directory: `dist` (default)
7. **Do not deploy yet** — first add Environment Variables

## 3.3 Add Environment Variables (critical)
In the import screen (or Project → Settings → Environment Variables), add these for **Production** (and Preview if you want):

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase **anon** key |
| `NEXT_PUBLIC_SUPABASE_URL` | same Project URL again |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same anon key again |
| `SUPABASE_SERVICE_ROLE_KEY` | your Supabase **service_role** key |
| `PUBLIC_SITE_URL` | `https://stoyangu.com` |
| `CRON_SECRET` | invent a long random password (e.g. 24+ characters) |

### Optional later (WhatsApp daily reports via Telnyx)
| Name | Value |
|------|--------|
| `TELNYX_API_KEY` | from Telnyx |
| `TELNYX_WHATSAPP_FROM` | your WhatsApp-enabled number like `+2547...` |
| `TELNYX_MESSAGING_PROFILE_ID` | from Telnyx |

### Optional Google login
Only if you set up your own Google OAuth later:
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_GOOGLE_AUTH_PROXY`

Email/password login works without Google.

## 3.4 Deploy
Click **Deploy**. Wait until it says **Ready**.

Open the `*.vercel.app` URL and test:
1. Homepage loads
2. `/login` works with your founder email/password
3. You land on **Management**
4. Try **New Client** (creates a store + owner login)
5. Open a public store page `/s/some-slug`
6. Submit a test application from homepage

If login fails: re-check Supabase redirect URLs + env vars, then **Redeploy** after changing env vars.

> After changing environment variables in Vercel, always go to Deployments → … → **Redeploy**.

## 3.5 Confirm Vercel serverless APIs
These should open without crashing:
- `https://YOUR-vercel-app.vercel.app/api/sitemap`
- `https://YOUR-vercel-app.vercel.app/robots.txt`
- `https://YOUR-vercel-app.vercel.app/llms.txt`

---

# PART 4 — Attach stoyangu.com

## 4.1 Add domain in Vercel
1. Vercel project → **Settings → Domains**
2. Add `stoyangu.com`
3. Add `www.stoyangu.com` (optional but good)
4. Vercel will show DNS instructions

## 4.2 Change DNS where you bought the domain
Log into your domain registrar (Namecheap / Cloudflare / GoDaddy / etc.).

Do **exactly** what Vercel shows. Common setup:

### Option A — Apex domain `stoyangu.com`
- Type: **A**
- Name/Host: `@`
- Value: the IP Vercel shows (often `76.76.21.21`)

### Option B — `www`
- Type: **CNAME**
- Name/Host: `www`
- Value: `cname.vercel-dns.com` (or what Vercel shows)

Save DNS. Wait 15 minutes to a few hours (sometimes up to 24–48h).

## 4.3 When Vercel says domain is Valid
Open:
- https://stoyangu.com
- https://stoyangu.com/login

## 4.4 Update Supabase Site URL again
Make sure Supabase Site URL is exactly:
`https://stoyangu.com`

---

# PART 5 — Store subdomains (pizzaro.stoyangu.com)

### Works immediately (use this first)
Every store already has a public page:
`https://stoyangu.com/s/storename`

Example: `https://stoyangu.com/s/pizzaro`

Share that while setting up true subdomains.

### Real `*.stoyangu.com` subdomains
1. Vercel → Domains → add `*.stoyangu.com` (wildcard) if available
2. DNS: CNAME host `*` → Vercel target (`cname.vercel-dns.com`)
3. Later, a small routing tweak can map `slug.stoyangu.com` → `/s/slug`

If this step confuses you, hire someone for 1 hour with this message:

> Connect wildcard `*.stoyangu.com` on my Vercel StoYangu project so each store slug serves the public storefront.

---

# PART 6 — Google Search Console

1. https://search.google.com/search-console
2. Add property → URL prefix → `https://stoyangu.com`
3. Verify (DNS TXT is usually easiest)
4. Sitemaps → submit:
   ```text
   https://stoyangu.com/api/sitemap
   ```
5. Confirm these open:
   - https://stoyangu.com/robots.txt
   - https://stoyangu.com/api/sitemap
   - https://stoyangu.com/llms.txt

Request indexing for:
- `/`
- `/about`
- `/stores`
- a few `/s/...` store pages

---

# PART 7 — What each env var does (so you don’t mix them up)

| Variable | Used by | Purpose |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Website (browser) | Talk to your Supabase project |
| `VITE_SUPABASE_ANON_KEY` | Website (browser) | Public key for auth session |
| `NEXT_PUBLIC_SUPABASE_URL` | API functions | Same URL for server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | API helpers | Public key server-side when needed |
| `SUPABASE_SERVICE_ROLE_KEY` | API only | Full admin access (create owners, upload, reports) |
| `PUBLIC_SITE_URL` | Sitemap | Canonical site for Google |
| `CRON_SECRET` | Daily report API | Stops strangers triggering WhatsApp blasts |
| Telnyx vars | Daily report API | Send WhatsApp reports |

**Important:**  
`SUPABASE_SERVICE_ROLE_KEY` must stay server-side only (Vercel env). Never post it publicly.

---

# PART 8 — Day-to-day use after go-live

## Founder
1. Login at `/login`
2. **Management** → see stats + applications
3. **New Client** → creates:
   - store row
   - slug / subdomain name
   - owner login email/password
   - design JSON link
4. Share with owner:
   - login details
   - public link `stoyangu.com/s/their-slug`

## Store owner
1. Login
2. **My Store** → add/edit/hide/delete products

## Public customer
1. Open store page
2. Click **Order on WhatsApp**
3. Seller gets chat

## Website applications (Video Yangu, Store Yangu)
- People apply on homepage
- You see them under **Management → Store applications**
- You approve offline / on WhatsApp, then create them via **New Client**

---

# PART 9 — Checklist: “It all works perfectly”

- [ ] Code is on my GitHub
- [ ] My own Supabase project exists
- [ ] `supabase-setup.sql` ran with no errors
- [ ] Storage bucket `stoyangu-assets` exists and is public
- [ ] Founder user exists in Auth
- [ ] Founder row exists in `profiles` with `role = founder`
- [ ] All Vercel env vars set
- [ ] Vercel deploy is Ready
- [ ] I can login as founder
- [ ] I can create a client
- [ ] Public store page loads products
- [ ] WhatsApp order button opens correct chat
- [ ] Homepage apply form saves to `applications`
- [ ] `stoyangu.com` points to Vercel and shows HTTPS
- [ ] Sitemap submitted in Search Console
- [ ] Social profiles ready: Instagram / TikTok / Facebook / X `@stoyangu`
- [ ] Email `info@stoyangu.com` works

---

# PART 10 — Common problems + fixes

| Problem | Fix |
|---------|-----|
| Blank page after deploy | Check Vercel build logs; ensure `npm run build` succeeded |
| Login says invalid credentials | User not created / wrong password / not confirmed |
| Login works on vercel.app but not domain | Supabase redirect URLs missing `https://stoyangu.com/**` |
| Create client fails | Missing `SUPABASE_SERVICE_ROLE_KEY` or not redeployed |
| Image upload fails | Bucket `stoyangu-assets` missing or not public |
| Stores page empty | No rows in `stores` with `is_active = true` |
| Apply form errors | `applications` table missing — re-run SQL |
| Domain not connecting | DNS wrong/not propagated; wait and recheck Vercel Domains |
| Env changed but site old | Redeploy on Vercel |
| Google shows nothing yet | Normal for new sites; submit sitemap and wait |

---

# PART 11 — Security basics (please do these)

1. Keep GitHub repo **private** until you’re confident.
2. Never send `service_role` key in WhatsApp groups.
3. Use a password manager.
4. Only you (or trusted admin) get founder login.
5. Rotate keys if they ever leak (Supabase → recreate API keys, update Vercel, redeploy).

---

# PART 12 — WhatsApp daily reports (optional later)

See `TELNYX_SETUP_GUIDE.md`.

After Telnyx secrets are in Vercel:
- Founder Management can preview/send reports
- Cron hits `/api/daily-report` each day (schedule already in `vercel.json`)

---

# You’re live when…

1. https://stoyangu.com opens your StoYangu site  
2. Founder login works  
3. You can onboard a client end-to-end  
4. Customers can order on WhatsApp from `/s/...`  
5. Applications land in Management  
6. Search Console is verified  

That’s full ownership: **code (GitHub) + database (Supabase) + hosting (Vercel) + domain (stoyangu.com).**

If one step fails, note **exactly which Part number** and the error text — that makes it easy to fix fast.
