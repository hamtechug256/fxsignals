import { NextResponse } from 'next/server';
const mockSignals = [
  { id: '1', pair: 'EUR/USD', type: 'BUY', entryPrice: 1.08500, status: 'ACTIVE', result: 'PENDING', pips: null, createdAt: new Date().toISOString() },
  { id: '2', pair: 'GBP/USD', type: 'SELL', entryPrice: 1.26500, status: 'HIT_TP1', result: 'WIN', pips: 45.5, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', pair: 'XAU/USD', type: 'BUY', entryPrice: 2325.50, status: 'HIT_TP2', result: 'WIN', pips: 95.0, createdAt: new Date(Date.now() - 172800000).toISOString() },
];
export async function GET() {
  return NextResponse.json({ signals: mockSignals, stats: { totalSignals: 156, winRate: 67.3, avgPips: 23.5 }, user: { plan: 'FREE', name: 'Guest' } });
}
