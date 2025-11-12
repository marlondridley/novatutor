# Multi-Child Subscription Setup Guide

## Overview

NovaTutor allows parents to add multiple children to their subscription directly from their Account Dashboard. There's no need for separate "family plans" - the system is built to handle multiple children under one parent account.

## How It Works

### For Parents

1. **Subscribe First**: Parent signs up and subscribes to NovaTutor Premium ($12.99/month per child)
2. **Add Children**: From Account Settings, parent can add child accounts
3. **Manage Subscriptions**: Parents can view, manage, and remove child subscriptions from one dashboard
4. **Monitor Progress**: Access the Parent Dashboard to see all children's learning activity

### System Architecture

```
Parent Account (subscriber)
  ├── Child Account 1 (subscription managed by parent)
  ├── Child Account 2 (subscription managed by parent)
  └── Child Account 3 (subscription managed by parent)
```

## Key Components

### 1. ManageChildSubscriptions Component
**Location**: `src/components/manage-child-subscriptions.tsx`

This component allows parents to:
- View all child accounts linked to their profile
- See subscription status for each child (active, inactive, trialing)
- Remove children from subscription
- Automatic billing adjustment when children are added/removed

**Usage**:
```tsx
import { ManageChildSubscriptions } from '@/components/manage-child-subscriptions';

// In account settings page
<ManageChildSubscriptions />
```

### 2. Parent Dashboard
**Location**: `src/components/parent-dashboard.tsx`

Features:
- Weekly learning summaries for all children
- Activity tracking across subjects
- Learning Coach insights and recommendations
- Download reports
- Send weekly emails

### 3. Database Structure

**Profiles Table**:
```sql
profiles:
  - id (uuid, primary key)
  - email (text)
  - name (text)
  - parent_id (uuid, foreign key to profiles.id) 
  - subscription_status (text)
  - subscription_id (text, Stripe subscription ID)
  - privacy_accepted (boolean)
  - parental_consent (boolean, for users under 13)
```

**Key Relationships**:
- Child profiles have `parent_id` pointing to parent's profile
- Parent can query all children using: `WHERE parent_id = parent.id`
- Each child has their own `subscription_id` for independent management

## How to Add Children

### Step 1: Parent Subscribes
1. Parent goes to `/pricing`
2. Subscribes using Stripe ($12.99/month)
3. `subscription_status` = "active" in database

### Step 2: Create Child Account
1. Parent creates child account with separate email
2. During signup, link child to parent: `parent_id = parent_user_id`
3. Privacy agreement with parental consent (if under 13)

### Step 3: Subscribe Child
1. Parent goes to `/account` settings
2. Sees `ManageChildSubscriptions` component
3. Each child can have their own subscription
4. Billing handled per child through Stripe

### Step 4: Monitor & Manage
1. Parent Dashboard shows all children's progress
2. Can add/remove subscriptions as needed
3. Independent billing for each child

## API Routes

### Remove Child from Subscription
**Endpoint**: `/api/remove-child-from-subscription`

```typescript
POST /api/remove-child-from-subscription
Body: {
  subscriptionId: string,
  profileId: string
}

Response: {
  success: boolean,
  canceled?: boolean,
  remainingCount?: number
}
```

This API:
- Cancels the child's Stripe subscription
- Updates the child's profile status to inactive
- Returns count of remaining children
- If last child, marks subscription as canceled

## Pricing Model

**Current**: $12.99/month per child
- Each child has independent subscription
- Managed from parent account
- Add/remove children anytime
- Immediate activation

**No Family Plan Needed**: Parents don't need a special "family plan". They just add children and each child subscription is billed separately.

## User Experience

### New Parent Flow
```
1. Land on website → See "Add multiple children from dashboard" messaging
2. Subscribe for first child ($12.99/month)
3. Navigate to Account Settings
4. Click "Add Child Account"
5. Create child profile
6. Subscribe additional child (another $12.99/month)
7. Manage all from one dashboard
```

### Existing Parent Flow
```
1. Already subscribed
2. Go to Account Settings
3. See "Manage Child Subscriptions" section
4. Add new child → Creates account → Subscribe
5. Monitor in Parent Dashboard
```

## Benefits of This Approach

✅ **Flexible**: Add/remove children anytime
✅ **Transparent**: Clear per-child pricing
✅ **Simple**: No complex "family plan" tiers
✅ **Fair**: Only pay for active children
✅ **Scalable**: No limit on number of children
✅ **Independent**: Each child has own account and data

## Privacy & Compliance

### COPPA Compliance (Children Under 13)
- Parents provide verifiable consent during child signup
- Stored in `parental_consent` column
- Parents can review/delete child data anytime
- Minimal data collection for children

### Data Privacy
- Each child's data is separate
- Parents have view-only access to progress
- Children's accounts are protected
- RLS (Row Level Security) enforces permissions

## Troubleshooting

### Child Not Showing in Parent Dashboard
- Check that child profile has correct `parent_id`
- Verify parent is logged in
- Check RLS policies in Supabase

### Can't Remove Child
- Ensure child has active subscription
- Check that `subscription_id` exists in profile
- Verify Stripe webhook is working

### Billing Issues
- Each child needs separate Stripe subscription
- Check Stripe customer portal for details
- Verify webhook events are being processed

## Future Enhancements

Potential improvements:
- Bulk discount (e.g., 3+ children get 10% off)
- Family dashboard with combined analytics
- Sibling interaction features
- Multi-year discounts
- Referral bonuses

## Related Files

- `src/components/manage-child-subscriptions.tsx` - Main management UI
- `src/components/parent-dashboard.tsx` - Progress monitoring
- `src/app/(app)/account/account-form.tsx` - Account settings page
- `src/app/api/remove-child-from-subscription/route.ts` - API endpoint
- `src/middleware.ts` - Privacy enforcement
- `docs/PRIVACY_AGREEMENT_SETUP.md` - Privacy and consent flow

## Support

For questions about multi-child subscriptions:
1. Check FAQ at `/faq`
2. Visit Account Settings for management options
3. Email support for billing questions
4. Use Stripe customer portal for payment details

