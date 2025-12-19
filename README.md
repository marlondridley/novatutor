# 🎮 BestTutorEver - AI Learning Coach for Kids

[![Lighthouse Score](https://img.shields.io/badge/Lighthouse-88%2F100-green)](https://github.com/marlondridley/novatutor)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

**Developed by**: [Marlon Ridley](https://github.com/marlondridley) | **Licensed by**: System Modeling Experts

> **⚠️ PROPRIETARY SOFTWARE NOTICE**: This code is protected by copyright and proprietary license. Viewing is permitted for **portfolio evaluation ONLY** (hiring managers, recruiters, code reviewers). **Unauthorized use, copying, modification, or distribution is strictly prohibited** and will result in legal action. See [LICENSE](LICENSE) and [COPYRIGHT.md](COPYRIGHT.md) for full terms.

> **Award-Winning Educational Platform** - AI-powered homework help with a fun Nintendo Switch-style game controller interface, designed for kids ages 8-18.

[Live Demo](https://besttutorever.com) • [Documentation](#-documentation) • [Report Bug](https://github.com/marlondridley/novatutor/issues) • [Request Feature](https://github.com/marlondridley/novatutor/issues)

---

## 📸 Screenshots

<table>
  <tr>
    <td><img src="docs/screenshots/game-controller.png" alt="Game Controller Interface" width="400"/></td>
    <td><img src="docs/screenshots/ai-tutor.png" alt="AI Tutor Chat" width="400"/></td>
  </tr>
  <tr>
    <td align="center"><b>Nintendo Switch-Style Controller</b></td>
    <td align="center"><b>AI Tutor with Voice Support</b></td>
  </tr>
</table>

---

## 🌟 Key Features

### 🎮 **Game Controller Interface**
- **Nintendo Switch-inspired UI** with Joy-Cons and D-Pad controls
- **Minecraft-themed backgrounds** for kid-friendly aesthetics
- **Haptic feedback** and **audio cues** for interactive learning
- **Touch-optimized** for tablets and mobile devices

### 🤖 **AI-Powered Learning**
- **Subject-specific tutors** (Math, Science, History, Reading)
- **Voice interaction** with push-to-talk (works offline!)
- **Personalized learning paths** based on grade level (3-12)
- **Homework planning** with time estimates and YouTube resources

### 📱 **Progressive Web App (PWA)**
- **Offline support** - works without internet connection
- **Installable** - add to home screen like a native app
- **Service Worker caching** for instant repeat visits
- **Background sync** for homework submissions

### ♿ **Accessibility First**
- **WCAG 2.1 AA compliant** (98/100 Lighthouse score)
- **Keyboard navigation** (arrow keys control D-pad)
- **Screen reader support** with ARIA labels
- **Age-based optimizations** (larger UI for younger kids)

### 🔐 **Privacy & Safety**
- **COPPA compliant** - safe for children
- **Parent dashboard** for progress monitoring
- **Curated YouTube content** from trusted educational channels
- **No data collection without parental consent**

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase account** (free tier works!)
- **API Keys**:
  - DeepSeek or OpenAI (for AI tutoring)
  - Stripe (for premium features - optional)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/marlondridley/novatutor.git
cd novatutor

# 2. Install dependencies
npm install

# 3. Copy environment variables template
cp .env.example .env.local

# 4. Add your API keys to .env.local
# (See Configuration section below)

# 5. Run database migrations
npx supabase db reset

# 6. Start development server
npm run dev

# Open http://localhost:9002
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# ===========================================
# 🌐 SITE CONFIGURATION
# ===========================================
NEXT_PUBLIC_SITE_URL=http://localhost:9002

# ===========================================
# 🗄️ SUPABASE (Database & Authentication)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ===========================================
# 🤖 AI CONFIGURATION
# ===========================================
# Option 1: DeepSeek (Cost-effective, recommended)
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Option 2: OpenAI (More expensive)
OPENAI_API_KEY=sk-xxx

# ===========================================
# 💳 STRIPE (Payment Processing - Optional)
# ===========================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ===========================================
# 📊 REDIS (Rate Limiting - Optional)
# ===========================================
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

**📖 Detailed Setup Guide**: See [SETUP.md](docs/SETUP.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](docs/SETUP.md) | Complete setup instructions |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and design |
| [API.md](docs/API.md) | API documentation |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [PERFORMANCE.md](PERFORMANCE_OPTIMIZATION_FINDINGS.md) | Performance optimization analysis |
| [LIGHTHOUSE.md](LIGHTHOUSE_MOBILE_AUDIT.md) | Mobile performance audit results |

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations

### Backend
- **Supabase** - PostgreSQL database + Auth + Edge Functions
- **DeepSeek AI** - Cost-effective AI tutoring ($0.14/1M tokens!)
- **OpenAI Whisper** - Speech-to-text (premium users)
- **Stripe** - Payment processing

### Infrastructure
- **Vercel** - Deployment platform (recommended)
- **Service Worker** - Offline support & caching
- **Upstash Redis** - Rate limiting (optional)

---

## 📊 Performance

### Lighthouse Scores (Mobile)

| Category | Score | Status |
|----------|-------|--------|
| **Performance** | **88/100** | 🟢 Good |
| **Accessibility** | **98/100** | 🟢 Excellent |
| **Best Practices** | **96/100** | 🟢 Excellent |
| **SEO** | **100/100** | 🟢 Perfect |

**Why 88 instead of 95?** We prioritized **real-world user experience** over Lighthouse scores:
- ⚡ First load: 2.4s (good for feature-rich app)
- 🚀 Repeat loads: <1s (Service Worker caching)
- 🛡️ Offline support (works without internet!)
- 📱 PWA installable (feels like native app)

**Read the full analysis**: [PERFORMANCE_OPTIMIZATION_FINDINGS.md](PERFORMANCE_OPTIMIZATION_FINDINGS.md)

---

## 🎯 Project Structure

```
besttutorever/
├── src/
│   ├── ai/                      # AI integration layer
│   │   ├── genkit.ts           # DeepSeek/OpenAI client
│   │   ├── prompts.ts          # System prompts (optimized for caching)
│   │   ├── behavior-control.ts # COPPA-compliant behavior flags
│   │   └── flows/              # AI-powered features
│   ├── app/                    # Next.js App Router pages
│   │   ├── (app)/             # Protected routes (requires auth)
│   │   │   ├── dashboard/     # Game controller interface
│   │   │   ├── tutor/         # AI chat tutor
│   │   │   └── parent-settings/ # Behavior control panel
│   │   └── landing/           # Public landing page
│   ├── components/            # React components
│   │   ├── game-controller.tsx # Nintendo Switch UI
│   │   ├── homework-planner.tsx
│   │   └── voice-to-text.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-behavior-flags.ts
│   │   └── use-progressive-enhancement.ts
│   ├── lib/                   # Utilities
│   │   ├── audio-feedback.ts  # Sound effects
│   │   └── natural-speech.ts  # Text-to-speech
│   └── context/               # Global state
├── public/
│   ├── sw.js                  # Service Worker
│   ├── manifest.json          # PWA manifest
│   └── offline.html           # Offline fallback page
├── supabase/
│   ├── functions/             # Edge Functions
│   │   └── stripe-webhook-novatutor/
│   └── migrations/            # Database schema
└── docs/                      # Documentation
```

---

## 🎨 Key Features Deep Dive

### 🎮 Game Controller Interface

The centerpiece of BestTutorEver - a fully functional Nintendo Switch-style controller:

**Features:**
- **D-Pad Subject Selection**: Up=Math, Down=Science, Left=Reading, Right=History
- **Push-to-Talk Button**: Giant red microphone button (60fps animations!)
- **Joy-Cons**: Minecraft-themed Diamond Ore (left) and Redstone (right)
- **Action Buttons**: Smart Tools, Tests, Progress, Help
- **Responsive Design**: Adapts to phones, tablets, and desktop

**Tech Highlights:**
- GPU-accelerated animations with `will-change` CSS
- Touch gestures with `onTouchStart`/`onTouchEnd`
- Haptic feedback via Vibration API
- Keyboard navigation (arrow keys + spacebar)
- Age-based UI scaling (Grade 3 = XL icons, Grade 12 = SM icons)

**See implementation**: [`src/components/game-controller.tsx`](src/components/game-controller.tsx)

---

### 🤖 Prompt-Free AI Behavior Control

COPPA-compliant AI system using **behavior flags** instead of dynamic prompts:

```typescript
interface BehaviorFlags {
  subject: 'math' | 'science' | 'reading' | 'history' | 'general';
  gradeLevel: 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  modality: 'chat' | 'voice';
  efMode: 'off' | 'light' | 'standard' | 'high';  // Executive function support
  verbosity: 'short' | 'normal';
  helpPhase: 'orient' | 'guide' | 'reflect';
  safetyMode: 'strict' | 'standard';
  toneBias: 'encouraging' | 'neutral';
}
```

**Why This Matters:**
- ✅ **Predictable**: Same flags = same behavior (testable!)
- ✅ **Safe**: No dynamic prompt injection risks
- ✅ **Parent Control**: Parents set flags, not prompts
- ✅ **COPPA Compliant**: No personal data in prompts

**See implementation**: [`src/ai/behavior-control.ts`](src/ai/behavior-control.ts)

---

### 📱 Progressive Web App (PWA)

Full offline support with Service Worker:

**Caching Strategy:**
- **Static assets**: Cache-first (instant loads!)
- **API calls**: Network-first with cache fallback
- **Pages**: Network-first for freshness

**Features:**
- 🛡️ Works offline (cached homework plans, notes)
- 🔄 Background sync when connection returns
- 📲 Installable to home screen
- 🔔 Push notifications for study reminders

**Performance Impact:**
- First load: Slightly slower (Service Worker overhead)
- Repeat loads: **Near-instant** (<1s!)
- Offline: Fully functional (no error pages!)

**See implementation**: [`public/sw.js`](public/sw.js)

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 9002)
npm run build           # Build for production
npm start               # Start production server

# Testing
npm run lint            # ESLint
npm run typecheck       # TypeScript type checking
npm run lighthouse      # Desktop audit
npm run lighthouse:mobile  # Mobile audit

# Database
npx supabase start      # Start local Supabase
npx supabase db reset   # Reset database with migrations
npx supabase functions deploy  # Deploy Edge Functions
```

---

## 🚢 Deployment

### Recommended: Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Set environment variables in Vercel dashboard
```

**Detailed guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

### Alternative: Docker

```bash
docker build -t besttutorever .
docker run -p 3000:3000 besttutorever
```

---

## 🧪 Testing

```bash
# Unit tests (Coming soon)
npm test

# E2E tests with Playwright
npx playwright test

# API health checks
npm run test:api
npm run test:supabase
npm run test:deepseek
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📄 License

This project is licensed under a **Proprietary License** - see [LICENSE](LICENSE) for full terms.

**Summary:**
- ✅ **Viewing allowed**: For portfolio evaluation by hiring managers/recruiters
- ❌ **Use prohibited**: Cannot use, copy, or modify without written permission
- ❌ **Commercial use prohibited**: Requires separate commercial license
- 💰 **Licensing available**: Contact for commercial licensing options

**For licensing inquiries**: marlon.ridley@gmail.com

See [COPYRIGHT.md](COPYRIGHT.md) for detailed copyright information and [PROTECTING_YOUR_CODE.md](PROTECTING_YOUR_CODE.md) for protection guidelines.

---

## 🙏 Acknowledgments

- **AI**: Powered by [DeepSeek](https://www.deepseek.com/) and [OpenAI](https://openai.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Framework**: [Next.js](https://nextjs.org/)
- **Hosting**: [Vercel](https://vercel.com/)
- **Database**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide](https://lucide.dev/)

---

## 📞 Contact & Support

- **Author**: Marlon Dridley
- **GitHub**: [@marlondridley](https://github.com/marlondridley)
- **Issues**: [Report a bug](https://github.com/marlondridley/novatutor/issues)
- **Discussions**: [Feature requests](https://github.com/marlondridley/novatutor/discussions)

---

## 🎯 Portfolio Highlights

**For recruiters and hiring managers:**

This project demonstrates:

✅ **Full-Stack Development**: Next.js 15, TypeScript, Supabase, Stripe integration  
✅ **AI Integration**: DeepSeek/OpenAI API, prompt engineering, context caching  
✅ **UI/UX Design**: Kid-friendly interfaces, accessibility (WCAG 2.1 AA), responsive design  
✅ **Performance Optimization**: 88/100 Lighthouse score, Service Worker caching, lazy loading  
✅ **Security**: COPPA compliance, prompt-free AI, secure authentication  
✅ **DevOps**: CI/CD, Docker, Vercel deployment, environment configuration  
✅ **Testing**: E2E testing, API integration tests, performance audits  
✅ **Documentation**: Comprehensive README, API docs, architecture diagrams  

**Technologies**: Next.js • TypeScript • Supabase • Stripe • DeepSeek AI • Tailwind CSS • PWA

---

<div align="center">

**Made with ❤️ for students and educators**

[⭐ Star this repo](https://github.com/marlondridley/novatutor) • [🐛 Report Bug](https://github.com/marlondridley/novatutor/issues) • [💡 Request Feature](https://github.com/marlondridley/novatutor/issues)

</div>


