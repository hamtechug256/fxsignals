// Signal utility functions

export interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  takeProfit1: number;
  takeProfit2: number | null;
  stopLoss: number;
  analysis: string | null;
  status: 'ACTIVE' | 'HIT_TP1' | 'HIT_TP2' | 'HIT_SL' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  result: 'WIN' | 'LOSS' | 'PENDING' | null;
  pips: number | null;
}

export interface SignalFormData {
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  takeProfit1: number;
  takeProfit2?: number;
  stopLoss: number;
  analysis?: string;
}

// Calculate pips for a signal
export function calculatePips(signal: Signal, exitPrice: number): number {
  const isBuy = signal.type === 'BUY';
  const isJpyPair = signal.pair.includes('JPY');
  const multiplier = isJpyPair ? 100 : 10000;
  
  if (isBuy) {
    return (exitPrice - signal.entryPrice) * multiplier;
  } else {
    return (signal.entryPrice - exitPrice) * multiplier;
  }
}

// Get status badge color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'HIT_TP1':
    case 'HIT_TP2':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'HIT_SL':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'CLOSED':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

// Get signal type color
export function getSignalTypeColor(type: string): string {
  return type === 'BUY' 
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : 'bg-red-500/20 text-red-400 border-red-500/30';
}

// Format price based on pair
export function formatPrice(price: number, pair: string): string {
  const isJpyPair = pair.includes('JPY');
  return isJpyPair ? price.toFixed(2) : price.toFixed(4);
}

// Format date for display
export function formatSignalDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get risk reward ratio
export function getRiskRewardRatio(signal: Signal): number {
  const isBuy = signal.type === 'BUY';
  const risk = Math.abs(signal.entryPrice - signal.stopLoss);
  const reward = Math.abs(signal.takeProfit1 - signal.entryPrice);
  return Number((reward / risk).toFixed(2));
}

// Calculate potential pips for signal
export function getPotentialPips(signal: Signal): { tp1: number; tp2: number | null; sl: number } {
  const isJpyPair = signal.pair.includes('JPY');
  const multiplier = isJpyPair ? 100 : 10000;
  const isBuy = signal.type === 'BUY';
  
  const tp1Pips = isBuy 
    ? (signal.takeProfit1 - signal.entryPrice) * multiplier
    : (signal.entryPrice - signal.takeProfit1) * multiplier;
    
  const tp2Pips = signal.takeProfit2 
    ? (isBuy 
        ? (signal.takeProfit2 - signal.entryPrice) * multiplier
        : (signal.entryPrice - signal.takeProfit2) * multiplier)
    : null;
    
  const slPips = isBuy
    ? (signal.entryPrice - signal.stopLoss) * multiplier
    : (signal.stopLoss - signal.entryPrice) * multiplier;
  
  return {
    tp1: Math.round(tp1Pips),
    tp2: tp2Pips ? Math.round(tp2Pips) : null,
    sl: Math.round(slPips),
  };
}
