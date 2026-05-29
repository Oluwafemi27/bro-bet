
-- Update profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected'));

-- Sportsbook Tables
CREATE TABLE IF NOT EXISTS sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid REFERENCES sports(id) ON DELETE CASCADE,
  name text NOT NULL,
  country text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid REFERENCES leagues(id) ON DELETE CASCADE,
  home_team text NOT NULL,
  away_team text NOT NULL,
  start_time timestamp with time zone NOT NULL,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished', 'cancelled')),
  result text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS odds_markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  market_name text NOT NULL,
  outcome_name text NOT NULL,
  odds numeric NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Casino Tables
CREATE TABLE IF NOT EXISTS casino_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  provider text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS casino_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid REFERENCES casino_games(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('bet', 'win')),
  amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Agents Tables
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  commission_rate numeric DEFAULT 0.05,
  total_earnings numeric DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  bet_id uuid REFERENCES bets(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Risk Tables
CREATE TABLE IF NOT EXISTS risk_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  criteria jsonb,
  action text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS betting_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  max_bet numeric,
  max_daily_win numeric,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at timestamp with time zone DEFAULT now()
);

-- Compliance Tables
CREATE TABLE IF NOT EXISTS kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_at timestamp with time zone,
  rejected_reason text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS responsible_gaming_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  deposit_limit_daily numeric,
  session_limit_minutes integer,
  self_exclusion_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE casino_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE casino_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsible_gaming_limits ENABLE ROW LEVEL SECURITY;

-- Admin Policies (Simplified for now, assuming public.has_role is available)
CREATE POLICY "Admins can manage sports" ON sports FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view active sports" ON sports FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage leagues" ON leagues FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view active leagues" ON leagues FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage matches" ON matches FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);

CREATE POLICY "Admins can manage odds_markets" ON odds_markets FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view odds_markets" ON odds_markets FOR SELECT USING (true);

CREATE POLICY "Admins can manage casino_games" ON casino_games FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view active casino_games" ON casino_games FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage casino_transactions" ON casino_transactions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own casino_transactions" ON casino_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage agents" ON agents FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents can view own record" ON agents FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage agent_commissions" ON agent_commissions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents can view own commissions" ON agent_commissions FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Admins can manage risk_rules" ON risk_rules FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage betting_limits" ON betting_limits FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own betting_limits" ON betting_limits FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage fraud_alerts" ON fraud_alerts FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own fraud_alerts" ON fraud_alerts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage kyc_documents" ON kyc_documents FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can manage own kyc_documents" ON kyc_documents FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage responsible_gaming_limits" ON responsible_gaming_limits FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can manage own responsible_gaming_limits" ON responsible_gaming_limits FOR ALL USING (auth.uid() = user_id);

-- Enable Realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE bets;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE fraud_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE kyc_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE user_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
