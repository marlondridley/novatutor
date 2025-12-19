# 🚀 GitHub Push Guide - BestTutorEver

This guide will help you securely push your code to GitHub **without exposing API keys or secrets**.

---

## ✅ Pre-Push Checklist

Before pushing to GitHub, ensure:

- [ ] `.env.local` is listed in `.gitignore`
- [ ] No API keys in code files
- [ ] `.env.example` created (without real keys)
- [ ] All secrets use environment variables
- [ ] Documentation is up-to-date
- [ ] Tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Linting passes: `npm run lint`

---

## 🔒 Security Check

### 1. Verify .gitignore is Working

```bash
# Check what will be committed
git status

# Verify .env.local is ignored
git check-ignore .env.local
# Should output: .env.local

# Check for any sensitive files
git status --ignored
```

### 2. Search for Leaked Secrets

```bash
# Search for common patterns
grep -r "sk-" --exclude-dir={node_modules,.next,out} .
grep -r "pk_" --exclude-dir={node_modules,.next,out} .
grep -r "API_KEY" --exclude-dir={node_modules,.next,out} .

# If any real keys are found, remove them!
```

### 3. Verify Environment Variables

**❌ NEVER commit:**
```typescript
// BAD - Hardcoded key
const apiKey = "sk-1234567890abcdef";
```

**✅ ALWAYS use environment variables:**
```typescript
// GOOD - Using environment variable
const apiKey = process.env.OPENAI_API_KEY;
```

---

## 📝 Git Commands

### Option 1: First-Time Push (New Repo)

```bash
# 1. Initialize git (if not already done)
git init

# 2. Add remote repository
git remote add origin https://github.com/marlondridley/novatutor.git

# 3. Stage all files
git add .

# 4. Check what's being committed
git status

# 5. Commit with a descriptive message
git commit -m "feat: initial commit - BestTutorEver AI learning platform

- Nintendo Switch-style game controller interface
- AI-powered tutoring with DeepSeek integration
- Offline PWA support with Service Worker
- COPPA-compliant behavior control system
- 88/100 Lighthouse mobile score
- Full TypeScript implementation"

# 6. Push to GitHub
git push -u origin main
```

---

### Option 2: Update Existing Repo

```bash
# 1. Pull latest changes (if working with others)
git pull origin main

# 2. Stage changed files
git add .

# 3. Commit changes
git commit -m "docs: update README and add portfolio documentation

- Enhanced README with project highlights
- Added CONTRIBUTING.md guidelines
- Added CODE_OF_CONDUCT.md
- Created comprehensive .env.example
- Updated .gitignore for security"

# 4. Push to GitHub
git push origin main
```

---

## 📂 Files That SHOULD Be Committed

✅ **Safe to commit:**
- `README.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `LICENSE`
- `.env.example` (template without real keys!)
- `.gitignore`
- All source code (`src/`)
- Package files (`package.json`, `package-lock.json`)
- Configuration files (`next.config.js`, `tailwind.config.ts`)
- Public assets (`public/`)

---

## 🚫 Files That Should NEVER Be Committed

❌ **NEVER commit:**
- `.env`
- `.env.local`
- `.env.production`
- Any file with real API keys
- `node_modules/`
- `.next/`
- `out/`
- Personal notes with credentials
- Database credentials
- Private keys (`.pem` files)

---

## 🔑 .env.example Template

Your `.env.example` should look like this:

```bash
# ===========================================
# 🌐 SITE CONFIGURATION
# ===========================================
NEXT_PUBLIC_SITE_URL=http://localhost:9002

# ===========================================
# 🗄️ SUPABASE (Database & Authentication)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ===========================================
# 🤖 AI CONFIGURATION
# ===========================================
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
OPENAI_API_KEY=sk-your-openai-key-here

# ===========================================
# 💳 STRIPE (Optional)
# ===========================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here
STRIPE_SECRET_KEY=sk_test_your-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# ===========================================
# 📊 REDIS (Optional)
# ===========================================
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Note:** Replace `your-key-here` with actual keys in your LOCAL `.env.local` file!

