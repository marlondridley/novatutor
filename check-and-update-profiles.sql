-- ============================================
-- CHECK AND UPDATE PROFILES TABLE SCHEMA
-- ============================================
-- Run these commands in Supabase SQL Editor to ensure your profiles table
-- has all the required columns for avatar uploads and subscriptions.

-- 1️⃣ FIRST: Check your current table structure
-- Copy and run this to see what columns you currently have:

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2️⃣ SECOND: Add missing columns (if needed)
-- Run each ALTER TABLE command one at a time.
-- If a column already exists, you'll get an error - that's OK, just continue!

-- Add avatar_url column (for profile pictures)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add subscription columns (if you haven't already)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' 
CHECK (subscription_status IN ('free', 'active', 'trialing', 'past_due', 'canceled'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_id TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Add timestamps (if you don't have them)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3️⃣ THIRD: Verify the changes
-- Run this again to confirm all columns are present:

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 4️⃣ EXPECTED COLUMNS:
-- You should see ALL of these columns:
-- ✅ id (uuid)
-- ✅ email (text)
-- ✅ name (text)
-- ✅ age (integer)
-- ✅ grade (text)
-- ✅ role (text, default 'student')
-- ✅ avatar_url (text) ⭐ NEW
-- ✅ subscription_status (text, default 'free')
-- ✅ subscription_id (text)
-- ✅ subscription_expires_at (timestamptz)
-- ✅ created_at (timestamptz)
-- ✅ updated_at (timestamptz)

-- ============================================
-- NOTES:
-- - "ADD COLUMN IF NOT EXISTS" is safe to run multiple times
-- - If you see "column already exists" errors, that's GOOD! 
-- - It means you already have that column.
-- ============================================

