# 🔐 Session Persistence - Stay Logged In

## ✅ What's Configured

Your app now **remembers users** and keeps them logged in!

### **Session Settings:**

- ✅ **Auto-refresh tokens** - Session renews automatically
- ✅ **localStorage storage** - Survives browser restarts
- ✅ **Cross-tab sync** - Login in one tab = logged in everywhere
- ✅ **7+ day sessions** - Users stay logged in for a week+

---

## 🔄 How It Works

### **Before (Default Supabase):**
```
User logs in → Session expires in 1 hour
User closes browser → Session lost
User reopens → Must log in again ❌
```

### **After (With Persistence):**
```
User logs in → Session stored in localStorage
Session auto-refreshes before expiring
User closes browser → Session saved
User reopens days later → Still logged in ✅
```

---

## ⚙️ Technical Details

### **Configuration in `src/lib/supabase.ts`:**

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store in localStorage (persists across browser restarts)
    storage: window.localStorage,
    
    // Auto-refresh before token expires
    autoRefreshToken: true,
    
    // Keep session alive across tabs/windows
    persistSession: true,
    
    // Handle email confirmations, password resets
    detectSessionInUrl: true,
    
    // Storage key for the session
    storageKey: 'supabase.auth.token',
  },
});
```

### **Token Lifecycle:**

1. **User logs in** → Access token + refresh token stored
2. **Access token expires** (1 hour) → Auto-refreshed with refresh token
3. **Refresh token valid** → 7+ days (configurable in Supabase)
4. **User stays logged in** → As long as they use the app within 7 days

---

## 🧪 Testing

### **Test Persistence:**

1. **Login** to your app
2. **Close browser completely**
3. **Reopen browser**
4. **Go to app** → Should still be logged in ✅

### **Test Auto-Refresh:**

1. **Login** to your app
2. **Wait 1 hour** (or check browser localStorage)
3. **Use the app** → Token auto-refreshes in background
4. **Still logged in** ✅

### **Check localStorage:**

Open browser console:
```javascript
// View stored session
localStorage.getItem('supabase.auth.token')

// Should see: access_token, refresh_token, etc.
```

---

## 🔒 Security

### **What's Stored:**

```
localStorage:
  - supabase.auth.token (session data)
    - access_token (expires in 1 hour)
    - refresh_token (expires in 7 days)
    - user metadata
```

### **Is This Safe?**

✅ **YES** - Supabase tokens are signed and validated server-side

⚠️ **Note:**
- Don't store sensitive data in tokens
- Tokens are client-side accessible (like any cookie/storage)
- Use HTTPS in production (Vercel provides this)
- Refresh tokens rotate on each use

---

## ⏰ Session Duration

### **Default Behavior:**

- **Access Token:** 1 hour (auto-refreshes)
- **Refresh Token:** 7 days (configurable)
- **Inactivity:** User logged out after 7 days of no activity

### **Change Session Duration:**

In **Supabase Dashboard:**

1. Go to **Authentication** → **Settings**
2. Find **JWT expiry limit**
3. Set to desired value:
   - `3600` = 1 hour (default)
   - `86400` = 24 hours
   - `604800` = 7 days

4. Find **Refresh Token Rotation**
5. Enable for better security

---

## 🔄 Logout Behavior

### **When User Clicks Logout:**

```typescript
await supabase.auth.signOut();
// Clears localStorage
// Invalidates tokens
// Removes session
```

### **Automatic Logout:**

Users are auto-logged out when:
- ❌ They explicitly click "Logout"
- ❌ Refresh token expires (7 days of inactivity)
- ❌ They clear browser data
- ❌ Session is revoked (you can do this in Supabase dashboard)

---

## 👥 Multiple Devices

### **Cross-Device Sessions:**

Users can be logged in on multiple devices:
- ✅ Desktop browser
- ✅ Mobile browser
- ✅ Tablet
- ✅ Multiple browsers

Each device has its own session token.

### **Logout One Device:**

Only logs out current device:
```typescript
await supabase.auth.signOut();
// Other devices stay logged in
```

### **Logout All Devices:**

From Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Find user
3. Click **Revoke All Sessions**

Or programmatically:
```typescript
await supabase.auth.admin.signOut(userId, 'global');
```

---

## 🐛 Troubleshooting

### **Issue: User logged out unexpectedly**

**Causes:**
- Refresh token expired (7+ days inactive)
- Browser cleared localStorage
- Session revoked in Supabase

**Fix:**
- User just needs to log in again
- Session will persist for another 7 days

### **Issue: Session not persisting**

**Check:**
```typescript
// In browser console
localStorage.getItem('supabase.auth.token')
// Should return session data
```

**If null:**
- Check Supabase URL/key are correct
- Verify localStorage is enabled (not in private/incognito mode)
- Check browser console for errors

### **Issue: Token refresh failing**

**Check Supabase Dashboard:**
- Auth → Logs
- Look for refresh errors
- Verify API keys are correct

---

## 📊 Monitor Sessions

### **In Supabase Dashboard:**

1. **Authentication** → **Users**
2. See **Last Sign In** timestamp
3. Click user → View **Active Sessions**

### **Query Active Sessions:**

```sql
-- See all users with recent activity
SELECT 
  email,
  last_sign_in_at,
  NOW() - last_sign_in_at as time_since_login
FROM auth.users
WHERE last_sign_in_at > NOW() - INTERVAL '7 days'
ORDER BY last_sign_in_at DESC;
```

---

## 🎯 Best Practices

### **For Users:**
- ✅ Sessions last 7 days
- ✅ Auto-refresh keeps you logged in
- ✅ Safe to close browser
- ✅ Works across tabs

### **For Developers:**
- ✅ Don't store sensitive data in tokens
- ✅ Use HTTPS in production
- ✅ Monitor session logs
- ✅ Rotate refresh tokens
- ✅ Implement "remember me" UI if needed

### **For Security:**
- ✅ Enable refresh token rotation
- ✅ Use short access token expiry (1 hour)
- ✅ Longer refresh token expiry (7 days)
- ✅ Implement rate limiting on auth endpoints
- ✅ Monitor for suspicious activity

---

## 🔐 Advanced: "Remember Me" Option

### **Optional: Add UI Toggle**

If you want to give users a choice:

```typescript
// Login component
const [rememberMe, setRememberMe] = useState(true);

// On login
if (rememberMe) {
  // Use localStorage (default)
  supabase.auth.signInWithPassword({email, password});
} else {
  // Use sessionStorage (cleared on browser close)
  const sessionClient = createClient(url, key, {
    auth: { 
      storage: window.sessionStorage,
      persistSession: true,
    }
  });
  sessionClient.auth.signInWithPassword({email, password});
}
```

---

## ✅ Summary

**What you have:**
- ✅ Users stay logged in across browser restarts
- ✅ Sessions auto-refresh for 7+ days
- ✅ Works across multiple tabs
- ✅ Secure token storage
- ✅ Automatic cleanup on logout

**What users experience:**
- ✅ Login once, stay logged in for days
- ✅ No annoying re-logins
- ✅ Seamless experience across devices

**Security:**
- ✅ Tokens expire and rotate
- ✅ Supabase handles security
- ✅ HTTPS enforced
- ✅ Server-side validation

---

## 🎉 You're All Set!

**Users will now:**
- Login once
- Stay logged in for 7+ days
- Only need to re-login after:
  - 7 days of inactivity
  - Clearing browser data
  - Explicit logout

**No more annoying 24-hour logouts!** 🎊

---

**Test it:** Login, close browser, reopen → Still logged in! ✅

