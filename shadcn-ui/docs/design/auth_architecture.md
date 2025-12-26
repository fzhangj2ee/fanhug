# Authentication System Architecture Design

## Executive Summary

This document outlines the architecture for implementing a comprehensive authentication system with OAuth2 social login capabilities for the sports betting platform. After evaluating multiple authentication providers, **Supabase Auth** is recommended as the optimal solution.

---

## 1. Authentication Provider Selection

### Evaluated Options

| Provider | Pros | Cons | Score |
|----------|------|------|-------|
| **Supabase Auth** | • Built-in OAuth2 for all major providers<br>• PostgreSQL database included<br>• Row-level security<br>• Free tier (50,000 MAU)<br>• Excellent TypeScript support<br>• Real-time subscriptions | • Requires backend setup<br>• Learning curve for RLS | ⭐⭐⭐⭐⭐ |
| Firebase Auth | • Easy setup<br>• Good documentation<br>• Mature ecosystem | • Vendor lock-in<br>• NoSQL only<br>• Pricing can scale quickly | ⭐⭐⭐⭐ |
| Auth0 | • Enterprise features<br>• Extensive customization | • Expensive for scale<br>• Complex setup<br>• Free tier limited (7,000 MAU) | ⭐⭐⭐ |
| NextAuth.js | • Self-hosted<br>• Full control | • Requires more backend work<br>• Manual OAuth setup<br>• No built-in database | ⭐⭐⭐ |

### Recommendation: Supabase Auth

**Justification:**
- **Perfect fit for React/TypeScript**: Native TypeScript support with excellent type inference
- **All-in-one solution**: Authentication + PostgreSQL database + real-time subscriptions
- **OAuth2 built-in**: Pre-configured for Google, Facebook, Twitter, GitHub, and 10+ more providers
- **Cost-effective**: Free tier supports 50,000 monthly active users
- **Security**: Row-level security (RLS) policies for fine-grained access control
- **Developer experience**: Excellent documentation, active community, and modern API design
- **Scalability**: Handles millions of users with automatic scaling

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Login Page   │  │ Protected    │  │ User Profile │      │
│  │              │  │ Routes       │  │ Page         │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │ Auth Context   │                        │
│                    │ (React Context)│                        │
│                    └───────┬────────┘                        │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │ Supabase Client│                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                    Supabase Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Auth Service │  │ PostgreSQL   │  │ Storage      │       │
│  │              │  │ Database     │  │              │       │
│  └──────┬───────┘  └──────────────┘  └──────────────┘       │
│         │                                                     │
│         │ OAuth2 Flows                                       │
│         │                                                     │
└─────────┼─────────────────────────────────────────────────────┘
          │
          │ OAuth2 Redirect
          │
┌─────────▼─────────────────────────────────────────────────────┐
│              OAuth2 Providers                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Google   │  │ Facebook │  │ Twitter/X│  │ GitHub   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└───────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── contexts/
│   └── AuthContext.tsx          # Global auth state management
├── lib/
│   ├── supabase.ts              # Supabase client configuration
│   └── auth.ts                  # Auth utility functions
├── pages/
│   ├── Login.tsx                # Login page with social buttons
│   ├── Signup.tsx               # Registration page
│   ├── Profile.tsx              # User profile management
│   └── ResetPassword.tsx        # Password reset flow
├── components/
│   ├── ProtectedRoute.tsx       # Route guard component
│   ├── SocialLoginButton.tsx    # Reusable social login button
│   └── AuthForm.tsx             # Email/password form component
└── hooks/
    ├── useAuth.ts               # Custom auth hook
    └── useUser.ts               # User data hook
```

---

## 3. OAuth2 Authentication Flows

### 3.1 Email/Password Authentication Flow

```
User                    Frontend              Supabase Auth
  │                        │                        │
  │  Enter credentials     │                        │
  ├───────────────────────>│                        │
  │                        │  signUp/signIn         │
  │                        ├───────────────────────>│
  │                        │                        │
  │                        │  Verify & create JWT   │
  │                        │<───────────────────────┤
  │                        │                        │
  │  Store session         │                        │
  │<───────────────────────┤                        │
  │                        │                        │
  │  Redirect to app       │                        │
  │<───────────────────────┤                        │
