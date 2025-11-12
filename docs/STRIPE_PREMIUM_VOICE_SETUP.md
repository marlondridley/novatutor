# Stripe Premium Voice Setup Guide

## ✅ What You Have Set Up

### Products in Stripe:
1. **Study Coach** - $12.99 USD / month (Base subscription)
2. **StudyCoachPremiumVoice** - $1.99 USD / month (Add-on)

**Bundle Total:** $14.98 USD / month

### Payment Link Created:
```
https://buy.stripe.com/4gM28rfBb0Fr3sl1L92VG05
```

---

## 🎯 Recommended Setup: Use Payment Link

### Why Payment Link is Better:
✅ **Simple** - One URL, no code to embed
✅ **Tested** - Works immediately
✅ **Flexible** - Easy to update pricing later
✅ **Mobile-friendly** - Works on all devices
✅ **Stripe-hosted** - Secure, PCI compliant

### Where It's Now Used:
```typescript
// src/components/voice-to-text-premium.tsx
const handleUpgrade = () => {
  window.location.href = 'https://buy.stripe.com/4gM28rfBb0Fr3sl1L92VG05';
};
```

**When clicked:** User goes directly to Stripe checkout for both products.

---

## 🔄 Alternative: Buy Button (Not Recommended)

### Buy Button Code:
```html
<script async src="https://js.stripe.com/v3/buy-button.js"></script>
<stripe-buy-button
  buy-button-id="buy_btn_1SSjXoGxHdRwEkVKrG0Qjljm"
  publishable-key="pk_live_51S5Tk9GxHdRwEkVK9UvEBwpbWo4XIKpDXvOrU4Q8g0UAhmipwAfKm3zmJTRMBCdo2kHyL9I94gZ4kIQjor1xUqy900TJUzjNms"
>
</stripe-buy-button>
```

### Why Not Use It:
❌ **Requires embedding** - More complex integration
❌ **JavaScript dependency** - Slower page load
❌ **Harder to test** - Need to render component
❌ **Less flexible** - Can't easily change button text

**Use Case:** Only if you want the button inline on your pricing page.

---

## 📊 Your Current Setup (Study Coach + Premium Voice)

### Bundle Configuration:

```
┌─────────────────────────────────────┐
│ Study Coach                         │
│ $12.99 USD / month                  │
│ ✓ Access to all base features       │
│ ✓ Browser-based voice (90-95%)     │
│ ✓ Educational AI coach              │
│ ✓ Learning journal & test generator │
└─────────────────────────────────────┘
             +
┌─────────────────────────────────────┐
│ Premium Voice (Add-on)              │
│ $1.99 USD / month                   │
│ ✨ 99% accurate transcription       │
│ ✨ OpenAI GPT-4o-mini-transcribe    │
│ ✨ 57 languages supported           │
│ ✨ Perfect for accents & tech terms │
└─────────────────────────────────────┘
             =
┌─────────────────────────────────────┐
│ Total: $14.98 USD / month          │
└─────────────────────────────────────┘
```

---

## 🎨 Updated Messaging (What Changed)

### Before:
```
"Want 99% accuracy?"
"Learn more →"
```

### After ✅:
```
"Having issues with voice accuracy?"
"Upgrade now →"
```

### Why This is Better:
1. ✅ **Problem-aware** - Acknowledges their pain point
2. ✅ **Action-oriented** - "Upgrade" vs "Learn more"
3. ✅ **Clear value prop** - States the benefit upfront
4. ✅ **Direct link** - Goes straight to Stripe checkout

---

## 💡 Recommendation: Separate vs Bundle

### Option 1: Current Setup (Bundle) ⭐ RECOMMENDED
**Payment Link:** Both products in one checkout
- **Pros:**
  - ✅ Simpler for new customers
  - ✅ One transaction, one payment
  - ✅ Higher perceived value ($14.98 vs $12.99 + $2)
  - ✅ Better for trial conversions

- **Cons:**
  - ❌ Existing customers can't add Premium Voice alone
  - ❌ Can't upgrade mid-subscription easily

**Best For:** New customer acquisition

---

### Option 2: Separate Products (Advanced)
**Setup:** Two payment links
1. Base: https://buy.stripe.com/xxx (Study Coach only - $12.99)
2. Add-on: https://buy.stripe.com/yyy (Premium Voice only - $1.99)

- **Pros:**
  - ✅ Existing customers can add Premium Voice
  - ✅ More flexible pricing
  - ✅ Can upsell after trial

- **Cons:**
  - ❌ Requires customer portal integration
  - ❌ Two separate transactions
  - ❌ More complex webhook logic

**Best For:** Upselling existing customers

---

## 🔧 How to Create Separate Add-On Link

If you want existing customers to add Premium Voice:

### Step 1: Create New Payment Link in Stripe
1. Go to: https://dashboard.stripe.com/payment-links
2. Click **"New"**
3. Select **only**: `StudyCoachPremiumVoice` ($1.99)
4. Set: "Allow promotion codes" ✓
5. Save and copy the new link

### Step 2: Update Code for Existing Customers
```typescript
const handleUpgrade = () => {
  // Check if user already has base subscription
  if (user?.subscription_status === 'active') {
    // Send to add-on only
    window.location.href = 'https://buy.stripe.com/NEW_ADDON_LINK';
  } else {
    // Send to bundle
    window.location.href = 'https://buy.stripe.com/4gM28rfBb0Fr3sl1L92VG05';
  }
};
```

---

## 🎯 Stripe Dashboard Configuration

### What to Check:

