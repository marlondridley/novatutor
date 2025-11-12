# Supabase Edge Functions

This directory contains Deno-based edge functions that run on Supabase's platform.

## 🚀 Functions

### `stripe-webhook-novatutor`
Handles Stripe webhook events for subscription management.

## 🔧 Development

### Prerequisites
Install Deno (not required for deployment, but useful for local development):

**Windows (PowerShell):**
```powershell
irm https://deno.land/install.ps1 | iex
```

**macOS/Linux:**
```bash
curl -fsSL https://deno.land/install.sh | sh
```

### Type Checking
Check types with Deno's built-in type checker:
```bash
deno check supabase/functions/**/*.ts
```

### Local Testing
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test webhook endpoint
curl -X POST http://localhost:54321/functions/v1/stripe-webhook-novatutor \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 📦 Deployment

Functions are automatically deployed when you push to Supabase:

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy stripe-webhook-novatutor
```

## 🔐 Environment Variables

Required environment variables (set in Supabase Dashboard → Edge Functions → Settings):

- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SIGNING_SECRET` - Webhook signing secret from Stripe
- `SUPABASE_URL` - Your Supabase project URL (auto-injected)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (auto-injected)

## 📝 Notes

- These functions use Deno runtime, not Node.js
- Import syntax uses `npm:package@version` for npm packages
- Type checking is handled by Deno, not Next.js TypeScript
- The `// @ts-nocheck` directive prevents Next.js from checking these files

## 🔗 Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Manual](https://deno.land/manual)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

