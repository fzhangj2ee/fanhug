# Authentication Setup Guide

This guide will help you set up Supabase authentication with OAuth2 social login for the sports betting platform.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- OAuth provider accounts (Google, Facebook, Twitter/X, GitHub)

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: Sports Betting Platform (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for development
4. Click "Create new project" and wait ~2 minutes for setup

## Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (a long JWT token)

3. Create a `.env.local` file in the project root:
   ```bash
   cd /workspace/shadcn-ui
   nano .env.local
   ```

4. Add your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. Save and close the file

## Step 3: Configure OAuth Providers

### Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable **Google+ API**:
   - Navigate to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: Sports Betting Platform
   - **Authorized redirect URIs**: Add `https://your-project-id.supabase.co/auth/v1/callback`
   - Click **Create**
5. Copy the **Client ID** and **Client Secret**
6. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Find **Google** and toggle it on
   - Paste your Client ID and Client Secret
   - Click **Save**

### Facebook Login

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click **My Apps** → **Create App**
3. Choose **Consumer** as the app type
4. Fill in app details and create the app
5. Add **Facebook Login** product:
   - Click **Add Product**
   - Find **Facebook Login** and click **Set Up**
6. Configure OAuth settings:
   - Go to **Facebook Login** → **Settings**
   - Add **Valid OAuth Redirect URIs**: `https://your-project-id.supabase.co/auth/v1/callback`
   - Save changes
7. Get credentials:
   - Go to **Settings** → **Basic**
   - Copy **App ID** and **App Secret**
8. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Find **Facebook** and toggle it on
   - Paste your App ID and App Secret
   - Click **Save**

### Twitter/X OAuth2

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or select an existing one
3. Configure user authentication settings:
   - Go to app settings → **User authentication settings**
   - Enable **OAuth 2.0**
   - Type of App: **Web App**
   - **Callback URI / Redirect URL**: `https://your-project-id.supabase.co/auth/v1/callback`
   - **Website URL**: Your app URL
   - Save settings
4. Copy **Client ID** and **Client Secret**
5. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Find **Twitter** and toggle it on
   - Paste your Client ID and Client Secret
   - Click **Save**

### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: Sports Betting Platform
   - **Homepage URL**: Your app URL
   - **Authorization callback URL**: `https://your-project-id.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Generate a new **Client Secret** and copy it
7. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Find **GitHub** and toggle it on
   - Paste your Client ID and Client Secret
   - Click **Save**

## Step 4: Configure Email Templates (Optional)

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup**: Welcome email with verification link
   - **Magic Link**: Passwordless login email
   - **Change Email Address**: Email change confirmation
   - **Reset Password**: Password reset email
3. Add your branding, logo, and styling
4. Save each template

## Step 5: Set Up Database (Optional - for user profiles)

If you want to store additional user data (like account balance, username, etc.):

1. In Supabase Dashboard, go to **SQL Editor**
2. Create a profiles table:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

3. Click **Run** to execute the SQL

## Step 6: Test Authentication

1. Start the development server:
   ```bash
   cd /workspace/shadcn-ui
   pnpm run dev
   ```

2. Test email/password signup:
   - Navigate to `/signup`
   - Fill in the form and submit
   - Check your email for verification link
   - Click the link to verify your account

3. Test email/password login:
   - Navigate to `/login`
   - Enter your credentials
   - You should be redirected to the home page

4. Test social login:
   - Navigate to `/login`
   - Click on a social login button (Google, Facebook, etc.)
   - You should be redirected to the provider's login page
   - Authorize the app
   - You should be redirected back and logged in

5. Test protected routes:
   - Try accessing `/my-bets` or `/wallet` without logging in
   - You should be redirected to `/login`
   - After logging in, you should be redirected back to the intended page

## Troubleshooting

### "Invalid credentials" error
- Double-check your Supabase URL and anon key in `.env.local`
- Restart the development server after changing `.env.local`

### OAuth redirect not working
- Verify the callback URL in each provider's settings matches: `https://your-project-id.supabase.co/auth/v1/callback`
- Make sure the provider is enabled in Supabase Dashboard

### Email verification not working
- Check your Supabase email settings in **Authentication** → **Email Templates**
- Verify your email service is configured (Supabase provides a default SMTP for development)

### Session not persisting
- Check browser console for errors
- Clear browser cache and cookies
- Verify Supabase client configuration in `src/lib/supabase.ts`

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use environment variables** - Never hardcode credentials
3. **Enable Row Level Security (RLS)** - Protect your database tables
4. **Require email verification** - Enable in Supabase settings
5. **Use HTTPS in production** - Required for OAuth flows
6. **Implement rate limiting** - Configure in Supabase dashboard
7. **Regular security audits** - Review auth logs and user activity

## Next Steps

- [ ] Customize email templates with your branding
- [ ] Set up user profile page
- [ ] Implement password reset flow
- [ ] Add multi-factor authentication (MFA)
- [ ] Configure custom domain for Supabase
- [ ] Set up production environment variables
- [ ] Deploy to production

## Support

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **GitHub Issues**: Report bugs in the project repository

## Architecture Reference

For detailed architecture information, see `/workspace/shadcn-ui/docs/design/auth_architecture.md`