1. **Products:**
   - ✅ `Study Coach` exists
   - ✅ `StudyCoachPremiumVoice` exists (Product ID: `prod_TPYJjhvbFCikK1`)
   - ✅ Both set to recurring billing

2. **Prices:**
   - ✅ Study Coach: $12.99/month
   - ✅ Premium Voice: $1.99/month
   - ✅ Currency: USD

3. **Payment Link:**
   - ✅ Includes both products
   - ✅ Customer can adjust quantities: 0-99
   - ✅ Tax calculation enabled (if needed)

4. **Webhook:**
   - ✅ Endpoint: Your Supabase function URL
   - ✅ Events: `customer.subscription.created`, `updated`, `deleted`
   - ✅ Premium Voice handler integrated

---

## 🧪 Testing Your Setup

### Test 1: New Customer Flow
1. Go to Focus Plan → "🎤 Talk It Out"
2. Retry voice input 3 times
3. See prompt: "Having issues with voice accuracy?"
4. Click "Upgrade to Premium Voice"
5. **Should redirect to:** Your Stripe payment link
6. **Should see:** Study Coach ($12.99) + Premium Voice ($1.99) = $14.98

### Test 2: Checkout Completes
1. Use Stripe test card: `4242 4242 4242 4242`
2. Complete checkout
3. **Should happen:**
   - Webhook fires: `customer.subscription.created`
   - Database updates: `premium_voice_enabled = true`
   - User sees: "Premium Voice Active 🎤✨" badge

### Test 3: Verify Database
```sql
SELECT 
  email, 
  premium_voice_enabled, 
  premium_voice_expires_at
FROM profiles 
WHERE email = 'test@example.com';
```

Should show:
```
email: test@example.com
premium_voice_enabled: true
premium_voice_expires_at: (30 days from now)
```

---

## 📝 Pricing Page Integration (Optional)

If you want to display Premium Voice on your `/pricing` page:

```typescript
// src/app/pricing/page.tsx

<Card className="relative">
  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400">
    Add-On
  </Badge>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Crown className="h-5 w-5" />
      Premium Voice
    </CardTitle>
    <CardDescription>
      99% accurate speech-to-text with advanced AI
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold mb-4">
      +$2<span className="text-lg font-normal text-muted-foreground">/month</span>
    </p>
    <ul className="space-y-2 text-sm mb-6">
      <li>✨ 99% accuracy with OpenAI Whisper</li>
      <li>🌍 Works in 57 languages</li>
      <li>🎯 Perfect for accents & technical terms</li>
      <li>📊 ~5 hours of transcription per month</li>
    </ul>
    <a href="https://buy.stripe.com/4gM28rfBb0Fr3sl1L92VG05">
      <Button className="w-full">
        Get Study Coach + Premium Voice
      </Button>
    </a>
  </CardContent>
</Card>
```

---

## ✅ Summary

### What's Now Configured:

1. ✅ **Messaging Updated** - "Having issues with voice accuracy?"
2. ✅ **Link Points to Stripe** - Bundle payment link
3. ✅ **Bundle Pricing** - $14.98/month (Study Coach + Premium Voice)
4. ✅ **Webhook Ready** - Will enable Premium Voice on purchase

### What Happens When User Clicks "Upgrade":

```
User clicks "Upgrade to Premium Voice"
    ↓
Redirect to: https://buy.stripe.com/4gM28rfBb0Fr3sl1L92VG05
    ↓
Stripe Checkout: $14.98/month (both products)
    ↓
Checkout complete → Webhook fires
    ↓
Database: premium_voice_enabled = true
    ↓
User sees: "Premium Voice Active 🎤✨"
```

### Recommendation:

**Keep using the Payment Link!** It's:
- ✅ Simplest to manage
- ✅ Works immediately
- ✅ Easy to update pricing
- ✅ Mobile-friendly
- ✅ Secure & PCI compliant

Only use Buy Button if you need inline checkout on your site (not recommended).

---

## 🔗 Quick Links

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Payment Links:** https://dashboard.stripe.com/payment-links
- **Products:** https://dashboard.stripe.com/products
- **Webhooks:** https://dashboard.stripe.com/webhooks
- **Your Payment Link:** https://buy.stripe.com/4gM28rfBb0Fr3sl1L92VG05
- **Customer Portal:** https://billing.stripe.com/p/login/fZu3cv0Gh4VHaUNblJ2VG00

---

## 🔐 Customer Portal

### Portal Configuration:
- **Portal Configuration ID:** `bpc_1S5YVfGxHdRwEkVKpMmmTBlJ`
- **Portal Link:** https://billing.stripe.com/p/login/fZu3cv0Gh4VHaUNblJ2VG00

### What Customers Can Do:
✅ **Manage subscriptions** - Upgrade, downgrade, or cancel
✅ **Update payment method** - Change credit card
✅ **View invoices** - Download past receipts
✅ **See upcoming charges** - Know when next payment is due

### Where It's Used:
The Customer Portal is already integrated in your app:

```typescript
// src/app/api/create-portal-session/route.ts
const session = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
});
```

**How it works:**
1. User clicks "Manage Subscription" in `/account`
2. API creates a secure portal session
3. User is redirected to Stripe's hosted portal
4. After making changes, user returns to `/account`

### Share the Portal Link:
You can also share the portal link directly with customers:
- Email it to customers who need support
- Add it to your footer or support pages
- Use it in customer service responses

**Note:** Customers will need to verify their email before accessing the portal.

---

**Status:** ✅ **Ready to Accept Payments!**

Users can now upgrade to Premium Voice and get 99% accurate transcription with OpenAI's best-in-class model.

