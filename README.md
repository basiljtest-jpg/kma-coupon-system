# KMA Coupon System

A Next.js web app for the Kamloops Malayali Association's member coupon redemption system.
Connected to Google Sheets as the database and Resend for emails.

---

## Deploy to Vercel (10 minutes)

### 1. Upload to GitHub

1. Go to github.com → New repository → name it `kma-coupon-system` → Create
2. Upload all files in this folder to the repository

### 2. Deploy on Vercel

1. Go to vercel.com → Sign up with your GitHub account
2. Click "Add New Project" → Import your `kma-coupon-system` repo
3. Click Deploy (don't change any settings)

### 3. Add Environment Variables in Vercel

After deploying, go to:
Project → Settings → Environment Variables

Add each of these one by one:

| Name | Value |
|------|-------|
| GOOGLE_SHEET_ID | 1_ZJmisy1x3uHdZ7FVviQciuAnlH4FJaDJU8vwOy1giw |
| GOOGLE_CLIENT_EMAIL | kma-sheets-bot@kma-coupon-system.iam.gserviceaccount.com |
| GOOGLE_PRIVATE_KEY | (paste the full private key from the JSON file, including BEGIN and END lines) |
| ADMIN_PIN | kma2026 |
| RESEND_API_KEY | (your Resend API key from resend.com) |
| KMA_EMAIL | (your KMA email address) |

### 4. Redeploy

After adding environment variables:
- Go to Deployments tab → click the 3 dots on latest deployment → Redeploy

Your app is now live at: https://kma-coupon-system.vercel.app

---

## How to use

### Restaurant staff
1. Open the website URL on any phone, tablet, or computer
2. Click "Restaurant" tab → enter your PIN
3. Ask member for their 5-digit code → type it in → click "Use 1 coupon"
4. Done — emails fire automatically to member, restaurant, and KMA

### KMA Admin
1. Click "Admin" tab → enter admin PIN (kma2026)
2. Add members → system auto-generates their 5-digit code and emails them
3. Add restaurants → set their unique PIN
4. View full redemption log

---

## Membership Types (matching Zeffy exactly)

| Type | Coupons |
|------|---------|
| Individual Membership | 1 |
| Student Membership | 1 |
| Family Membership (2 adults) | 2 |
| Family Membership (3 adults) | 3 |
| Family Membership (4 adults) | 4 |

---

## Google Sheet structure

Sheet ID: 1_ZJmisy1x3uHdZ7FVviQciuAnlH4FJaDJU8vwOy1giw

Three tabs:
- **Members** — all member data, codes, coupon counts
- **Restaurants** — restaurant list with PINs
- **Redemptions** — full transaction log

The app reads and writes directly to these tabs.
