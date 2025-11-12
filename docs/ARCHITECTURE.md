# NovaTutor Architecture

## 🏗️ Project Structure

```
novatutor/
├── src/                          # Next.js application
│   ├── app/                      # App Router pages & API routes
│   ├── components/               # React components
│   ├── ai/                       # AI flows and prompts
│   ├── lib/                      # Utilities and helpers
│   └── hooks/                    # React hooks
│
├── supabase/                     # Supabase configuration
│   ├── functions/                # Deno edge functions
│   │   ├── tsconfig.json        # Deno TypeScript config
│   │   └── stripe-webhook-novatutor/  # Stripe webhook handler
│   └── migrations/               # Database migrations
│
├── public/                       # Static assets
├── tests/                        # Test scripts
└── docs/                         # Documentation
```

## 🔧 Tech Stack

### Frontend & Backend
- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod validation

### Database & Auth
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Row Level Security**: Enabled for all tables
- **Storage**: Supabase Storage (for images)

### AI & LLM
- **Primary Provider**: DeepSeek AI
- **Fallback**: OpenAI GPT-4
- **Vector Search**: Supabase pgvector (for RAG)
- **Caching**: Redis (rate limiting & embeddings)

### Payment
- **Provider**: Stripe
- **Webhooks**: Supabase Edge Function (Deno)
- **Subscription Model**: Per-child pricing

### Deployment
- **Frontend/API**: Vercel (or Next.js host)
- **Database**: Supabase Cloud
- **Edge Functions**: Supabase Platform (Deno)
- **CDN**: Vercel Edge Network

## 🎯 Key Design Decisions

### 1. **Two TypeScript Configurations**

#### Why?
Different runtimes require different type systems:

| Component | Runtime | Config | Type Checker |
|-----------|---------|--------|--------------|
| **Next.js App** | Node.js/Browser | `tsconfig.json` (root) | tsc (Next.js) |
| **Supabase Functions** | Deno | `supabase/functions/tsconfig.json` | Deno CLI |

#### Implementation:
```json
// Root tsconfig.json
{
  "exclude": ["node_modules", "supabase/functions"]
}

// supabase/functions/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"]
  }
}
```

### 2. **Cookie-Based Auth (SSR)**

Using `@supabase/ssr` for proper server-side authentication:

```typescript
// Browser client
import { createBrowserClient } from '@supabase/ssr'

// Server client (App Router)
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Middleware
export async function updateSession(request: NextRequest) {
  // Refreshes session cookies on every request
}
```

**Benefits:**
- ✅ Works with Next.js middleware
- ✅ Proper SSR/SSG support
- ✅ No localStorage issues
- ✅ Secure session management

### 3. **AI Provider Abstraction**

Centralized AI provider selection with fallback:

```typescript
// ai/genkit.ts
export const { openai, DEFAULT_MODEL } = getProvider();

// Automatically uses DeepSeek if available, falls back to OpenAI
```

**Benefits:**
- ✅ Cost optimization (DeepSeek is cheaper)
- ✅ Easy provider switching
- ✅ Graceful degradation
- ✅ Cached embeddings

### 4. **Modular AI Flows**

Each AI feature is a separate flow with typed inputs/outputs:

```typescript
// ai/flows/subject-specialized-tutor.ts
export async function connectWithSubjectSpecializedTutor(
  input: ConnectWithSubjectSpecializedTutorInput
): Promise<ConnectWithSubjectSpecializedTutorOutput>
```

**Flows:**
- `subject-specialized-tutor` - Socratic tutoring
- `generate-personalized-learning-path` - Adaptive learning plans
- `data-driven-executive-function-coaching` - Behavioral interventions
- `homework-feedback-flow` - Image-based homework help
- `generate-illustration-flow` - Educational diagrams
- `test-prep-flow` - Practice test generation

### 5. **Cornell Notes Digital Implementation**

Structured note-taking with AI integration:

```sql
CREATE TABLE cornell_notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  cue_column TEXT[],      -- Key questions
  note_body TEXT,          -- Main content
  summary TEXT,            -- Reflection
  tags TEXT[],             -- For search
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Features:**
- Auto-save (debounced)
- AI cue suggestions
- Tag-based search
- Export to learning journal

### 6. **Adaptive Test Generator**

Context-aware quiz generation:

```typescript
// Modes: Practice, Challenge, Mastery
// Context: Recent Cornell notes + past performance
// Delivery: Streaming responses for perceived speed
```

**Features:**
- Difficulty adapts to student level
- Questions pulled from learning journal
- Streaming UI for instant feedback
- Cached embeddings for speed

### 7. **Privacy-First Design**

COPPA-compliant with parental controls:

```typescript
// Middleware enforces privacy acceptance
export async function middleware(request: NextRequest) {
  const { user } = await supabase.auth.getUser();
  
  if (user && !user.privacy_accepted) {
    return NextResponse.redirect('/privacy-agreement');
  }
}
```

**Features:**
- Required privacy acceptance on signup
- Parental consent for users under 13
- RLS policies on all tables
- No third-party tracking

## 🚀 Data Flow Examples

### 1. **User Authentication Flow**

```
Client → Login Page → Supabase Auth
                         ↓
                    Set Cookies
                         ↓
    Middleware → Validate Session → Redirect to Dashboard
