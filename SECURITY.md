# Security Policy

## 🔒 API Key Management

### Environment Variables

All sensitive API keys are stored in `.env.local` which is:
- ✅ Protected by `.gitignore`
- ✅ Never committed to Git
- ✅ Server-side only (not exposed to browser)
- ✅ Different for each environment (dev, staging, prod)

### Setup for Development

1. Copy the example file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your real API keys:
   ```env
   DEEPSEEK_API_KEY=your-deepseek-api-key-here
   OPENAI_API_KEY=your-openai-api-key-here
   ```

3. Never commit `.env.local` to version control!

### Setup for Production

For production deployment, set environment variables in your hosting provider:

#### Vercel
1. Go to Project Settings > Environment Variables
2. Add each variable with production values
3. Deploy

#### Netlify
1. Go to Site Settings > Build & Deploy > Environment
2. Add variables
3. Deploy

#### Railway/Render/Others
Use their respective environment variable interfaces.

### Protected Files

Files that should NEVER be committed:
```
.env.local
.env.production
.env.*.local
```

These are already in `.gitignore`:
```gitignore
.env*
```

## 🚨 What to Do If Keys Are Exposed

If you accidentally commit API keys:

### 1. Immediately Rotate Keys

**DeepSeek:**
1. Go to https://platform.deepseek.com/api_keys
2. Delete the exposed key
3. Create a new key
4. Update `.env.local`

**OpenAI:**
1. Go to https://platform.openai.com/api-keys
2. Revoke the exposed key
3. Create a new key
4. Update `.env.local`

### 2. Remove from Git History

```bash
# If the commit hasn't been pushed
git reset --soft HEAD~1
git add .env.local  # To re-ignore it
git commit -m "Remove sensitive data"

# If it's been pushed (use with caution!)
# Consider using tools like BFG Repo-Cleaner
# Or create a new repository and migrate
```

### 3. Update Production

Update environment variables in all deployment environments.

## ✅ Best Practices

### DO:
- ✅ Keep API keys in `.env.local`
- ✅ Use different keys for dev/staging/prod
- ✅ Rotate keys regularly
- ✅ Use `.gitignore` for all `.env*` files
- ✅ Use environment variable UI in hosting providers
- ✅ Share keys securely (password manager, not email/chat)

### DON'T:
- ❌ Commit `.env.local` to Git
- ❌ Hard-code API keys in source code
- ❌ Share keys in Slack/Discord/email
- ❌ Use production keys in development
- ❌ Put keys in documentation files
- ❌ Store keys in client-side code

## 📋 Security Checklist

Before deploying:

- [ ] All API keys in `.env.local` (not in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] No keys in any `.md` files
- [ ] Production uses different keys than development
- [ ] Environment variables set in hosting provider
- [ ] No keys exposed in client-side bundles
- [ ] Git history doesn't contain keys

## 🔍 Audit Your Repository

Check for accidentally committed secrets:

```bash
# Search for potential API keys in Git history
git log -p | grep -i "api.key\|secret\|password" 

# Search current codebase
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=.git

# Use tools like:
# - git-secrets
# - truffleHog
# - GitHub Secret Scanning (automatic on public repos)
```

## 📞 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security concerns privately
3. Include steps to reproduce
4. Give time for fix before disclosure

## 🔐 Additional Security Measures

### Rate Limiting
Consider implementing rate limiting for API calls to prevent abuse.

### Request Signing
For production, consider signing requests to verify they come from your server.

### Monitoring
Set up monitoring for:
- Unusual API usage patterns
- Failed authentication attempts
- Cost anomalies

### Least Privilege
Use API keys with minimal required permissions:
- Read-only where possible
- Scoped to specific resources
- Time-limited when applicable

---

**Remember**: Security is a continuous process, not a one-time setup. Review regularly! 🛡️

