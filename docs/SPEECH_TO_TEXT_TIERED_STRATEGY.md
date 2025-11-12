# Speech-to-Text Tiered Strategy

## 🎯 Product Strategy

### Free Tier (Default)
**Technology:** Browser-based `react-speech-recognition` (Web Speech API)
- ✅ $0 cost
- ✅ Real-time transcription
- ✅ 90-95% accuracy
- ✅ Works in Chrome, Edge, Safari
- ⚠️ May struggle with:
  - Accents
  - Background noise
  - Complex technical terms
  - Non-English languages

### Premium Tier ($2/month add-on)
**Technology:** OpenAI Whisper API
- ✅ 99% accuracy
- ✅ 57 languages
- ✅ Better with accents and noise
- ✅ Technical vocabulary (math, science)
- ✅ Auto-punctuation
- 💰 Cost: ~$0.006 per minute (~333 minutes for $2)

---

## 📊 Pricing Model

### Base Subscription
- $12.99/month per child
- Includes browser-based speech-to-text

### Premium Voice Add-On
- **+$2.00/month** per child
- Unlocks OpenAI Whisper for all voice features
- ~5 hours of premium transcription per month

### ROI for Student
- **Free:** Good enough for 80% of use cases
- **Premium:** Worth it if:
  - Student has strong accent
  - Non-native English speaker
  - Learning languages other than English
  - Needs technical vocabulary recognition
  - Uses voice features heavily (>30 min/day)

---

## 🎨 User Experience Flow

### 1. **Default Experience (Free)**

```
Student clicks "🎤 Talk It Out"
  ↓
Browser speech-to-text activates
  ↓
Real-time transcription appears
  ↓
If accuracy is poor (user repeats 3+ times):
  ↓
Show upgrade prompt:
  "Having trouble? Premium Voice ($2/mo) gives you 
   99% accuracy with advanced AI. Try it free for 7 days."
```

### 2. **Premium Experience**

```
Student clicks "🎤 Talk It Out" 
  ↓
Badge shows: "Premium Voice Active 🎤✨"
  ↓
Records audio → Sends to Whisper API
  ↓
Returns high-quality transcription
  ↓
"Transcribed with Premium Voice (99% accurate)"
```

---

## 🛠️ Implementation Plan

### Phase 1: Feature Flag (30 min)

Add to `profiles` table:
```sql
ALTER TABLE profiles ADD COLUMN premium_voice_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN premium_voice_expires_at TIMESTAMP WITH TIME ZONE;
```

### Phase 2: Subscription Product (15 min)

Add to Stripe:
- Product: "Premium Voice"
- Price: $2.00/month
- Metadata: `feature=premium_voice`

### Phase 3: Voice Mode Selector (1 hour)

Update `voice-to-text.tsx`:
```typescript
interface VoiceToTextProps {
  mode?: 'free' | 'premium' | 'auto'; // auto = fallback to premium if available
  onUpgradeClick?: () => void;
}

// Show mode indicator
{mode === 'premium' && (
  <Badge variant="premium">Premium Voice Active 🎤✨</Badge>
)}
```

### Phase 4: Upgrade Prompts (30 min)

Trigger upgrade prompt when:
1. User clicks "Stop Recording" → "Clear" → "Start Recording" 3+ times in 2 minutes
2. Transcript has low confidence (<70%)
3. User manually requests upgrade

### Phase 5: Usage Tracking (30 min)

Track premium voice usage:
```typescript
// Log each Whisper API call
{
  userId: string;
  duration: number; // seconds
  cost: number; // calculated from duration
  timestamp: Date;
}

// Alert if approaching monthly limit
if (monthlyUsage > 300 minutes) {
  showWarning("You've used 90% of your Premium Voice minutes");
}
```

---

## 🎁 Upgrade Messaging (Study Coach Voice)

### In-App Prompts

**After 3rd retry:**
```
💡 Having trouble?

Free voice works great most of the time, but Premium Voice 
uses advanced AI for 99% accuracy — even with accents, 
background noise, and technical terms.

Try it free for 7 days, then just $2/month.

[Try Premium Voice 🎤✨]  [Maybe Later]
```

**Settings Page:**
```
🎤 Premium Voice — $2/month
✨ 99% accuracy with OpenAI Whisper
🌍 57 languages supported
🎯 Perfect for technical subjects
📊 ~5 hours of transcription per month

Current Plan: Browser Voice (Free)
[Upgrade to Premium Voice]
```

**Parent Dashboard:**
```
💡 Coach Tip

Your child has been using voice features a lot! 
Premium Voice ($2/mo) gives 99% accuracy and works 
better with their accent. It could save them time 
on homework.

[Learn More]
```

---

## 📈 Success Metrics

### Conversion Targets
- **Trial Conversion:** 40% of free users try premium
- **Paid Conversion:** 15% of trial users subscribe
- **Retention:** 80% of premium voice users renew

### Key Indicators
- **High Intent:** User retries recording 3+ times
- **Heavy Usage:** >30 min voice/day on free tier
- **Language Needs:** Non-English language selected
- **Parent Request:** Parent asks for upgrade

---

