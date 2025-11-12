# 📋 Study Coach Product Roadmap

## 🎯 **Ethos Alignment**

Every feature must support our core values:
- ✅ **Empowerment Over Answers** - Socratic guidance, not shortcuts
- ✅ **Family Peace** - Reduce homework battles
- ✅ **Accessible** - Affordable and inclusive
- ✅ **Confidence First** - Build self-efficacy before grades
- ✅ **Privacy & Safety** - Parent-controlled, COPPA-compliant

---

## ✅ **Recently Completed**

### **1. Multi-Input Homework Helper** (v1.2)
**Status:** ✅ Complete

**Features:**
- 📸 **Camera Mode**: Live camera with explicit permission request
- 📁 **File Upload Mode**: Drag-and-drop or choose file
- 🔒 **Smart Permission Handling**: 
  - "Grant Camera Access" button with tooltip
  - Browser permission guide (lock icon → Allow Camera)
  - Fallback to file upload if camera blocked
- 🎨 **Tabbed Interface**: Clean UX with Camera/Upload tabs

**Alignment:**
- Reduces friction (accessibility)
- Multiple learning modalities (visual, kinesthetic)
- Still functional even without camera (family peace)

---

## 🚧 **In Progress**

### **2. Enhanced Learning Path Generation** (v1.1)
**Status:** ✅ Complete

**Features:**
- 📝 Pre-Assessment: 3-5 diagnostic questions before starting
- 📤 Notes Prompt: Encourages students to share existing materials
- ✨ Concrete Examples: 2-3 worked examples per topic
- ❓ Practice Questions: Gradual difficulty progression
- 🎯 Personalized to grade level, learning style, goals

**Alignment:**
- Empowerment (scaffolding, not answers)
- Confidence (knowledge check without discouragement)
- Personalized (respects individual learning styles)

---

## 📅 **Q1 2025 Priorities**

### **3. Unified Input Hub** 🎤📸📁
**Goal:** Let students share work *their* way

**Features:**
- 🎙️ **Voice Input**: Record questions instead of typing
  - "I don't understand how to solve this..."
  - Auto-transcription with context
  - Combines with uploaded image
- 📂 **Multi-File Upload**: 
  - Worksheets (PDF)
  - Screenshots
  - Teacher notes
  - Previous homework
- 🤝 **Hybrid Mode**: Voice + Image together
  - Point at problem + explain confusion
  - More natural for younger students

**Technical Requirements:**
- Speech-to-text API (OpenAI Whisper already integrated)
- PDF parsing/OCR for uploaded documents
- Multi-modal AI prompts (text + image context)

**Success Metrics:**
- 40%+ students use non-camera input methods
- Reduced "homework helper error" support tickets
- Higher engagement from 8-12 age group (prefer voice)

---

### **4. Learning Journal (Auto-Save Context)** 📚
**Goal:** Build a personalized knowledge base automatically

**Features:**
- 🗂️ **Automatic Capture**:
  - Every homework question asked
  - Every image uploaded
  - Every voice note recorded
  - Every learning path generated
- 📊 **Smart Organization**:
  - By subject
  - By date
  - By topic/concept
  - By difficulty level
- 🔍 **Searchable History**:
  - "Show me all my algebra questions"
  - "What did I learn about photosynthesis?"
- 🎯 **AI Insights**:
  - "You struggle with word problems"
  - "Strong in geometry, needs practice in fractions"
  - Parent dashboard integration

**Technical Requirements:**
- Database schema: `learning_journal` table
- Full-text search (Postgres)
- Tagging system (AI-generated tags)
- Storage quotas (500MB free, 5GB premium)

**Success Metrics:**
- 60%+ students revisit journal monthly
- 30% reduction in repeated questions
- Parents report "see progress over time"

---

### **5. Adaptive Test Generator Revamp** 📝
**Goal:** Fix "slow and poor" test generation

**Current Issues:**
- Generic questions (not personalized)
- Slow generation (20+ seconds)
- No difficulty scaling

**Solution:**
- **Pull from Learning Journal**:
  - Use student's actual past work
  - Focus on weak areas identified by AI
  - Include variations of problems they struggled with
- **Difficulty Modes**:
  - 🟢 **Practice** (60% mastery level)
  - 🟡 **Challenge** (80% mastery level)
  - 🔴 **Mastery** (95% mastery level)
