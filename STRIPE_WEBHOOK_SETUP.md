# 🔔 Stripe Webhook Setup Guide

How to automatically update Supabase when users subscribe via Stripe.

---

## 🎯 **The Problem**

When a user pays via Stripe (payment link or QR code):
- ✅ Stripe processes the payment
- ❌ Your Supabase database doesn't know about it
- ❌ User still can't access the app

**Solution:** Stripe Webhooks → Automatically update `subscription_status` in Supabase

---

## 🛠️ **Solution Overview**

```
User pays $19.99 → Stripe
                    ↓
              Webhook Event
                    ↓
         Your Next.js API Route
                    ↓
      Update Supabase profiles table
      SET subscription_status = 'active'
```

---

## 📋 **Step-by-Step Setup**

### **Step 1: Install Stripe SDK**

```bash
npm install stripe
```

---

### **Step 2: Add Stripe Secret Key to `.env.local`**

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Existing keys...
DEEPSEEK_API_KEY=...
OPENAI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Get your keys:**
1. Go to **Stripe Dashboard** → **Developers** → **API Keys**
2. Copy **Secret key** (starts with `sk_test_` or `sk_live_`)

---

### **Step 3: Create Webhook API Route**

Create a new file: `src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Supabase Admin Client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin key - add this to .env.local
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Payment completed:', session.id);

  const customerEmail = session.customer_email;
  const subscriptionId = session.subscription as string;

  if (!customerEmail) {
    console.error('❌ No customer email found');
    return;
  }

  // Update user's subscription status in Supabase
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_id: subscriptionId,
      subscription_expires_at: null, // No expiry for active subscriptions
      updated_at: new Date().toISOString(),
    })
    .eq('email', customerEmail);

  if (error) {
    console.error('❌ Failed to update subscription:', error);
  } else {
    console.log(`✅ Subscription activated for ${customerEmail}`);
  }
}

// Handle subscription changes (renewal, upgrade, etc.)
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription changed:', subscription.id);

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const customerEmail = (customer as Stripe.Customer).email;

  if (!customerEmail) {
    console.error('❌ No customer email found');
    return;
  }

  const status = subscription.status;
  const expiresAt = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  // Map Stripe status to our status
  let subscriptionStatus: string;
  switch (status) {
    case 'active':
      subscriptionStatus = 'active';
      break;
    case 'trialing':
      subscriptionStatus = 'trialing';
      break;
    case 'past_due':
      subscriptionStatus = 'past_due';
      break;
    case 'canceled':
    case 'unpaid':
      subscriptionStatus = 'canceled';
      break;
    default:
      subscriptionStatus = 'free';
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: subscriptionStatus,
      subscription_id: subscription.id,
      subscription_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('email', customerEmail);

  if (error) {
    console.error('❌ Failed to update subscription:', error);
  } else {
    console.log(`✅ Subscription updated for ${customerEmail}: ${subscriptionStatus}`);
  }
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id);

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const customerEmail = (customer as Stripe.Customer).email;

  if (!customerEmail) {
    console.error('❌ No customer email found');
    return;
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      subscription_expires_at: new Date().toISOString(), // Mark as expired
      updated_at: new Date().toISOString(),
    })
    .eq('email', customerEmail);

  if (error) {
    console.error('❌ Failed to cancel subscription:', error);
  } else {
    console.log(`✅ Subscription canceled for ${customerEmail}`);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('💳 Payment failed:', invoice.id);

  const customer = await stripe.customers.retrieve(invoice.customer as string);
  const customerEmail = (customer as Stripe.Customer).email;

  if (!customerEmail) {
    console.error('❌ No customer email found');
    return;
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('email', customerEmail);

  if (error) {
    console.error('❌ Failed to update payment status:', error);
  } else {
    console.log(`⚠️ Payment failed for ${customerEmail} - marked as past_due`);
  }
}
```

---

