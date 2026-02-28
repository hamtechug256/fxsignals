-- ============================================
-- FX SIGNALS PWA - SUPABASE DATABASE SETUP
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Go to: Supabase Dashboard → SQL Editor → New Query
-- ============================================

-- 1. Create signals table
CREATE TABLE IF NOT EXISTS signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pair VARCHAR(20) NOT NULL,
  type VARCHAR(4) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  entry_price DECIMAL(10, 5) NOT NULL,
  stop_loss DECIMAL(10, 5) NOT NULL,
  take_profit_1 DECIMAL(10, 5) NOT NULL,
  take_profit_2 DECIMAL(10, 5),
  take_profit_3 DECIMAL(10, 5),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hit_tp', 'hit_sl', 'cancelled')),
  confidence INTEGER DEFAULT 70 CHECK (confidence >= 0 AND confidence <= 100),
  analysis TEXT,
  timeframe VARCHAR(10) DEFAULT 'H1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  result_pips DECIMAL(10, 2)
);

-- 2. Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'vip')),
  push_subscription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create performance_stats table
CREATE TABLE IF NOT EXISTS performance_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  period VARCHAR(20) NOT NULL,
  total_signals INTEGER DEFAULT 0,
  winning_signals INTEGER DEFAULT 0,
  losing_signals INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  total_pips DECIMAL(10, 2) DEFAULT 0,
  best_trade_pips DECIMAL(10, 2),
  worst_trade_pips DECIMAL(10, 2),
  avg_pips_per_trade DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create subscribers table (for push notifications)
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_pair ON signals(pair);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies

-- Signals: Anyone can read active signals
CREATE POLICY "Signals are viewable by everyone" ON signals
  FOR SELECT USING (true);

-- Signals: Only authenticated users can insert (for admin)
CREATE POLICY "Authenticated users can insert signals" ON signals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Signals: Only authenticated users can update (for admin)
CREATE POLICY "Authenticated users can update signals" ON signals
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Profiles: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscribers: Anyone can insert (for push subscription)
CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);

-- Subscribers: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscribers
  FOR SELECT USING (auth.uid() = user_id);

-- 8. Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, plan)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Insert sample signals (so your app has data immediately)
INSERT INTO signals (pair, type, entry_price, stop_loss, take_profit_1, take_profit_2, take_profit_3, status, confidence, analysis, timeframe, result_pips) VALUES
('EUR/USD', 'BUY', 1.0850, 1.0820, 1.0880, 1.0900, 1.0920, 'active', 85, 'Bullish order block identified at 1.0840. FVG present at 1.0845-1.0855. Previous session liquidity cleared.', 'H1', NULL),
('GBP/USD', 'SELL', 1.2650, 1.2680, 1.2620, 1.2600, 1.2580, 'active', 78, 'Bearish fair value gap at 1.2655-1.2665. Premium zone reached. Expecting liquidity sweep of previous lows.', 'H4', NULL),
('USD/JPY', 'BUY', 149.50, 149.20, 149.80, 150.00, 150.20, 'active', 82, 'Strong bullish structure. Order block at 149.30 acting as support. Target liquidity above 150.00.', 'H1', NULL),
('XAU/USD', 'BUY', 2025.00, 2018.00, 2032.00, 2038.00, 2045.00, 'active', 88, 'Gold showing strong bullish momentum. FVG at 2022-2028. Institutional buying evident.', 'H4', NULL),
('EUR/GBP', 'SELL', 0.8580, 0.8600, 0.8560, 0.8540, 0.8520, 'active', 75, 'Bearish structure on H4. Order block at 0.8590 rejecting price. Looking for continuation.', 'H4', NULL),
('AUD/USD', 'BUY', 0.6550, 0.6520, 0.6580, 0.6610, 0.6640, 'active', 72, 'Bullish divergence on RSI. Previous swing low liquidity cleared. Expecting reversal.', 'H1', NULL);

-- 11. Insert sample performance data
INSERT INTO performance_stats (period, total_signals, winning_signals, losing_signals, win_rate, total_pips, best_trade_pips, worst_trade_pips, avg_pips_per_trade) VALUES
('this_week', 12, 9, 3, 75.00, 287.5, 65.0, -25.0, 23.96),
('this_month', 48, 33, 15, 68.75, 892.0, 78.0, -32.0, 18.58),
('this_year', 156, 105, 51, 67.31, 3245.0, 95.0, -45.0, 20.80);

-- 12. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Add updated_at triggers
DROP TRIGGER IF EXISTS update_signals_updated_at ON signals;
CREATE TRIGGER update_signals_updated_at
  BEFORE UPDATE ON signals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Your database is now set up.
-- ============================================
-- Next steps:
-- 1. Get your Supabase URL and anon key from Project Settings > API
-- 2. Add them to your Vercel environment variables
-- 3. Your app will automatically connect!
-- ============================================
