-- FanHug Supabase Database Schema
-- This file contains the complete database schema for the FanHug betting application

-- =====================================================
-- BETS TABLE
-- =====================================================

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  game_id TEXT NOT NULL,
  bet_type TEXT NOT NULL,
  odds DECIMAL NOT NULL,
  stake DECIMAL NOT NULL,
  payout DECIMAL,
  status TEXT NOT NULL DEFAULT 'pending',
  spread_value DECIMAL,
  total_value DECIMAL,
  game_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for bets table
CREATE INDEX IF NOT EXISTS bets_user_id_idx ON bets(user_id);
CREATE INDEX IF NOT EXISTS bets_status_idx ON bets(status);
CREATE INDEX IF NOT EXISTS bets_created_at_idx ON bets(created_at DESC);

-- Enable Row Level Security (RLS) for bets table
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bets table
CREATE POLICY "Users can insert own bets" ON bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own bets" ON bets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own bets" ON bets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all bets" ON bets
  FOR SELECT USING (auth.email() = 'fzhangj2ee@gmail.com');

CREATE POLICY "Admin can update all bets" ON bets
  FOR UPDATE USING (auth.email() = 'fzhangj2ee@gmail.com');

-- =====================================================
-- MESSAGES TABLE
-- =====================================================

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for messages table
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_read_idx ON messages(read);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);

-- Enable Row Level Security (RLS) for messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages table
-- Allow authenticated users to insert their own messages
CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own messages
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admin to read all messages
CREATE POLICY "Admin can read all messages" ON messages
  FOR SELECT USING (auth.email() = 'fzhangj2ee@gmail.com');

-- Allow admin to update messages (mark as read)
CREATE POLICY "Admin can update messages" ON messages
  FOR UPDATE USING (auth.email() = 'fzhangj2ee@gmail.com');

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on bets table
DROP TRIGGER IF EXISTS update_bets_updated_at ON bets;
CREATE TRIGGER update_bets_updated_at
  BEFORE UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- To apply this schema to your Supabase project:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project: cubuiswiuxshvipteqdd
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
-- 6. Verify in Table Editor that both tables exist with proper RLS policies
--
-- RLS Policies Explanation:
-- - Users can INSERT, SELECT, and UPDATE their own bets and messages
-- - Admin (fzhangj2ee@gmail.com) can SELECT and UPDATE all bets and messages
-- - This ensures data privacy while allowing admin oversight
--