### **Step 4: Add Supabase Service Role Key**

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Copy **service_role key** (secret, never expose to client!)
3. Add to `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

### **Step 5: Configure Next.js to Accept Raw Body**

Create `src/app/api/webhooks/stripe/config.ts`:

```typescript
export const config = {
  api: {
    bodyParser: false, // Disable body parsing, Stripe needs raw body
  },
};
```

---

### **Step 6: Test Webhook Locally with Stripe CLI**

#### Install Stripe CLI:

**Windows:**
```bash
scoop install stripe
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

#### Login to Stripe:
```bash
stripe login
```

#### Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:9002/api/webhooks/stripe
```

This will give you a **webhook signing secret** like:
```
whsec_xxxxxxxxxxxxxxxxxxxxx
```

Add this to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### Trigger a test event:
```bash
stripe trigger checkout.session.completed
```

Check your terminal - you should see:
```
✅ Webhook received: checkout.session.completed
✅ Subscription activated for test@example.com
```

---

### **Step 7: Set Up Production Webhook**

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://yourapp.com/api/webhooks/stripe`
4. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (`whsec_...`)
7. Add to your **production environment variables** (Vercel/Netlify)

---

## 🧪 **Testing the Complete Flow**

### Test Scenario 1: New Subscription

1. **User signs up** → `subscription_status = 'free'`
2. **User clicks "Subscribe Now"** → Redirected to Stripe
3. **User pays $19.99** → Stripe processes payment
4. **Stripe sends webhook** → Your API receives it
5. **API updates Supabase:**
   ```sql
   UPDATE profiles 
   SET subscription_status = 'active',
       subscription_id = 'sub_xxxxx'
   WHERE email = 'user@example.com';
   ```
6. **User refreshes page** → Full access granted! ✅

---

### Test Scenario 2: Manual Testing (Without Stripe)

For testing, you can manually update the database:

```sql
-- Give a user active subscription
UPDATE profiles 
SET subscription_status = 'active',
    subscription_id = 'sub_test_123',
    subscription_expires_at = NULL
WHERE email = 'test@example.com';
```

Then login - you should have full access!

---

## 📊 **Webhook Event Reference**

| Stripe Event | What It Means | Your Action |
|--------------|---------------|-------------|
| `checkout.session.completed` | User completed payment | Set `subscription_status = 'active'` |
| `customer.subscription.created` | New subscription started | Set `subscription_status = 'active'` |
| `customer.subscription.updated` | Subscription renewed/changed | Update `subscription_status` |
| `customer.subscription.deleted` | User canceled subscription | Set `subscription_status = 'canceled'` |
| `invoice.payment_failed` | Payment failed | Set `subscription_status = 'past_due'` |

---

## 🔒 **Security Best Practices**

1. ✅ **Always verify webhook signature** (prevents fake webhooks)
2. ✅ **Use Supabase Service Role Key** (bypasses RLS for admin operations)
3. ✅ **Never expose service role key to client**
4. ✅ **Log all webhook events for debugging**
5. ✅ **Use environment variables for all secrets**

---

## 🐛 **Troubleshooting**

### Webhook not receiving events?
- Check that endpoint URL is correct
- Verify webhook secret in `.env.local`
- Check Stripe Dashboard → Webhooks → Recent attempts

### Database not updating?
- Check server logs for errors
- Verify Supabase Service Role Key
- Check email matches between Stripe and Supabase

### User still can't access app after paying?
- Refresh the page (session needs to reload)
- Check `subscription_status` in Supabase
- Verify webhook was received (Stripe Dashboard)

---

## 📝 **Summary**

### Environment Variables Needed:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### Files Created:
- ✅ `src/app/api/webhooks/stripe/route.ts` - Webhook handler

### Stripe Dashboard Setup:
- ✅ Create product ($19.99/month)
- ✅ Create payment link
- ✅ Set up webhook endpoint
- ✅ Configure webhook events

---

**Once webhooks are set up, subscriptions will be 100% automatic! 🎉**


