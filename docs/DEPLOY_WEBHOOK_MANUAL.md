# Deploy Premium Voice Webhook (Manual Steps)

## Issue
CLI login doesn't work in non-interactive terminals:
```
Cannot use automatic login flow inside non-TTY environments.
```

## ✅ Solution: Deploy via Supabase Dashboard

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Edge Functions** (in left sidebar)

### Step 2: Find Your Webhook Function
1. Look for: `stripe-webhook-novatutor`
2. Click on it to open the editor

### Step 3: Update the Function Code

#### File 1: `index.ts`
Copy the entire contents from:
```
supabase/functions/stripe-webhook-novatutor/index.ts
```

**Key changes to verify:**
- Line 8: `import { handlePremiumVoiceUpdate, handlePremiumVoiceCanceled } from "./premium-voice-handler.ts"`
- Line 80: `await handlePremiumVoiceUpdate(supabase, sub, sub.customer as string)`
- Line 108: `await handlePremiumVoiceUpdate(supabase, sub, sub.customer as string)`
- Line 117: `await handlePremiumVoiceCanceled(supabase, sub, sub.customer as string)`

#### File 2: Create `premium-voice-handler.ts`
1. Click **"New File"** or **"+"**
2. Name it: `premium-voice-handler.ts`
3. Copy the entire contents from:
```
supabase/functions/stripe-webhook-novatutor/premium-voice-handler.ts
```

### Step 4: Deploy
1. Click **"Deploy"** button (top right)
2. Wait for deployment to complete (~30 seconds)
3. Verify status shows: **"Deployed"** ✅

---

## 🎯 Alternative: Use Access Token

If you prefer CLI deployment:

### Option A: Get Access Token from Dashboard
1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Copy the token
4. Run:
```bash
$env:SUPABASE_ACCESS_TOKEN="your-token-here"
supabase functions deploy stripe-webhook-novatutor
```

### Option B: Login with Token Flag
```bash
supabase login --token sbp_xxxxxxxxxxxxxxxxxxxxx
supabase functions deploy stripe-webhook-novatutor
```

---

## ✅ Verify Deployment

### Test 1: Check Function Logs
1. In Supabase Dashboard → Edge Functions
2. Click on `stripe-webhook-novatutor`
3. Go to **"Logs"** tab
4. Look for: `"✅ Stripe Webhook Function booted!"`

### Test 2: Trigger Test Webhook from Stripe
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Find your webhook endpoint
3. Click **"Send test webhook"**
4. Select: `customer.subscription.created`
5. Check Supabase logs for: `"🎤 Checking for Premium Voice in subscription..."`

### Test 3: Enable Premium Voice for Your Account
```sql
-- In Supabase SQL Editor
UPDATE profiles 
SET 
  premium_voice_enabled = true,
  premium_voice_expires_at = NOW() + INTERVAL '1 month'
WHERE email = 'your@email.com';
```

Then test in the app:
1. Go to: http://localhost:9002/dashboard
2. Click Focus Plan → "🎤 Talk It Out"
3. Should see: **"Premium Voice Active 🎤✨"** badge

---

## 📝 Summary

**Quick Path (Recommended):**
1. Supabase Dashboard → Edge Functions
2. Open `stripe-webhook-novatutor`
3. Update `index.ts` (add import on line 8)
4. Create `premium-voice-handler.ts`
5. Click Deploy

**CLI Path (If Token Available):**
```bash
supabase login --token YOUR_TOKEN
supabase functions deploy stripe-webhook-novatutor
```

**Total Time:** ~5 minutes

---

## 🐛 Troubleshooting

**"Function not found"**
- Make sure you're in the correct Supabase project

**"Deployment failed"**
- Check for syntax errors in the files
- Verify the import path is correct: `"./premium-voice-handler.ts"`

**"No logs appearing"**
- Stripe webhook might not be configured
- Check webhook URL in Stripe Dashboard
- Verify webhook signing secret is in Supabase secrets

**Premium Voice not enabling**
- Check if `premium_voice_enabled` column exists in profiles table
- Run migration: `20251112_add_premium_voice.sql`
- Verify Stripe product ID matches: `prod_TPYJjhvbFCikK1`

---

## 🎉 Once Deployed

Your webhook will automatically:
✅ Enable Premium Voice when users subscribe
✅ Disable Premium Voice when they cancel
✅ Track usage in `voice_usage_logs` table
✅ Handle subscription updates and renewals

**No further action needed!** The system is fully automated.

