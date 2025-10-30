# 📸 Avatar Upload Setup Guide

Complete guide to enable avatar/profile picture uploads in SuperNOVA Tutor.

---

## 🗄️ **1. Update Database Schema**

Add the `avatar_url` column to your `profiles` table in Supabase:

### SQL Command

```sql
-- Add avatar_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN avatar_url TEXT;
```

Run this in **Supabase Dashboard** → **SQL Editor** → **New Query**

---

## 🪣 **2. Create Storage Bucket**

### Step 1: Create the Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Name: `avatars`
4. **Public bucket:** ✅ **YES** (so avatars can be displayed)
5. Click **"Create bucket"**

### Step 2: Configure Storage Policies

Run these policies in **SQL Editor** to allow authenticated users to upload/read avatars:

```sql
-- Policy: Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## ✅ **3. Verify Setup**

### Test Avatar Upload

1. **Navigate to:** `http://localhost:9002/account`
2. Click **"Upload Avatar"**
3. Select an image (JPG, PNG, GIF)
4. Check that:
   - ✅ Image uploads successfully
   - ✅ Avatar displays in the account page
   - ✅ Avatar appears in the user menu (top right)

### Check Storage

1. Go to **Supabase Dashboard** → **Storage** → **avatars**
2. You should see your uploaded file: `{user-id}-{random}.{ext}`

---

## 📁 **Files Created/Updated**

### New Files
- ✅ `src/components/avatar-upload.tsx` - Avatar upload component
- ✅ `src/app/(app)/account/account-form.tsx` - Account form with avatar
- ✅ `AVATAR_SETUP.md` - This setup guide

### Updated Files
- ✅ `src/app/(app)/account/page.tsx` - Refactored to use AccountForm
- ✅ `src/components/user-nav.tsx` - Displays avatar in menu
- ✅ `src/context/auth-context.tsx` - Updated profile type

---

## 🎨 **Features**

### Avatar Upload Component
- ✅ Drag-and-drop file input
- ✅ Image preview (circular avatar)
- ✅ File validation (2MB max, images only)
- ✅ Loading states
- ✅ Error handling
- ✅ Fallback to initials if no avatar

### User Experience
- ✅ Avatar displayed in user dropdown menu
- ✅ Avatar on account settings page
- ✅ Upload button with icon
- ✅ File size/type restrictions

---

## 🔧 **Troubleshooting**

### Error: "new row violates row-level security"
**Solution:** Make sure you've created the storage policies above.

### Error: "Bucket not found"
**Solution:** Create the `avatars` bucket in Supabase Storage.

### Avatar not displaying
**Solution:** 
1. Check that the bucket is **public**
2. Verify the `avatar_url` is saved in the database
3. Check browser console for errors

### Upload fails silently
**Solution:**
1. Check file size (must be < 2MB)
2. Verify file type (must be image/*)
3. Check Supabase logs in dashboard

---

## 🔐 **Security Features**

- ✅ File size validation (2MB max)
- ✅ File type validation (images only)
- ✅ Users can only upload to their own folder
- ✅ RLS policies prevent unauthorized access
- ✅ Unique filenames prevent conflicts

---

## 📊 **Database Schema**

### Updated `profiles` Table

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  grade TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  avatar_url TEXT,  -- ⭐ NEW FIELD
  subscription_status TEXT DEFAULT 'free',
  subscription_id TEXT,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 **Quick Start**

```bash
# 1. Update database schema (run SQL above in Supabase)
# 2. Create storage bucket (follow steps above)
# 3. Set up storage policies (run SQL above)
# 4. Restart your dev server
npm run dev

# 5. Navigate to account page
open http://localhost:9002/account

# 6. Upload an avatar!
```

---

## 📚 **Resources**

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

---

**Avatar upload is now fully functional! 🎉**

