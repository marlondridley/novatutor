# 👨‍👩‍👧‍👦 Multi-Child Checkout Flow - Complete Guide

## 🎯 **The Feature**

**Pay for Multiple Children with One Card**

Parents can select multiple child accounts and subscribe to all of them in a single Stripe checkout session - one payment, multiple activations.

---

## 🔑 **Key Challenge: Stripe Metadata Serialization**

### **The Problem:**
Stripe metadata only accepts **string values**, not arrays.

```typescript
// ❌ This doesn't work
metadata: {
  profile_ids: ['user1-uuid', 'user2-uuid', 'user3-uuid'] // Error!
}
```

### **The Solution:**
Serialize the array as a **comma-separated string**:

```typescript
// ✅ This works
metadata: {
  profile_ids: 'user1-uuid,user2-uuid,user3-uuid' // String!
}
```

---

## 🔄 **Complete Flow**

### **Step 1: Parent Selects Children**

```tsx
// src/components/multi-child-checkout.tsx
const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());

// Parent selects:
// ✅ Child 1 (id: abc-123)
// ✅ Child 2 (id: def-456)
// ✅ Child 3 (id: ghi-789)
```

### **Step 2: Create Multi-Checkout Session**

```typescript
// src/app/api/create-multi-checkout-session/route.ts

// Serialize array to comma-separated string
const metadata = {
  type: 'multi_subscription',
  profile_ids: profileIds.join(','), // 🔑 "abc-123,def-456,ghi-789"
  profile_count: profileIds.length.toString(), // "3"
  parent_user_id: user.id,
  parent_email: userEmail,
};

// Create Stripe session
const session = await stripe.checkout.sessions.create({
  customer_email: userEmail,
  line_items: [
    { price: PRICE_ID, quantity: 1 }, // Child 1
    { price: PRICE_ID, quantity: 1 }, // Child 2
    { price: PRICE_ID, quantity: 1 }, // Child 3
  ],
  mode: 'subscription',
  metadata, // Includes serialized profile IDs
  subscription_data: {
    metadata, // Also stored on subscription
  },
});
```

### **Step 3: Parent Pays**

```
Parent redirected to Stripe Checkout
→ Enters card: 4242 4242 4242 4242
→ Pays: $59.97/month (3 × $19.99)
→ Completes payment
```

### **Step 4: Webhook Receives Event**

```typescript
// supabase/functions/stripe-webhook/index.ts

// Detect multi-subscription checkout
if (session.metadata?.type === "multi_subscription") {
  await handleMultiSubscriptionCheckout(session)
}
```

### **Step 5: Deserialize & Update All Profiles**

```typescript
// Parse comma-separated string back to array
const profileIds = session.metadata.profile_ids.split(",")
// Result: ["abc-123", "def-456", "ghi-789"]

// Update all profiles in parallel
const updates = profileIds.map(async (profileId) => {
  await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_id: subscriptionId,
      subscription_expires_at: null,
    })
    .eq("id", profileId.trim()) // Match by ID
})

await Promise.all(updates) // Execute all at once
```

### **Step 6: All Children Get Access**

```
✅ Child 1 (abc-123): subscription_status = 'active'
✅ Child 2 (def-456): subscription_status = 'active'
✅ Child 3 (ghi-789): subscription_status = 'active'
```

---

## 📊 **Metadata Structure**

### **Serialization Format:**

```typescript
// API Route (Serialization)
const metadata = {
  type: 'multi_subscription',           // Flag for multi-checkout
  profile_ids: 'uuid1,uuid2,uuid3',    // 🔑 Comma-separated
  profile_count: '3',                   // Number as string
  parent_user_id: 'parent-uuid',        // Who paid
  parent_email: 'parent@example.com',   // Billing email
};
```

### **Webhook (Deserialization):**

```typescript
// Extract metadata
const metadata = session.metadata

// Parse comma-separated string
const profileIds = metadata.profile_ids.split(',')
// ["uuid1", "uuid2", "uuid3"]

// Trim whitespace (safety)
const cleanIds = profileIds.map(id => id.trim())
```

---

## 💡 **Why Comma-Separated Strings?**

### **Stripe Metadata Limitations:**

