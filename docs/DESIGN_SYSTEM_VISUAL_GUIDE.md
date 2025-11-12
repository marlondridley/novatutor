# 🎨 Study Coach Design System Visual Guide

**Purpose:** Quick reference for implementing the Study Coach visual identity

---

## 🌈 Color Palette

### Primary Colors

| Color | Hex | HSL | Usage | Emotion |
|-------|-----|-----|-------|---------|
| **Calm Blue** | `#2563EB` | `217 91% 60%` | Primary buttons, links, focus states | Focus & Trust |
| **Warm Yellow** | `#FBBF24` | `43 96% 56%` | Badges, highlights, "aha moments" | Curiosity & Warmth |
| **Soft Background** | `#F9FAFB` | `210 20% 98%` | Page background | Calm & Clean |
| **Dark Text** | `#111827` | `215 25% 15%` | Body text | Readable & Clear |

### Secondary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Growth Green** | `#059669` | Success states, achievements |
| **Energy Orange** | `#EA580C` | Streak indicators, time-sensitive |
| **Insight Purple** | `#7C3AED` | AI insights, "coach tips" |
| **Soft Gray** | `#E5E7EB` | Borders, dividers, muted elements |

---

## 🎯 Design Principles

### 1. **Warm, Not Corporate**

❌ **Before:** Navy blue (`#1E3A8A`) feels formal, serious  
✅ **After:** Calm blue (`#2563EB`) feels approachable, trustworthy

```css
/* ❌ OLD: Bank of America Navy */
--primary: 214 85% 35%;  /* Too dark, too corporate */

/* ✅ NEW: Calm Blue */
--primary: 217 91% 60%;  /* Bright, friendly, inviting */
```

### 2. **Curiosity Over Urgency**

❌ **Before:** No accent color → monochromatic, boring  
✅ **After:** Yellow accent (`#FBBF24`) → "aha moments", warmth

**Where to Use Yellow:**
- Achievement badges: "Mastered fractions! 🌟"
- "Suggest Cues" button in Cornell Notes
- Difficulty badges: "Challenge Mode 🎯"
- Streak indicators: "7 days! 🔥"

```tsx
// ✅ Example: Achievement Badge
<Badge className="bg-accent text-accent-foreground">
  <Sparkles className="h-3 w-3 mr-1" />
  Mastered!
</Badge>
```

### 3. **Soft Corners, Not Sharp**

❌ **Before:** `rounded-md` (6px) feels utilitarian  
✅ **After:** `rounded-xl` (12px) feels friendly

```css
/* Buttons */
rounded-xl  /* Not rounded-md */

/* Cards */
rounded-2xl  /* Not rounded-lg */

/* Inputs */
rounded-lg  /* Not rounded-md */
```

---

## 🧩 Component Examples

### Buttons

#### Primary Button (Calm Blue)
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
  Let's Test Your Skills ✨
</Button>
```

**Visual:**
- Background: Calm Blue (#2563EB)
- Text: White
- Hover: Slightly darker blue
- Border Radius: 12px

#### Accent Button (Warm Yellow)
```tsx
<Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
  <Sparkles className="mr-2 h-4 w-4" />
  Suggest Cues
</Button>
```

**Visual:**
- Background: Warm Yellow (#FBBF24)
- Text: Dark (#111827)
- Hover: Slightly darker yellow
- Use for: "Curiosity" actions (AI suggestions, hints, exploration)

---

### Badges

#### Success Badge (Growth Green)
```tsx
<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
  <Check className="h-3 w-3 mr-1" />
  Completed
</Badge>
```

#### Accent Badge (Warm Yellow)
```tsx
<Badge className="bg-accent/20 text-accent-foreground border border-accent">
  <Sparkles className="h-3 w-3 mr-1" />
  New Feature
</Badge>
```

#### Info Badge (Calm Blue)
```tsx
<Badge className="bg-primary/10 text-primary border border-primary/20">
  <Brain className="h-3 w-3 mr-1" />
  AI Insight
</Badge>
```

---

### Cards

```tsx
<Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <BookOpen className="h-5 w-5 text-primary" />
      Your Learning Journey
    </CardTitle>
    <CardDescription>
      Small wins add up — let's see how far you've come.
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Visual:**
- Border Radius: 16px (`rounded-2xl`)
- Shadow: Subtle, not heavy
- Hover: Slightly larger shadow (depth)

---

### Progress Indicators

#### Progress Bar (Calm Blue)
```tsx
<Progress value={75} className="h-2">
  <div className="h-full bg-primary rounded-full transition-all" />
</Progress>
```

#### Confidence Slider (Calm Blue → Warm Yellow)
```tsx
<Slider
  defaultValue={[3]}
  max={5}
  step={1}
  className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
/>
<div className="flex justify-between text-sm text-muted-foreground">
  <span>Just starting</span>
  <span className="text-accent font-medium">I could teach this!</span>
</div>
```

**Visual:**
- Track: Light gray
- Fill: Calm Blue
- Thumb: Warm Yellow (curiosity!)

---

## 📝 Microcopy Style Guide

### Tone Matrix

