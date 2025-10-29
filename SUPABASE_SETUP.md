# Supabase Setup Guide for SuperTutor

## Overview

SuperTutor uses Supabase for production-ready authentication and database management. This guide will help you set up Supabase for your project.

## Prerequisites

- A Supabase account (free tier available at https://supabase.com)
- Node.js and npm installed
- SuperTutor project cloned locally

## Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
```

## Step 2: Supabase Project Setup

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details:
   - **Name**: `supertutor` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

4. Wait for project initialization (1-2 minutes)

## Step 3: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll see two important values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: A long JWT token

3. Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste and run this SQL:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  grade TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'parent', 'teacher', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Anyone can insert their profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**

2. **Email Auth Settings:**
   - Enable **Email Confirmations** (recommended for production)
   - For development, you can disable to skip email verification

3. **URL Configuration:**
   - **Site URL**: `http://localhost:9002` (for development)
   - **Redirect URLs**: Add `http://localhost:9002/**`

4. **Email Templates** (Optional):
   - Customize confirmation and password reset emails
   - Use your brand colors and messaging

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:9002/login

3. Try creating a new account:
   - Click **Sign Up** tab
   - Fill in name, age, grade, email, password
   - Click **Create Account**

4. Check your email for verification (if enabled)

5. Try logging in with your credentials

## Features Enabled

✅ **Email/Password Authentication**
- Secure password hashing
- Email verification
- Password reset functionality

✅ **User Profiles**
- Name, age, grade information
- Role-based access (student, parent, teacher, admin)
- Automatic timestamp tracking

✅ **Row Level Security (RLS)**
- Users can only access their own data
- Database-level security policies
- Protection against unauthorized access

✅ **Session Management**
- Automatic token refresh
- Persistent sessions across page reloads
- Secure logout functionality

## Security Best Practices

### Environment Variables

Your Supabase credentials are stored in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hjegsngsrwwbddbujvxe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ `NEXT_PUBLIC_` prefix exposes to browser safely
- ✅ `anon` key is safe for client-side use with RLS enabled

### Row Level Security (RLS)

Always enable RLS on tables containing user data:

```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

Create policies to control access:

```sql
-- Example: Users can only see their own data
CREATE POLICY "Users can read own data"
  ON your_table
  FOR SELECT
  USING (auth.uid() = user_id);
```

## Advanced Features

### Password Reset

Add password reset functionality:

```typescript
import { supabase } from '@/lib/supabase';

async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:9002/reset-password',
  });
  
  if (error) {
    console.error('Error:', error.message);
  }
}
```

### OAuth Providers

Enable social login in Supabase dashboard → Authentication → Providers:
- Google
- GitHub
- Facebook
- Apple
- And more...

### Real-time Subscriptions

Listen to database changes in real-time:

```typescript
const subscription = supabase
  .channel('profiles')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'profiles' 
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

## Troubleshooting

### "Invalid API key" Error

**Solution**: Double-check your `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

### "User already registered" Error

**Solution**: The email is already in use. Try logging in instead or use a different email.

### Email not sending

**Solution**: 
- Check Supabase logs in dashboard
- For development, check email settings
- For production, set up custom SMTP

### RLS preventing queries

**Solution**: 
- Ensure policies are created correctly
- Check if user is authenticated (`auth.uid()` returns a value)
- Review policy conditions

## Migration from JSON Auth

If you previously used JSON-based auth, follow these steps:

1. Export existing users from `users.json`
2. Create accounts in Supabase using the signup flow
3. Remove or deprecate `users.json` and `src/lib/auth.ts`
4. Update any remaining references to old auth system

## Production Deployment

Before deploying to production:

1. **Enable Email Confirmations**
   - Go to Authentication → Settings
   - Enable "Enable email confirmations"

2. **Update URLs**
   - Set Site URL to your production domain
   - Add production domain to Redirect URLs

3. **Custom Email Domain** (Optional)
   - Set up custom SMTP in Authentication → Settings
   - Use your own email domain for auth emails

4. **Environment Variables**
   - Add Supabase credentials to your hosting platform
   - Vercel: Settings → Environment Variables
   - Netlify: Site settings → Environment variables

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **SuperTutor Issues**: Create an issue in your GitHub repo

## Next Steps

1. ✅ Set up authentication
2. 📊 Add user progress tracking
3. 💾 Store learning data in Supabase
4. 🔔 Implement notifications
5. 📈 Add analytics and insights

