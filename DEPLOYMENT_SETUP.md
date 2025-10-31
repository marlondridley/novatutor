# Deployment Setup Guide

## Required Environment Variables

### Production Environment Setup

All environment variables should be set in your deployment platform (Azure App Service, Vercel, etc.).

### Core Services

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (Live Mode)
STRIPE_SECRET_KEY=sk_live_your-live-key
STRIPE_WEBHOOK_SIGNING_SECRET=whsec_your-webhook-secret

# AI Provider (choose one or configure priority)
# Option 1: Azure OpenAI (recommended for production)
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Option 2: DeepSeek (cost-effective alternative)
DEEPSEEK_API_KEY=your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# Option 3: OpenAI
OPENAI_API_KEY=sk-your-openai-key

# OpenAI (for STT/TTS - required)
OPENAI_API_KEY=sk-your-openai-key

# Redis (Upstash)
REDIS_URL=https://your-redis.upstash.io
REDIS_TOKEN=your-redis-token
```

### Azure AI Search (RAG Pipeline) - Optional

```bash
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_KEY=your-search-api-key
AZURE_SEARCH_INDEX_NAME=educational-content
AZURE_EMBEDDING_DEPLOYMENT=text-embedding-ada-002
```

### Monitoring - Optional but Recommended

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### Application Settings

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Supabase Storage Setup

1. Create a storage bucket named `homework-uploads`
2. Set bucket to public or configure RLS policies
3. Policy example:
   ```sql
   -- Allow authenticated users to upload their own homework
   CREATE POLICY "Users can upload own homework"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'homework-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
   ```

## Sentry Setup

1. Install Sentry:
   ```bash
   npm install @sentry/nextjs
   ```

2. Initialize (already done in `src/app/layout.tsx`):
   - Just set `NEXT_PUBLIC_SENTRY_DSN` environment variable

3. Optional: Run Sentry wizard:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

## Azure AI Search Setup (Optional)

1. Create Azure Cognitive Search service
2. Create search index with fields:
   - `content` (searchable text)
   - `source` (string)
   - `subject` (filterable)
   - `grade` (filterable)
   - `metadata` (object)
3. Populate with educational content
4. Configure semantic search (optional but recommended)

## Verification Checklist

- [ ] All environment variables set in production
- [ ] Supabase Storage bucket `homework-uploads` created
- [ ] Stripe webhook endpoint configured
- [ ] Sentry DSN configured (optional)
- [ ] Azure AI Search configured (optional)
- [ ] Test signup/login flow
- [ ] Test subscription payment
- [ ] Test homework upload
- [ ] Test AI tutoring features
- [ ] Verify error logging in Sentry (if configured)