| Data Type | Supported | Example |
|-----------|-----------|---------|
| String | ✅ Yes | `"value"` |
| Number | ✅ Yes (as string) | `"123"` |
| Boolean | ✅ Yes (as string) | `"true"` |
| Array | ❌ No | `["a","b"]` ❌ |
| Object | ❌ No | `{key:"value"}` ❌ |
| Null | ❌ No | `null` ❌ |

### **Serialization Options:**

| Method | Pros | Cons |
|--------|------|------|
| Comma-separated | Simple, readable | Breaks if IDs contain commas |
| JSON string | Supports complex data | Harder to read in Stripe Dashboard |
| Pipe-separated | Safer than comma | Less conventional |
| Base64 encoded | Most flexible | Hardest to debug |

**We chose comma-separated** because:
- ✅ UUIDs never contain commas
- ✅ Easy to read in Stripe Dashboard
- ✅ Simple to parse
- ✅ Minimal overhead

---

## 🎨 **Frontend Component**

### **Usage:**

```tsx
// src/app/family-pricing/page.tsx
import { MultiChildCheckout } from '@/components/multi-child-checkout';

export default function FamilyPricingPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">
        Family Subscription
      </h1>
      <MultiChildCheckout />
    </div>
  );
}
```

### **Features:**

```tsx
<MultiChildCheckout />
// Includes:
// ✅ Profile list with checkboxes
// ✅ Status badges (active/free/past_due)
// ✅ Quick select buttons (All/Free Only/None)
// ✅ Real-time total calculation
// ✅ One-click checkout
// ✅ Error handling
```

---

## 🧪 **Testing**

### **Test Scenario:**

```bash
# 1. Create 3 test child accounts
CREATE TABLE profiles:
├─ id: 'child1-uuid', email: 'child1@test.com', status: 'free'
├─ id: 'child2-uuid', email: 'child2@test.com', status: 'free'
└─ id: 'child3-uuid', email: 'child3@test.com', status: 'free'

# 2. Parent logs in as parent@test.com

# 3. Navigate to family pricing page

# 4. Select all 3 children

# 5. Click "Subscribe 3 Accounts"

# 6. Pay with test card: 4242 4242 4242 4242

# 7. Check webhook logs:
# Expected:
# "👨‍👩‍👧‍👦 Multi-subscription checkout detected"
# "👨‍👩‍👧‍👦 Activating 3 profiles"
# "✅ Activated profile child1-uuid"
# "✅ Activated profile child2-uuid"
# "✅ Activated profile child3-uuid"
# "✅ Multi-subscription complete: 3/3 profiles activated"

# 8. Verify in Supabase:
SELECT id, email, subscription_status 
FROM profiles 
WHERE email LIKE 'child%@test.com';

# All should show: subscription_status = 'active' ✅
```

---

## 🔧 **API Endpoints**

### **1. Single Checkout (Original)**

```typescript
POST /api/create-checkout-session

// For single user subscription
// Includes: metadata.supabase_user_id
// Result: 1 profile activated
```

### **2. Multi-Checkout (New)**

```typescript
POST /api/create-multi-checkout-session

Body: {
  profileIds: string[] // Array of Supabase user IDs
}

// For multiple users at once
// Includes: metadata.profile_ids (comma-separated)
// Result: All profiles activated
```

---

## 📝 **Database Requirements**

### **Profiles Table:**

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

### **Optional: Family Relationships Table:**

```sql
-- For managing who can subscribe for whom
CREATE TABLE family_members (
  id UUID PRIMARY KEY,
  parent_user_id UUID REFERENCES profiles(id),
  child_user_id UUID REFERENCES profiles(id),
  relationship TEXT, -- 'parent', 'guardian', 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_user_id, child_user_id)
);
```

---

## 🔒 **Security Considerations**

### **1. Verify Ownership**

```typescript
// Before allowing multi-checkout, verify user can manage these profiles
const { data: profiles } = await supabase
  .from('profiles')
  .select('id')
  .in('id', profileIds)
  .eq('managed_by', user.id); // Or check family_members table

if (profiles.length !== profileIds.length) {
  return { error: 'Unauthorized' };
}
```

### **2. Limit Selections**