- **Speed Optimization**:
  - Pre-generate question bank
  - Cache common test patterns
  - Progressive enhancement (show easy questions first)
- **Adaptive Logic**:
  - If student gets 3 in a row correct → increase difficulty
  - If 2 wrong → add scaffolding hints
  - Track time spent per question

**Technical Requirements:**
- Question template library (500+ templates)
- Difficulty rating algorithm
- Real-time adaptive logic
- Performance optimization (< 5 sec generation)

**Success Metrics:**
- Test generation < 5 seconds
- 80%+ students complete generated tests
- 4.0+ star rating on "test quality"
- 50% reduction in "test too easy/hard" feedback

---

## 📅 **Q2 2025**

### **6. Socratic Coach Flow (Anti-Cheating)** 🧠
**Goal:** Enforce "no direct answers" philosophy

**Features:**
- **Scaffolding Questions**:
  - Student: "What's 2x + 5 = 15?"
  - Coach: "What operation would cancel out the +5?"
  - Student: "Subtraction?"
  - Coach: "Great! Try applying that. What do you get?"
- **Hint Progression**:
  - Level 1: "What's the first step?"
  - Level 2: "Remember PEMDAS..."
  - Level 3: "Try subtracting 5 from both sides"
  - Level 4: "Here's a similar example..."
- **Understanding Trail**:
  - Track each step of reasoning
  - Save to Learning Journal
  - Show parents "how they solved it"
- **Anti-Shortcut Detection**:
  - If student just says "I don't know" → require attempt
  - If skipping steps → prompt to explain reasoning

**Technical Requirements:**
- Multi-turn conversation state
- Hint database per concept
- Detection patterns for "giving up"
- Parent transparency report

**Success Metrics:**
- 70%+ parents report "my child learned the process"
- Reduced "just give me the answer" complaints
- Increased session duration (deeper engagement)

---

### **7. Parent Transparency Enhancements** 👨‍👩‍👧‍👦
**Goal:** Build trust, reduce "surveillance" feeling

**Features:**
- 📊 **Weekly Digest Email**:
  - Topics studied
  - Time spent learning
  - Progress highlights
  - Areas needing support
- 🎯 **Conversation Starters**:
  - "Ask your child about solving quadratic equations!"
  - "They mastered photosynthesis this week 🎉"
- 🚦 **Alert System**:
  - Red: Struggling with core concept (3+ attempts)
  - Yellow: Progress slower than expected
  - Green: On track, building confidence
- 📖 **Learning Journal Access**:
  - Parents can review (read-only)
  - Filter by subject/date
  - Download progress reports

**Technical Requirements:**
- Email template system
- Scheduled jobs (weekly digest)
- Alert thresholds configuration
- Export to PDF feature

**Success Metrics:**
- 80%+ parents open weekly digest
- 50%+ click "view details"
- Reduced "what is my child doing?" support tickets

---

## 🔮 **Future Vision (Q3-Q4 2025)**

### **8. Peer Learning (Optional)** 👥
- Study groups with moderated chat
- Share learning paths (anonymized)
- Collaborative problem-solving
- Still Socratic, not answer-sharing

### **9. Teacher Integration** 👩‍🏫
- Teacher dashboard (classroom view)
- Assign custom learning paths
- Track class progress
- Export to LMS (Canvas, Google Classroom)

### **10. Gamification** 🎮
- Streak tracking (7 days in a row)
- Badges for mastery
- NOT competitive (no leaderboards)
- Focus on personal growth

---

## 🎯 **Key Principles for All Features**

1. **Always Socratic**: Never give direct answers
2. **Always Accessible**: Work without premium hardware
3. **Always Safe**: COPPA-compliant, parent-controlled
4. **Always Empowering**: Build confidence and independence
5. **Always Transparent**: Parents can see everything

---

## 📊 **Success Metrics (2025)**

- **Growth**: 10,000 active families
- **Retention**: 70% monthly retention
- **NPS**: 50+ (industry-leading)
- **Revenue**: $120K ARR (sustainable)
- **Impact**: "Homework battles reduced by 60%" (user surveys)

---

## 💬 **Feedback Channels**

- **User Interviews**: Monthly (10 families)
- **In-App Surveys**: After 7 days, after 30 days
- **Support Tickets**: Track common pain points
- **Usage Analytics**: What features are actually used?

---

**Last Updated:** January 2025  
**Maintained By:** Product Team  
**Review Cycle:** Monthly