```

### 3.2 OAuth2 Social Login Flow

```
User              Frontend         Supabase Auth      OAuth Provider
  │                  │                   │                   │
  │  Click Google    │                   │                   │
  ├─────────────────>│                   │                   │
  │                  │  signInWithOAuth  │                   │
  │                  ├──────────────────>│                   │
  │                  │                   │  Redirect to      │
  │                  │                   │  provider         │
  │                  │                   ├──────────────────>│
  │                  │                   │                   │
  │  Authorize app   │                   │                   │
  │<──────────────────────────────────────────────────────────┤
  │                  │                   │                   │
  │  Grant access    │                   │                   │
  ├──────────────────────────────────────────────────────────>│
  │                  │                   │                   │
  │                  │                   │  Auth code        │
  │                  │                   │<──────────────────┤
  │                  │                   │                   │
  │                  │                   │  Exchange for     │
  │                  │                   │  access token     │
  │                  │                   ├──────────────────>│
  │                  │                   │                   │
  │                  │                   │  Access token     │
  │                  │                   │<──────────────────┤
  │                  │                   │                   │
  │                  │  Redirect with    │                   │
  │                  │  session          │                   │
  │                  │<──────────────────┤                   │
  │                  │                   │                   │
  │  Logged in       │                   │                   │
  │<─────────────────┤                   │                   │
```

---

## 4. Database Schema

### Users Table (Managed by Supabase Auth)

```sql
-- Supabase automatically creates auth.users table
-- We create a public.profiles table for additional user data

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
```

### Bets Table (Updated with User Reference)

```sql
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  game_id TEXT NOT NULL,
  bet_type TEXT NOT NULL, -- 'spread', 'total', 'moneyline'
  selection TEXT NOT NULL,
  odds INTEGER NOT NULL,
  stake DECIMAL(10, 2) NOT NULL,
  potential_payout DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'won', 'lost', 'void'
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settled_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own bets
CREATE POLICY "Users can view own bets"
  ON public.bets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own bets
CREATE POLICY "Users can insert own bets"
  ON public.bets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 5. Implementation Approach

### Phase 1: Setup & Configuration (Day 1)

1. **Create Supabase Project**
   - Sign up at https://supabase.com
   - Create new project
   - Note: Project URL and anon key

2. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js
   npm install @supabase/auth-ui-react @supabase/auth-ui-shared
   ```

3. **Configure Environment Variables**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Initialize Supabase Client**
   - Create `/src/lib/supabase.ts`
   - Configure client with URL and key
   - Set up auth state listener

### Phase 2: Core Authentication (Day 2-3)

1. **Create Auth Context**
   - Global authentication state
   - User session management
   - Sign in/out functions
   - Session persistence

2. **Build Login Page**
   - Email/password form
   - Social login buttons (Google, Facebook, Twitter, GitHub)
   - "Remember me" functionality
   - Error handling

3. **Build Signup Page**
   - Registration form
   - Email verification flow
   - Password strength indicator
   - Terms acceptance

4. **Implement Protected Routes**
   - Route guard component
   - Redirect to login if unauthenticated
   - Preserve intended destination

### Phase 3: OAuth2 Integration (Day 4-5)

1. **Configure OAuth Providers in Supabase**
   - **Google OAuth2**:
     - Create project in Google Cloud Console
     - Enable Google+ API
     - Create OAuth 2.0 credentials
     - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
     - Copy Client ID and Secret to Supabase

   - **Facebook Login**:
     - Create app in Facebook Developers
     - Add Facebook Login product
     - Configure OAuth redirect URI
     - Copy App ID and Secret to Supabase

   - **Twitter/X OAuth2**:
     - Create app in Twitter Developer Portal
     - Enable OAuth 2.0
     - Set callback URL
     - Copy API Key and Secret to Supabase

   - **GitHub OAuth**:
     - Create OAuth App in GitHub Settings
     - Set authorization callback URL
     - Copy Client ID and Secret to Supabase

2. **Implement Social Login Buttons**
   - Reusable button component
   - Provider-specific styling
   - Loading states
   - Error handling

3. **Handle OAuth Callbacks**
   - Parse URL parameters
   - Extract session tokens
   - Store user session
   - Redirect to intended page

### Phase 4: User Profile & Session Management (Day 6)

1. **Create Profile Page**
   - Display user information
   - Edit profile functionality
   - Avatar upload
   - Account balance display

2. **Implement Session Management**
   - Auto-refresh tokens
   - Handle expired sessions
   - Logout functionality
   - Session timeout warnings

3. **Add Password Reset Flow**
   - Request reset email
   - Verify reset token
   - Update password
   - Confirmation message

### Phase 5: Integration & Testing (Day 7)

1. **Integrate with Existing Features**
   - Update BettingContext to use user ID
   - Modify MyBets to fetch user-specific bets
   - Add user balance to BetSlip
   - Implement bet placement with authentication

2. **Security Enhancements**
   - Implement CSRF protection
   - Add rate limiting for auth endpoints
   - Set up email verification requirement
   - Configure password policies

3. **Testing**
   - Test all OAuth providers
   - Verify protected routes
   - Test session persistence
   - Check error handling
   - Validate RLS policies

---

## 6. Required Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OAuth Provider Credentials (configured in Supabase Dashboard)
# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook Login
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Twitter/X OAuth2
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## 7. Security Considerations

### 7.1 Token Management

- **Access Tokens**: Short-lived (1 hour), stored in memory
- **Refresh Tokens**: Long-lived (30 days), stored in httpOnly cookies
- **Auto-refresh**: Tokens automatically refreshed before expiration
- **Secure Storage**: Never store tokens in localStorage (XSS vulnerability)

### 7.2 Row-Level Security (RLS)

```sql
-- Example: Users can only access their own data
CREATE POLICY "Users access own data"
  ON public.bets
  FOR ALL
  USING (auth.uid() = user_id);
