# 👥 Multiple Subscriptions Per Email - Complete Guide

## 🎯 **The Problem**

**Scenario:** A parent with email `parent@example.com` wants to pay for 3 children:
- Child 1 Account: `child1@example.com`
- Child 2 Account: `child2@example.com`
- Child 3 Account: `child3@example.com`

**Problem with Email-Only Matching:**
```typescript
// ❌ This only works for ONE subscription per email
.eq('email', 'parent@example.com')
```

If parent pays for 3 subscriptions, only the last one updates!

---

## ✅ **The Solution**

### **Use Supabase User ID in Metadata**

```
Payment → Includes User ID → Webhook Matches Correct Profile
```

---

## 🔧 **How It Works**

### **Step 1: Checkout Includes User ID**

```typescript
// src/app/api/create-checkout-session/route.ts
const session = await stripe.checkout.sessions.create({
  customer_email: userEmail, // For Stripe emails
  client_reference_id: user.id, // 🔑 Supabase user ID
  metadata: {
    supabase_user_id: user.id, // Also in metadata
  },
  subscription_data: {
    metadata: {
      supabase_user_id: user.id, // Stored in subscription
    },
  },
});
```

### **Step 2: Webhook Matches by User ID**

```typescript
// supabase/functions/stripe-webhook/index.ts
const supabaseUserId = session.metadata?.supabase_user_id

// Match by ID, not email!
await supabase
  .from('profiles')
  .update({ subscription_status: 'active' })
  .eq('id', supabaseUserId) // 🔑 Matches specific user
```

---

## 📊 **Example Scenarios**

### **Scenario 1: Parent Pays for 3 Kids**

```
Parent Account: parent@example.com (id: 'parent-uuid')
├─ Child 1: child1@example.com (id: 'child1-uuid')
├─ Child 2: child2@example.com (id: 'child2-uuid')
└─ Child 3: child3@example.com (id: 'child3-uuid')
```

**Parent logs in as each child and subscribes:**

```typescript
// Parent logs in to child1@example.com
<CheckoutButton /> // Creates subscription with child1-uuid

// Parent logs in to child2@example.com  
<CheckoutButton /> // Creates subscription with child2-uuid

// Parent logs in to child3@example.com
<CheckoutButton /> // Creates subscription with child3-uuid
```

**Result:**
- ✅ All 3 subscriptions work independently
- ✅ Parent gets 3 invoices to `parent@example.com` (can be configured)
- ✅ Each child account has `subscription_status = 'active'`
- ✅ No conflicts!

### **Scenario 2: School Admin Pays for Teachers**

```
Admin: admin@school.com (pays for everyone)
├─ Teacher A: teachera@school.com (id: 'teacher-a-uuid')
├─ Teacher B: teacherb@school.com (id: 'teacher-b-uuid')
└─ Teacher C: teacherc@school.com (id: 'teacher-c-uuid')
```

**Admin logs in as each teacher:**
1. Logs in to Teacher A account → Subscribe
2. Logs in to Teacher B account → Subscribe
3. Logs in to Teacher C account → Subscribe

**Stripe sends invoices to:**
- `admin@school.com` (the payment email)

**Webhook updates:**
- Teacher A profile: `subscription_status = 'active'`
- Teacher B profile: `subscription_status = 'active'`
- Teacher C profile: `subscription_status = 'active'`

---

## 🔄 **Flow Diagram**

```
┌──────────────────────────────────────────────────────────┐
│ PARENT LOGS INTO CHILD 1 ACCOUNT                         │
│ Email: child1@example.com                                │
│ User ID: child1-uuid                                     │
└──────────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ PARENT CLICKS SUBSCRIBE                                  │
│                                                          │
│ POST /api/create-checkout-session                       │
│   → Gets user.id = "child1-uuid"                        │
│   → Gets user.email = "child1@example.com"              │
│   → Creates checkout with:                              │
│       • customer_email: "child1@example.com"            │
│       • metadata.supabase_user_id: "child1-uuid" ✅     │
└──────────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ PARENT PAYS ON STRIPE                                    │
│ (Can use parent's credit card)                           │
└──────────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ WEBHOOK RECEIVES EVENT                                   │
│                                                          │
│ subscription.metadata.supabase_user_id = "child1-uuid"   │
└──────────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ UPDATE CORRECT PROFILE                                   │
│                                                          │
│ UPDATE profiles                                          │
│ SET subscription_status = 'active'                       │
│ WHERE id = 'child1-uuid'  ← 🔑 Correct child!          │
└──────────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ CHILD 1 GETS ACCESS ✅                                   │
│ (Other children: still free status)                      │
└──────────────────────────────────────────────────────────┘
```

