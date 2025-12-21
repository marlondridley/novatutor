# NovaTutor - Deployment & Architecture Guide

**Last Updated:** December 21, 2025  
**Version:** 1.0  
**Production URL:** https://novatutor.vercel.app

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Environment Setup](#environment-setup)
5. [Deployment Guide](#deployment-guide)
6. [API Configuration](#api-configuration)
7. [Database Schema](#database-schema)
8. [Feature Modules](#feature-modules)
9. [Performance & Monitoring](#performance--monitoring)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

NovaTutor is an AI-powered educational platform designed for students ages 8-18. The system provides:

- **Interactive Voice Tutoring** - Nintendo Switch-style game controller interface with voice input
- **Subject-Specialized AI Tutoring** - Math, Science, Writing, History
- **Executive Function Coaching** - Planning, focus, organization support
- **Study Planning & Session Management** - Timer-based study sessions with motivational pings
- **Test Preparation** - Adaptive test generation
- **Natural Text-to-Speech** - Microsoft Edge Neural voices
- **Premium Features** - Advanced voice transcription (OpenAI Whisper)

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  Next.js 15 + React 18 + TypeScript + Tailwind CSS         │
│  - Game Controller UI (Voice Interface)                      │
│  - Dashboard & Learning Pages                                │
│  - Real-time Speech Recognition                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│  Next.js Server Actions + API Routes                        │
│  - AI Flow Orchestration                                     │
│  - Rate Limiting (Redis/Upstash)                            │
│  - Context-Aware Prompt System                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                          │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   AI APIS    │  │    SPEECH    │  │     AUTH     │      │
│  │              │  │              │  │              │      │
│  │ • Anthropic  │  │ • Web Speech │  │ • Supabase   │      │
│  │   Claude     │  │   API        │  │   Auth       │      │
│  │ • DeepSeek   │  │ • Edge TTS   │  │ • Stripe     │      │
│  │ • OpenAI     │  │ • Whisper    │  │   Webhooks   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  Supabase (PostgreSQL) + Upstash (Redis)                    │
│  - User Profiles & Auth                                      │
│  - Subscription Status                                       │
│  - Learning Progress                                         │
│  - Rate Limit Tracking                                       │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. Game Controller (Voice Interface)
- **Location:** `src/components/game-controller.tsx`
- **Purpose:** Nintendo Switch-style voice-first tutoring interface
- **Features:**
  - Big RED TALK button (push-to-talk)
  - 2-second speech buffer after release
  - D-pad subject selection (Math, Science, Writing, History)
  - Real-time chat display
  - Study plan integration
  - Haptic and audio feedback

#### 2. AI Tutoring System
- **Location:** `src/ai/`
- **Core Files:**
  - `prompts.ts` - Tutor Response Contract (7-section mandatory structure)
  - `flows/subject-specialized-tutor.ts` - Context-aware AI orchestration
  - `helpers.ts` - AI API integration (Anthropic, DeepSeek, OpenAI)
  - `behavior-control.ts` - Safety guardrails

**Tutor Response Contract (7 Sections):**
1. Acknowledgment (validate student)
2. Concept Explanation (2-3 paragraphs)
3. Worked Example (step-by-step walkthrough)
4. Memory Aid (mnemonic/mental hook)
5. Guided Question (check understanding)
6. Practice Problem (student try)
7. Your Turn Instruction (explicit next step)

**Context Flags:**
- `mode`: 'short' (3-4 lines) | 'deep' (10-15 lines)
- `grade`: 1-12 (vocabulary adjustment)
- `confidenceLevel`: 'low' | 'medium' | 'high' (scaffolding)
- `efNeeds`: ['planning', 'checking work', 'organization', 'focus']

#### 3. Speech System
- **Browser Speech Recognition:** `react-speech-recognition` library
- **Natural TTS:** Microsoft Edge Neural voices via `@lobehub/tts`
- **Premium Transcription:** OpenAI Whisper (fallback for non-Chrome browsers)
- **API Route:** `/api/tts/edge` - Server-side TTS generation

#### 4. Authentication & Payments
- **Auth Provider:** Supabase Auth
- **Payment Provider:** Stripe
- **Subscription Tiers:**
  - Free: Basic tutoring, browser speech
  - Premium: Advanced features, Whisper transcription, priority support

---

## Technology Stack

### Frontend
- **Framework:** Next.js 15.5.4 (App Router, Turbopack)
- **Language:** TypeScript 5.x
- **UI Library:** React 18
- **Styling:** Tailwind CSS 3.x
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **Speech:** react-speech-recognition, @lobehub/tts

### Backend
- **Runtime:** Node.js 20+
- **Server Actions:** Next.js Server Actions
- **API Routes:** Next.js API Routes
- **Rate Limiting:** Upstash Redis
- **Database:** Supabase (PostgreSQL)

### AI Services
- **Primary:** Anthropic Claude (Sonnet 4.5)
- **Secondary:** DeepSeek, OpenAI GPT-4
- **Schema Validation:** Zod + zodToJsonSchema

### Infrastructure
- **Hosting:** Vercel (Edge Network)
- **Database:** Supabase Cloud
- **Cache:** Upstash Redis
- **CDN:** Vercel Edge Network

---

## Environment Setup

### Prerequisites
- Node.js 20+ and npm
- Git
- Accounts: Vercel, Supabase, Anthropic, Stripe, Upstash

### Environment Variables

Create `.env.local` in the project root:

```bash
# =============================================================================
# AI PROVIDERS (Prioritized: Anthropic > DeepSeek > OpenAI)
# =============================================================================

# Anthropic Claude (PRIMARY)
ANTHROPIC_API_KEY=sk-ant-...

# DeepSeek (SECONDARY - Cost-effective alternative)
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# OpenAI (FALLBACK)
OPENAI_API_KEY=sk-...

# Azure OpenAI (OPTIONAL)
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://YOUR_RESOURCE.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4

# =============================================================================
# SUPABASE (Database + Auth)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# =============================================================================
# STRIPE (Payments)
# =============================================================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Premium Plan Price ID
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...

# =============================================================================
# UPSTASH REDIS (Rate Limiting)
# =============================================================================
UPSTASH_REDIS_REST_URL=https://YOUR_REDIS.upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# =============================================================================
# OPTIONAL: Azure AI Search (RAG - Educational Content)
# =============================================================================
AZURE_SEARCH_ENDPOINT=https://YOUR_SEARCH.search.windows.net
AZURE_SEARCH_KEY=...
AZURE_SEARCH_INDEX_NAME=educational-content

# =============================================================================
# APP CONFIG
# =============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/novatutor.git
cd novatutor

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Run database migrations (Supabase)
# Visit: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
# Run the SQL from: supabase/migrations/

# 5. Start development server
npm run dev

# 6. Open browser
# http://localhost:3000
```

---

## Deployment Guide

### Vercel Deployment (Recommended)

#### Initial Setup

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
# First deployment (creates project)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Scope: Your account
# - Link to existing project? No
# - Project name: novatutor
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

#### Environment Variables Setup

Add all environment variables to Vercel:

```bash
# Via CLI
vercel env add ANTHROPIC_API_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... add all other variables

# Or via Dashboard:
# https://vercel.com/YOUR_USERNAME/novatutor/settings/environment-variables
```

#### Stripe Webhook Setup

1. **Get Vercel production URL:**
```
https://novatutor.vercel.app
```

2. **Configure Stripe webhook:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Create endpoint: `https://novatutor.vercel.app/api/webhooks/stripe`
   - Events to listen: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook secret → Add to Vercel env: `STRIPE_WEBHOOK_SECRET`

3. **Redeploy:**
```bash
vercel --prod
```

#### Domain Configuration

1. **Add custom domain:**
   - Vercel Dashboard → Project → Settings → Domains
   - Add: `novatutor.com` and `www.novatutor.com`

2. **Update DNS:**
   - Add CNAME: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → Vercel IP

3. **Update environment:**
```bash
vercel env add NEXT_PUBLIC_APP_URL production
# Value: https://novatutor.com
```

### Alternative: Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t novatutor .
docker run -p 3000:3000 --env-file .env.local novatutor
```

---

## API Configuration

### AI Provider Priority

The system attempts providers in this order:

1. **Anthropic Claude Sonnet 4.5** (PRIMARY)
   - Best quality responses
   - Natural conversational style
   - Follows 7-section contract well

2. **DeepSeek** (SECONDARY)
   - Cost-effective alternative
   - Good performance
   - Lower latency

3. **OpenAI GPT-4** (FALLBACK)
   - Reliable fallback
   - Good quality
   - Higher cost

Configuration in `src/ai/genkit.ts`:

```typescript
const AI_PROVIDERS = {
  anthropic: process.env.ANTHROPIC_API_KEY,
  deepseek: process.env.DEEPSEEK_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  azure: process.env.AZURE_OPENAI_API_KEY,
};
```

### Rate Limiting

Configured in `src/lib/redis.ts`:

```typescript
const RATE_LIMITS = {
  ai: { requests: 30, window: 3600 },      // 30 requests/hour
  voice: { requests: 100, window: 3600 },  // 100 requests/hour
  tts: { requests: 50, window: 3600 },     // 50 requests/hour
};
```

Graceful degradation: If Redis is unavailable, rate limiting is disabled in development.

---

## Database Schema

### Supabase Tables

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  grade_level INTEGER CHECK (grade_level >= 1 AND grade_level <= 12),
  is_premium BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `learning_progress`
```sql
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
  attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  last_practiced TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `study_sessions`
```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  duration_minutes INTEGER,
  topics_covered TEXT[],
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Similar policies for other tables...
```

---

## Feature Modules

### 1. Voice Interface Module

**Location:** `src/components/game-controller.tsx`

**Key Features:**
- Push-to-talk with 2-second buffer
- Browser speech recognition
- Natural TTS playback
- Haptic feedback (mobile)
- Audio feedback (clicks, confirmations)

**Speech Flow:**
```
User presses TALK → SpeechRecognition starts
User releases TALK → 2-second buffer (keep listening)
Buffer ends → Stop listening → Process transcript
Send to AI → Receive response → Speak naturally via TTS
```

### 2. AI Tutoring Module

**Location:** `src/ai/flows/subject-specialized-tutor.ts`

**Context-Aware System:**
```typescript
// Dynamic context flags
{
  subject: "Math",
  topic: "Order of Operations",
  mode: "deep",               // Response verbosity
  grade: 5,                   // Vocabulary level
  confidenceLevel: "low",     // Scaffolding amount
  efNeeds: ["planning"]       // Executive function support
}
```

**Response Contract Enforcement:**
- 7 mandatory sections
- Minimum 800 characters (deep mode)
- Schema validation: `z.string().min(800)`
- 4-step self-check loop

### 3. Study Planning Module

**Location:** `src/components/controller-plan-display.tsx`

**Features:**
- Multi-subject study plans
- Countdown timer (with pause/resume)
- 5 random motivational pings during session
- Task completion tracking
- "Rock N Roll!" session starter

**Ping Messages:**
```typescript
const PING_MESSAGES = [
  "You're doing great! Keep that focus strong.",
  "Halfway there! You've got this.",
  "Amazing effort! Stay on track.",
  // ... 12 total messages
];
```

### 4. Premium Features

**Location:** `src/lib/actions.ts`

**Premium Tier Includes:**
- OpenAI Whisper transcription (fallback for non-Chrome browsers)
- Priority AI response queue
- Extended rate limits
- Advanced analytics (future)

**Stripe Integration:**
- Checkout session creation: `/api/checkout/session`
- Webhook handling: `/api/webhooks/stripe`
- Subscription status sync with Supabase

---

## Performance & Monitoring

### Performance Optimizations

1. **Next.js Optimization:**
   - Static generation where possible
   - Image optimization with `next/image`
   - Font optimization with `next/font`
   - Code splitting (dynamic imports)

2. **Turbopack (Dev Server):**
   - Faster HMR (Hot Module Replacement)
   - Improved build times
   - Better caching

3. **Edge Functions:**
   - API routes deployed to Vercel Edge Network
   - Lower latency for users worldwide

4. **Context Caching (AI):**
   - Reuse system prompts across requests
   - DeepSeek context cache optimization
   - Reduced API costs

### Monitoring

**Vercel Analytics:**
- Real-time performance metrics
- Core Web Vitals tracking
- Error tracking

**Supabase Dashboard:**
- Database query performance
- Connection pool monitoring
- Row-level security violations

**Stripe Dashboard:**
- Payment success rates
- Failed payment alerts
- Subscription churn tracking

### Error Handling

**Graceful Degradation:**
```typescript
// Example: Redis failure handling
if (!redis) {
  console.warn('[Rate Limit] Redis unavailable, allowing request');
  return { success: true };
}
```

**Client-Side Error Boundaries:**
- React Error Boundaries for component failures
- Fallback UI for broken features
- User-friendly error messages

---

## Troubleshooting

### Common Issues

#### 1. Speech Recognition Not Working

**Symptoms:** TALK button doesn't capture voice

**Solutions:**
- Check browser compatibility (Chrome/Edge/Safari required)
- Verify microphone permissions granted
- Check console for `isMicrophoneAvailable` status
- Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

#### 2. AI Responses Are Short/Incomplete

**Symptoms:** Tutor stops after acknowledgment

**Solutions:**
- Check `mode: 'deep'` is set in game controller
- Verify schema validation: `z.string().min(800)`
- Check AI provider API keys are valid
- Review console logs for API errors

#### 3. TTS Not Speaking

**Symptoms:** No audio output after AI response

**Solutions:**
- Check `/api/tts/edge` endpoint is working
- Verify `@lobehub/tts` is installed
- Check browser audio permissions
- Test with browser's built-in TTS (fallback)

#### 4. Stripe Webhook Failures

**Symptoms:** Subscription status not updating

**Solutions:**
- Verify webhook secret in Vercel env
- Check webhook endpoint URL is correct
- Review Stripe webhook logs
- Test webhook locally with Stripe CLI

#### 5. Database Connection Errors

**Symptoms:** "Could not connect to Supabase"

**Solutions:**
- Verify Supabase URL and keys in `.env.local`
- Check Supabase project status (not paused)
- Review RLS policies (not blocking queries)
- Check connection pooling limits

### Debugging Tips

**Enable Debug Logging:**
```typescript
// Add to .env.local
DEBUG=true
LOG_LEVEL=debug
```

**Check Server Logs:**
```bash
# Vercel deployment logs
vercel logs

# Local development
# Check terminal running `npm run dev`
```

**Network Inspection:**
- Open DevTools → Network tab
- Check API route responses
- Verify request payloads
- Check for CORS errors

**Database Queries:**
```bash
# Test Supabase connection
curl https://YOUR_PROJECT.supabase.co/rest/v1/profiles \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## Development Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes, commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub
# After review, merge to main

# Deploy to production
vercel --prod
```

### Testing

```bash
# Run linter
npm run lint

# Type check
npm run type-check

# Build (test production build)
npm run build

# Start production server locally
npm start
```

### Code Quality

**ESLint Configuration:**
- `eslint-config-next` for Next.js best practices
- TypeScript strict mode enabled
- Accessibility linting with `eslint-plugin-jsx-a11y`

**TypeScript:**
- Strict type checking
- No implicit any
- Zod for runtime validation

---

## Security Considerations

### API Key Protection

- Never commit `.env.local` to Git
- Use environment variables in Vercel for production
- Rotate keys regularly
- Use separate keys for dev/staging/production

### Authentication

- Supabase Auth with secure JWT tokens
- Row-level security (RLS) on all tables
- Session management with automatic expiration
- Password requirements enforced

### Payment Security

- PCI compliance via Stripe
- No credit card data stored in database
- Webhook signature verification
- HTTPS only in production

### Content Safety

- AI guardrails in `src/ai/behavior-control.ts`
- Age-appropriate content filtering
- Profanity detection and blocking
- User-generated content moderation

---

## Support & Maintenance

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages (carefully!)
npm update

# Test after updates
npm run build
npm run lint
```

### Database Migrations

```bash
# Create migration
# In Supabase Dashboard → SQL Editor
# Write migration SQL
# Save as new migration

# Example: Add column
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;

# Deploy
# Migrations run automatically on Supabase
```

### Monitoring & Alerts

**Set up alerts for:**
- Failed payment webhooks
- High API error rates
- Database connection failures
- Rate limit exceedances

**Vercel Integrations:**
- Slack notifications for deployment status
- Email alerts for critical errors

---

## Additional Resources

### Documentation Links

- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **Anthropic Claude:** https://docs.anthropic.com/
- **Stripe:** https://stripe.com/docs
- **Vercel:** https://vercel.com/docs
- **Upstash Redis:** https://docs.upstash.com/

### Support Channels

- **GitHub Issues:** https://github.com/YOUR_USERNAME/novatutor/issues
- **Email:** support@novatutor.com (if applicable)

---

## License

[Your License Here - e.g., MIT, Proprietary, etc.]

---

## Version History

- **v1.0** (Dec 2025) - Initial deployment with voice interface, AI tutoring, and payment integration

---

**Last Updated:** December 21, 2025

