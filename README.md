# 🎓 NovaTutor - AI-Powered Learning Coach

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org/)

**Developed by**: Marlon Ridley  
**Production URL**: https://novatutor.vercel.app

> An AI-powered educational platform with voice-first tutoring interface, designed for students ages 8-18.

---

## 🌟 Key Features

### 🎮 Nintendo Switch-Style Voice Interface
- **Big RED TALK Button** - Push-to-talk with 2-second speech buffer
- **D-Pad Subject Selection** - Math, Science, Writing, History
- **Real-time Chat Display** - See your conversation unfold
- **Natural Text-to-Speech** - Microsoft Edge neural voices
- **Haptic & Audio Feedback** - Interactive learning experience

### 🤖 AI Tutor with 7-Section Response Contract
- **Mandatory Teaching Structure**: Acknowledgment → Concept → Example → Memory Aid → Question → Practice → Instruction
- **Context-Aware Responses**: Adapts to grade level, confidence, and executive function needs
- **Graduated Hint System**: Progressive scaffolding for problem-solving
- **Minimum 800 characters**: Ensures rich, detailed teaching responses

### 📚 Study Planning & Session Management
- **Multi-Subject Study Plans** - Create personalized study schedules
- **Countdown Timer** - With pause/resume functionality
- **Motivational Pings** - 5 random encouragement messages during study sessions
- **Task Completion Tracking** - Visual progress indicators

### 💳 Premium Features
- **OpenAI Whisper Transcription** - Fallback for non-Chrome browsers
- **Priority AI Response Queue**
- **Extended Rate Limits**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- API Keys: Anthropic, Supabase, Stripe

### Installation

```bash
# Clone the repository
git clone https://github.com/marlondridley/novatutor.git
cd novatutor

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Open browser
# http://localhost:3000
```

### Environment Variables

See `DEPLOYMENT_ARCHITECTURE.md` for complete environment setup guide.

Required minimum:
```bash
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
```

---

## 📖 Documentation

**For deployment, architecture, and detailed technical documentation:**

👉 **[Read DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md)**

This comprehensive guide includes:
- System architecture & data flow
- Complete environment setup
- Deployment guides (Vercel, Docker)
- API configuration & rate limiting
- Database schema & migrations
- Feature module documentation
- Troubleshooting & debugging
- Security considerations

---

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript 5
- **UI**: React 18, Tailwind CSS
- **AI**: Anthropic Claude Sonnet 4.5, DeepSeek, OpenAI
- **Speech**: react-speech-recognition, @lobehub/tts
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis
- **Hosting**: Vercel

---

## 📁 Project Structure

```
novatutor/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (app)/              # Protected routes (requires auth)
│   │   │   ├── dashboard/      # Main dashboard with game controller
│   │   │   ├── tutor/          # Learning coach interface
│   │   │   ├── planner/        # Study planning
│   │   │   └── test-generator/ # Test prep
│   │   └── api/                # API routes
│   │       ├── tts/edge/       # Text-to-speech endpoint
│   │       ├── webhooks/       # Stripe webhooks
│   │       └── checkout/       # Payment checkout
│   ├── components/             # React components
│   │   ├── game-controller.tsx # Main voice interface
│   │   ├── controller-plan-display.tsx # Study session manager
│   │   └── ...
│   ├── ai/                     # AI integration
│   │   ├── prompts.ts          # Tutor Response Contract
│   │   ├── flows/              # AI orchestration flows
│   │   ├── helpers.ts          # API integration (Anthropic, etc.)
│   │   └── behavior-control.ts # Safety guardrails
│   ├── lib/                    # Utility functions
│   │   ├── actions.ts          # Server actions
│   │   ├── natural-speech.ts   # TTS system
│   │   └── redis.ts            # Rate limiting
│   └── context/                # React context providers
│       └── auth-context.tsx    # Authentication state
├── public/                     # Static assets
├── supabase/                   # Database migrations
│   └── migrations/
├── DEPLOYMENT_ARCHITECTURE.md  # Complete technical documentation
├── README.md                   # This file
└── package.json
```

---

## 🎯 Core AI Architecture

### Context-Aware Tutor System

```typescript
// Single system prompt adapts to context flags
getEducationalAssistantResponse({
  subject: "Math",
  studentQuestion: "help with order of operations",
  
  // Context flags (no new prompts needed!)
  mode: 'deep',              // 'short' | 'deep'
  grade: 5,                  // 1-12
  confidenceLevel: 'low',    // 'low' | 'medium' | 'high'
  efNeeds: ['planning']      // Executive function support
})
```

### 7-Section Response Contract

Every topic response MUST include:
1. **Acknowledgment** - Validate student
2. **Concept Explanation** - 2-3 paragraphs
3. **Worked Example** - Step-by-step walkthrough
4. **Memory Aid** - Mnemonic/mental hook
5. **Guided Question** - Check understanding
6. **Practice Problem** - Student try
7. **Your Turn Instruction** - Explicit next step

**Enforcement**: Schema validation `z.string().min(800)` + 4-step self-check loop

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Docker

```bash
# Build
docker build -t novatutor .

# Run
docker run -p 3000:3000 --env-file .env.local novatutor
```

**See `DEPLOYMENT_ARCHITECTURE.md` for detailed deployment guides.**

---

## 🧪 Development

```bash
# Run development server
npm run dev

# Run linter
npm run lint

# Type check
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Speech recognition not working?**
   - Check browser compatibility (Chrome/Edge/Safari)
   - Verify microphone permissions
   - Try hard refresh (Ctrl+Shift+R)

2. **AI responses too short?**
   - Verify `mode: 'deep'` in controller
   - Check API keys are valid
   - Review console for errors

3. **TTS not speaking?**
   - Check `/api/tts/edge` endpoint
   - Verify browser audio permissions
   - Test fallback browser TTS

**See `DEPLOYMENT_ARCHITECTURE.md` for complete troubleshooting guide.**

---

## 📊 Performance

- **Lighthouse Score**: 88/100
- **Core Web Vitals**: All green
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s

Optimizations:
- Edge functions for low latency
- Context caching for AI requests
- Image optimization with `next/image`
- Code splitting with dynamic imports

---

## 🔒 Security

- Supabase Auth with JWT tokens
- Row-level security (RLS) on all database tables
- PCI compliance via Stripe (no card data stored)
- AI content safety guardrails
- HTTPS only in production

---

## 📄 License

Proprietary. All rights reserved.

For evaluation purposes only. Unauthorized use, copying, modification, or distribution is prohibited.

---

## 👤 Author

**Marlon Ridley**  
- GitHub: [@marlondridley](https://github.com/marlondridley)
- Email: marlon.ridley@gmail.com

---

## 🙏 Acknowledgments

- **Anthropic Claude** - AI tutoring engine
- **Vercel** - Hosting and edge functions
- **Supabase** - Authentication and database
- **@lobehub/tts** - Natural text-to-speech
- **react-speech-recognition** - Browser speech API wrapper

---

**For complete technical documentation, deployment guides, and architecture details:**

👉 **[Read DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md)**
