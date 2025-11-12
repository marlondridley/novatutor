-- Add privacy_accepted column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS parental_consent BOOLEAN,
ADD COLUMN IF NOT EXISTS parental_consent_date TIMESTAMP WITH TIME ZONE;

-- Update existing users to have privacy accepted (since they already signed up)
UPDATE profiles 
SET privacy_accepted = TRUE, 
    privacy_accepted_at = created_at
WHERE privacy_accepted IS NULL OR privacy_accepted = FALSE;

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_accepted ON profiles(privacy_accepted);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('privacy_accepted', 'privacy_accepted_at', 'parental_consent', 'parental_consent_date');

