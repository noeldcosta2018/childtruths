# ChildTruths - Complete Setup Guide (Non-Technical)

This guide walks you through everything step by step. No coding knowledge needed.
Follow each section in order. Estimated total time: 2-3 hours.

---

## STEP 1: Get Your Claude API Key (5 minutes)

This is what powers the AI explanations in your app.

1. Go to https://console.anthropic.com
2. Click "Sign Up" (or "Sign In" if you already have an account)
3. Once logged in, click "API Keys" in the left sidebar
4. Click "Create Key"
5. Name it "ChildTruths Production"
6. Copy the key — it starts with `sk-ant-...`
7. Save it somewhere safe (you'll need it later)

**Cost:** You pay per explanation generated. Roughly $0.01-0.03 per explanation.
Add billing at https://console.anthropic.com/settings/billing

---

## STEP 2: Set Up Supabase (Database + Login) — 30 minutes

Supabase stores your users, their children, saved explanations, and handles Google login.

### 2A: Create Your Supabase Project

1. Go to https://supabase.com
2. Click "Start your project" → Sign up with GitHub
3. Click "New Project"
4. Fill in:
   - **Organization:** Create one (e.g., "ChildTruths")
   - **Project name:** `childtruths`
   - **Database password:** Create a strong password and SAVE IT
   - **Region:** Choose closest to your users (e.g., "Middle East" for UAE users)
5. Click "Create new project"
6. Wait 2 minutes for it to set up

### 2B: Create Your Database Tables

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Open the file `supabase/migrations/001_initial_schema.sql` from your project
   - You can find it at: C:\Users\noel_\OneDrive\Desktop\childtruths-app\supabase\migrations\001_initial_schema.sql
   - Open it with Notepad, select ALL text (Ctrl+A), copy it (Ctrl+C)
4. Paste the entire SQL into the Supabase SQL Editor
5. Click "Run" (the green play button)
6. You should see "Success. No rows returned" — that means it worked!

### 2C: Get Your Supabase Keys

1. In Supabase dashboard, click "Settings" (gear icon) in the left sidebar
2. Click "API" under "Configuration"
3. You'll see:
   - **Project URL:** Copy this (looks like `https://abcdef.supabase.co`)
   - **anon public key:** Copy this (long string starting with `eyJ...`)
   - **service_role secret key:** Click "Reveal" and copy this (also starts with `eyJ...`)
4. Save all three somewhere safe

### 2D: Enable Google Login

1. In Supabase dashboard, click "Authentication" in the left sidebar
2. Click "Providers"
3. Find "Google" and click to expand it
4. Toggle it ON
5. You need a Google Client ID and Secret. Here's how to get them:

#### Getting Google OAuth Credentials:
1. Go to https://console.cloud.google.com
2. Sign in with your Google account
3. Click "Select a project" at the top → "New Project"
4. Name it "ChildTruths" → Click "Create"
5. Make sure "ChildTruths" is selected as current project
6. In the search bar at the top, type "OAuth consent screen" and click it
7. Select "External" → Click "Create"
8. Fill in:
   - **App name:** ChildTruths
   - **User support email:** Your email
   - **Developer contact email:** Your email
9. Click "Save and Continue" through the remaining steps (Scopes, Test users)
10. Click "Publish App" when you reach the summary
11. Now go to search bar → type "Credentials" → click "Credentials"
12. Click "Create Credentials" → "OAuth client ID"
13. **Application type:** Web application
14. **Name:** ChildTruths Web
15. Under "Authorized redirect URIs", click "Add URI" and paste:
    `https://YOUR-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
    (Replace YOUR-SUPABASE-PROJECT with your actual Supabase project URL)
16. Click "Create"
17. You'll see a **Client ID** and **Client Secret** — copy both!

#### Back in Supabase:
1. Go back to Supabase → Authentication → Providers → Google
2. Paste your **Client ID** and **Client Secret**
3. Click "Save"

### 2E: Set Redirect URLs

1. In Supabase → Authentication → URL Configuration
2. Set **Site URL** to: `https://childtruths.vercel.app`
3. Under **Redirect URLs**, add:
   - `https://childtruths.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for testing)
4. Click "Save"

---

## STEP 3: Set Up Stripe (Payments) — 20 minutes

Stripe handles credit card payments for your Pro subscription.

### 3A: Create Stripe Account

1. Go to https://stripe.com
2. Click "Start now" → Create account
3. Complete the onboarding (business info, bank account for payouts)
   - **Business type:** Individual / Sole Proprietorship is fine
   - **Product description:** "AI-powered parenting app for age-appropriate explanations"

### 3B: Create Your Subscription Products

1. In Stripe Dashboard, click "Product catalog" in the left sidebar
2. Click "Add product"
3. Fill in:
   - **Name:** ChildTruths Pro Monthly
   - **Description:** Unlimited explanations, all layers, cultural calibration
   - Click "Add price":
     - **Price:** $6.99
     - **Billing period:** Monthly
   - Click "Save product"
4. Click on the product you just created
5. Under "Pricing", click on the price → Copy the **Price ID** (starts with `price_`)
6. Save this as your MONTHLY price ID

7. Go back to Products → "Add product" again:
   - **Name:** ChildTruths Pro Annual
   - **Description:** Save 40% — unlimited explanations, all features
   - **Price:** $49.99
   - **Billing period:** Yearly
   - Click "Save product"
8. Copy the Annual **Price ID** too

### 3C: Get Your Stripe Keys

1. Click "Developers" in the top-right corner of Stripe Dashboard
2. Click "API keys"
3. You'll see:
   - **Publishable key:** Starts with `pk_test_...` — copy it
   - **Secret key:** Click "Reveal test key" → starts with `sk_test_...` — copy it
4. Save both

### 3D: Set Up Stripe Webhook

This tells your app when someone pays or cancels.

1. In Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL:** `https://childtruths.vercel.app/api/webhooks/stripe`
4. Under "Select events to listen to", click "Select events" and choose:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. On the webhook page, click "Reveal" under "Signing secret"
7. Copy this (starts with `whsec_...`)

### 3E: Enable Customer Portal

1. In Stripe Dashboard → Settings → Billing → Customer portal
2. Toggle ON: "Allow customers to cancel subscriptions"
3. Toggle ON: "Allow customers to switch plans"
4. Click "Save"

---

## STEP 4: Add All Keys to Vercel — 10 minutes

Now you'll put all the keys you collected into your Vercel deployment.

1. Go to https://vercel.com
2. Sign in → Click on your "childtruths" project
3. Click "Settings" tab at the top
4. Click "Environment Variables" in the left sidebar
5. Add each of these one by one (type the name, paste the value, click "Save"):

| Name | Value (paste what you copied) |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role secret key |
| `ANTHROPIC_API_KEY` | Your Claude API key (sk-ant-...) |
| `STRIPE_SECRET_KEY` | Your Stripe Secret key (sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe Publishable key (pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook signing secret (whsec_...) |
| `STRIPE_MONTHLY_PRICE_ID` | Monthly price ID from Stripe (price_...) |
| `STRIPE_ANNUAL_PRICE_ID` | Annual price ID from Stripe (price_...) |
| `NEXT_PUBLIC_APP_URL` | `https://childtruths.vercel.app` |

6. After adding all variables, click "Deployments" tab
7. Find the latest deployment → Click the three dots menu → "Redeploy"
8. Wait for it to finish (2-3 minutes)

---

## STEP 5: Push Your Code to GitHub — 5 minutes

Your new code needs to be uploaded to GitHub so Vercel can deploy it.

1. Open a terminal/command prompt
2. Run these commands one by one:

```
cd C:\Users\noel_\OneDrive\Desktop\childtruths-app
git add -A
git commit -m "Add Supabase auth, Stripe payments, Claude API integration"
git push origin main
```

3. Vercel will automatically detect the push and redeploy

---

## STEP 6: Test Everything — 15 minutes

### Test Google Login:
1. Go to https://childtruths.vercel.app
2. Click "Get Started" → Click "Continue with Google"
3. Sign in with your Google account
4. You should land on the setup screen

### Test Email Signup:
1. Go back to the auth screen
2. Switch to "Sign up"
3. Enter an email + password
4. Check your email for a confirmation link
5. Click the link → you should be logged in

### Test AI Generation:
1. Add a child (name + age)
2. Go to home screen
3. Type a question like "Where do babies come from?"
4. Click "Generate Explanation"
5. You should see 4 layered explanations

### Test Stripe Payment:
1. Use all 3 free explanations
2. On the 4th try, you should see the paywall
3. Click a plan → Stripe checkout should open
4. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
5. After payment, you should have unlimited access

---

## STEP 7: Deploy to App Stores — This Requires a Mac for iOS

### What You Need:
- **Apple App Store:** Apple Developer Account ($99/year) — https://developer.apple.com/programs/
- **Google Play Store:** Google Play Console ($25 one-time) — https://play.google.com/console/

### IMPORTANT: Apple's Payment Rules
Apple DOES NOT allow apps to use Stripe for digital subscriptions.
You MUST use Apple's In-App Purchase system for iOS.

**Recommended solution:** Use RevenueCat (https://www.revenuecat.com)
- It's free up to $2,500/month in revenue
- It handles both Apple IAP and Google Play Billing
- One integration for both platforms

### For Google Play (Android):
1. You need Android Studio installed on your computer
2. Run: `npx cap add android`
3. Run: `npx cap open android`
4. In Android Studio: Build → Generate Signed Bundle/APK
5. Upload the .aab file to Google Play Console

### For Apple App Store (iOS):
1. You need a Mac with Xcode installed
2. Run: `npx cap add ios`
3. Run: `npx cap open ios`
4. In Xcode: Product → Archive → Distribute App
5. Upload to App Store Connect

### If You Don't Have a Mac:
Options for building iOS without a Mac:
1. **MacInCloud** (https://www.macincloud.com) — Rent a Mac in the cloud ($30/month)
2. **GitHub Actions** — Automated builds using CI/CD (free for open source)
3. **Hire someone** on Upwork/Fiverr to do the app store submission ($100-300)

---

## STEP 8: Go Live with Stripe — 10 minutes

When you're ready to accept real payments (not test mode):

1. Go to Stripe Dashboard
2. Complete your account verification (if not done)
3. Toggle the "Test mode" switch OFF (top right)
4. Create the same two products (Monthly + Annual) in live mode
5. Get new live API keys (they start with `pk_live_` and `sk_live_`)
6. Update your Vercel environment variables with the live keys
7. Create a new webhook with the live endpoint
8. Redeploy on Vercel

---

## Quick Reference: All Your Accounts

| Service | URL | What It Does |
|---------|-----|-------------|
| Vercel | vercel.com | Hosts your web app |
| GitHub | github.com | Stores your code |
| Supabase | supabase.com | Database + user login |
| Stripe | stripe.com | Payments |
| Anthropic | console.anthropic.com | AI (Claude) |
| Google Cloud | console.cloud.google.com | Google Sign-In |
| Apple Developer | developer.apple.com | iOS App Store ($99/yr) |
| Google Play Console | play.google.com/console | Android App Store ($25) |

---

## Monthly Costs Estimate

| Service | Cost |
|---------|------|
| Vercel (hosting) | Free (Hobby plan) or $20/month (Pro) |
| Supabase (database) | Free up to 50,000 users |
| Stripe | 2.9% + 30¢ per transaction |
| Claude API | ~$0.01-0.03 per explanation |
| Apple Developer | $99/year |
| Google Play | $25 one-time |
| **Total (starting)** | **~$10-30/month + per-use API costs** |

---

## Need Help?

- **Supabase docs:** https://supabase.com/docs
- **Stripe docs:** https://stripe.com/docs
- **Anthropic docs:** https://docs.anthropic.com
- **Capacitor docs:** https://capacitorjs.com/docs
