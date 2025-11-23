# Supabase Authentication Integration Plan

## Overview
Replace localStorage authentication with Supabase Auth to enable social login (Google, Facebook, Twitter, LinkedIn).

## Files to Update
1. ✅ Create Supabase client configuration
2. ✅ Update AuthContext to use Supabase Auth
3. ✅ Update Login page with Supabase social login
4. ✅ Update Signup page with Supabase social login
5. ✅ Update Dashboard to use Supabase user data
6. ✅ Install @supabase/supabase-js dependency
7. ✅ Test and verify authentication flow

## Implementation Details

### 1. Supabase Client Setup
- Create `/src/lib/supabase.ts` with Supabase client initialization
- Use environment variables for Supabase URL and anon key

### 2. AuthContext Updates
- Replace localStorage logic with Supabase Auth methods
- Implement `signUp`, `signInWithPassword`, `signInWithOAuth`
- Handle session management with Supabase
- Listen to auth state changes

### 3. Login/Signup Pages
- Connect social login buttons to Supabase OAuth
- Update form handlers to use Supabase methods
- Add proper error handling

### 4. Protected Routes
- Verify authentication using Supabase session
- Redirect unauthenticated users appropriately