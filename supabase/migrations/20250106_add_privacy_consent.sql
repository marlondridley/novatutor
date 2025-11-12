-- Add privacy consent tracking to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS parental_consent BOOLEAN,
ADD COLUMN IF NOT EXISTS parental_consent_date TIMESTAMP WITH TIME ZONE;

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_accepted ON profiles(privacy_accepted);

-- Add comment explaining the columns
COMMENT ON COLUMN profiles.privacy_accepted IS 'Whether the user has accepted the privacy policy';
COMMENT ON COLUMN profiles.privacy_accepted_at IS 'Timestamp when privacy policy was accepted';
COMMENT ON COLUMN profiles.parental_consent IS 'Whether parental consent was given (for users under 13)';
COMMENT ON COLUMN profiles.parental_consent_date IS 'Timestamp when parental consent was given';

