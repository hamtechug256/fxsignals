// Forex price utilities

export interface ForexPrice {
  pair: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface ForexPrices {
  prices: Record<string, {
    bid: number;
    ask: number;
    change: number;
    changePercent: number;
  }>;
  timestamp: string;
}

// Major forex pairs
export const MAJOR_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'AUD/USD',
  'USD/CAD',
  'USD/CHF',
  'NZD/USD',
] as const;

// Cross pairs
export const CROSS_PAIRS = [
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY',
  'AUD/JPY',
  'EUR/AUD',
  'GBP/AUD',
] as const;

// All supported pairs
export const ALL_PAIRS = [...MAJOR_PAIRS, ...CROSS_PAIRS] as const;

// Format price for display
export function formatForexPrice(price: number, pair: string): string {
  const isJpyPair = pair.includes('JPY');
  return isJpyPair ? price.toFixed(2) : price.toFixed(4);
}

// Get price change color
export function getPriceChangeColor(change: number): string {
  if (change > 0) return 'text-emerald-400';
  if (change < 0) return 'text-red-400';
  return 'text-gray-400';
}

// Format spread for display
export function formatSpread(spread: number): string {
  return spread.toFixed(1);
}

// Calculate pip value (for standard lot)
export function calculatePipValue(pair: string, accountCurrency: string = 'USD'): number {
  // Simplified pip value calculation for a standard lot (100,000 units)
  const isJpyPair = pair.includes('JPY');
  
  if (pair.endsWith('/USD') || accountCurrency === 'USD') {
    // Direct quote or USD account
    return isJpyPair ? 10 : 10;
  } else if (pair.startsWith('USD')) {
    // Indirect quote
    return 10;
  } else {
    // Cross pair - simplified
    return 10;
  }
}

// Fetch live price (client-side helper)
export async function fetchForexPrice(pair: string): Promise<ForexPrice | null> {
  try {
    const response = await fetch(`/api/forex/price?pair=${encodeURIComponent(pair)}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error fetching forex price:', error);
    return null;
  }
}

// Fetch all prices (client-side helper)
export async function fetchAllForexPrices(): Promise<ForexPrices | null> {
  try {
    const response = await fetch('/api/forex/price');
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error fetching forex prices:', error);
    return null;
  }
}
