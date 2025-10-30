# 🔄 Complete Subscription Flow

## ✅ **Key Requirements Met**

### 1️⃣ **Email Linking** ✅
```typescript
// src/app/api/create-checkout-session/route.ts
const session = await stripe.checkout.sessions.create({
  customer_email: userEmail, // 🔑 From Supabase auth
  // ... other config
});
```
✅ User's email is **always included** in checkout session  
✅ Webhook can **perfectly match** user by email

### 2️⃣ **Status Reflects Reality** ✅
```typescript
// supabase/functions/stripe-webhook/index.ts
subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled'
```
✅ Status **always reflects** current access state  
✅ Updated **automatically** by webhook

### 3️⃣ **Frontend Just Checks Status** ✅
```typescript
// src/hooks/use-subscription-status.ts
const { isActive, status } = useSubscriptionStatus();
// That's it! Webhook handles everything else.
```
✅ Frontend **only reads** `subscription_status`  
✅ **No manual updates** needed  
✅ **Real-time updates** via Supabase subscriptions

---

## 🎯 **Complete Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER INITIATES CHECKOUT                                  │
│                                                              │
│  <CheckoutButton>Subscribe</CheckoutButton>                 │
│            ↓                                                 │
│  POST /api/create-checkout-session                          │
│            ↓                                                 │
│  Supabase Auth → Gets user.email                            │
│            ↓                                                 │
│  Stripe.checkout.sessions.create({                          │
│    customer_email: user.email  ← 🔑 KEY LINK                │
│  })                                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. USER COMPLETES PAYMENT                                   │
│                                                              │
│  → Redirected to Stripe Checkout                            │
│  → Enters card: 4242 4242 4242 4242                         │
│  → Completes payment                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. STRIPE SENDS WEBHOOK                                     │
│                                                              │
│  Stripe → POST https://xxx.supabase.co/functions/v1/...     │
│                                                              │
│  Event: checkout.session.completed                          │
│  Data: { customer_email: "user@example.com", ... }          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. EDGE FUNCTION UPDATES DATABASE                           │
│                                                              │
│  await supabase                                             │
│    .from('profiles')                                         │
│    .update({                                                 │
│      subscription_status: 'active',  ← 🎯 STATUS UPDATED    │
│      subscription_id: 'sub_xxx',                            │
│      subscription_expires_at: null                          │
│    })                                                        │
│    .eq('email', customerEmail)  ← 🔑 MATCHED BY EMAIL       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. FRONTEND GETS INSTANT ACCESS                             │
│                                                              │
│  const { isActive } = useSubscriptionStatus();              │
│  // isActive = true! 🎉                                      │
│                                                              │
│  Real-time update via Supabase Realtime                     │
│  No page refresh needed!                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 **Subscription Lifecycle**

### **New Subscription**
```
User clicks button
  → checkout.session.completed
    → subscription_status = 'active'
      → User gets access immediately
```

### **Successful Renewal**
```
Stripe charges card
  → invoice.paid
    → subscription_status = 'active'
      → Access continues seamlessly
```

### **Failed Payment**
```
Stripe fails to charge
  → invoice.payment_failed
    → subscription_status = 'past_due'
      → User sees "Update payment" warning
```

### **Cancellation**
```
User cancels in Stripe portal
  → customer.subscription.deleted
    → subscription_status = 'canceled'
      → Access revoked immediately
```

### **Status Change**
```
User upgrades/downgrades
  → customer.subscription.updated
    → subscription_status updated
      → Frontend reflects new status
```

---

## 🎨 **Frontend Usage Examples**

### **Example 1: Simple Access Check**
```tsx
import { useSubscriptionStatus } from '@/hooks/use-subscription-status';

export function TutorPage() {
  const { isActive, loading } = useSubscriptionStatus();

  if (loading) return <div>Loading...</div>;

  if (!isActive) {
    return (
      <div>
        <h2>Subscribe to access AI Tutor</h2>
        <CheckoutButton />
      </div>
    );
  }

  return <AiTutorChat />; // Premium feature
}
```

### **Example 2: Status-Based UI**
```tsx
import { useSubscriptionStatus } from '@/hooks/use-subscription-status';

export function Dashboard() {
  const { status, isActive, isPastDue } = useSubscriptionStatus();

  return (
    <div>
      {isPastDue && (
        <Alert variant="destructive">
          Payment failed! Update your payment method.
        </Alert>
      )}

      {isActive ? (
        <PremiumDashboard />
      ) : (
        <FreeDashboard />
      )}
    </div>
  );
}
```