## 🔒 Privacy & COPPA Compliance

### Free Tier (Browser)
- ✅ Audio never sent to server
- ✅ Processing happens in browser
- ✅ No storage or logging

### Premium Tier (Whisper)
- ⚠️ Audio sent to OpenAI (encrypted)
- ✅ Deleted immediately after transcription
- ✅ No training on student data (per OpenAI policy)
- ✅ Parent must consent to premium features

**Consent Flow:**
```
Before enabling Premium Voice:

"Premium Voice uses OpenAI's Whisper AI for better 
accuracy. This means audio is briefly sent to OpenAI 
for transcription, then immediately deleted. No audio 
is stored or used for AI training.

By enabling this feature, you consent to this processing.

[I Understand, Enable Premium Voice] [Cancel]"
```

---

## 💰 Cost Analysis

### Free Tier
- Cost per user: $0
- Margin: 100%
- Risk: Browser limitations may frustrate users

### Premium Tier
- Revenue: $2.00/month
- Whisper cost: ~$0.006/min × 333 min = $2.00 (break even)
- Target usage: ~150 min/month (50% usage)
- Actual cost: ~$0.90/month
- Margin: $1.10/month (55%)
- Risk: Heavy users may exceed limits

### Upsell Potential
- 1,000 base users at $12.99
- 10% convert to Premium Voice (+$2)
- Additional revenue: $200/month
- Additional profit: $110/month

---

## 🚀 Rollout Plan

### Week 1: Soft Launch
- Enable feature flag for internal testing
- Test upgrade flow with test users
- Monitor Whisper API costs

### Week 2: Beta Launch
- Offer free trial to top 50 users
- Collect feedback on accuracy improvement
- Measure conversion rates

### Week 3: Full Launch
- Add upgrade prompts to all users
- Enable Stripe product and checkout
- Track usage and costs

### Week 4: Optimize
- A/B test upgrade messaging
- Adjust usage limits if needed
- Add parent dashboard insights

---

## 🎯 Marketing Copy

### Landing Page Addition
```
🎤 Premium Voice (Optional)
Need perfect transcription every time?

✨ 99% accuracy with advanced AI
🌍 Works in 57 languages
🎯 Understands technical vocabulary
📊 Just $2/month per child

Perfect for students who:
- Use voice features heavily (30+ min/day)
- Have strong accents or speak multiple languages
- Need technical terms transcribed correctly
- Learn better by talking through their work

Try it free for 7 days, cancel anytime.
```

### Email to Existing Users
```
Subject: Make voice features even better 🎤✨

Hi [Parent Name],

We noticed [Child] loves using voice features! 

Most students do great with our free browser-based 
voice recognition. But if [Child] is:
- Repeating themselves often
- Speaking in languages other than English
- Struggling with technical vocabulary

Premium Voice might help! It uses OpenAI's advanced 
AI for 99% accuracy, even with accents and background 
noise.

Try it free for 7 days, then just $2/month.

[Activate Premium Voice]

Questions? Reply to this email!

— The Study Coach Team
```

---

## 🛡️ Fallback Strategy

**If Premium Voice fails:**
1. Automatically fall back to free browser voice
2. Show message: "Premium Voice is temporarily unavailable. Using free mode."
3. Log error for debugging
4. Don't charge for that session

**If user exceeds monthly limit:**
1. Show warning at 80% usage
2. At 100%, offer:
   - Pay $2 for additional 5 hours
   - Switch to free mode for rest of month
   - Upgrade to higher tier (coming soon)

---

## 📚 Documentation Updates Needed

1. Update `docs/VOICE_TO_TEXT_FEATURE.md` with tiered info
2. Add pricing page section for Premium Voice
3. Update FAQ with "When should I upgrade to Premium Voice?"
4. Parent guide: "Understanding Voice Features"

---

## ✅ Implementation Checklist

### Database
- [ ] Add `premium_voice_enabled` column to profiles
- [ ] Add `premium_voice_expires_at` column
- [ ] Create `voice_usage_logs` table

### Stripe
- [ ] Create "Premium Voice" product
- [ ] Set price to $2.00/month
- [ ] Add webhook handler for premium_voice subscription

### Frontend
- [ ] Add mode selector to `voice-to-text.tsx`
- [ ] Show "Premium Voice Active" badge
- [ ] Add upgrade prompts (3 retry trigger)
- [ ] Create premium voice settings page
- [ ] Add usage meter (minutes used this month)

### Backend
- [ ] Add `/api/voice/transcribe-premium` endpoint
- [ ] Integrate OpenAI Whisper API
- [ ] Add usage tracking and limits
- [ ] Add cost monitoring alerts

### Testing
- [ ] Test free → premium flow
- [ ] Test upgrade checkout
- [ ] Test usage limit enforcement
- [ ] Test fallback to free mode

### Marketing
- [ ] Update landing page
- [ ] Create upgrade email campaign
- [ ] Add to pricing page
- [ ] Update parent dashboard with tips

---

**Status:** 📋 **Ready to Implement**  
**Estimated Time:** 1 full day  
**Expected Revenue:** $100-300/month (based on 1,000 users, 5-15% conversion)