```

### 2. **AI Tutoring Request**

```
Client → Tutor UI → /api/tutor (Next.js API)
                         ↓
                    Rate Limiting (Redis)
                         ↓
                    AI Flow (DeepSeek)
                         ↓
                    Stream Response → Client
                         ↓
                    Log to Database (Supabase)
```

### 3. **Stripe Webhook Processing**

```
Stripe → Supabase Edge Function (Deno)
              ↓
         Verify Signature
              ↓
         Update Database (profiles table)
              ↓
         Return 200 OK
```

### 4. **Cornell Notes with AI**

```
Client → Note Editor → Auto-save (debounced)
                            ↓
                       /api/notes (Next.js)
                            ↓
                       Supabase (save note)
                            ↓
         "Suggest Cues" → /api/notes/suggest-cues
                            ↓
                       AI Flow (analyze content)
                            ↓
                       Return suggestions → Client
```

## 📊 Database Schema (Key Tables)

### `profiles`
User profiles with subscription status:
- `id` (UUID, primary key, references auth.users)
- `email`, `name`, `age`, `grade`
- `subscription_status` ('free' | 'active' | 'trialing' | 'past_due')
- `privacy_accepted`, `privacy_accepted_at`
- `parent_id` (for multi-child accounts)

### `cornell_notes`
Digital Cornell notes:
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `subject`, `topic`
- `cue_column` (TEXT[])
- `note_body`, `summary`
- `tags` (TEXT[])
- `created_at`, `updated_at`

### `learning_sessions`
Track student activity:
- `id`, `user_id`
- `subject`, `topic`
- `duration`, `confidence_level`
- `created_at`

## 🔐 Security Measures

1. **Row Level Security (RLS)**: All tables have RLS enabled
2. **API Rate Limiting**: Redis-based rate limiting on all AI endpoints
3. **Input Validation**: Zod schemas for all user inputs
4. **SQL Injection Prevention**: Parameterized queries only
5. **XSS Protection**: Next.js automatic escaping
6. **CSRF Protection**: Next.js built-in protection
7. **Secure Cookies**: HttpOnly, Secure, SameSite flags
8. **Environment Variables**: Separate `.env.local` (never committed)

## 🔄 CI/CD Pipeline

```
Git Push → GitHub Actions
              ↓
         Type Check (tsc)
              ↓
         Lint (ESLint)
              ↓
         Build (next build)
              ↓
         Deploy to Vercel
              ↓
         Run Supabase Migrations
```

## 📚 Additional Documentation

- [Privacy Agreement Setup](./PRIVACY_AGREEMENT_SETUP.md)
- [Multi-Child Subscription](./MULTI_CHILD_SETUP.md)
- [Cornell Notes Setup](./CORNELL_NOTES_SETUP.md)
- [Adaptive Test Generator](./ADAPTIVE_TEST_GENERATOR.md)
- [AI Setup Guide](./AI_SETUP_GUIDE.md)
- [Parent Dashboard Email](./parent-dashboard-email-setup.md)

## 🎨 Design System

- **Color Palette**: Calm Blue (#2563EB) + Warm Yellow (#FBBF24)
- **Typography**: PT Sans (body), system fonts (fallback)
- **Border Radius**: 0.75rem (rounded-xl for warmth)
- **Spacing**: Tailwind default scale
- **Animation**: Framer Motion for microinteractions

## 🧪 Testing Strategy

1. **Type Safety**: TypeScript strict mode + tsc
2. **API Health Checks**: `npm run test:api`
3. **Supabase Integration**: `npm run test:supabase`
4. **AI Provider**: `npm run test:deepseek`
5. **Redis Connection**: `npm run test:redis`

## 🚀 Deployment Checklist

- [ ] Set all environment variables in Vercel/host
- [ ] Run Supabase migrations (`supabase db push`)
- [ ] Deploy Supabase edge functions (`supabase functions deploy`)
- [ ] Configure Stripe webhooks (point to edge function URL)
- [ ] Set up Redis instance (Upstash or similar)
- [ ] Test authentication flow end-to-end
- [ ] Verify AI provider API keys
- [ ] Enable RLS on all Supabase tables
- [ ] Test payment flow with Stripe test mode
- [ ] Monitor error logs (Vercel/Sentry)

## 📈 Performance Optimizations

1. **AI Response Streaming**: Faster perceived load times
2. **Cached Embeddings**: Redis cache for vector search
3. **Image Optimization**: Next.js Image component
4. **Code Splitting**: Automatic via Next.js App Router
5. **Edge Middleware**: Fast auth checks at edge
6. **Static Generation**: Pre-render marketing pages
7. **Debounced Auto-save**: Reduce database writes

---

**Last Updated**: 2025-11-12  
**Maintained By**: Development Team  
**Version**: 1.0

