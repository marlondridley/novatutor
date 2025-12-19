# 🔍 Lighthouse Audit Guide - BestTutorEver

## 🚀 Quick Start

### Method 1: Chrome DevTools (Easiest!)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open Chrome and navigate to:**
   ```
   http://localhost:3000/dashboard
   ```

3. **Open Chrome DevTools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows)
   - Or right-click → "Inspect"

4. **Click the "Lighthouse" tab:**
   - If you don't see it, click the `>>` icon and select "Lighthouse"

5. **Configure the audit:**
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
   - Device: Desktop (for controller mode)
   - Click "Analyze page load"

6. **Wait 30-60 seconds** for the audit to complete

---

### Method 2: Lighthouse CLI (More Detailed)

1. **Install Lighthouse globally:**
   ```bash
   npm install -g lighthouse
   ```

2. **Start your dev server:**
   ```bash
   npm run dev
   ```

3. **Run Lighthouse:**
   ```bash
   lighthouse http://localhost:3000/dashboard --view --preset=desktop
   ```

4. **View the report:**
   - Opens automatically in your browser
   - Saved as HTML file in current directory

---

## 🎯 Expected Scores (Goals)

| Category | Goal | Why |
|----------|------|-----|
| **Performance** | 90+ | Fast load, smooth animations |
| **Accessibility** | 95+ | WCAG 2.1 AA compliant |
| **Best Practices** | 90+ | Secure, modern code |
| **SEO** | 85+ | Discoverable (less critical for app) |

---

## 🔧 Common Issues & Fixes

### Performance Issues

#### Issue: "Largest Contentful Paint > 2.5s"
**Fix:**
```typescript
// next.config.js - Already optimized!
images: {
  domains: ['...'],
  formats: ['image/avif', 'image/webp'],
}
```

#### Issue: "Total Blocking Time > 300ms"
**Fix:**
- Use `loading="lazy"` on images
- Code already uses dynamic imports
- Animations respect `prefers-reduced-motion`

#### Issue: "Cumulative Layout Shift > 0.1"
**Fix:**
```tsx
// Always specify image dimensions
<Image width={48} height={48} ... />
```

---

### Accessibility Issues

#### Issue: "Background and foreground colors do not have sufficient contrast"
**Check these colors:**
```typescript
// Elementary grade colors (high saturation)
const colors = {
  mathBlue: '#2563eb',      // Should be 7:1 ratio ✓
  scienceGreen: '#16a34a',  // Check this one
  readingPurple: '#9333ea', // Check this one
  historyOrange: '#ea580c', // Check this one
};
```

**Fix:** Use contrast checker: https://webaim.org/resources/contrastchecker/

#### Issue: "Links do not have a discernible name"
**Fix:**
```tsx
// Always add aria-label to icon-only buttons
<button aria-label="Select Math subject">
  <Calculator />
</button>
```

#### Issue: "Form elements do not have associated labels"
**Check:** Parent Settings page - all inputs need labels

---

### Best Practices Issues

#### Issue: "Browser errors were logged to the console"
**Fix:**
- Check browser console for errors
- Fix any React warnings
- Ensure all assets load

#### Issue: "Does not use HTTPS"
**Note:** This is expected in dev mode. Production will use HTTPS.

---

## 📊 Detailed Audit Checklist

### ✅ Performance Metrics

| Metric | Target | How to Check |
|--------|--------|--------------|
| **First Contentful Paint** | < 1.8s | Time until first content visible |
| **Speed Index** | < 3.4s | How quickly content is visually displayed |
| **Largest Contentful Paint** | < 2.5s | Time until largest element visible |
| **Time to Interactive** | < 3.8s | Time until page is fully interactive |
| **Total Blocking Time** | < 300ms | Time page is blocked from user input |
| **Cumulative Layout Shift** | < 0.1 | Visual stability (no jumping) |

### ✅ Accessibility Checks

- [ ] **ARIA** - All interactive elements have proper ARIA labels
- [ ] **Keyboard** - Tab through entire interface
- [ ] **Screen Reader** - Test with NVDA/VoiceOver
- [ ] **Color Contrast** - 4.5:1 for normal text, 3:1 for large text
- [ ] **Focus Indicators** - Visible when tabbing
- [ ] **Alt Text** - All images have descriptive alt text
- [ ] **Form Labels** - All inputs have associated labels
- [ ] **Semantic HTML** - Proper heading hierarchy (h1→h2→h3)

