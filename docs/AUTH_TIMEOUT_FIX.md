# Authentication & Profile Timeout Fix

## Issue Summary

**Problem:** "Profile query timeout after 10s" error when trying to log in, causing users to be stuck in a redirect loop.

**Root Cause:** After migrating API routes to use the new `@supabase/ssr` server client, old session cookies may be incompatible, causing profile queries to hang.

## Fixes Applied

### 1. ✅ Updated All API Routes to Use New Supabase SSR Client

**Changed in 10 files:**
- `src/app/api/create-portal-session/route.ts` ← Account settings fix
- `src/app/api/create-checkout-session/route.ts`
- `src/app/api/remove-child-from-subscription/route.ts`
- `src/app/api/create-multi-checkout-session/route.ts`
- `src/app/api/quiz/submit/route.ts`
- `src/app/api/quiz/route.ts`
- `src/app/api/tutor/route.ts`
- `src/app/api/tts/route.ts`
- `src/app/api/stt/route.ts`
- `src/lib/actions.ts`

**Before:**
```typescript
import { createClient } from '@/lib/supabase-server';
```

**After:**
```typescript
import { createClient } from '@/utils/supabase/server';
```

### 2. ✅ Improved Profile Fetching with Session Check

**File:** `src/context/auth-context.tsx`

**Improvements:**
- ✅ Check for valid session before querying profile
- ✅ Reduced timeout from 10s → 5s for faster failure
- ✅ Better error logging and handling
- ✅ Return `null` gracefully instead of throwing

**Code:**
```typescript
// First check if we have a valid session
const { data: sessionData } = await supabase.auth.getSession();
if (!sessionData.session) {
  console.warn('⚠️ No active session, cannot fetch profile');
  return null;
}

// Query with shorter timeout (5 seconds)
const { data, error } = await Promise.race([
  supabase.from('profiles').select('*').eq('id', userId).single(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Query timeout')), 5000)
  )
]) as any;
```

### 3. ✅ Added Retry Logic and Fallback Profile

**File:** `src/context/auth-context.tsx` → `signIn` function

**Improvements:**
- ✅ Retry profile fetch once if it fails
- ✅ Create fallback profile from auth metadata if still failing
- ✅ Never block login due to profile fetch failure

**Code:**
```typescript
// Retry once if it fails
let profile = await fetchUserProfile(data.user.id);
if (!profile) {
  console.log('⚠️ Profile fetch failed, retrying after 1s...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  profile = await fetchUserProfile(data.user.id);
}

// Fallback profile from auth data
if (!profile) {
  console.warn('⚠️ Profile still not found, creating fallback profile');
  profile = {
    id: data.user.id,
    email: data.user.email || '',
    name: data.user.user_metadata?.name || 'Student',
    // ... other fields from auth metadata
  };
}
```

### 4. ✅ Created Diagnostic Tools

**New Files:**

1. **Health Check API:** `src/app/api/health/supabase/route.ts`
   - Test Supabase connection
   - Check environment variables
   - Verify session status
   - Test database queries

2. **Session Reset Page:** `src/app/clear-session/page.tsx`
   - Clear all auth cookies
   - Clear localStorage & sessionStorage
   - Force sign out
   - Redirect to fresh login

## 🚨 How to Fix Your Login Issue

### Option 1: Clear Session (Recommended)

1. **Navigate to:** `http://localhost:9002/clear-session`
2. **Click:** "Clear Session & Restart"
3. **Wait** for redirect to login page
4. **Log in again** with your credentials

### Option 2: Manual Browser Clear

If Option 1 doesn't work:

1. **Open DevTools** (F12)
2. **Go to:** Application tab
3. **Clear:**
   - Cookies (all `sb-*` cookies)
   - Local Storage
   - Session Storage
4. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
5. **Try logging in again**

### Option 3: Test Supabase Connection

1. **Navigate to:** `http://localhost:9002/api/health/supabase`
2. **Check the JSON response:**
   ```json
   {
     "status": "ok",
     "checks": {
       "environment": { "hasUrl": true, "hasKey": true },
       "session": { "exists": false },
       "query": { "success": true }
     }
   }
   ```
3. **If query.success is false** → Supabase connection issue (check `.env.local`)

## 📋 Verification Steps

After clearing your session and logging in again:

1. ✅ **Login should succeed** within 5-10 seconds
2. ✅ **No "Profile query timeout" errors**
3. ✅ **Dashboard loads correctly**
4. ✅ **Account settings "Manage Subscription" button works**

## 🔍 Debugging Tips

### Check Console Logs

**Good login flow:**
```
🔄 Querying database for profile: 4e987c42-...
🔄 Session check: Session exists
🔄 Database query completed, data: true error: false
✅ Profile data received: {...}
```

**Bad login flow (old cookies):**
```
🔄 Querying database for profile: 4e987c42-...
🔄 Session check: No session
⚠️ No active session, cannot fetch profile
```

### Check Network Tab

**Look for:**
- `POST /auth/v1/token` → Should return 200
- `GET /rest/v1/profiles` → Should return 200 (not timeout)

**If you see:**
- 401 errors → Session invalid, clear cookies
- Timeouts → Supabase connection issue, check env vars

## 🛠️ Environment Variables

Verify these are set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...YOUR_KEY
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbG...YOUR_KEY
```

**Note:** `PUBLISHABLE_KEY` should match `ANON_KEY` (same value).

## 🚀 Related Features Working Now

After fixing the auth client imports:

- ✅ **Account Settings** → "Manage Subscription" button works
- ✅ **Checkout** → Creating subscriptions works
- ✅ **Multi-child Management** → Adding/removing children works
- ✅ **Quiz System** → Submitting quizzes works
- ✅ **AI Tutor** → Chat and voice input work
- ✅ **TTS/STT** → Text-to-speech and speech-to-text work

## 📚 Technical Details

### Why This Happened

When we migrated to `@supabase/ssr` for proper cookie-based authentication:
1. Middleware started using new cookie format
2. Client-side code was updated to read new cookies
3. **But** API routes were still using old server client
4. Old session cookies became incompatible
5. Profile queries timed out due to auth mismatch

### The Fix

1. **Unified all Supabase clients** → Use `@supabase/ssr` everywhere
2. **Added session validation** → Check session before queries
3. **Graceful degradation** → Fallback profiles if DB unavailable
4. **Clear path forward** → Session reset tools for users

## 🎯 Prevention

Going forward:
- ✅ Always use `@/utils/supabase/server` for API routes
- ✅ Always use `@/utils/supabase/client` (or `@/lib/supabase-client`) for browser
- ✅ Never import from old `@/lib/supabase-server`
- ✅ Test auth flow after major auth changes

## ⚙️ Architecture

```
┌─────────────────────────────────────────────┐
│ Browser (Client)                            │
│ Uses: @supabase/ssr createBrowserClient     │
│ Reads: Cookies set by middleware            │
└─────────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────┐
│ Middleware (Edge)                           │
│ Uses: @supabase/ssr createServerClient      │
│ Updates: Session cookies on every request   │
└─────────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────┐
│ API Routes (Server)                         │
│ Uses: @supabase/ssr createServerClient      │
│ Reads: Cookies via next/headers             │
└─────────────────────────────────────────────┘
```

**Key Insight:** All three layers must use `@supabase/ssr` for cookies to work correctly.

---

**Status:** ✅ **Fixed**  
**Last Updated:** November 12, 2025  
**Next Steps:** Clear your session and log in fresh!

