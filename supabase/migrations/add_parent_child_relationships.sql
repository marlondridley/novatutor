-- Add parent_id column to profiles table for family relationships
-- This allows parents to manage children's subscriptions

-- Step 1: Add parent_id column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Step 2: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_parent_id ON profiles(parent_id);

-- Step 3: Add helpful comments
COMMENT ON COLUMN profiles.parent_id IS 'ID of the parent/guardian who manages this account';

-- Step 4: Create a view for easy family management
CREATE OR REPLACE VIEW family_accounts AS
SELECT 
  p.id,
  p.email,
  p.name,
  p.subscription_status,
  p.subscription_id,
  p.parent_id,
  parent.email as parent_email,
  parent.name as parent_name
FROM profiles p
LEFT JOIN profiles parent ON p.parent_id = parent.id;

-- Step 5: Add RLS policy to allow parents to view their children
DROP POLICY IF EXISTS "Parents can view their children" ON profiles;
CREATE POLICY "Parents can view their children"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR auth.uid() = parent_id
  );

-- Step 6: Add RLS policy to allow parents to update their children's subscriptions
DROP POLICY IF EXISTS "Parents can update children subscriptions" ON profiles;
CREATE POLICY "Parents can update children subscriptions"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = id 
    OR auth.uid() = parent_id
  );

-- Step 7: Function to get all children for a parent
CREATE OR REPLACE FUNCTION get_managed_children(parent_user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  subscription_status TEXT,
  subscription_id TEXT
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id,
    email,
    name,
    subscription_status,
    subscription_id
  FROM profiles
  WHERE parent_id = parent_user_id
  ORDER BY name, email;
$$;

-- Step 8: Function to verify parent ownership
CREATE OR REPLACE FUNCTION verify_parent_ownership(child_id UUID, parent_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = child_id
    AND parent_id = parent_user_id
  );
$$;

