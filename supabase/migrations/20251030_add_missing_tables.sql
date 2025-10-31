-- Migration: Add Missing Tables for Production
-- Created: 2025-10-30
-- Description: Adds webhook events, conversation history, quiz results, and session analytics tables

-- ============================================
-- 1. Webhook Events Table (Idempotency)
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB,
  status TEXT DEFAULT 'processed' CHECK (status IN ('processed', 'failed', 'pending')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- RLS Policies (service role only)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage webhook events"
  ON webhook_events
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

COMMENT ON TABLE webhook_events IS 'Stores Stripe webhook events for idempotency and tracking';

-- ============================================
-- 2. Conversations Table (Chat History)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('Math', 'Science', 'Writing')),
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_subject ON conversations(subject);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversations_updated_at();

COMMENT ON TABLE conversations IS 'Stores AI tutor conversation history';

-- ============================================
-- 3. Quiz Results Table
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('quiz', 'flashcards')),
  questions JSONB NOT NULL,
  answers JSONB,
  score DECIMAL(5,2),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER,
  time_spent_seconds INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_subject ON quiz_results(subject);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON quiz_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed ON quiz_results(completed);

-- RLS Policies
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz results"
  ON quiz_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz results"
  ON quiz_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz results"
  ON quiz_results
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Parents can view children's quiz results
CREATE POLICY "Parents can view children quiz results"
  ON quiz_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = quiz_results.user_id
      AND profiles.parent_id = auth.uid()
    )
  );

COMMENT ON TABLE quiz_results IS 'Stores quiz and test prep results for progress tracking';

-- ============================================
-- 4. AI Sessions Table (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('tutor', 'homework', 'quiz', 'tts', 'stt', 'learning_path', 'coaching')),
  subject TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  message_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_session_type ON ai_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_started_at ON ai_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_cost ON ai_sessions(cost_usd DESC);

-- RLS Policies
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON ai_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all sessions"
  ON ai_sessions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Parents can view children's sessions
CREATE POLICY "Parents can view children sessions"
  ON ai_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = ai_sessions.user_id
      AND profiles.parent_id = auth.uid()
    )
  );

COMMENT ON TABLE ai_sessions IS 'Tracks AI usage for analytics and cost monitoring';

-- ============================================
-- 5. User Feedback Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id UUID REFERENCES ai_sessions(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  feedback_type TEXT CHECK (feedback_type IN ('bug', 'feature', 'general', 'ai_quality')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_session_id ON user_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);

-- RLS Policies
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create feedback"
  ON user_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
  ON user_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE user_feedback IS 'Stores user feedback and ratings';

-- ============================================
-- 6. Helper Functions
-- ============================================

-- Function to check if webhook event was already processed
CREATE OR REPLACE FUNCTION is_webhook_processed(event_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM webhook_events
    WHERE stripe_event_id = event_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's quiz statistics
CREATE OR REPLACE FUNCTION get_quiz_stats(p_user_id UUID)
RETURNS TABLE (
  total_quizzes BIGINT,
  completed_quizzes BIGINT,
  average_score DECIMAL,
  total_time_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_quizzes,
    COUNT(*) FILTER (WHERE completed = TRUE)::BIGINT as completed_quizzes,
    AVG(score) FILTER (WHERE completed = TRUE) as average_score,
    (SUM(time_spent_seconds) FILTER (WHERE completed = TRUE) / 60)::INTEGER as total_time_minutes
  FROM quiz_results
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's AI usage statistics
CREATE OR REPLACE FUNCTION get_ai_usage_stats(p_user_id UUID, days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_sessions BIGINT,
  total_messages BIGINT,
  total_cost DECIMAL,
  avg_session_duration INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_sessions,
    SUM(message_count)::BIGINT as total_messages,
    SUM(cost_usd) as total_cost,
    AVG(duration_seconds)::INTEGER as avg_session_duration
  FROM ai_sessions
  WHERE user_id = p_user_id
    AND started_at >= NOW() - (days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Grants
-- ============================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON quiz_results TO authenticated;
GRANT SELECT ON ai_sessions TO authenticated;
GRANT SELECT, INSERT ON user_feedback TO authenticated;

-- Grant service role full access
GRANT ALL ON webhook_events TO service_role;
GRANT ALL ON ai_sessions TO service_role;

-- ============================================
-- Migration Complete
-- ============================================

-- Insert migration record
INSERT INTO public.schema_migrations (version, name)
VALUES ('20251030', 'add_missing_tables')
ON CONFLICT (version) DO NOTHING;
