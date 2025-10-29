# SuperTutor Local Setup Guide

## Quick Start

This guide will help you set up SuperTutor to run locally with DeepSeek API.

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Environment File

Copy the example file and add your API keys:

```bash
cp env.example .env.local
```

Then edit `.env.local` and replace the placeholders with your actual API keys:

```env
# DeepSeek API Configuration (for AI tutoring)
DEEPSEEK_API_KEY=your-deepseek-api-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# OpenAI API Configuration (for Text-to-Speech)
OPENAI_API_KEY=your-openai-api-key-here
```

> **Important**: Replace the placeholder values above with your actual API keys. Never commit `.env.local` to version control. Your `.gitignore` already protects `.env*` files.
 

### Step 3: Start the Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:9002**

## What Changed?

We've migrated from Google Firebase Studio to a local setup:

### Removed:
- ❌ Google Genkit dependencies
- ❌ Firebase Studio hosting configuration
- ❌ Firebase Authentication (being replaced)
- ❌ Genkit development scripts
- ❌ Project IDX configuration

### Added:
- ✅ OpenAI SDK for TTS and DeepSeek compatibility
- ✅ DeepSeek API for AI tutoring (cost-effective)
- ✅ Context caching optimization for cost savings
- ✅ Environment-based configuration
- ✅ Centralized system prompts
- ✅ Streaming text-to-speech

## Cost Optimization - DeepSeek Context Caching

The app is optimized for DeepSeek's automatic context caching:

**Benefits:**
- 🔥 **90% cost reduction** on repeated content
- 🚀 **Faster responses** from cached prompts
- 🎯 **Automatic** - no code changes needed

**How it works:**
- System prompts are identical across requests
- Common prefixes get cached automatically
- Cache hits: ¥0.1 per million tokens
- Cache misses: ¥1.0 per million tokens

**Example:**
```typescript
// First student asks about math
Request 1: System prompt + "Explain fractions"
// Cache miss: Full cost

// Second student asks about math  
Request 2: System prompt + "Explain decimals"
// Cache hit on system prompt: 90% cheaper! ✅
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Next.js Frontend                │
│   (React Components + UI)               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Server Actions (actions.ts)        │
│   (API Layer - Type-safe endpoints)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         AI Flows (flows/)               │
│  - Subject Tutor                        │
│  - Homework Feedback                    │
│  - Learning Path Generator              │
│  - Test Prep                            │
│  - Homework Planner                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    AI Helpers (helpers.ts)              │
│  - generateStructured()                 │
│  - buildUserMessage()                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   DeepSeek API (via OpenAI SDK)         │
│   Model: deepseek-chat                  │
│   Context Caching: Enabled              │
└─────────────────────────────────────────┘
```

## Features Currently Implemented

### ✅ Working Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Subject Tutoring** | Math, Science, Writing tutors with specialized personas | ✅ Working |
| **Homework Feedback** | Upload homework images for AI analysis | ✅ Working |
| **Homework Planner** | Create structured study plans | ✅ Working |
| **Learning Paths** | Personalized learning recommendations | ✅ Working |
| **Test Prep** | Generate quizzes and flashcards | ✅ Working |
| **Executive Coaching** | Performance monitoring and interventions | ✅ Working |
| **Math Rendering** | LaTeX formula display | ✅ Working |
| **SVG Diagrams** | Auto-generated educational diagrams | ✅ Working |

### ⚠️ Features Requiring Additional Setup

| Feature | Requirement | Status |
|---------|------------|--------|
| **Text-to-Speech** | OpenAI TTS API | ❌ Not implemented |
| **Speech-to-Text** | OpenAI Whisper API | ❌ Not implemented |
| **Illustration Generation** | DALL-E or Stable Diffusion | ❌ Not implemented |

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server  
npm start

# Run linter
npm run lint

# Type check
npm run typecheck
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DEEPSEEK_API_KEY` | Your DeepSeek API key | `sk-xxx...` |
| `DEEPSEEK_BASE_URL` | DeepSeek API endpoint | `https://api.deepseek.com` |
| `OPENAI_API_KEY` | Your OpenAI API key (for TTS) | `sk-proj-xxx...` |

> All API keys are server-side only and not exposed to the browser.

## Troubleshooting

### Error: "DEEPSEEK_API_KEY is not defined"

**Solution**: Ensure `.env.local` exists and contains your API key. Restart the dev server after creating it.

### Error: "Failed to get response from educational assistant"

**Possible causes:**
1. Invalid API key
2. API rate limit exceeded
3. Network connectivity issues

**Solution**: Check your API key at https://platform.deepseek.com/

### Authentication Issues

**Note**: Firebase Authentication has been removed. Authentication system to be implemented.

## Next Steps

1. ✅ App is running locally
2. 🔐 Implement new authentication system (replacing Firebase)
3. 🎨 Customize UI components
4. 📊 Monitor API usage and costs
5. 🚀 Deploy to production (Vercel, etc.)

## Production Deployment

When deploying to production:

1. Add environment variables to your hosting provider (DeepSeek + OpenAI keys)
2. Implement production authentication system
3. Set up proper error logging
4. Configure rate limiting if needed

**Vercel Deployment:**
```bash
# Set environment variables in Vercel dashboard
# Then deploy:
vercel
```

## 🔐 Security

See `SECURITY.md` for comprehensive security guidelines including:
- API key management
- What to do if keys are exposed
- Production deployment security
- Security checklist

## 📁 Important Files

- `env.example` - Template for environment variables
- `SECURITY.md` - Security best practices
- `TTS_SETUP_COMPLETE.md` - Text-to-speech setup guide
- `ENV_SETUP_COMPLETE.md` - Environment setup guide

## Support & Resources

- **DeepSeek Docs**: https://api-docs.deepseek.com/
- **DeepSeek Pricing**: https://platform.deepseek.com/pricing
- **OpenAI Docs**: https://platform.openai.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

🎉 **You're all set!** Start the dev server with `npm run dev` and visit http://localhost:9002

