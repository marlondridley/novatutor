# Local Text Summarization Implementation Plan

## 📊 Current Architecture Analysis

**Your Stack:**
- **Frontend/Backend**: Next.js 15.5 (App Router) on Vercel/Azure
- **Runtime**: Node.js 20+ (server) + Browser (client)
- **AI Infrastructure**: DeepSeek AI (primary) + OpenAI (fallback) - both external APIs
- **Caching**: Redis for rate limiting & embeddings
- **Database**: Supabase PostgreSQL
- **Deployment**: Azure App Service (mentioned) OR Vercel

**Current API Pattern:**
```
src/app/api/[feature]/route.ts
- Uses external AI APIs (DeepSeek, OpenAI)
- Server-side only (no browser AI)
- Cached with Redis
```

---

## 🎯 Three Implementation Options for Local Summarization

### Option 1: **Transformers.js (Browser-Based)** ⭐ RECOMMENDED

**What it is:** Run Hugging Face models directly in the browser using ONNX and WebAssembly.

**Pros:**
- ✅ **Zero server cost** - runs entirely client-side
- ✅ **Privacy-first** - text never leaves the user's device
- ✅ **Scales automatically** - no server load
- ✅ **Works offline** - once model is cached
- ✅ **Perfect for Azure App Service** - no resource impact

**Cons:**
- ❌ Initial model download (~40-200MB, cached after first use)
- ❌ Slower on low-end devices
- ❌ Limited model selection (ONNX-compatible only)

**Best For:** Student-facing features where privacy matters and text is < 5,000 words.

---

### Option 2: **Ollama (Self-Hosted Server)**

**What it is:** Run local LLMs (Llama 3.2, Mistral, etc.) on your own server.

**Pros:**
- ✅ **Full control** - your models, your rules
- ✅ **More powerful** - larger models than browser
- ✅ **Can run on Azure VM** - separate from App Service
- ✅ **Faster than browser** for large texts

**Cons:**
- ❌ **Requires separate server** - Azure VM cost ($50-200/mo)
- ❌ **GPU recommended** - CPU inference is slow
- ❌ **DevOps overhead** - deployment, monitoring, updates
- ❌ **Not suitable for Azure App Service** - resource intensive

**Best For:** High-volume summarization where you need more power than browser models.

---

### Option 3: **Node.js Summarization Libraries**

**What it is:** Use npm packages like `node-summarizer`, `sumy`, or `@huggingface/transformers` (Node runtime).

**Pros:**
- ✅ **Easy to integrate** - just npm install
- ✅ **Works on Azure App Service** - standard Node.js
- ✅ **No model downloads** - algorithmic summarization
- ✅ **Fast** - extractive summarization is quick

**Cons:**
- ❌ **Lower quality** - extractive only (not generative)
- ❌ **Limited capabilities** - can't rephrase or simplify
- ❌ **Still uses server resources** - but minimal

**Best For:** Quick extractive summaries, keyword extraction, or simple bullet points.

---

## 🏆 RECOMMENDED APPROACH: Option 1 (Transformers.js)

**Why it's best for your use case:**
1. **Student privacy** - text stays on device (COPPA compliant)
2. **Zero API costs** - no OpenAI/DeepSeek needed for summaries
3. **Scales infinitely** - every user brings their own compute
4. **Azure App Service friendly** - no server load
5. **Fits your philosophy** - "empowerment over answers"

---

## 🛠️ Implementation: Transformers.js (Browser-Based)

### Step 1: Install Dependencies

```bash
npm install @xenova/transformers
```

### Step 2: Create Summarization Hook

**File:** `src/hooks/use-local-summarizer.ts`

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';

interface SummarizerOptions {
  maxLength?: number;
  minLength?: number;
}

export function useLocalSummarizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pipelineRef = useRef<any>(null);

  // Load model on mount (with lazy loading)
  useEffect(() => {
    async function loadModel() {
      try {
        setIsLoading(true);
        const { pipeline } = await import('@xenova/transformers');
        
        // Use a lightweight summarization model
        // Model: ~45MB, cached after first download
        pipelineRef.current = await pipeline(
          'summarization',
          'Xenova/distilbart-cnn-6-6',
          {
            progress_callback: (data: any) => {
              if (data.status === 'progress') {
                setProgress(Math.round(data.progress));
              }
            }
          }
        );
        
        setIsModelLoaded(true);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to load summarization model:', err);
        setError(err.message);
        setIsLoading(false);
      }
    }

    loadModel();
  }, []);

  const summarize = async (
    text: string,
    options: SummarizerOptions = {}
  ): Promise<string> => {
    if (!pipelineRef.current) {
      throw new Error('Model not loaded yet');
    }

    if (!text || text.trim().length < 50) {
      throw new Error('Text too short to summarize (min 50 characters)');
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await pipelineRef.current(text, {
        max_length: options.maxLength || 130,
        min_length: options.minLength || 30,
        do_sample: false,
      });

      setIsLoading(false);
      return result[0].summary_text;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    summarize,
    isLoading,
    isModelLoaded,
    progress,
    error,
  };
}
```

### Step 3: Create Summarizer Component

**File:** `src/components/local-summarizer.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLocalSummarizer } from '@/hooks/use-local-summarizer';
import { Progress } from '@/components/ui/progress';

