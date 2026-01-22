-- FanHug Supabase Database Schema
-- This file contains the complete database schema for the FanHug betting application
-- Updated with proper RLS policies for admin and regular users

-- ==============================================================
-- BETS TABLE
-- ==============================================================

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    game_id TEXT NOT NULL,
    bet_type TEXT NOT NULL,
    placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    odds DECIMAL NOT NULL,
    stake DECIMAL NOT NULL,
    payout DECIMAL,
    status TEXT NOT NULL DEFAULT 'pending',
    spread_value DECIMAL,
    total_value DECIMAL,
    game_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for bets table
CREATE INDEX IF NOT EXISTS bets_user_id_idx ON bets(user_id);
CREATE INDEX IF NOT EXISTS bets_status_idx ON bets(status);
CREATE INDEX IF NOT EXISTS bets_created_at_idx ON bets(created_at DESC);
CREATE INDEX IF NOT EXISTS bets_placed_at_idx ON bets(placed_at DESC);

-- Enable Row Level Security (RLS) for bets table
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bets table
CREATE POLICY "Users can insert own bets" ON bets
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and admins can view bets" ON bets
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id 
        OR 
        auth.email() = 'fzhangj2ee@gmail.com'
    );

CREATE POLICY "Users can update own bets" ON bets
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all bets" ON bets
    FOR UPDATE TO authenticated
    USING (auth.email() = 'fzhangj2ee@gmail.com');

-- ==============================================================
-- TRANSACTIONS TABLE
-- ==============================================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    type TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    balance_after DECIMAL NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for transactions table
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at DESC);

-- Enable RLS for transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions table
CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and admins can view transactions" ON transactions
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id 
        OR 
        auth.email() = 'fzhangj2ee@gmail.com'
    );

-- ==============================================================
-- WALLETS TABLE
-- ==============================================================

CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
    balance DECIMAL NOT NULL DEFAULT 1000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for wallets table
CREATE INDEX IF NOT EXISTS wallets_user_id_idx ON wallets(user_id);

-- Enable RLS for wallets table
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallets table
CREATE POLICY "Users can view own wallet" ON wallets
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id 
        OR 
        auth.email() = 'fzhangj2ee@gmail.com'
    );

CREATE POLICY "Users can update own wallet" ON wallets
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet" ON wallets
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================
-- MESSAGES TABLE
-- ==============================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for messages table
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_read_idx ON messages(read);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);

-- Enable RLS for messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages table
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id 
        OR 
        auth.email() = 'fzhangj2ee@gmail.com'
    );

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert messages" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- ==============================================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for bets table
DROP TRIGGER IF EXISTS update_bets_updated_at ON bets;
CREATE TRIGGER update_bets_updated_at
    BEFORE UPDATE ON bets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for wallets table
DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================
-- INITIAL DATA (OPTIONAL)
-- ==============================================================

-- Note: When a new user signs up, their wallet should be automatically created
-- This can be done via a trigger or in the application logic