### ✅ Best Practices

- [ ] **HTTPS** (production only)
- [ ] **No console errors**
- [ ] **No console warnings**
- [ ] **Images have explicit dimensions**
- [ ] **No deprecated APIs**
- [ ] **CSP headers** (production)

---

## 🎨 Optimizing for Lighthouse

### Images
```typescript
// Use next/image for automatic optimization
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="BestTutorEver Logo"
  width={48}
  height={48}
  priority // For above-the-fold images
/>
```

### Fonts
```typescript
// Preload fonts in layout.tsx
<link
  rel="preload"
  href="/fonts/nunito.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

### Code Splitting
```typescript
// Already implemented - dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />
});
```

---

## 📱 Mobile Lighthouse Audit

1. **In Chrome DevTools Lighthouse tab:**
   - Select "Mobile" device
   - Check "Simulated throttling"
   - Run audit

2. **Expected mobile performance:**
   - Performance: 85+ (lower than desktop is OK)
   - Accessibility: 95+ (same as desktop)

3. **Mobile-specific checks:**
   - [ ] Touch targets ≥ 48×48px
   - [ ] Text readable without zooming
   - [ ] No horizontal scrolling
   - [ ] Fast tap response (< 100ms)

---

## 🔍 Debugging Poor Scores

### Performance < 90
1. **Check Network tab** - Any slow requests?
2. **Check Coverage tab** - Unused JavaScript?
3. **Check Performance tab** - Long tasks?
4. **Disable extensions** - Run in Incognito mode

### Accessibility < 95
1. **Check Elements tab** - ARIA attributes present?
2. **Use Accessibility Inspector** - DevTools → Elements → Accessibility
3. **Run axe DevTools** - Browser extension for detailed checks
4. **Test with screen reader** - NVDA (Windows) or VoiceOver (Mac)

### Best Practices < 90
1. **Check Console** - Fix all errors and warnings
2. **Check Security tab** - HTTPS issues?
3. **Review manifest.json** - PWA requirements

---

## 🎯 Real-World Testing

### Test on Actual Devices

#### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Mobile
- [ ] iPhone 12+ (Safari)
- [ ] iPhone SE (older hardware)
- [ ] Samsung Galaxy (Chrome)
- [ ] Budget Android (Chrome)

### Network Conditions
- [ ] Fast 3G
- [ ] Slow 3G
- [ ] Offline (PWA test)

---

## 📈 Benchmark Results Template

Copy this after running Lighthouse:

```markdown
## Lighthouse Scores - [Date]

**Page:** http://localhost:3000/dashboard
**Device:** Desktop
**Network:** Fast 3G

### Scores
- Performance: ____ / 100
- Accessibility: ____ / 100
- Best Practices: ____ / 100
- SEO: ____ / 100

### Key Metrics
- First Contentful Paint: ____ s
- Speed Index: ____ s
- Largest Contentful Paint: ____ s
- Time to Interactive: ____ s
- Total Blocking Time: ____ ms
- Cumulative Layout Shift: ____

### Issues Found
1. [Issue description]
2. [Issue description]

### Actions Taken
1. [Fix description]
2. [Fix description]
```

---

## 🚀 Continuous Monitoring

### Option 1: Lighthouse CI (GitHub Actions)

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

### Option 2: Lighthouse Bot

Add to `package.json`:

```json
{
  "scripts": {
    "lighthouse": "lighthouse http://localhost:3000/dashboard --view --preset=desktop",
    "lighthouse:ci": "lighthouse http://localhost:3000/dashboard --output=json --output-path=./lighthouse-results.json"
  }
}
```

---

## 🎉 Success Criteria

Your app is **production-ready** when:

✅ Performance ≥ 90
✅ Accessibility ≥ 95
✅ Best Practices ≥ 90
✅ SEO ≥ 85
✅ No critical console errors
✅ Works on mobile devices
✅ Works on slow connections
✅ Passes manual screen reader test

---

## 📞 Need Help?

If your scores are lower than expected:

1. **Share the Lighthouse report** (HTML file or screenshot)
2. **List the top 3 issues** flagged by Lighthouse
3. **Ask for specific fixes** for those issues

**Remember:** It's normal to iterate! First score might be 70-80, then you optimize to 90+. 🚀

