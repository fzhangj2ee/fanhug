-- FanHug Supabase Database Schema
-- This file contains the complete database schema for the FanHug betting application

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

CREATE POLICY "Users can view own bets" ON bets
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own bets" ON bets
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);