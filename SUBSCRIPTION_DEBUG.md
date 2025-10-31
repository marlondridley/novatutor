# 🔍 Subscription Access Issue - Debugging Guide

## Problem
You started a free trial but keep getting redirected to the pricing page.

## Root Cause
The app checks `subscription_status` in your profile, but it might not be updated yet.

---

## 🧪 Quick Checks

### 1. Check Your Profile in Supabase

Go to Supabase Dashboard → Table Editor → profiles

Find your user and check:
```sql
SELECT 
  id,
  email,
  subscription_status,
  subscription_id,
  subscription_expires_at
FROM profiles
WHERE email = 'YOUR_EMAIL';
```

**Expected for trial:**
- `subscription_status`: `'trialing'` or `'active'`
- `subscription_id`: Should have a value (starts with `sub_`)
- `subscription_expires_at`: Future date

**If you see:**
- `subscription_status`: `'free'` or `NULL` → **This is the problem!**

---

## 🔧 Quick Fix Options

### Option 1: Manually Update Your Profile (Fastest)

In Supabase SQL Editor:
```sql
UPDATE profiles
SET 
  subscription_status = 'trialing',
  subscription_id = 'manual_trial',
  subscription_expires_at = NOW() + INTERVAL '7 days'
WHERE email = 'YOUR_EMAIL';
```

Then **refresh the dashboard page** - you should get in!

---

### Option 2: Check if Webhook Fired

```sql
-- Check if webhook received the checkout event
SELECT * FROM webhook_events
WHERE event_type = 'checkout.session.completed'
ORDER BY created_at DESC
LIMIT 5;
```

**If no results:**
- Webhook didn't fire
- Stripe might not have sent it
- Webhook URL might be wrong

**If you see events:**
Check the `status` column:
- `'processed'` → Good, but profile might not have updated
- `'failed'` → Check `error_message` column
- `'pending'` → Still processing

---

### Option 3: Check Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/subscriptions
2. Find your subscription
3. Check:
   - **Status:** Should be "Active" or "Trialing"
   - **Customer:** Should have your email
   - **Metadata:** Should have `supabase_user_id`

If metadata is missing, the webhook can't link the subscription to your profile!

---

## 🚨 Common Issues

### Issue 1: Webhook Not Configured
**Symptom:** Checkout completes but profile doesn't update

**Fix:**
1. Go to https://dashboard.stripe.com/test/webhooks
2. Add webhook endpoint:
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook-novatutor
   ```
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy signing secret and update `.env.local`:
   ```
   STRIPE_WEBHOOK_SIGNING_SECRET=whsec_xxxxx
   ```

### Issue 2: Pricing Table Not Passing User ID
**Symptom:** Subscription created but not linked to user

**Fix:** Update pricing page to pass user ID:
```tsx
// src/app/(app)/pricing/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { supabase } from '@/lib/supabase-client';

export default function PricingPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      setUserEmail(user?.email || null);
    }
    getUser();
  }, []);

  return (
    <main className="flex flex-1 items-center justify-center p-4 lg:p-6">
      <div className="w-full max-w-4xl mx-auto">
        <Script
          src="https://js.stripe.com/v3/pricing-table.js"
          strategy="lazyOnload"
        />

        {userId && userEmail ? (
          <stripe-pricing-table
            pricing-table-id="prctbl_1SO5iLGxHdRwEkVK0LTy9JqE"
            publishable-key="pk_live_51S5Tk9GxHdRwEkVK9UvEBwpbWo4XIKpDXvOrU4Q8g0UAhmipwAfKm3zmJTRMBCdo2kHyL9I94gZ4kIQjor1xUqy900TJUzjNms"
            client-reference-id={userId}
            customer-email={userEmail}
          />
        ) : (
          <div className="text-center">Loading...</div>
        )}
      </div>
    </main>
  );
}
```

### Issue 3: Cache Issue
**Symptom:** Profile is updated but app still redirects

**Fix:**
1. Open browser DevTools (F12)
2. Go to Application tab → Storage → Clear site data
3. Or hard refresh: `Ctrl + Shift + R`
4. Or try incognito mode

---

## 🎯 Immediate Solution

**Run this in Supabase SQL Editor:**
```sql
-- Check your current status
SELECT email, subscription_status, subscription_id 
FROM profiles 
WHERE email = 'YOUR_EMAIL';

-- If subscription_status is 'free' or NULL, update it:
UPDATE profiles
SET 
  subscription_status = 'trialing',
  subscription_id = 'manual_trial_' || id,
  subscription_expires_at = NOW() + INTERVAL '14 days'
WHERE email = 'YOUR_EMAIL';

-- Verify the update
SELECT email, subscription_status, subscription_expires_at 
FROM profiles 
WHERE email = 'YOUR_EMAIL';
```

Then **refresh your browser** and try accessing `/dashboard` again!

---

## 📊 Debug Console Logs

Open browser console (F12) and look for:
```
⚠️ No premium access, redirecting to pricing
```

This means `hasPremiumAccess()` is returning `false`.

Check what the subscription hook is returning:
```javascript
// In browser console
localStorage.getItem('supabase.auth.token')
```

If you see a token, you're logged in. The issue is subscription status.

---

## ✅ Verification Steps

After applying the fix:

1. **Check browser console** - Should NOT see redirect warning
2. **Check URL** - Should stay on `/dashboard`
3. **Check sidebar** - Should see all nav items
4. **Test features** - Try the AI tutor

---

## 🚀 Prevention for Future

To prevent this issue:

1. **Always pass `client-reference-id`** in checkout
2. **Test webhook locally** with Stripe CLI
3. **Monitor webhook events** in Supabase
4. **Add success page** to verify subscription

---

## 📞 Still Stuck?

Check these in order:

1. ✅ Profile `subscription_status` = `'trialing'` or `'active'`
2. ✅ Webhook events table has `checkout.session.completed` event
3. ✅ Stripe subscription shows your email in metadata
4. ✅ Browser cache cleared
5. ✅ Hard refresh (Ctrl + Shift + R)

If all checks pass and still redirecting, there might be a caching issue in the subscription hook.

**Quick nuclear option:**
```sql
-- Force update your profile
UPDATE profiles
SET subscription_status = 'active'
WHERE email = 'YOUR_EMAIL';
```

Then sign out and sign back in!
