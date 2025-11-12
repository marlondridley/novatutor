-- Create cornell_notes table
CREATE TABLE IF NOT EXISTS cornell_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  cue_column TEXT[] DEFAULT '{}',
  note_body TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cornell_notes_user_id ON cornell_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_cornell_notes_subject ON cornell_notes(subject);
CREATE INDEX IF NOT EXISTS idx_cornell_notes_tags ON cornell_notes USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE cornell_notes ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own notes
CREATE POLICY "Users can read own cornell notes"
  ON cornell_notes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cornell notes"
  ON cornell_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cornell notes"
  ON cornell_notes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cornell notes"
  ON cornell_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cornell_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER cornell_notes_updated_at
  BEFORE UPDATE ON cornell_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_cornell_notes_updated_at();