export function LocalSummarizer() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const { summarize, isLoading, isModelLoaded, progress, error } = useLocalSummarizer();

  const handleSummarize = async () => {
    try {
      const result = await summarize(inputText);
      setSummary(result);
    } catch (err: any) {
      console.error('Summarization error:', err);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          ✨ Smart Summarizer
        </CardTitle>
        <CardDescription>
          Privately summarize your notes — everything happens on your device, not our servers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Model Loading Status */}
        {!isModelLoaded && isLoading && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              <p className="font-medium mb-2">Loading AI model ({progress}%)</p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">
                First time only — this will be cached for future use
              </p>
            </AlertDescription>
          </Alert>
        )}

        {isModelLoaded && (
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Model ready! Your text never leaves your device.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Text</label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your notes, article, or any text you want summarized (min 50 characters)..."
            className="min-h-[200px]"
            disabled={!isModelLoaded}
          />
          <p className="text-xs text-muted-foreground">
            {inputText.length} characters
          </p>
        </div>

        {/* Summarize Button */}
        <Button
          onClick={handleSummarize}
          disabled={!isModelLoaded || isLoading || inputText.length < 50}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Summarize ✨
            </>
          )}
        </Button>

        {/* Output */}
        {summary && (
          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-medium">Summary</label>
            <div className="p-4 bg-accent/10 rounded-lg border">
              <p className="text-sm whitespace-pre-wrap">{summary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 4: Add to Cornell Notes (Example Integration)

**File:** `src/components/cornell-note-editor.tsx` (add summarization feature)

```typescript
// Add button to summarize notes
<Button
  onClick={async () => {
    const { summarize } = useLocalSummarizer();
    const summary = await summarize(noteBody);
    setSummary(summary);
  }}
  variant="outline"
>
  <Sparkles className="mr-2 h-4 w-4" />
  AI Summarize My Notes
</Button>
```

### Step 5: Create Demo Page

**File:** `src/app/(app)/summarizer/page.tsx`

```typescript
import { LocalSummarizer } from '@/components/local-summarizer';

export default function SummarizerPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Smart Summarizer</h1>
      <LocalSummarizer />
    </div>
  );
}
```

---

## 📊 Resource & Performance Trade-offs

| Aspect | Transformers.js | Ollama Server | Node.js Libs |
|--------|----------------|---------------|--------------|
| **Initial Load** | ~45-200MB download (once) | N/A (server-side) | None |
| **Runtime Cost** | $0 (client CPU) | $50-200/mo (VM) | $0 (minimal) |
| **Latency** | 2-10s (depends on device) | 1-3s (depends on GPU) | <1s |
| **Quality** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Privacy** | ✅ Perfect | ✅ Good | ⚠️ Server-side |
| **Azure App Service** | ✅ Perfect fit | ❌ Needs VM | ✅ Works |
| **Scalability** | ♾️ Infinite | Limited by VM | Limited by CPU |
| **Maintenance** | Minimal | High | Minimal |

---

## 🚀 Deployment Considerations

### For Azure App Service (Your Setup)

**✅ Transformers.js (Recommended)**
- No server-side changes needed
- Bundle size: ~3MB (library only, models load on-demand)
- Next.js dynamic imports work perfectly
- Client-side only - no impact on server

**⚠️ Ollama**
- Would require separate Azure VM (B-series or GPU)
- Network calls from App Service to VM
- Additional infrastructure cost & complexity

**✅ Node.js Libraries**
- Works out-of-box on App Service
- Minimal CPU/memory impact
- Good for extractive summarization only

### For Vercel (Alternative)

All three options work, but Transformers.js is still best for cost/privacy.

---

## 🎯 Recommended Next Steps

1. **Install Transformers.js** (5 min)
   ```bash
   npm install @xenova/transformers
   ```

2. **Add the hook** (10 min)
   - Create `src/hooks/use-local-summarizer.ts`
   - Copy code from above

3. **Create demo component** (15 min)
   - Create `src/components/local-summarizer.tsx`
   - Test in standalone page

4. **Integrate into Cornell Notes** (20 min)
   - Add "Summarize" button
   - Auto-fill summary section

5. **Test on real devices** (30 min)
   - Desktop: Should be fast (<5s)
   - Mobile: May be slower (10-15s) but works

**Total Time:** ~1.5 hours for full implementation

---

## 📚 Model Options

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| `Xenova/distilbart-cnn-6-6` | 45MB | Fast | Good | Short notes |
| `Xenova/bart-large-cnn` | 1.6GB | Slow | Excellent | Long articles |
| `Xenova/t5-small` | 242MB | Medium | Good | General purpose |

**Recommended:** Start with `distilbart-cnn-6-6` for best balance.

---

## 🔒 Privacy & COPPA Compliance

✅ **Transformers.js advantages:**
- Text never sent to external servers
- No API keys or tracking
- Works offline after initial model download
- Perfect for student data privacy (COPPA compliant)

---

## 🎓 Educational Use Cases in Your App

1. **Cornell Notes** - Auto-summarize the "Notes Area" into the "Summary Section"
2. **Learning Journal** - Summarize study session reflections
3. **Focus Plan** - Condense homework instructions
4. **Parent Dashboard** - Summarize weekly activity for parents
5. **Test Generator** - Summarize incorrect answers for review

---

**Questions or need help implementing?** This architecture is production-ready and aligns perfectly with your Study Coach philosophy of privacy, empowerment, and accessibility.

