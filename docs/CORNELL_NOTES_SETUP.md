# 🧠 Cornell Notes - Setup Guide

## ✅ What We Built

A complete **Cornell Notes Learning Journal** system integrated into Study Coach:

### **Features:**
- ✅ 3-zone Cornell layout (Cue Column | Notes | Summary)
- ✅ Auto-save every 2 seconds
- ✅ AI-powered cue question suggestions
- ✅ Search and filter by subject/topic
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Row Level Security (users only see their own notes)
- ✅ Beautiful UI with shadcn/ui components
- ✅ Mobile responsive design

---

## 🗄️ DATABASE SETUP (REQUIRED)

### **Step 1: Run SQL Migration**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire SQL below and paste it:

```sql
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
```

6. Click **Run** or press `Ctrl+Enter`
7. You should see: ✅ **"Success. No rows returned"**

### **Step 2: Verify Table Created**

1. Go to **Table Editor** in Supabase Dashboard
2. You should see a new table: **`cornell_notes`**
3. Click on it to see the schema

---

## 📁 FILES CREATED

### **Backend (API Routes)**
- ✅ `src/app/api/notes/route.ts` - List & Create notes
- ✅ `src/app/api/notes/[id]/route.ts` - Get, Update, Delete note
- ✅ `src/app/api/notes/suggest-cues/route.ts` - AI cue generation

### **Frontend (Pages)**
- ✅ `src/app/(app)/journal/page.tsx` - Journal list view
- ✅ `src/app/(app)/journal/new/page.tsx` - Create new note
- ✅ `src/app/(app)/journal/[id]/page.tsx` - Edit existing note

### **Components**
- ✅ `src/components/cornell-note-editor.tsx` - Main editor component

### **Database**
- ✅ `supabase/migrations/20250112_create_cornell_notes.sql` - Migration file

### **Navigation**
- ✅ Updated `src/app/(app)/layout.tsx` - Added "Learning Journal" to sidebar

---

## 🚀 HOW TO USE

### **1. Access the Journal**

After running the SQL migration, restart your dev server:

```bash
npm run dev
```

Then navigate to: **http://localhost:9002/journal**

Or click **"Learning Journal"** in the sidebar.

### **2. Create Your First Note**

1. Click **"New Note"** button
2. Fill in:
   - **Subject**: e.g., "Algebra"
   - **Topic**: e.g., "Quadratic Equations"
3. Start taking notes in the 3 zones:
   - **Cue Column** (left): Questions & key concepts
   - **Notes Area** (right): Main content, examples
   - **Summary** (bottom): Reflection

### **3. Use AI Cue Suggestions**

1. While editing a note, click the ✨ **sparkle button** in the Cue Column
2. AI will generate 3-4 Socratic questions based on your topic
3. Questions appear automatically in your cue list

### **4. Auto-Save**

- Notes auto-save every 2 seconds
- Watch the indicator:
  - 🔴 Gray dot = Unsaved changes
  - ⏳ Spinner = Saving...
  - ✅ Green check = Saved

---

## 🎨 UI TEXT & MICROCOPY

All text follows the Study Coach ethos:

| Element | Text |
|---------|------|
| **Header** | "🧠 Cornell Notes — Learn it. Question it. Summarize it." |
| **Cue Placeholder** | "Write key questions or hints here..." |
| **Notes Placeholder** | "Take your main notes, examples, or diagrams..." |
| **Summary Placeholder** | "What clicked for you? What do you still need to work on?" |
| **Save Success** | "✅ Saved! Great work staying organized." |
| **Reflection Prompt** | "💭 What's one thing you'd like to understand better next time?" |

---

## 🔗 INTEGRATIONS

### **Current:**
- ✅ Uses existing `useAuth()` context
- ✅ Uses existing Supabase client utilities
- ✅ Uses existing shadcn/ui components
- ✅ Follows existing API route patterns
- ✅ Integrated into sidebar navigation