```

### 7.3 Best Practices

1. **HTTPS Only**: All authentication flows over HTTPS
2. **CSRF Protection**: Use Supabase's built-in CSRF tokens
3. **Rate Limiting**: Prevent brute force attacks (configured in Supabase)
4. **Email Verification**: Require email verification for new accounts
5. **Password Policy**:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one number
   - At least one special character
6. **Session Timeout**: Auto-logout after 30 days of inactivity
7. **Multi-Factor Authentication (MFA)**: Optional, can be enabled later

### 7.4 OAuth2 Security

- **State Parameter**: Prevent CSRF attacks in OAuth flow
- **PKCE**: Use Proof Key for Code Exchange for mobile apps
- **Scope Limitation**: Request only necessary permissions
- **Token Validation**: Verify tokens on every request

---

## 8. User Experience Considerations

### 8.1 Login Page Features

- **Social Login Buttons**: Prominent, above email/password form
- **"Remember Me"**: Optional checkbox for extended sessions
- **Password Visibility Toggle**: Eye icon to show/hide password
- **Error Messages**: Clear, actionable error messages
- **Loading States**: Show spinner during authentication
- **Redirect Preservation**: Return to intended page after login

### 8.2 Registration Flow

- **Progressive Disclosure**: Minimal required fields initially
- **Real-time Validation**: Instant feedback on username availability
- **Password Strength Meter**: Visual indicator of password security
- **Terms & Privacy**: Clear links to policies
- **Email Verification**: Send verification email immediately

### 8.3 Profile Management

- **Avatar Upload**: Drag-and-drop or click to upload
- **Editable Fields**: Username, full name, email
- **Account Balance**: Prominent display with deposit button
- **Bet History**: Quick access to recent bets
- **Settings**: Notifications, privacy, security preferences

---

## 9. API Integration Examples

### 9.1 Sign Up with Email/Password

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  options: {
    data: {
      full_name: 'John Doe',
      username: 'johndoe'
    }
  }
});
```

### 9.2 Sign In with Google

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    scopes: 'email profile'
  }
});
```

### 9.3 Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### 9.4 Sign Out

```typescript
const { error } = await supabase.auth.signOut();
```

### 9.5 Reset Password

```typescript
// Request reset email
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  { redirectTo: `${window.location.origin}/reset-password` }
);

// Update password
const { data, error } = await supabase.auth.updateUser({
  password: 'NewSecurePassword123!'
});
```

---

## 10. Setup Instructions

### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up
2. Click "New Project"
3. Enter project details:
   - Name: "Sports Betting Platform"
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### Step 2: Configure OAuth Providers

#### Google OAuth2

1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret
8. In Supabase Dashboard:
   - Go to Authentication → Providers
   - Enable Google
   - Paste Client ID and Secret
   - Save

#### Facebook Login

1. Go to https://developers.facebook.com
2. Create new app → Consumer
3. Add Facebook Login product
4. Settings → Basic:
   - Copy App ID and App Secret
5. Facebook Login → Settings:
   - Valid OAuth Redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
6. In Supabase Dashboard:
   - Go to Authentication → Providers
   - Enable Facebook
   - Paste App ID and Secret
   - Save

#### Twitter/X OAuth2

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create new app
3. User authentication settings:
   - Enable OAuth 2.0
   - Type: Web App
   - Callback URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. In Supabase Dashboard:
   - Go to Authentication → Providers
   - Enable Twitter
   - Paste Client ID and Secret
   - Save

#### GitHub OAuth

1. Go to https://github.com/settings/developers
2. New OAuth App
3. Application name: "Sports Betting Platform"
4. Homepage URL: Your app URL
5. Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
6. Copy Client ID and generate Client Secret
7. In Supabase Dashboard:
   - Go to Authentication → Providers
   - Enable GitHub
   - Paste Client ID and Secret
   - Save

### Step 3: Configure Email Templates

1. In Supabase Dashboard → Authentication → Email Templates
2. Customize templates:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password
3. Add your branding and styling

### Step 4: Set Up Database

1. In Supabase Dashboard → SQL Editor
2. Run the SQL scripts from Section 4 (Database Schema)
3. Verify tables created successfully
4. Test RLS policies

### Step 5: Install & Configure Frontend

1. Install dependencies:
   ```bash
   cd /workspace/shadcn-ui
   npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
   ```

2. Create `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Create Supabase client configuration
4. Implement Auth Context
5. Build authentication pages
6. Add protected routes

