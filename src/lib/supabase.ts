import { createClient } from '@supabase/supabase-js';

// These will be set from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not set. Using mock mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry_price: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2?: number;
  take_profit_3?: number;
  status: 'active' | 'hit_tp' | 'hit_sl' | 'cancelled';
  confidence: number;
  analysis: string;
  timeframe: string;
  created_at: string;
  updated_at: string;
  result_pips?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'free' | 'premium' | 'vip';
  created_at: string;
  push_subscription?: string;
}

export interface Performance {
  id: string;
  period: string;
  total_signals: number;
  winning_signals: number;
  losing_signals: number;
  win_rate: number;
  total_pips: number;
  best_trade_pips: number;
  worst_trade_pips: number;
  avg_pips_per_trade: number;
}

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey;
};
