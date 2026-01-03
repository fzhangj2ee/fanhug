-- Create bets table
CREATE TABLE IF NOT EXISTS public.bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    game_data JSONB NOT NULL,
    bet_type TEXT NOT NULL CHECK (bet_type IN ('home', 'away', 'spread-home', 'spread-away', 'over', 'under')),
    odds NUMERIC NOT NULL,
    stake NUMERIC NOT NULL,
    spread_value NUMERIC,
    total_value NUMERIC,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
    payout NUMERIC,
    placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON public.bets(status);
CREATE INDEX IF NOT EXISTS idx_bets_placed_at ON public.bets(placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_bets_user_status ON public.bets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bets_game_id ON public.bets(game_id);

-- Enable Row Level Security
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to read their own bets
CREATE POLICY "Users can read own bets" ON public.bets
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own bets
CREATE POLICY "Users can insert own bets" ON public.bets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own bets (for grading)
CREATE POLICY "Users can update own bets" ON public.bets
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bets_updated_at
    BEFORE UPDATE ON public.bets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.bets TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================
-- Messages Table
-- ============================================

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to insert their own messages
CREATE POLICY "Users can insert own messages" ON public.messages
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own messages
CREATE POLICY "Users can read own messages" ON public.messages
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow admin to read all messages
CREATE POLICY "Admin can read all messages" ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'fzhangj2ee@gmail.com'
        )
    );

-- Allow admin to update read status
CREATE POLICY "Admin can update messages" ON public.messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'fzhangj2ee@gmail.com'
        )
    );

-- Grant permissions
GRANT ALL ON public.messages TO authenticated;