```typescript
if (profileIds.length > 10) {
  return { error: 'Maximum 10 profiles per checkout' };
}
```

### **3. Prevent Duplicate Activations**

```typescript
// In webhook handler, check if profile is already active
const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_status')
  .eq('id', profileId)
  .single();

if (profile.subscription_status === 'active') {
  console.log(`Profile ${profileId} already active, skipping`);
  return;
}
```

---

## 💰 **Pricing Calculation**

### **Frontend Display:**

```tsx
const pricePerChild = 19.99;
const selectedCount = selectedProfiles.size;
const totalPrice = selectedCount * pricePerChild;

<div>
  <p>{selectedCount} accounts selected</p>
  <p className="text-2xl font-bold">
    ${totalPrice.toFixed(2)}/month
  </p>
</div>
```

### **Stripe Line Items:**

```typescript
// Create one line item per child
const lineItems = profileIds.map(() => ({
  price: process.env.STRIPE_PRICE_ID, // Your Stripe Price ID
  quantity: 1,
}));

// Stripe automatically calculates total
// 3 line items × $19.99 = $59.97/month
```

---

## 🎯 **Use Cases**

### **1. Family Subscription**
Parent manages 3 children's educational accounts.

### **2. School Administrator**
Admin subscribes 10 teachers at once.

### **3. Organization**
Company pays for multiple employee accounts.

### **4. Sports Team**
Coach subscribes all team members.

---

## 📊 **Comparison: Single vs Multi**

| Feature | Single Checkout | Multi Checkout |
|---------|----------------|----------------|
| Profiles per checkout | 1 | 1-10 |
| Metadata format | `supabase_user_id: string` | `profile_ids: string` (CSV) |
| Line items | 1 | Multiple |
| Total cost | $19.99/mo | $19.99 × count |
| Webhook handler | Single update | Batch update |
| Use case | Self-subscription | Parent/Admin |

---

## ✅ **Implementation Checklist**

### **Backend:**
- [x] Multi-checkout API route
- [x] Metadata serialization (array → CSV string)
- [x] Webhook deserialization (CSV string → array)
- [x] Batch profile updates
- [x] Error handling for partial failures

### **Frontend:**
- [x] Multi-child selection component
- [x] Checkbox interface
- [x] Quick select buttons
- [x] Price calculation
- [x] Loading states
- [x] Error messages

### **Testing:**
- [ ] Test with 1 child
- [ ] Test with 3 children
- [ ] Test with max (10) children
- [ ] Test with already-active profiles
- [ ] Test payment failure
- [ ] Test webhook errors
- [ ] Test partial activation failure

---

## 🚀 **Deployment**

### **1. Deploy Edge Function:**
```bash
supabase functions deploy stripe-webhook
```

### **2. Add Multi-Checkout Route:**
Already created at `/api/create-multi-checkout-session`

### **3. Add Frontend Component:**
```tsx
import { MultiChildCheckout } from '@/components/multi-child-checkout';
```

### **4. Test:**
```bash
# Use Stripe test mode
STRIPE_SECRET_KEY=sk_test_...
```

---

## 📖 **Summary**

### **Key Points:**

1. ✅ **Serialization Required** - Arrays → Comma-separated strings
2. ✅ **Deserialization in Webhook** - Split string back to array
3. ✅ **Batch Updates** - Use `Promise.all()` for parallel updates
4. ✅ **One Payment** - Multiple profiles activated instantly
5. ✅ **Flexible Pricing** - Scales from 1 to 10+ children

### **Metadata Flow:**

```
Frontend: ['uuid1', 'uuid2', 'uuid3']
    ↓
API: 'uuid1,uuid2,uuid3' (serialized)
    ↓
Stripe: metadata.profile_ids = 'uuid1,uuid2,uuid3'
    ↓
Webhook: ['uuid1', 'uuid2', 'uuid3'] (deserialized)
    ↓
Database: 3 profiles updated
```

---

## 🎉 **Result**

Parents can now:
- ✅ Select multiple children
- ✅ Pay once for all
- ✅ Activate all accounts instantly
- ✅ Manage everything from one dashboard

**One checkout, multiple subscriptions!** 🚀

