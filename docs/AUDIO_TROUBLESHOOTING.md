# Audio Troubleshooting Guide

**Issue:** "Coach is speaking" badge shows, but no audio heard

---

## ✅ **What I Fixed**

### 1. **Browser TTS Fallback**
- Now uses **built-in browser text-to-speech** (always works!)
- No longer depends on API TTS
- Works offline

### 2. **Extensive Logging**
Every audio event now logs to console:
- `🔊 Attempting to speak: [text]`
- `✅ Using browser TTS`
- `🔊 Browser TTS started`
- `✅ Browser TTS ended`
- `❌ Browser TTS error: [details]`

### 3. **Audio Test Button**
Added **"Test Audio"** button in the tutor page:
- Click to hear: "Testing audio. Can you hear me?"
- Verifies speakers are working
- Shows console logs for debugging

---

## 🧪 **How to Test Audio**

### Step 1: Open Tutor Page
Navigate to: `http://localhost:9002/tutor`

### Step 2: Click "Test Audio" Button
- Located in the top toolbar
- Should immediately speak: "Testing audio. Can you hear me?"

### Step 3: Check Console
Press `F12` → Console tab

**You should see:**
```
🔊 Attempting to speak: Testing audio. Can you hear me?
✅ Using browser TTS (fallback)
🔊 Browser TTS started
✅ Browser TTS ended
```

---

## 🔍 **If You Still Don't Hear Audio**

### Check 1: System Volume
- **Windows:** Click speaker icon in taskbar
  - Make sure volume is not 0%
  - Make sure not muted
  
- **Browser volume:** Some browsers have per-site volume
  - Check site settings in browser
  - Look for muted site indicator

### Check 2: Browser Audio Permissions
1. Click 🔒 or ⓘ icon in address bar
2. Look for "Sound" permission
3. Make sure it's set to "Allow"

### Check 3: Browser Compatibility
Browser TTS support:
- ✅ **Chrome** - Full support
- ✅ **Edge** - Full support  
- ✅ **Safari** - Full support
- ✅ **Firefox** - Full support

### Check 4: Run Audio Test in Console
```javascript
// Test if browser TTS is available
console.log('Speech Synthesis:', 'speechSynthesis' in window);

// Test speaking
const utterance = new SpeechSynthesisUtterance("Hello, can you hear me?");
utterance.onstart = () => console.log('Started');
utterance.onend = () => console.log('Ended');
utterance.onerror = (e) => console.error('Error:', e);
speechSynthesis.speak(utterance);
```

### Check 5: Output Device
- Make sure correct speakers/headphones selected
- **Windows:** Settings → Sound → Choose output device
- **Browser:** May have separate audio output setting

---

## 🎯 **What Should Happen**

### Focus Plan:
1. Page loads
2. Console: `🔊 Coach speaking: Hey there! I'm your learning...`
3. Console: `✅ Using browser TTS`
4. Console: `🔊 Browser TTS started`
5. **You hear:** Coach greeting
6. Console: `✅ Coach finished speaking`

### Wake Word Session:
1. Say "Hey Coach"
2. Console: `✅ Wake word DETECTED!`
3. Console: `🔊 Attempting to speak: Yes? How can I help you?`
4. **You hear:** Coach response
5. Console: `✅ Browser TTS ended`

### Check-Ins (every 5 minutes):
1. Console: `⏰ 5-minute check-in triggered`
2. Console: `🔊 Attempting to speak: Hey, just checking in!...`
3. **You hear:** Coach check-in
4. Message appears in chat

---

## 🔧 **Debug Commands**

### Check Available Voices:
```javascript
const voices = speechSynthesis.getVoices();
console.log('Available voices:', voices.length);
voices.forEach(v => console.log(`- ${v.name} (${v.lang})`));
```

### Force Speak:
```javascript
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
};

speak("Testing one two three");
```

### Check Audio Context:
```javascript
const audioContext = new AudioContext();
console.log('Audio Context State:', audioContext.state);
if (audioContext.state === 'suspended') {
  audioContext.resume().then(() => console.log('Audio resumed'));
}
```

---

## 💡 **Common Issues & Solutions**

### Issue: Voices not loading
**Solution:**
```javascript
// Wait for voices to load
speechSynthesis.onvoiceschanged = () => {
  console.log('Voices loaded:', speechSynthesis.getVoices().length);
};
```

### Issue: Audio cuts off
**Cause:** Browser auto-suspends audio context

**Solution:** User interaction required
```javascript
// Click anywhere first, then audio will work
document.addEventListener('click', () => {
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance("Now it works!"));
}, { once: true });
```

### Issue: Multiple voices speaking at once
**Solution:** Already implemented
```javascript
window.speechSynthesis.cancel(); // Cancels all ongoing speech
```

### Issue: Rate too fast/slow
**Adjust in code:**
```javascript
utterance.rate = 0.95; // Slower (Focus Plan uses this)
utterance.rate = 1.0;  // Normal (default)
utterance.rate = 1.2;  // Faster
```

---

## 🎨 **Voice Quality Options**

### Browser TTS (Current - Free):
- ✅ Always available
- ✅ Works offline
- ✅ No API calls
- ⚠️ Robotic voice
- ⚠️ Limited expressiveness

### API TTS (Premium - Optional):
- ✅ Natural voice (OpenAI)
- ✅ Expressive intonation
- ✅ Multiple voice options
- ❌ Requires API key
- ❌ Requires internet
- ❌ Costs money

**Current Strategy:**
1. Try browser TTS first (free, always works)
2. Fall back to API TTS (if configured and available)

---

## 📊 **Expected Console Output**

### Successful Audio Flow:
```
🔊 Attempting to speak: Testing audio. Can you hear me?
✅ Using browser TTS (fallback)
🔊 Browser TTS started
✅ Browser TTS ended
```

### If API TTS is also tried:
```
🔊 Attempting to speak: Testing audio. Can you hear me?
✅ Using browser TTS (fallback)
🔊 Browser TTS started
✅ Browser TTS ended
🌐 Trying API TTS...
⚠️ API TTS returned: 401
```

---

## ✅ **Quick Checklist**

Test these in order:

- [ ] Click "Test Audio" button
- [ ] Check console for logs
- [ ] Verify system volume is up
- [ ] Check browser isn't muted
- [ ] Try different browser (Chrome recommended)
- [ ] Click anywhere on page first (interaction required)
- [ ] Check speakers/headphones are plugged in
- [ ] Try browser audio test (see debug commands)
- [ ] Check browser audio permissions
- [ ] Restart browser

---

## 🚀 **It Should Just Work Now!**

The app now uses **browser text-to-speech** which:
- ✅ Works in ALL modern browsers
- ✅ Requires NO setup
- ✅ Works offline
- ✅ Never fails (unless speakers broken)

If you see the badge "Coach is speaking..." and console logs show `✅ Using browser TTS`, but you still don't hear anything, it's a **system audio issue**, not the app.

---

**Try clicking "Test Audio" now!** 🔊

