# Privacy Agreement Setup Guide

## Overview

NovaTutor requires all users to accept the Privacy Policy before using the app. For users under 13, **parental consent is required** per COPPA regulations.

## How It Works

### 1. Database Tracking

The `profiles` table tracks privacy consent with these columns:

```sql
privacy_accepted          BOOLEAN DEFAULT FALSE
privacy_accepted_at       TIMESTAMP
parental_consent          BOOLEAN (for users under 13)
parental_consent_date     TIMESTAMP
```

### 2. Signup Flow

When a new user signs up:
1. User creates account via `/login` page
2. Middleware checks if `privacy_accepted = true`
3. If not accepted, redirects to `/privacy-agreement`
4. User must review and accept before accessing the app

### 3. Parental Consent (COPPA)

For users under 13:
- Age is checked from the profile
- Additional checkbox appears: "Parental Consent Required"
- Parent/guardian must check both boxes to proceed
- Both `privacy_accepted` and `parental_consent` are saved

### 4. Access Control

**Middleware** (`src/middleware.ts`) enforces:
- ✅ Public routes: accessible to anyone
- ✅ `/privacy-agreement`: accessible to logged-in users
- ❌ All other routes: require `privacy_accepted = true`

**Protected Routes:**
- `/dashboard`
- `/tutor`
- `/learning-path`
- `/account`
- All app routes under `/(app)/`

## Database Migration

Run this migration to add the consent tracking:

```bash
# Apply migration
psql -U postgres -d novatutor < supabase/migrations/20250106_add_privacy_consent.sql

# Or in Supabase Dashboard:
# Go to SQL Editor and run the contents of the migration file
```

## Testing

### Test Case 1: New User Signup
1. Create new account at `/login`
2. Should automatically redirect to `/privacy-agreement`
3. Try to navigate to `/dashboard` → should redirect back
4. Accept privacy policy
5. Should redirect to `/dashboard` successfully

### Test Case 2: User Under 13
1. Create account with age < 13
2. Redirected to `/privacy-agreement`
3. See additional "Parental Consent" checkbox
4. Must check both boxes to proceed
5. Profile updated with both `privacy_accepted` and `parental_consent`

### Test Case 3: Existing Users
1. Existing users with `privacy_accepted = NULL` or `FALSE`
2. On next login, redirected to `/privacy-agreement`
3. Must accept to continue using the app

### Test Case 4: Already Accepted
1. User with `privacy_accepted = TRUE`
2. Can access all routes normally
3. No redirect to agreement page

## User Experience

### First-Time Users
```
Signup → Email Verification → Privacy Agreement → Dashboard
```

### Returning Users (No Consent)
```
Login → Privacy Agreement → Dashboard
```

### Returning Users (With Consent)
```
Login → Dashboard
```

## Admin Checklist

- [ ] Run database migration
- [ ] Test new user signup flow
- [ ] Test user under 13 (parental consent)
- [ ] Verify middleware redirects work
- [ ] Test that accepted users can access app
- [ ] Verify privacy data is saved correctly

## Privacy Policy Updates

If you update the Privacy Policy:

1. Update the version date in `/privacy-agreement/page.tsx`
2. Consider requiring users to re-accept:
   ```sql
   UPDATE profiles SET privacy_accepted = FALSE WHERE privacy_accepted_at < '2025-01-06';
   ```
3. Users will be prompted to accept the new policy on next login

## Compliance Notes

### COPPA (Children Under 13)
✅ Parental consent required before data collection
✅ Minimal data collection for children
✅ Parents can review/delete child's data
✅ No third-party advertising to children

### GDPR (If applicable)
✅ Clear consent mechanism
✅ Right to access data
✅ Right to delete data
✅ Data portability available

### Best Practices
✅ Versioned privacy policy (date tracked)
✅ Consent timestamp recorded
✅ Cannot bypass agreement
✅ Can review policy before accepting
✅ Clear decline option

## Troubleshooting

### User stuck in redirect loop
- Check if middleware is properly checking `privacy_accepted`
- Verify database column exists and is accessible
- Check Supabase RLS policies allow updates to profiles table

### Parental consent not showing
- Verify user's age is < 13 in profiles table
- Check that `isUnder13` state is being set correctly

### Can't access app after accepting
- Check that database was updated successfully
- Verify no middleware errors in server logs
- Check browser console for any JavaScript errors

## Code Locations

- **Agreement Page**: `src/app/privacy-agreement/page.tsx`
- **Middleware**: `src/middleware.ts`
- **Modal Component**: `src/components/privacy-agreement-modal.tsx`
- **Full Privacy Policy**: `src/app/privacy/page.tsx`
- **Database Migration**: `supabase/migrations/20250106_add_privacy_consent.sql`

## Support

For issues or questions:
1. Check server logs for errors
2. Verify database migration ran successfully
3. Test with browser developer tools open
4. Review Supabase logs for any auth/database errors

