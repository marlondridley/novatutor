# Wake Word Testing Guide

**Status:** 🔧 **DEBUGGING MODE ACTIVE**

---

## 🐛 What I Fixed

### 1. **Better Wake Word Detection**
- Added more variations: "hey coach", "coach", "heycoach", "a coach", "hey couch"
- Case-insensitive matching
- Added delay before resetting transcript (500ms)

### 2. **Extensive Logging**
Every action now logs to console:
- `🎤 Listening for wake word...` - Shows what's being heard
- `✅ Wake word DETECTED!` - Shows which variation was detected
- `🔄 Transcript cleared` - When ready for command
- `📝 Command captured` - Your question

### 3. **Live Debug Panel**
When session is active, you'll see a floating panel showing:
- Current transcript
- Microphone status (active/paused)
- Current state (waiting for wake word / capturing command)

### 4. **Microphone Permission Check**
- Explicitly requests mic permission on start
- Shows clear error if permission denied
- Tests mic before starting session

---

## 🧪 How to Test

### Step 1: Open the Tutor Page
Navigate to: `http://localhost:9002/tutor`

### Step 2: Open Developer Console
Press `F12` or `Right-click → Inspect → Console`

### Step 3: Start Wake Word Session
1. Click the **"Wake Word"** button in the top-right
2. Allow microphone access if prompted
3. Look for console message: `✅ Wake word session started!`

### Step 4: Check Visual Indicators
You should see:
- Button changed to **"Live Session"** (pulsing)
- Badge: **"Say 'Hey Coach'"**
- **Debug panel** (top-right) showing live transcript

### Step 5: Say "Hey Coach"
Try these variations:
- "hey coach"
- "coach"
- "hey couch" (common misrecognition)

### Step 6: Watch Console Logs
You should see:
```
🎤 Listening for wake word... transcript: "hey coach"
✅ Wake word DETECTED! Variation: hey coach Full transcript: hey coach
🔄 Transcript cleared, ready for command...
```

### Step 7: Ask Your Question
After wake word is detected:
- Badge changes to **"Listening..."**
- Speak your question (e.g., "What is photosynthesis?")
- Watch the debug panel show your words
- After ~10 characters, it should auto-submit

### Step 8: Reset Test
- Check console for: `📝 Command captured: [your question]`
- Question should appear in chat
- System resets to listening for wake word again

---

## 🔍 Troubleshooting

### Issue: Nothing happens when I say "Hey Coach"

**Check:**
1. **Console logs** - Do you see transcript updates?
   - If NO: Microphone not working
   - If YES: Wake word not being detected

2. **Debug panel** - Is it showing your words?
   - If NO: Speech recognition not starting
   - If YES but no detection: Try different pronunciation

3. **Browser compatibility**
   - Chrome/Edge: ✅ Full support
   - Safari: ⚠️ Limited support
   - Firefox: ❌ Not supported

**Fix:**
```javascript
// Check if speech recognition is available
console.log('Browser support:', SpeechRecognition.browserSupportsSpeechRecognition);

// Check if mic is working
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log('✅ Mic working'))
  .catch(err => console.error('❌ Mic error:', err));
```

---

### Issue: Wake word detected but question not capturing

**Check:**
1. Is command threshold reached? (needs >10 characters)
2. Check console for: `📝 Command captured: [text]`
3. Is `resetToWakeWord()` being called too early?

**Debug:**
```javascript
// Add to educational-assistant-chat.tsx
console.log('Transcript length:', coachSession.transcript.length);
console.log('Is listening for command:', coachSession.isListeningForCommand);
```

---

### Issue: Microphone permission denied

**Fix:**
1. Click the 🔒 or ⓘ icon in browser address bar
2. Find "Microphone" permission
3. Change to "Allow"
4. Refresh page
5. Try again

---

### Issue: Recognition stops after a few seconds

**Cause:** Browser auto-stops after silence

**Fix:** Already implemented - `continuous: true` in `SpeechRecognition.startListening()`

**Verify in console:**
```
🎙️ Starting continuous listening...
```

---

## 📊 Expected Console Output

### Successful Flow:
```
🎤 Starting wake word session...
✅ Microphone permission granted
🎙️ Starting continuous listening...
✅ Wake word session started! Say "Hey Coach" to activate.
🎤 Listening for wake word... transcript: "hey"
🎤 Listening for wake word... transcript: "hey coach"
✅ Wake word DETECTED! Variation: hey coach Full transcript: hey coach
🔄 Transcript cleared, ready for command...
📝 Command captured: what is photosynthesis
🎤 Processing voice command: what is photosynthesis
```

---

## 🎯 What Should Happen

### Timeline:
1. **0s** - Click "Wake Word" button
2. **0.5s** - Microphone permission granted
3. **1s** - Session active, listening for wake word
4. **You say "Hey Coach"**
5. **Immediate** - Wake word detected, toast notification
6. **0.5s** - Transcript cleared
7. **You ask question**
8. **After 10 chars** - Question captured and sent to AI
9. **AI responds**
10. **Auto-reset** - Back to listening for wake word

---

## 🔧 Debug Commands

### Check Browser Support:
```javascript
console.log('Speech Recognition:', !!window.SpeechRecognition || !!window.webkitSpeechRecognition);
```

### Force Restart Session:
```javascript
// In browser console
SpeechRecognition.stopListening();
SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
```

### Check Microphone:
```javascript
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const mics = devices.filter(d => d.kind === 'audioinput');
    console.log('Microphones:', mics);
  });
```

---

## 💡 Tips for Better Detection

### Speak Clearly:
- **Good:** "Hey coach" (pause) "What is photosynthesis?"
- **Bad:** "Heycoachwhatisphotosynthesis" (too fast, no pause)

### Pronunciation:
- Emphasis on "HEY" and "COACH"
- Distinct syllables: "HEY CO-ACH"

### Environment:
- Quiet room (no background noise)
- Mic close to mouth (6-12 inches)
- Good internet connection (recognition uses cloud)

### Variations to Try:
- "hey coach"
- "coach"
- "HEY COACH" (louder)
- "a coach" (if misheard)

---

## 📝 Test Checklist

- [ ] Console shows `✅ Wake word session started!`
- [ ] Debug panel appears with live transcript
- [ ] Badge shows "Say 'Hey Coach'"
- [ ] Saying "hey coach" shows detection log
- [ ] Toast appears: "I'm listening!"
- [ ] Badge changes to "Listening..."
- [ ] Question appears in debug panel
- [ ] After >10 chars, command captured
- [ ] Question sent to AI
- [ ] Answer appears in chat
- [ ] System resets to wake word listening
- [ ] 5-minute check-in fires (wait or test manually)

---

## 🚀 Quick Test Script

Run this in console after starting session:

```javascript
// Simulate wake word detection (for testing without mic)
setTimeout(() => {
  console.log('🧪 TEST: Triggering wake word...');
  // This would normally come from speech recognition
  // but you can test the flow manually
}, 2000);
```

---

**Status:** 🔍 **Ready for Testing with Enhanced Debugging**

The wake word system now has extensive logging and a live debug panel. Open the console and debug panel to see exactly what's happening!

