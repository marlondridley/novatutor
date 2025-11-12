-- Add Premium Voice feature flags to profiles table
-- This enables $2/month upsell for OpenAI Whisper transcription

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS premium_voice_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS premium_voice_expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster premium voice checks
CREATE INDEX IF NOT EXISTS idx_profiles_premium_voice 
ON profiles(premium_voice_enabled) 
WHERE premium_voice_enabled = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN profiles.premium_voice_enabled IS 
'Enables OpenAI Whisper API for 99% accurate speech-to-text. $2/month add-on.';

COMMENT ON COLUMN profiles.premium_voice_expires_at IS 
'When premium voice subscription expires. NULL = lifetime or no expiration.';

-- Create voice usage tracking table (for monitoring API costs)
CREATE TABLE IF NOT EXISTS voice_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_type TEXT NOT NULL CHECK (voice_type IN ('free', 'premium')),
  duration_seconds INTEGER NOT NULL,
  estimated_cost DECIMAL(10, 6) DEFAULT 0, -- Whisper cost: $0.006 per minute
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for usage queries
CREATE INDEX IF NOT EXISTS idx_voice_usage_logs_user_id 
ON voice_usage_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_voice_usage_logs_created_at 
ON voice_usage_logs(created_at);

-- Enable Row Level Security
ALTER TABLE voice_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can read their own usage logs
CREATE POLICY "Users can read own voice usage logs"
  ON voice_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies: Users can insert their own usage logs
CREATE POLICY "Users can insert own voice usage logs"
  ON voice_usage_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to calculate monthly usage for a user
CREATE OR REPLACE FUNCTION get_monthly_voice_usage(p_user_id UUID)
RETURNS TABLE (
  total_minutes INTEGER,
  premium_minutes INTEGER,
  estimated_cost DECIMAL(10, 6)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(duration_seconds / 60)::INTEGER as total_minutes,
    SUM(CASE WHEN voice_type = 'premium' THEN duration_seconds / 60 ELSE 0 END)::INTEGER as premium_minutes,
    SUM(estimated_cost) as estimated_cost
  FROM voice_usage_logs
  WHERE user_id = p_user_id
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_monthly_voice_usage(UUID) TO authenticated;

