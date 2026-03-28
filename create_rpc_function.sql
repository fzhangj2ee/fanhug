-- Create a function to get all bets with user emails
CREATE OR REPLACE FUNCTION get_all_bets_with_emails()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  game_id TEXT,
  bet_type TEXT,
  placed_at TIMESTAMPTZ,
  odds DECIMAL,
  stake DECIMAL,
  payout DECIMAL,
  status TEXT,
  spread_value DECIMAL,
  total_value DECIMAL,
  game_data JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.user_id,
    u.email as user_email,
    b.game_id,
    b.bet_type,
    b.placed_at,
    b.odds,
    b.stake,
    b.payout,
    b.status,
    b.spread_value,
    b.total_value,
    b.game_data,
    b.created_at,
    b.updated_at
  FROM bets b
  LEFT JOIN auth.users u ON b.user_id = u.id
  ORDER BY b.placed_at DESC;
END;
$$;
