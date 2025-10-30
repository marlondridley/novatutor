# 🎯 Complete Stripe + Supabase Integration

## 🔄 **How It All Works Together**

```
User clicks "Subscribe" 
    ↓
Next.js API: /api/create-checkout-session
    ↓
Creates Stripe Checkout (with user's email)
    ↓
User pays on Stripe
    ↓
Stripe sends webhook to Supabase Edge Function
    ↓
Edge Function updates profiles table
    ↓
User gets instant access!
```

---

## 📂 **Files Created**

### **1. Supabase Edge Function** ✅
**Location:** `supabase/functions/stripe-webhook/index.ts`  
**Deployed URL:** `https://hjegsngsrwwbddbujvxe.supabase.co/functions/v1/stripe-webhook-novatutor`

**What it does:**
- Receives webhook events from Stripe
- Verifies webhook signature
- Updates `profiles` table based on subscription events

### **2. Next.js Checkout API** ✅
**Location:** `src/app/api/create-checkout-session/route.ts`

**What it does:**
- Gets authenticated user's email
- Creates Stripe checkout session with email
- Returns checkout URL

### **3. Checkout Button Component** ✅
**Location:** `src/components/checkout-button.tsx`

**What it does:**
- Provides easy-to-use button
- Calls checkout API
- Redirects to Stripe

---

## 🔐 **Environment Variables Required**

### **For Next.js (.env.local):**

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hjegsngsrwwbddbujvxe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### **For Supabase Edge Function:**
(Set in Supabase Dashboard → Edge Functions → Secrets)

```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SIGNING_SECRET=whsec_xxxxx
SUPABASE_URL=https://hjegsngsrwwbddbujvxe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🎨 **How to Use the Checkout Button**

### **Option 1: Simple Button**
```tsx
import { CheckoutButton } from '@/components/checkout-button';

export default function PricingPage() {
  return (
    <div>
      <h1>Subscribe Now - $19.99/month</h1>
      <CheckoutButton />
    </div>
  );
}
```

### **Option 2: Custom Button**
```tsx
import { CheckoutButton } from '@/components/checkout-button';

export default function PricingPage() {
  return (
    <CheckoutButton className="bg-gradient-to-r from-purple-500 to-pink-500">
      🚀 Start Your Journey - $19.99/mo
    </CheckoutButton>
  );
}
```

---

## 🔄 **Complete Payment Flow**

### **Step 1: User Initiates Checkout**
```tsx
// User clicks button in your app
<CheckoutButton>Subscribe Now</CheckoutButton>
```

### **Step 2: Create Checkout Session**
```typescript
// POST /api/create-checkout-session
// Gets user email from Supabase auth
// Creates Stripe session with email included
const session = await stripe.checkout.sessions.create({
  customer_email: userEmail, // 🔑 Critical for webhook linking
  line_items: [{ price: PRICE_ID, quantity: 1 }],
  mode: 'subscription',
});
```

### **Step 3: User Pays on Stripe**
User is redirected to Stripe Checkout page and completes payment.

### **Step 4: Stripe Sends Webhook**
```
Stripe → https://hjegsngsrwwbddbujvxe.supabase.co/functions/v1/stripe-webhook-novatutor
```

### **Step 5: Edge Function Updates Database**
```typescript
// Finds user by email
await supabase
  .from('profiles')
  .update({
    subscription_status: 'active',
    subscription_id: 'sub_xxxxx',
    subscription_expires_at: null,
  })
  .eq('email', customerEmail) // 🔑 Matches by email
```

### **Step 6: User Gets Access**
User is redirected to success URL and now has active subscription!

---

## 🔧 **Stripe Dashboard Setup**

### **1. Create Product & Price**
1. Go to **Stripe Dashboard** → **Products**
2. Click **"Add product"**
3. Name: "NovaHelper Premium"
4. Price: $19.99/month (recurring)
5. Copy the **Price ID** (starts with `price_`)

### **2. Configure Webhook**
1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** 
   ```
   https://hjegsngsrwwbddbujvxe.supabase.co/functions/v1/stripe-webhook-novatutor
   ```
4. **Select events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`
5. **Select payload style:** Snapshot
6. Click **"Add endpoint"**
7. Copy the **Signing secret** (starts with `whsec_`)

---

## 🧪 **Testing**

### **Test Locally with Stripe CLI**

```bash
# Terminal 1: Start your dev server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to https://hjegsngsrwwbddbujvxe.supabase.co/functions/v1/stripe-webhook-novatutor

# Terminal 3: Trigger test event
stripe trigger checkout.session.completed
```

### **Test Cards**
Use these test cards in Stripe Checkout:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0341` | Payment requires authentication |
| `4000 0000 0000 9995` | Card declined |

---

## 📊 **Database Schema**

Your `profiles` table should have these columns:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'free',
  subscription_id TEXT,
  subscription_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Subscription Statuses:**
- `free` - No active subscription
- `active` - Subscription is active
- `trialing` - In trial period
- `past_due` - Payment failed, grace period
- `canceled` - Subscription canceled

---

## 🎯 **Integration Checklist**

### **Stripe Setup**
- [ ] Create product ($19.99/month)
- [ ] Copy Price ID
- [ ] Set up webhook endpoint
- [ ] Copy webhook signing secret
- [ ] Test with test cards

### **Supabase Setup**
- [ ] Deploy Edge Function
- [ ] Set environment secrets
- [ ] Verify function logs

### **Next.js Setup**
- [ ] Add environment variables to `.env.local`
- [ ] Add `CheckoutButton` to pricing page
- [ ] Test checkout flow
- [ ] Verify database updates

---

## 🐛 **Troubleshooting**

### **Checkout button not working?**
- Check console for errors
- Verify user is authenticated
- Check API route is accessible

### **Payment successful but no access?**
- Check Stripe Dashboard → Webhooks → Recent events
- Check Supabase Edge Function logs
- Verify email matches between Stripe and Supabase

### **Webhook signature verification failed?**
- Verify `STRIPE_WEBHOOK_SIGNING_SECRET` is correct
- Check it's set in Supabase Edge Function secrets
- Ensure webhook endpoint URL is correct

---

## 🚀 **Deployment Checklist**

### **Before Production:**
1. Switch to **live mode** in Stripe Dashboard
2. Update all `sk_test_` keys to `sk_live_` keys
3. Update webhook endpoint to production URL
4. Test with real (small) payment
5. Set up Stripe email notifications
6. Configure subscription cancellation policies

---

## 📚 **Key Files Reference**

| File | Purpose |
|------|---------|
| `supabase/functions/stripe-webhook/index.ts` | Handles webhook events |
| `src/app/api/create-checkout-session/route.ts` | Creates checkout sessions |
| `src/components/checkout-button.tsx` | UI component for subscription |
| `.env.local` | Environment variables |

---

## 🎉 **You're All Set!**

Your Stripe + Supabase integration is complete! Users can now:
1. Click "Subscribe Now"
2. Pay via Stripe Checkout
3. Get instant access
4. Renewals happen automatically
5. You get notified of all subscription changes

**Questions?** Check the troubleshooting section or Stripe docs.

