# 🎓 SuperNOVA Tutor - Complete Guide

> **Your AI-powered tutoring platform - Production ready!**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [What You Have](#what-you-have)
3. [Setup & Deployment](#setup--deployment)
4. [Payment & Subscriptions](#payment--subscriptions)
5. [Entitlements & Access Control](#entitlements--access-control)
6. [Technical Details](#technical-details)
7. [Cost & Revenue](#cost--revenue)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### **Deploy in 3 Steps:**

```bash
# 1. Add QR code image
# Save your QR code as: public/payment-qr-code.png

# 2. Verify environment variables in .env.local
DEEPSEEK_API_KEY=your-key
OPENAI_API_KEY=your-key
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# 3. Deploy to Vercel
vercel --prod
```

**Your app will be live in 2-3 minutes!**

---

## ✅ What You Have

### **Full-Featured AI Platform:**
- 🎓 **AI Tutoring** - DeepSeek-powered Q&A (all subjects)
- 📚 **Learning Paths** - Personalized study plans
- 📝 **Homework Help** - AI feedback on assignments
- 📊 **Test Prep** - Practice quizzes & questions
- 🗣️ **Text-to-Speech** - Audio responses (OpenAI TTS)
- 🎤 **Speech-to-Text** - Voice questions (Whisper)
- 🎨 **Image Generation** - Visual aids (DALL-E 3)
- 🧠 **Executive Function Coaching** - Study skills

### **User Management:**
- ✅ Supabase authentication (email/password)
- ✅ User profiles (name, age, grade)
- ✅ Session management
- ✅ Subscription tracking

### **Payment System:**
- ✅ Stripe payment link ($5/month)
- ✅ QR code integration
- ✅ Pricing page
- ✅ Login banner promotions

### **Production Features:**
- ✅ Rate limiting (Redis-based)
- ✅ Cost tracking
- ✅ Error handling
- ✅ Input validation
- ✅ Prompt injection protection
- ✅ Response validation
- ✅ Caching layer

---

## 🛠️ Setup & Deployment

### **Prerequisites:**
- Node.js 18+ installed
- Vercel account (free)
- Supabase account (free)
- DeepSeek API key
- OpenAI API key

### **1. Environment Variables**

Create `.env.local` with:

```bash
# AI Services
DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
OPENAI_API_KEY=sk-your-openai-key

# Database & Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Redis (for better caching)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

**Get API Keys:**
- DeepSeek: https://platform.deepseek.com/api_keys
- OpenAI: https://platform.openai.com/api-keys
- Supabase: https://app.supabase.com/project/_/settings/api
- Upstash: https://console.upstash.com/ (optional)

### **2. Supabase Database Setup**

**Run this SQL in Supabase SQL Editor:**

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  grade TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  subscription_status TEXT DEFAULT 'free' 
    CHECK (subscription_status IN ('free', 'active', 'trialing', 'past_due', 'canceled')),
  subscription_id TEXT,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their profile during signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (true);
```

### **3. Add QR Code**

Save your Stripe payment QR code as:
```
public/payment-qr-code.png
```

### **4. Deploy to Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### **5. Add Environment Variables to Vercel**

1. Go to: https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add all variables from `.env.local`
4. Redeploy if needed

---

## 💳 Payment & Subscriptions

### **How It Works:**

```
User Flow:
1. User sees QR/pricing on login page
2. Clicks "Subscribe" or scans QR code
3. Redirects to Stripe checkout
4. Pays $5/month
5. You manually update their status in Supabase
6. User gets immediate full access
```

### **Stripe Payment Link:**
```
https://buy.stripe.com/3cI4gz2Op9bXe6Z61p2VG04
```

### **When Someone Pays:**

1. **Check Stripe Dashboard** for new subscriptions
2. **Go to Supabase** → Table Editor → profiles
3. **Find user by email**
4. **Update fields:**

```sql
UPDATE profiles
SET 
  subscription_status = 'active',
  subscription_id = 'sub_xxx',  -- From Stripe
  subscription_expires_at = NOW() + INTERVAL '30 days'
WHERE email = 'user@example.com';
```

### **Subscription Status Values:**
- `free` - Default, limited access
- `active` - Paid, full access ✅
- `trialing` - Trial period, full access ✅
- `past_due` - Payment failed, grace period
- `canceled` - Subscription ended

---

## 🔐 Entitlements & Access Control

### **Automatic Feature Gating**

The app automatically checks subscription status before granting access.

### **Free Users Get:**
- ❌ Rate limited (30 questions/hour)
- ❌ See upgrade prompts
- ✅ Limited trial of features

### **Active Users Get:**
- ✅ Unlimited questions
- ✅ All premium features
- ✅ No rate limits
- ✅ Full access

### **Using in Your Code:**

**Gate a page:**
```typescript
import { SubscriptionGate } from '@/components/subscription-gate';

export default function PremiumPage() {
  return (
    <SubscriptionGate feature="advanced analytics">
      <h1>Premium Content</h1>
      {/* Only paid users see this */}
    </SubscriptionGate>
  );
}
```

**Conditional features:**
```typescript
import { useSubscription } from '@/hooks/use-subscription';

export function MyComponent() {
  const { hasPremiumAccess } = useSubscription();

  return hasPremiumAccess() ? (
    <button>Unlimited Access</button>
  ) : (
    <Link href="/pricing">Upgrade to Premium</Link>
  );
}
```

**Skip rate limits for premium:**
```typescript
const { hasPremiumAccess } = useSubscription();

if (!hasPremiumAccess()) {
  // Apply rate limiting
  const rateLimit = await checkRateLimit('tutor', userId);
  if (!rateLimit.success) {
    return { error: 'Rate limit exceeded. Upgrade!' };
  }
}

// Process request for premium users
```

---

## 🔧 Technical Details

### **Tech Stack:**

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI

**Backend:**
- Next.js API Routes
- DeepSeek AI (text generation)
- OpenAI (TTS, STT, DALL-E)
- Supabase (auth & database)
- Upstash Redis (optional caching)

**Deployment:**
- Vercel (hosting)
- CDN (automatic)
- Edge functions

### **Key Files:**

```
src/
├── app/
│   ├── login/page.tsx              # Auth + QR banner
│   ├── (app)/
│   │   ├── dashboard/              # Main dashboard
│   │   ├── tutor/                  # AI tutoring
│   │   ├── learning-path/          # Study plans
│   │   ├── pricing/                # Payment page
│   │   └── focus/                  # Study tools
│   └── api/                        # API routes
├── ai/
│   ├── flows/                      # AI features
│   ├── validation.ts               # Security
│   ├── error-handling.ts           # Resilience
│   └── monitoring.ts               # Cost tracking
├── components/
│   ├── subscription-gate.tsx       # Feature gating
│   └── ui/                         # UI components
├── hooks/
│   └── use-subscription.ts         # Entitlement checks
└── lib/
    ├── actions.ts                  # Server actions
    ├── supabase.ts                 # Auth client
    └── redis.ts                    # Caching
```

### **Testing:**

```bash
# Run API health checks
npm run test:all

# Test individual services
npm run test:supabase    # Supabase connectivity
npm run test:deepseek    # DeepSeek API
npm run test:redis       # Redis caching

# Build for production
npm run build

# Local development
npm run dev
```

### **Security:**

- ✅ Environment variables never committed
- ✅ Row Level Security (RLS) in Supabase
- ✅ Input sanitization
- ✅ Prompt injection protection
- ✅ Rate limiting
- ✅ HTTPS enforced
- ✅ Security headers configured

---

## 💰 Cost & Revenue

### **Monthly Operating Costs:**

```
DeepSeek API:  $20/month  (AI text generation)
OpenAI API:    $10/month  (TTS, STT, images)
Vercel:        $0         (free tier)
Supabase:      $0         (free tier, 50K users)
Redis:         $0-10      (optional, in-memory fallback)
───────────────────────────
TOTAL:         $30-40/month
```

### **Revenue Model:**

```
Price: $5/month per subscriber

Break-even: 6-8 subscribers
```

### **Profitability:**

**At 20 subscribers:**
```
Revenue:  $100/month
Costs:    $40/month
Profit:   $60/month ($720/year)
```

**At 50 subscribers:**
```
Revenue:  $250/month
Costs:    $40/month
Profit:   $210/month ($2,520/year)
```

**At 100 subscribers:**
```
Revenue:  $500/month
Costs:    $40/month
Profit:   $460/month ($5,520/year)
```

### **Monitoring Revenue:**

**Query active subscribers:**
```sql
SELECT 
  COUNT(*) as active_subscribers,
  COUNT(*) * 5 as monthly_revenue
FROM profiles
WHERE subscription_status IN ('active', 'trialing');
```

---

## 🐛 Troubleshooting

### **Build Errors**

**Issue:** Missing dependencies
```bash
npm install
```

**Issue:** TypeScript errors
```bash
npm run typecheck
```

**Issue:** Build fails
```bash
rm -rf .next
npm run build
```

### **API Errors**

**Issue:** DeepSeek "402 Insufficient Balance"
- Add credits to DeepSeek account
- Check: https://platform.deepseek.com

**Issue:** OpenAI errors
- Verify API key is correct
- Check quota: https://platform.openai.com/usage

**Issue:** Supabase connection fails
- Verify URL and anon key
- Check RLS policies are correct

### **Subscription Issues**

**Issue:** User paid but no access
- Check Stripe dashboard for payment
- Update user status in Supabase:
```sql
UPDATE profiles
SET subscription_status = 'active'
WHERE email = 'user@example.com';
```

**Issue:** All users showing as 'free'
- Ensure subscription columns exist in database
- Run the ALTER TABLE SQL from setup

### **Deployment Issues**

**Issue:** Vercel build fails
- Check environment variables are set
- Ensure all required variables are added
- Check build logs for specific errors

**Issue:** QR code not showing
- Verify file exists: `public/payment-qr-code.png`
- Check file permissions
- Try hard refresh: Ctrl+Shift+R

---

## 📊 Monitoring & Analytics

### **Key Metrics to Track:**

**Growth:**
- Monthly Active Users (MAU)
- New signups per week
- Conversion rate (free → paid)
- Churn rate

**Revenue:**
- Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Customer Lifetime Value (LTV)

**Product:**
- Daily Active Users (DAU)
- Session duration
- Feature usage rates
- Error rates

### **Success Milestones:**

**Month 1:**
- 100 visitors
- 50 signups
- 3 paid subscribers ($15 MRR)

**Month 3:**
- 500 visitors
- 250 signups
- 25 paid subscribers ($125 MRR)

**Month 6:**
- 2,000 visitors
- 1,000 signups
- 100 paid subscribers ($500 MRR)

---

## 🎯 Best Practices

### **For Users:**
1. Test with free account first
2. Manually update one user to premium to test
3. Verify all features work for premium users
4. Set up monitoring in Stripe & Supabase

### **For Growth:**
1. Share on social media
2. Post in education communities
3. Run small ads ($5-10/day)
4. Collect testimonials
5. Create YouTube tutorials
6. Partner with schools

### **For Maintenance:**
1. Check Stripe daily for new subscriptions
2. Update user status within 24 hours
3. Monitor error rates in Vercel
4. Track API costs monthly
5. Backup Supabase weekly

---

## 📚 Additional Resources

### **Documentation:**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Stripe: https://stripe.com/docs

### **Support:**
- DeepSeek: https://platform.deepseek.com/docs
- OpenAI: https://platform.openai.com/docs
- Supabase: https://supabase.com/support

### **Community:**
- Next.js Discord
- Supabase Discord
- Vercel Community

---

## 🎉 Summary

**You have a production-ready AI tutoring platform!**

**Features:**
- ✅ Full AI tutoring (8+ features)
- ✅ User authentication
- ✅ Payment system ($5/month)
- ✅ Subscription tracking
- ✅ Feature gating
- ✅ Production security

**Costs:**
- $30-40/month operating
- Break-even at 6-8 subscribers

**Setup:**
- 3 steps to deploy
- 2 minutes to update subscriptions
- Simple, maintainable code

**Deploy command:**
```bash
vercel --prod
```

**You're ready to launch and start making money!** 🚀💰

---

## 🆘 Quick Help

**Need to:**
- Deploy? → `vercel --prod`
- Add subscriber? → Update Supabase profiles table
- Check revenue? → Query profiles table in Supabase
- Fix build? → `rm -rf .next && npm run build`
- Test features? → Set user to 'active' in Supabase

**Issues?**
- Check Vercel logs
- Verify environment variables
- Test API keys with `npm run test:all`

---

**Made with ❤️ for education**

**Version:** 1.0.0  
**Last Updated:** 2025

**Happy teaching!** 🎓✨

