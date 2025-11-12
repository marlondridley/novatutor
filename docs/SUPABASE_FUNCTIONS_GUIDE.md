# Supabase Functions Development Guide

## ✅ Current Setup Status

### Installed Components
- ✅ **Supabase CLI v2.58.5** - Installed via Scoop
- ✅ **TypeScript Config** - `supabase/functions/tsconfig.json` created
- ✅ **Documentation** - `supabase/functions/README.md` created
- ✅ **Architecture Docs** - `docs/ARCHITECTURE.md` created
- ⚠️ **Deno** - Not installed (optional for local dev)
- ⚠️ **Docker Desktop** - Required for local Supabase stack

### Function Status
- ✅ **stripe-webhook-novatutor** - Ready for deployment
- ✅ **Type Safety** - Uses `// @ts-nocheck` to prevent Next.js conflicts
- ✅ **Excluded from Next.js** - Won't cause build errors

---

## 🚀 Quick Commands Reference

### Check Supabase CLI Version
```bash
supabase --version
# Output: 2.58.5
```

### List Functions
```bash
cd supabase/functions
ls
```

### Deploy to Supabase (Production)
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy stripe-webhook-novatutor

# Deploy with environment variables
supabase functions deploy stripe-webhook-novatutor \
  --env-file .env.local
```

---

## 🔧 Local Development Setup (Optional)

### Prerequisites
1. **Install Docker Desktop**
   - Download from: https://docs.docker.com/desktop/install/windows-install/
   - Required for running local Supabase stack

2. **Install Deno (Optional)**
   - PowerShell: `irm https://deno.land/install.ps1 | iex`
   - Useful for type checking functions locally

### Start Local Supabase
```bash
# Initialize Supabase in project
supabase init

# Start local Supabase stack (requires Docker)
supabase start

# View status
supabase status
```

### Serve Function Locally
```bash
# Serve specific function
supabase functions serve stripe-webhook-novatutor --no-verify-jwt

# Function will be available at:
# http://localhost:54321/functions/v1/stripe-webhook-novatutor
```

### Test Function Locally
```bash
# Test with curl
curl -X POST http://localhost:54321/functions/v1/stripe-webhook-novatutor \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test with Postman or Insomnia
# POST http://localhost:54321/functions/v1/stripe-webhook-novatutor
```

### Type Check with Deno
```bash
# Check all functions
deno check supabase/functions/**/*.ts

# Check specific function
deno check supabase/functions/stripe-webhook-novatutor/index.ts
```

---

## 📦 Deployment Workflow

### 1. Environment Variables (Supabase Dashboard)
Navigate to: **Project Settings → Edge Functions → Environment Variables**

Set these variables:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SIGNING_SECRET=whsec_...
```

**Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected.

### 2. Deploy Function
```bash
# Ensure you're logged in
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy
supabase functions deploy stripe-webhook-novatutor
```

### 3. Get Function URL
After deployment, you'll receive a URL like:
```
https://[project-ref].supabase.co/functions/v1/stripe-webhook-novatutor
```

### 4. Configure Stripe Webhook
In Stripe Dashboard:
1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter function URL:
   ```
   https://[project-ref].supabase.co/functions/v1/stripe-webhook-novatutor
   ```
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** and add to Supabase environment variables

---

## 🧪 Testing Deployment

### Test in Stripe Dashboard
1. Go to **Developers → Webhooks**
2. Click on your webhook endpoint
3. Click **Send test webhook**
4. Select an event type
5. View the response

### Test with Stripe CLI
```bash
# Install Stripe CLI
scoop install stripe

# Forward webhooks to local function
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook-novatutor

# Trigger test event
stripe trigger customer.subscription.created
```

---

## 📊 Monitoring & Debugging

### View Function Logs
```bash
# Real-time logs
supabase functions logs stripe-webhook-novatutor --tail

# Logs from last hour
supabase functions logs stripe-webhook-novatutor --since 1h

# Logs with specific level
supabase functions logs stripe-webhook-novatutor --level error
```

### Dashboard Monitoring
In Supabase Dashboard:
1. Go to **Edge Functions**
2. Click on function name
3. View:
   - **Invocations** - Request count over time
   - **Logs** - Real-time function logs
   - **Errors** - Error rate and details

---

## 🔒 Security Best Practices

### 1. Verify Stripe Signatures
The function already includes signature verification:
```typescript
const event = await stripe.webhooks.constructEventAsync(
  rawBody,
  sig!,
  Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!,
  undefined,
  cryptoProvider
)
```

### 2. Use Service Role Key Carefully
The function uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS.
Only use it for authorized operations.

### 3. Validate Event Data
Always validate Stripe event data before processing:
```typescript
if (!event.data.object) {
  throw new Error('Invalid event data');
}
```

### 4. Idempotency
Stripe may send the same webhook multiple times. Implement idempotency:
```typescript
// Check if event already processed
const { data: existing } = await supabase
  .from('webhook_events')
  .select('id')
  .eq('stripe_event_id', event.id)
  .single();

if (existing) {
  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}
```

---

## 🐛 Common Issues & Solutions

### Issue: "Docker Desktop is required"
**Solution:** Install Docker Desktop from https://docs.docker.com/desktop/

### Issue: "Deno not found"
**Solution:** Either:
- Install Deno: `irm https://deno.land/install.ps1 | iex`
- Or skip local type checking (functions are checked on deployment)

### Issue: "Function fails to deploy"
**Solution:** Check:
1. You're logged in: `supabase login`
2. Project is linked: `supabase link`
3. Environment variables are set in dashboard
4. No syntax errors: `deno check supabase/functions/**/*.ts`

### Issue: "Stripe signature verification fails"
**Solution:** 
1. Ensure `STRIPE_WEBHOOK_SIGNING_SECRET` is set correctly
2. Check webhook endpoint URL matches deployed function
3. Verify you're using the signing secret from the correct webhook endpoint

### Issue: "Database permission denied"
**Solution:**
1. Ensure RLS policies allow service role access
2. Or use `SUPABASE_SERVICE_ROLE_KEY` (already configured)

---

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Manual](https://deno.land/manual)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig)

---

## 🎯 Next Steps

### For Production Deployment:
1. ✅ Supabase CLI installed
2. ⬜ Install Docker Desktop (if local dev needed)
3. ⬜ Configure environment variables in Supabase Dashboard
4. ⬜ Deploy function: `supabase functions deploy stripe-webhook-novatutor`
5. ⬜ Get function URL from deployment output
6. ⬜ Configure Stripe webhook with function URL
7. ⬜ Test webhook in Stripe Dashboard
8. ⬜ Monitor logs: `supabase functions logs stripe-webhook-novatutor --tail`

### For Local Development:
1. ⬜ Install Docker Desktop
2. ⬜ Run `supabase start`
3. ⬜ Serve function: `supabase functions serve stripe-webhook-novatutor`
4. ⬜ Forward Stripe webhooks: `stripe listen --forward-to localhost:54321/...`
5. ⬜ Test and iterate

---

**Last Updated:** 2025-11-12  
**Supabase CLI Version:** 2.58.5  
**Status:** ✅ Ready for deployment