---

## 11. Testing Checklist

### Email/Password Authentication
- [ ] User can sign up with email and password
- [ ] Email verification email is sent
- [ ] User can verify email via link
- [ ] User can sign in with verified credentials
- [ ] Invalid credentials show error message
- [ ] Password strength validation works
- [ ] User can sign out successfully

### OAuth2 Social Login
- [ ] Google login redirects correctly
- [ ] Google authorization completes successfully
- [ ] Facebook login works end-to-end
- [ ] Twitter/X login functions properly
- [ ] GitHub login completes successfully
- [ ] User profile data is populated from OAuth
- [ ] Duplicate account prevention works

### Session Management
- [ ] Session persists across page refreshes
- [ ] Token auto-refresh works before expiration
- [ ] Expired sessions redirect to login
- [ ] "Remember me" extends session duration
- [ ] Logout clears session completely

### Protected Routes
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users can access protected pages
- [ ] Redirect to intended page after login
- [ ] Deep links work with authentication

### Profile Management
- [ ] User can view profile information
- [ ] User can edit profile fields
- [ ] Avatar upload works correctly
- [ ] Changes persist after save
- [ ] Account balance displays correctly

### Password Reset
- [ ] Reset email is sent successfully
- [ ] Reset link works and is single-use
- [ ] Password update succeeds
- [ ] User can sign in with new password
- [ ] Old password no longer works

### Security
- [ ] Tokens stored securely (not in localStorage)
- [ ] RLS policies prevent unauthorized access
- [ ] CSRF protection enabled
- [ ] Rate limiting prevents brute force
- [ ] HTTPS enforced for all auth flows

---

## 12. Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Multi-Factor Authentication (MFA)**
   - SMS verification
   - Authenticator app (TOTP)
   - Backup codes

2. **Social Features**
   - Link/unlink social accounts
   - Account merging
   - Social profile import

3. **Advanced Security**
   - Login history and device management
   - Suspicious activity alerts
   - IP-based restrictions
   - Biometric authentication (mobile)

4. **User Preferences**
   - Notification settings
   - Privacy controls
   - Theme preferences
   - Language selection

5. **Account Recovery**
   - Security questions
   - Trusted contacts
   - Account freeze/unfreeze

---

## 13. Cost Estimation

### Supabase Pricing (as of 2024)

**Free Tier:**
- 50,000 monthly active users
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- Unlimited API requests

**Pro Tier ($25/month):**
- 100,000 monthly active users
- 8 GB database space
- 100 GB file storage
- 50 GB bandwidth
- Daily backups

**Recommendation:** Start with Free tier, upgrade to Pro when approaching limits.

---

## 14. Conclusion

This authentication system architecture provides:

✅ **Comprehensive OAuth2 Support**: Google, Facebook, Twitter, GitHub
✅ **Security Best Practices**: RLS, token management, CSRF protection
✅ **Excellent Developer Experience**: TypeScript, modern API, great docs
✅ **Scalability**: Handles millions of users
✅ **Cost-Effective**: Free tier for MVP, affordable scaling
✅ **Fast Implementation**: Can be built in 7 days

**Next Steps:**
1. Create Supabase project
2. Configure OAuth providers
3. Implement authentication pages
4. Integrate with existing betting features
5. Test thoroughly
6. Deploy to production

**Questions or Concerns:**
- Need clarification on any OAuth provider setup
- Want to discuss alternative authentication flows
- Require additional security features
- Need help with implementation details

This architecture is production-ready and follows industry best practices for authentication and security.