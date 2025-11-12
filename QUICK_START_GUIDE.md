# Quick Start Guide - Study Coach MVP

## 🚀 What Just Changed

Your app has been transformed from "AI Tutor" to "Study Coach" with parent-focused conversion features!

---

## 📍 New Pages & Features

### 1. Landing Page
**URL:** `http://localhost:9002/landing` or `/landing`
- Professional marketing page
- Hero, value props, testimonials, pricing, FAQ
- **Use this as your main marketing URL**

### 2. Parent Dashboard  
**URL:** `/parent-dashboard` (after login)
- Shows student activity summary
- Weekly insights and achievements
- Download/email reports
- **Currently uses mock data - connect to your database**

### 3. Enhanced Pricing Page
**URL:** `/pricing` (after login)
- Now shows $12.99/month with 7-day trial
- Testimonials and social proof
- Better conversion layout

### 4. Email Preview
**URL:** `/email-preview` (after login)
- View all onboarding email templates
- Welcome, tips, and weekly emails

---

## ✅ Quick Test Checklist

```bash
# 1. Start your dev server
npm run dev

# 2. Visit these pages and verify:
http://localhost:9002/landing          # Landing page works
http://localhost:9002/login            # Says "Study Coach" not "SuperTutor"
http://localhost:9002/pricing          # Shows $12.99/month
http://localhost:9002/parent-dashboard # Dashboard displays
http://localhost:9002/email-preview    # Email templates show
```

---

## 🎨 Branding Changes

### Old → New:
- ❌ "SuperTutor" → ✅ "Study Coach"
- ❌ "AI Tutor" → ✅ "Study Coach"
- ❌ "Educational Assistant" → ✅ "Study Coach"
- ❌ $5/month → ✅ $12.99/month

### Logo:
- Brain icon (instead of Graduation Cap)
- Gradient blue background
- "Study Coach" text

---

## 📧 Email Onboarding Flow

**What to Send:**
1. **Day 0 (Signup):** Welcome email with quick start guide
2. **Day 1:** Tip about starting with tough subjects
3. **Day 3:** Tip about using homework planner
4. **Day 5:** Tip about active learning/quizzes
5. **Every Monday:** Weekly progress summary

**How to Implement:**
- Use SendGrid, Postmark, or Resend
- Copy email templates from `src/components/email-onboarding.tsx`
- Schedule with cron jobs or service automations

---

## 💰 Update Stripe Pricing

### In Your Stripe Dashboard:
1. Go to Products → Create Product
2. Name: "Study Coach Premium"
3. Price: $12.99/month recurring
4. Add 7-day free trial
5. Update pricing table ID in `/pricing` page if needed

Current Stripe config in code:
```
pricing-table-id="prctbl_1SO5iLGxHdRwEkVK0LTy9JqE"
publishable-key="pk_live_51S5Tk9..."
```

---

## 🔧 Connect Real Data to Parent Dashboard

**File:** `src/components/parent-dashboard.tsx`

**Current State:** Uses mock data

**To-Do:** Replace with real data from Supabase:
```typescript
// Track these in your database:
interface StudentActivity {
  date: Date;
  subject: string;
  questions_asked: number;
  time_spent_minutes: number;
  topics: string[];
  ai_notes: string;
}

// Query from Supabase:
const { data } = await supabase
  .from('student_activity')
  .select('*')
  .eq('user_id', userId)
  .gte('date', weekStart)
  .lte('date', weekEnd);
```

---

## 📊 What Parents See

### Parent Dashboard Shows:
- **Study time this week** (hours and minutes)
- **Subjects practiced** (Math, Science, etc.)
- **Questions asked** (engagement metric)
- **Study streak** (consecutive days)
- **AI insights** (personalized observations)
- **Notable achievements** (milestones reached)
- **Areas for growth** (where to focus next)

### Weekly Email Includes:
- Total study time
- Subjects covered
- One notable achievement
- One Study Coach recommendation
- Link to full report

---

## 🎯 Marketing Your Landing Page

### Share This URL:
`https://yourdomain.com/landing`

### Where to Post:
1. **Facebook Groups:**
   - Homeschool parents
   - Local parenting groups
   - Education communities

2. **Reddit:**
   - r/homeschool
   - r/Parenting
   - r/education

3. **Twitter/X:**
   - Use hashtags: #homeschool #edtech #studyskills

4. **Local Schools:**
   - Share with teachers
   - PTA/PTO meetings
   - School newsletters

### Key Selling Points:
- ✅ $12.99/month (price of 2 coffees)
- ✅ 7-day free trial, no credit card
- ✅ 24/7 availability
- ✅ Socratic teaching method (not just answers)
- ✅ Parent dashboard with insights
- ✅ Safe, ad-free environment
- ✅ Grades 3–12

---

## 🐛 Troubleshooting

### Landing Page Not Loading?
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Parent Dashboard Shows No Data?
- Expected! It uses mock data currently
- Connect to your database to show real activity

### Emails Not Sending?
- Email components are templates only
- You need to integrate with SendGrid/Postmark/Resend
- See implementation notes in code comments

### Logo Showing Fallback?
- Image file `/study-coach-logo.png` doesn't exist yet
- Brain icon shows as fallback (this is fine!)
- Create custom logo and add to `/public` folder

---

## 📝 Deployment Checklist

Before going live:

- [ ] Update Stripe to $12.99/month plan
- [ ] Add 7-day free trial to Stripe
- [ ] Test landing page on mobile
- [ ] Test all CTAs (call-to-action buttons)
- [ ] Set up Google Analytics
- [ ] Create welcome email automation
- [ ] Set up weekly email cron job
- [ ] Test parent dashboard with real data
- [ ] Update testimonials with real ones
- [ ] Add privacy policy link
- [ ] Add terms of service link
- [ ] Test signup → trial → conversion flow
- [ ] Deploy to Vercel/production
- [ ] Point domain to landing page

---

## 🎉 You're Ready!

**Your conversion-optimized MVP includes:**
- ✅ Professional landing page
- ✅ Parent dashboard with insights
- ✅ Email onboarding templates
- ✅ Enhanced pricing page
- ✅ Study Coach rebranding
- ✅ Trust signals & social proof
- ✅ FAQ section

**Next Steps:**
1. Test everything locally
2. Update Stripe pricing
3. Deploy to production
4. Share landing page link
5. Watch the signups roll in! 🚀

---

## 📞 Quick Reference

| Page | URL | Purpose |
|------|-----|---------|
| Landing | `/landing` | Main marketing page |
| Login | `/login` | Sign in/up |
| Dashboard | `/dashboard` | Student view |
| Study Coach | `/tutor` | AI chat interface |
| Pricing | `/pricing` | Subscription page |
| Parent Dashboard | `/parent-dashboard` | Activity tracking |
| Email Preview | `/email-preview` | View email templates |

---

**Questions?** Check `MVP_CONVERSION_UPDATES.md` for detailed documentation!

**Ready to Launch?** 🚀
```bash
npm run build
vercel --prod
```