---

## 🛡️ GitHub Secrets (For CI/CD)

If using GitHub Actions, add secrets in:
**Settings → Secrets and variables → Actions**

Required secrets:
- `DEEPSEEK_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` (if using payments)

---

## 📊 Portfolio Best Practices

### Make Your Repo Shine for Recruiters:

1. **Add a professional README**
   - Clear project description
   - Screenshots/GIFs
   - Tech stack highlighted
   - Setup instructions
   - Live demo link

2. **Add comprehensive documentation**
   - `CONTRIBUTING.md`
   - `CODE_OF_CONDUCT.md`
   - `LICENSE`
   - API documentation

3. **Add GitHub badges**
   ```markdown
   [![Lighthouse](https://img.shields.io/badge/Lighthouse-88%2F100-green)]()
   [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()
   ```

4. **Create a clean commit history**
   ```bash
   # Use conventional commits
   feat: add new feature
   fix: fix bug
   docs: update documentation
   style: formatting changes
   refactor: code refactoring
   test: add tests
   chore: maintenance
   ```

5. **Add GitHub Topics**
   Go to your repo → About → Settings → Topics:
   - `nextjs`
   - `typescript`
   - `ai`
   - `education`
   - `pwa`
   - `tailwindcss`

6. **Pin this repo to your profile**
   GitHub Profile → Repositories → Pin to profile

---

## 🧪 Test Before Pushing

```bash
# 1. Build the project
npm run build

# 2. Run linting
npm run lint

# 3. Type check
npm run typecheck

# 4. Test lighthouse scores
npm run lighthouse:mobile

# If all pass, you're ready to push!
```

---

## 🚀 Complete Push Workflow

Here's the full workflow:

```bash
# 1. Check status
git status

# 2. Stage all changes
git add .

# 3. Verify what's being committed (check for .env files!)
git status

# 4. Commit with descriptive message
git commit -m "feat: add game controller interface with PWA support"

# 5. Push to GitHub
git push origin main

# 6. Verify on GitHub
# Open: https://github.com/marlondridley/novatutor
# Check that .env.local is NOT visible!
```

---

## ⚠️ If You Accidentally Committed Secrets

**DON'T PANIC!** Follow these steps:

### 1. Remove the Secret from Git History

```bash
# Remove .env.local from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (careful!)
git push origin --force --all
```

### 2. Rotate ALL Exposed Keys

- **OpenAI**: Create new API key, delete old one
- **DeepSeek**: Create new API key, delete old one
- **Supabase**: Reset service role key
- **Stripe**: Roll keys in dashboard

### 3. Add to .gitignore

```bash
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "chore: add .env.local to .gitignore"
git push origin main
```

---

## 🎯 Portfolio Presentation Tips

When sharing this repo with recruiters:

1. **Add a live demo link** (Vercel deployment)
2. **Include screenshots** in README
3. **Highlight key achievements**:
   - 88/100 Lighthouse score
   - PWA with offline support
   - COPPA-compliant AI system
   - Nintendo Switch-inspired UI
4. **Document your decisions** (why DeepSeek? why Service Worker?)
5. **Show testing coverage** (add tests!)
6. **Keep commits clean** (meaningful commit messages)

---

## 📞 Need Help?

If you run into issues:

1. **Check .gitignore** is working: `git check-ignore -v .env.local`
2. **Review staged files**: `git diff --cached --name-only`
3. **Test build locally**: `npm run build`
4. **Ask for help**: Open a GitHub issue or discussion

---

## ✅ Final Checklist Before Push

```bash
□ .env.local is in .gitignore
□ No hardcoded API keys in code
□ .env.example created (no real keys!)
□ README.md is updated
□ CONTRIBUTING.md exists
□ LICENSE exists
□ npm run build succeeds
□ npm run lint passes
□ npm run typecheck passes
□ Commit message is descriptive
□ Ready to push!
```

---

**You're ready to push! 🚀**

```bash
git push origin main
```

**Check your repo:** https://github.com/marlondridley/novatutor