### **Example 3: Feature Gate Component**
```tsx
import { SimpleAccessGate } from '@/components/subscription-status-examples';

export function AdvancedFeaturePage() {
  return (
    <SimpleAccessGate>
      {/* Only premium users see this */}
      <AdvancedAnalytics />
      <ExportData />
      <CustomReports />
    </SimpleAccessGate>
  );
}
```

---

## 🔐 **How Email Linking Works**

### **Step 1: Checkout Creation**
```typescript
// API Route gets authenticated user
const { data: { user } } = await supabase.auth.getUser();
const userEmail = user.email; // "john@example.com"

// Create checkout WITH email
const session = await stripe.checkout.sessions.create({
  customer_email: userEmail, // ← Email included
  line_items: [...],
});
```

### **Step 2: User Pays**
```
User completes payment on Stripe
Stripe stores: customer_email = "john@example.com"
```

### **Step 3: Webhook Receives Event**
```typescript
// Edge Function receives webhook
const session = event.data.object;
const customerEmail = session.customer_email; // "john@example.com"
```

### **Step 4: Database Update**
```typescript
// Update by email - perfect match!
await supabase
  .from('profiles')
  .update({ subscription_status: 'active' })
  .eq('email', customerEmail); // ← Matches "john@example.com"
```

### **Step 5: User Gets Access**
```typescript
// Frontend checks status
const { isActive } = useSubscriptionStatus();
// isActive = true (because subscription_status = 'active')
```

---

## 🎯 **Status Values Explained**

| Status | Meaning | User Access | What Happened |
|--------|---------|-------------|---------------|
| `free` | No subscription | ❌ No | Default state |
| `trialing` | Trial period | ✅ Yes | Started trial |
| `active` | Paid & current | ✅ Yes | Payment successful |
| `past_due` | Payment failed | ⚠️ Grace period | Card declined |
| `canceled` | Subscription ended | ❌ No | User canceled |

---

## 🔄 **Automatic Updates**

### **What the Webhook Handles Automatically:**
✅ Initial subscription activation  
✅ Monthly renewal billing  
✅ Failed payment notifications  
✅ Subscription cancellations  
✅ Plan upgrades/downgrades  
✅ Trial period tracking  

### **What You DON'T Need to Do:**
❌ Manually update subscription status  
❌ Track billing dates  
❌ Handle renewal logic  
❌ Send payment failure emails (Stripe does this)  
❌ Calculate expiration dates  

### **What You DO Need to Do:**
✅ Check `isActive` in your frontend  
✅ Show upgrade prompt for free users  
✅ Display current status badge  

---

## 📝 **Quick Reference**

### **Create Checkout**
```tsx
<CheckoutButton>Subscribe - $19.99/mo</CheckoutButton>
```

### **Check Status**
```tsx
const { isActive } = useSubscriptionStatus();
```

### **Gate Content**
```tsx
<SimpleAccessGate>
  <PremiumContent />
</SimpleAccessGate>
```

### **Show Status**
```tsx
<SubscriptionStatusBadge />
```

---

## 🚀 **Files Summary**

| File | Purpose | Key Feature |
|------|---------|-------------|
| `src/app/api/create-checkout-session/route.ts` | Creates checkout | Includes `customer_email` |
| `supabase/functions/stripe-webhook/index.ts` | Handles webhooks | Updates `subscription_status` |
| `src/hooks/use-subscription-status.ts` | React hook | Reads status, provides helpers |
| `src/components/checkout-button.tsx` | UI component | Initiates checkout |
| `src/components/subscription-status-examples.tsx` | Examples | Shows usage patterns |

---

## ✅ **Verification Checklist**

### **Email Linking** ✅
- [x] `customer_email` included in checkout
- [x] Edge Function matches by email
- [x] Email from Supabase auth

### **Status Management** ✅
- [x] `subscription_status` always reflects reality
- [x] Webhook updates automatically
- [x] Real-time updates enabled

### **Frontend Integration** ✅
- [x] Hook to check status
- [x] Example components provided
- [x] Simple API: just check `isActive`

---

## 🎉 **You're All Set!**

Your subscription system is **fully automated**:

1. ✅ Users click subscribe
2. ✅ Checkout includes their email
3. ✅ They pay on Stripe
4. ✅ Webhook updates status automatically
5. ✅ Frontend shows correct access instantly

**No manual intervention needed!** 🚀

