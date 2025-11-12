# AI Provider Setup Guide

## Overview

Study Coach supports three AI providers. You need to configure **at least one** of them:

1. **DeepSeek** (Recommended - Most affordable)
2. **Azure OpenAI** (Enterprise solution)
3. **OpenAI** (Standard option)

## Priority Order

The system checks for providers in this order:
1. Azure OpenAI (if `AZURE_OPENAI_API_KEY` is set)
2. DeepSeek (if `DEEPSEEK_API_KEY` is set)
3. OpenAI (if `OPENAI_API_KEY` is set)

---

## Option 1: DeepSeek (Recommended) 🌟

**Cost:** ~$0.14 per million input tokens (Very affordable!)

### Setup Steps:

1. **Get API Key:**
   - Go to https://platform.deepseek.com/
   - Sign up or log in
   - Navigate to API Keys
   - Create a new API key
   - Copy the key

2. **Add to `.env.local`:**
   ```env
   DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
   DEEPSEEK_MODEL=deepseek-chat
   DEEPSEEK_BASE_URL=https://api.deepseek.com
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

---

## Option 2: Azure OpenAI (Enterprise)

**Cost:** Varies by deployment and region

### Setup Steps:

1. **Get Azure OpenAI Access:**
   - Go to https://portal.azure.com/
   - Create an Azure OpenAI resource
   - Deploy a model (gpt-4, gpt-3.5-turbo, etc.)
   - Get the endpoint URL and API key

2. **Add to `.env.local`:**
   ```env
   AZURE_OPENAI_API_KEY=your-azure-api-key-here
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
   AZURE_OPENAI_DEPLOYMENT=gpt-4
   AZURE_OPENAI_API_VERSION=2024-02-15-preview
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

---

## Option 3: OpenAI

**Cost:** ~$10 per million input tokens (gpt-4)

### Setup Steps:

1. **Get API Key:**
   - Go to https://platform.openai.com/
   - Sign up or log in
   - Navigate to API Keys
   - Create a new secret key
   - Copy the key

2. **Add to `.env.local`:**
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   OPENAI_MODEL=gpt-4
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

---

## Testing Your Setup

### Quick Test (Check Configuration)
```bash
npx tsx tests/ai-provider-check.ts
```

### Full Test (Generate Learning Path)
```bash
npx tsx tests/test-learning-path-ai.ts
```

---

## Cost Comparison

| Provider | Input Tokens | Output Tokens | Best For |
|----------|-------------|---------------|----------|
| DeepSeek | $0.14/M | $0.28/M | Development, Production (Budget) |
| OpenAI GPT-4 | $10/M | $30/M | High Quality Responses |
| OpenAI GPT-3.5 | $0.50/M | $1.50/M | Balance of Cost & Quality |
| Azure OpenAI | Varies | Varies | Enterprise, Compliance |

**Recommendation:** Start with DeepSeek for development. It's very affordable and works great!

---

## Common Issues

### "No AI provider configured"
**Problem:** No API keys are set in `.env.local`

**Solution:**
1. Create or edit `.env.local` in your project root
2. Add one of the API key configurations above
3. Restart your dev server

### "Invalid API key"
**Problem:** The API key is incorrect or expired

**Solution:**
1. Verify you copied the full API key
2. Check for extra spaces or line breaks
3. Generate a new API key if needed

### "This response_format type is unavailable"
**Problem:** The AI provider doesn't support the response format

**Solution:**
- This should be fixed already in `src/ai/helpers.ts`
- If you still see this, ensure you've pulled the latest code
- The fix changes from `json_schema` to `json_object`

### "Rate limit exceeded"
**Problem:** You've hit the API rate limit

**Solution:**
- Wait a few minutes and try again
- For DeepSeek: Check your usage at platform.deepseek.com
- For OpenAI: Check your usage at platform.openai.com
- Consider upgrading your plan if needed

---

## Environment Variables Reference

### DeepSeek
```env
DEEPSEEK_API_KEY=sk-...           # Required
DEEPSEEK_MODEL=deepseek-chat      # Optional (default: deepseek-chat)
DEEPSEEK_BASE_URL=https://api.deepseek.com  # Optional
```

### Azure OpenAI
```env
AZURE_OPENAI_API_KEY=...          # Required
AZURE_OPENAI_ENDPOINT=https://...  # Required
AZURE_OPENAI_DEPLOYMENT=gpt-4     # Required
AZURE_OPENAI_API_VERSION=2024-02-15-preview  # Optional
```

### OpenAI
```env
OPENAI_API_KEY=sk-...             # Required
OPENAI_MODEL=gpt-4                # Optional (default: gpt-4)
```

---

## Production Deployment

When deploying to production (Vercel, Railway, etc.):

1. **Add environment variables to your hosting platform:**
   - In Vercel: Settings → Environment Variables
   - In Railway: Variables tab
   - In Heroku: Settings → Config Vars

2. **Use production API keys** (not test keys)

3. **Set up monitoring** to track:
   - API usage and costs
   - Error rates
   - Response times

4. **Consider rate limiting** to control costs:
   - Already implemented in `src/lib/redis.ts`
   - Adjust limits in `checkRateLimit()` function

---

## Security Best Practices

1. ✅ **NEVER commit `.env.local` to git**
2. ✅ **Use different API keys for dev and production**
3. ✅ **Rotate API keys regularly**
4. ✅ **Monitor API usage for unexpected spikes**
5. ✅ **Set spending limits on your AI provider dashboard**
6. ✅ **Keep API keys in secure environment variables only**

---

## Next Steps

1. Choose an AI provider (DeepSeek recommended for starters)
2. Get your API key from the provider's website
3. Add the API key to `.env.local`
4. Restart your dev server
5. Run the test: `npx tsx tests/test-learning-path-ai.ts`
6. Try generating a learning path in the app!

---

## Support

If you need help:
1. Check the error messages in the console
2. Verify your API key is correctly set
3. Review the Common Issues section above
4. Check your AI provider's status page
5. Review the provider's documentation

### Provider Documentation:
- DeepSeek: https://platform.deepseek.com/docs
- Azure OpenAI: https://learn.microsoft.com/azure/ai-services/openai/
- OpenAI: https://platform.openai.com/docs/