### **Future Roadmap:**
- 🔄 Link notes to Learning Path topics
- 🔄 Show recent notes in Parent Dashboard
- 🔄 Generate test questions from notes
- 🔄 Tag notes with Focus Session data
- 🔄 Export notes to PDF

---

## 🧪 TESTING

### **Test Scenarios:**

1. **Create Note**
   - Go to `/journal`
   - Click "New Note"
   - Fill in subject + topic
   - Add cues, notes, summary
   - Click "Save Now"
   - ✅ Should redirect to edit page

2. **AI Cue Generation**
   - Create/edit a note with a topic
   - Click ✨ sparkle button
   - ✅ Should add 3-4 questions to cue column

3. **Auto-Save**
   - Edit any field
   - Wait 2 seconds
   - ✅ Status should change to "Auto-saved"

4. **Search & Filter**
   - Create notes with different subjects
   - Use search bar
   - Click subject filter buttons
   - ✅ Results should update

5. **Delete Note**
   - Click trash icon on a note
   - Confirm deletion
   - ✅ Note should disappear

---

## 🐛 TROUBLESHOOTING

### **"Failed to fetch notes" Error**

**Cause:** Database table not created or RLS policies missing

**Fix:**
1. Run the SQL migration again
2. Check Supabase SQL Editor for errors
3. Verify table exists in Table Editor

### **"Unauthorized" Error**

**Cause:** User not authenticated or RLS policy blocking access

**Fix:**
1. Make sure you're logged in
2. Check browser console for auth errors
3. Verify `auth.uid()` matches `user_id` in database

### **AI Cue Suggestions Not Working**

**Cause:** Missing AI provider credentials

**Fix:**
1. Check `.env.local` has `DEEPSEEK_API_KEY` or `OPENAI_API_KEY`
2. Restart dev server after adding env vars
3. Check API route logs for errors

---

## 📊 DATABASE SCHEMA

```typescript
interface CornellNote {
  id: string;              // UUID primary key
  user_id: string;         // References auth.users(id)
  subject: string;         // "Math", "Science", etc.
  topic: string;           // "Quadratic Equations"
  cue_column: string[];    // Array of cue questions
  note_body: string;       // Main note content
  summary: string;         // Reflection summary
  tags: string[];          // Future: for categorization
  created_at: string;      // Timestamp
  updated_at: string;      // Auto-updated timestamp
}
```

---

## ✅ SUCCESS CHECKLIST

- [ ] SQL migration executed successfully
- [ ] `cornell_notes` table visible in Supabase
- [ ] Dev server restarted
- [ ] "Learning Journal" appears in sidebar
- [ ] Can create a new note
- [ ] Can edit and save note
- [ ] Auto-save indicator works
- [ ] AI cue suggestions generate
- [ ] Can search/filter notes
- [ ] Can delete notes

---

## 🎓 CORNELL NOTES METHOD

### **Why Cornell Notes?**

The Cornell method improves:
- ✅ **Active Recall**: Cue questions force retrieval practice
- ✅ **Organization**: Structured layout prevents messy notes
- ✅ **Executive Function**: Planning, summarizing, self-monitoring
- ✅ **Reflection**: Summary section builds metacognition

### **How Students Use It:**

1. **During Class/Study:**
   - Take main notes in the right column
   - Write down examples, diagrams, facts

2. **After Class:**
   - Add cue questions in left column
   - "What does this mean?"
   - "How do I solve X?"

3. **Before Tests:**
   - Cover right column
   - Try to answer cue questions from memory
   - Check answers in notes

4. **Weekly Review:**
   - Read summaries to refresh memory
   - Update summaries with new insights

---

## 🚀 NEXT STEPS

1. **Run the SQL migration** (see Step 1 above)
2. **Restart your dev server**
3. **Test creating a note**
4. **Share with a student** to get feedback
5. **Monitor usage** in Supabase Table Editor

---

**Questions?** Check the logs in:
- Browser console (F12)
- Terminal (dev server logs)
- Supabase Dashboard → Logs

**Last Updated:** January 2025