| Situation | ❌ Avoid | ✅ Use Instead |
|-----------|----------|----------------|
| **Button Action** | "Submit" | "Lock it in" |
| **Loading** | "Processing..." | "Building your plan..." |
| **Error** | "Failed to save" | "Oops! Let's try that again together." |
| **Success** | "Save successful" | "Great work! ✨ Saved." |
| **Empty State** | "No data" | "Nothing here yet — let's get started!" |
| **Encouragement** | "Good job" | "You're building great habits! 💪" |

### Key Phrases

| Context | Phrase | Why It Works |
|---------|--------|--------------|
| **Dashboard** | "Let's plan your next small win." | Removes pressure, focuses on progress |
| **Homework** | "You decide what to study — I'll help you make it doable." | Student agency + support |
| **Charts** | "Each bar shows how comfortable you feel — not a grade, just growth." | Reframes success |
| **Coach** | "Explain what's confusing you..." | Inviting, non-judgmental |
| **Test** | "Let's Test Your Skills ✨" | Curiosity over anxiety |

---

## 🎬 Animation Guidelines

### Framer Motion Presets

```tsx
// Button Hover
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Let's Go!
</motion.button>

// Card Entry
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  <Card>...</Card>
</motion.div>

// Success Message
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", bounce: 0.5 }}
>
  <Alert>✅ Saved!</Alert>
</motion.div>

// Loading Pulse
<motion.div
  animate={{ scale: [1, 1.05, 1] }}
  transition={{ repeat: Infinity, duration: 2 }}
>
  <Loader2 className="animate-spin" />
</motion.div>
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile First
className="text-sm md:text-base"  // Body text
className="p-4 md:p-6"  // Padding
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"  // Layout

// Touch Targets
className="h-11 px-8"  // Large buttons (min 44px height)
className="gap-3"  // Enough space between clickable elements
```

---

## 🔍 Accessibility Checklist

### Color Contrast

| Element | Foreground | Background | Ratio | WCAG |
|---------|------------|------------|-------|------|
| Body Text | #111827 | #F9FAFB | 14.5:1 | ✅ AAA |
| Primary Button | #FFFFFF | #2563EB | 8.6:1 | ✅ AAA |
| Accent Badge | #111827 | #FBBF24 | 7.8:1 | ✅ AAA |
| Muted Text | #6B7280 | #F9FAFB | 4.5:1 | ✅ AA |

### Interaction States

```css
/* Focus Ring (Keyboard Navigation) */
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2

/* Hover States */
hover:bg-primary/90  /* Buttons */
hover:text-accent  /* Links */
hover:shadow-md  /* Cards */

/* Active/Pressed States */
active:scale-98  /* Buttons */
```

---

## 🎯 Before/After Examples

### Dashboard Header

❌ **Before:**
```tsx
<h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
```

✅ **After:**
```tsx
<div className="flex flex-col gap-1">
  <h1 className="text-lg font-semibold md:text-2xl">Welcome back!</h1>
  <p className="text-sm text-muted-foreground">Let's plan your next small win.</p>
</div>
```

### Test Generator Button

❌ **Before:**
```tsx
<Button>Generate Quiz</Button>
```

✅ **After:**
```tsx
<Button className="rounded-xl">
  <Sparkles className="mr-2 h-4 w-4" />
  Let's Test Your Skills ✨
</Button>
```

### Achievement Badge

❌ **Before:**
```tsx
<Badge variant="secondary">Completed</Badge>
```

✅ **After:**
```tsx
<Badge className="bg-accent/20 text-accent-foreground border border-accent">
  <Check className="mr-1 h-3 w-3" />
  Mastered! 🌟
</Badge>
```

---

## 📋 Quick Implementation Checklist

### Colors
- [ ] Primary is Calm Blue (#2563EB)
- [ ] Accent is Warm Yellow (#FBBF24)
- [ ] Background is Soft (#F9FAFB)
- [ ] Charts use new palette

### Typography
- [ ] Body text is readable (#111827)
- [ ] Headings are clear and hierarchical
- [ ] Microcopy is warm and encouraging

### Components
- [ ] Buttons use `rounded-xl`
- [ ] Cards use `rounded-2xl`
- [ ] Yellow accent on "curiosity" elements
- [ ] Success states use green
- [ ] AI insights use purple

### Animations
- [ ] Buttons have hover/tap states
- [ ] Cards fade in on load
- [ ] Success messages pulse
- [ ] Loading states are smooth

### Accessibility
- [ ] Focus rings on all interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets are 44px minimum
- [ ] Keyboard navigation works

---

## 🚀 Launch-Ready Criteria

✅ **Visual:**
- All colors match design system
- Animations are smooth (60fps)
- Dark mode works correctly

✅ **UX:**
- Microcopy is warm and encouraging
- Button text is action-oriented
- Error messages are friendly

✅ **Accessibility:**
- WCAG AA compliance
- Keyboard navigation
- Screen reader friendly

✅ **Performance:**
- Fast page loads
- Smooth animations
- No jank or flicker

---

**Next Steps:** Implement critical fixes from `CRITICAL_FIXES_IMPLEMENTATION.md`