---

## 🔑 **Key Implementation Details**

### **1. Checkout Session** ✅
```typescript
// src/app/api/create-checkout-session/route.ts
client_reference_id: user.id, // Available in checkout.session.completed
metadata: {
  supabase_user_id: user.id, // Backup
},
subscription_data: {
  metadata: {
    supabase_user_id: user.id, // Persists on subscription
  },
},
```

### **2. Webhook Handler** ✅
```typescript
// supabase/functions/stripe-webhook/index.ts
// PRIMARY: Match by user ID
const supabaseUserId = session.metadata?.supabase_user_id || session.client_reference_id

if (supabaseUserId) {
  await supabase
    .from('profiles')
    .update({ ... })
    .eq('id', supabaseUserId) // ✅ Precise matching
}

// FALLBACK: Email matching (for backward compatibility)
if (!supabaseUserId && customerEmail) {
  await supabase
    .from('profiles')
    .update({ ... })
    .eq('email', customerEmail)
}
```

---

## 📝 **Database Schema**

Your `profiles` table should have:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,  -- ← Used for matching!
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'free',
  subscription_id TEXT,  -- Stripe subscription ID
  subscription_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 **Frontend Usage**

No changes needed! The hook still works the same:

```tsx
import { useSubscriptionStatus } from '@/hooks/use-subscription-status';

export function MyPage() {
  const { isActive } = useSubscriptionStatus();
  
  // This checks the CURRENT logged-in user's status
  return isActive ? <PremiumContent /> : <UpgradePrompt />;
}
```

---

## 💡 **Important Notes**

### **1. User Must Be Logged In**
```tsx
// ✅ User is logged in as the account they want to subscribe
// Payment email can be different, but subscription links to logged-in account
<CheckoutButton />
```

### **2. Multiple Payment Methods**
```
Same email = Same Stripe customer = Shared payment methods
Different emails = Different Stripe customers = Separate payment methods
```

### **3. Invoice Consolidation**
All subscriptions paid with same email will appear on same invoice in Stripe dashboard.

---

## 🔄 **Migration from Email-Only**

If you already have subscriptions using email-only matching:

### **Option 1: Automatic Migration** (Recommended)
Both methods work! New subscriptions use User ID, old subscriptions use email fallback.

### **Option 2: Backfill User IDs**
```sql
-- Add user IDs to existing Stripe subscriptions
-- (Manual process in Stripe Dashboard or via API)
```

---

## 🧪 **Testing**

### **Test Multiple Subscriptions:**

```bash
# 1. Create 3 test accounts in Supabase
user1@test.com (id: user1-uuid)
user2@test.com (id: user2-uuid)
user3@test.com (id: user3-uuid)

# 2. Log in as user1, subscribe
# 3. Log in as user2, subscribe
# 4. Log in as user3, subscribe

# 4. Verify in Supabase:
SELECT id, email, subscription_status 
FROM profiles 
WHERE email LIKE '%@test.com';

# All 3 should show 'active'! ✅
```

---

## 📊 **Comparison**

| Feature | Email-Only | User ID (New) |
|---------|-----------|---------------|
| One user per email | ✅ Yes | ✅ Yes |
| Multiple subscriptions per email | ❌ No | ✅ Yes |
| Parent pays for kids | ❌ Conflicts | ✅ Works perfectly |
| Backward compatible | N/A | ✅ Yes (fallback) |
| Implementation complexity | Simple | Slightly more complex |

---

## ✅ **Summary**

### **What Changed:**

**Before (Email-Only):**
```typescript
// Only works for one subscription per email
.eq('email', customerEmail)
```

**After (User ID + Email Fallback):**
```typescript
// PRIMARY: Match by user ID (supports multiple subscriptions)
.eq('id', supabaseUserId)

// FALLBACK: Match by email (backward compatibility)
.eq('email', customerEmail)
```

### **Benefits:**
✅ Support multiple subscriptions per email  
✅ Backward compatible with existing subscriptions  
✅ More precise matching  
✅ Supports family/school scenarios  
✅ No frontend changes required  

---

## 🎯 **Real-World Use Cases**

### **1. Family Plan**
Parent manages and pays for multiple children accounts.

### **2. School/Organization**
Admin pays for multiple teacher/student accounts.

### **3. Corporate**
Manager pays for team member accounts.

### **4. Reseller**
Agency manages subscriptions for multiple clients.

---

## 🚀 **You're All Set!**

Your system now supports:
- ✅ One subscription per user (normal case)
- ✅ Multiple subscriptions per payment email (family/school case)
- ✅ Backward compatibility with email-only matching
- ✅ No frontend changes needed

**Deploy and test!** 🎉

