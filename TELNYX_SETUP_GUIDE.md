# StoYangu — Telnyx WhatsApp Setup Guide (Non-Technical)

This guide walks you through connecting daily WhatsApp reports so every store owner gets an automatic message once a day.

---

## What you will end up with

Every day, StoYangu will send each active store owner a WhatsApp message with:

- That day's website visits
- That day's WhatsApp order clicks
- **Daily Winner** (best product)
- **Need a Look** (product that needs attention + a tip)
- A reminder to mention their `storename.stoyangu.com` link in videos

---

## Step 1 — Create a Telnyx account

1. Go to [https://telnyx.com](https://telnyx.com) and sign up.
2. Complete business verification if Telnyx asks for it (normal for WhatsApp).
3. Add a little credit/balance so messages can send.

---

## Step 2 — Get WhatsApp sending ready in Telnyx

1. In the Telnyx Mission Control portal, open **Messaging**.
2. Create a **Messaging Profile** (give it a clear name like `StoYangu Daily Reports`).
3. Set up **WhatsApp** on Telnyx:
   - Telnyx → WhatsApp / Messaging → connect a WhatsApp Business number.
   - Follow Telnyx’s prompts to link your Meta/WhatsApp Business account.
4. Note down:
   - Your **WhatsApp-enabled phone number** (example: `+2547XXXXXXXX`)
   - Your **Messaging Profile ID**

> Tip: Keep the same “from” number for all daily reports so owners recognize StoYangu.

---

## Step 3 — Create an API key

1. In Telnyx, go to **Account → API Keys** (or **Auth → API Keys**).
2. Create a new API key.
3. Copy it immediately and store it somewhere safe (password manager).
4. You will **not** put this key in your frontend code.

---

## Step 4 — Add secrets to your project

In this Design Arena project (or later in Vercel → Project → Settings → Environment Variables), add:

| Secret name | What to paste |
|---|---|
| `TELNYX_API_KEY` | Your Telnyx API key |
| `TELNYX_WHATSAPP_FROM` | Your WhatsApp-enabled number, with country code (e.g. `+2547…`) |
| `TELNYX_MESSAGING_PROFILE_ID` | Your Telnyx messaging profile ID |
| `CRON_SECRET` | Any long random password you invent (protects the report endpoint) |

After adding secrets, redeploy the app (or let the platform auto-redeploy).

---

## Step 5 — Make sure the daily job is scheduled

This project already includes a Vercel Cron entry for:

- **Path:** `/api/daily-report`
- **Schedule:** `0 6 * * *` (06:00 UTC daily ≈ morning in Kenya)

On Vercel:
1. Deploy the project.
2. Open **Project → Settings → Cron Jobs** and confirm the job appears.
3. Cron works on eligible Vercel plans. If cron is unavailable on your plan, use a free external scheduler (e.g. cron-job.org) to call:

```
GET https://YOUR-DOMAIN/api/daily-report?secret=YOUR_CRON_SECRET
```

once per day.

---

## Step 6 — Test safely before going live

### Option A — Preview only (recommended first)
1. Sign in as founder.
2. On **Management**, click **Preview WA report**.
3. This builds the messages but does **not** send WhatsApp texts.

### Option B — Real send
1. Make sure at least one store has a real WhatsApp number you control.
2. Click **Send daily WA** on Management.
3. Check that phone for the report message.

You can also call:

```
POST /api/daily-report?dry_run=1
Authorization: Bearer <your founder session token or CRON_SECRET>
```

---

## Step 7 — WhatsApp template notes (important)

Depending on your Telnyx/Meta setup:

- Free-form messages may only work inside an open customer-care window.
- For reliable **once-a-day proactive reports**, Meta often requires an approved **WhatsApp template**.

If Telnyx returns template errors:
1. Create a utility template in Meta/WhatsApp Manager, something like:

```
Habari {{1}}! Here's your StoYangu daily report for {{2}}:
Visits: {{3}}
WhatsApp order clicks: {{4}}
Daily Winner: {{5}}
Need a Look: {{6}}
Reminder: mention {{7}} in your videos.
— Team StoYangu
```

2. Get it approved.
3. Tell your developer (or ask in a follow-up) to switch the sender from plain text to that template ID.

The current app sends plain text via Telnyx Messages API, which is perfect for testing and many WhatsApp Business setups once the number is fully enabled.

---

## Step 8 — Kenya phone number format

When creating clients, enter WhatsApp numbers like:

- `0712 345 678` (local), or
- `+254712345678` (international)

The app automatically converts numbers starting with `0` to `+254…`.

---

## Troubleshooting

| Problem | What to check |
|---|---|
| “Telnyx is not configured” | Secrets missing / not redeployed |
| Message failed in report log | API key, from-number, or messaging profile wrong |
| No daily send | Cron not active on plan; use external cron + `CRON_SECRET` |
| Owner didn’t receive | Wrong WhatsApp on store record; number not on WhatsApp |
| Template error from Meta | Create & approve a WhatsApp template |

---

## How the report content is chosen

- **Visits / WA clicks:** from that day’s store stats
- **Daily Winner:** product with the most order clicks that day
- **Need a Look:** product with views but zero (or very low) order clicks, plus a short tip

---

## You’re done when…

1. Secrets are set
2. Preview report works
3. A real test message arrives on your phone
4. Cron (or external scheduler) is confirmed

After that, store owners receive their daily StoYangu coaching message automatically.
