import { NextRequest, NextResponse } from 'next/server';

const mockSignals = [
  { id: '1', pair: 'EUR/USD', type: 'BUY', entryPrice: 1.08500, takeProfit1: 1.08700, takeProfit2: 1.08900, stopLoss: 1.08300, analysis: 'ICT Order Block + FVG confluence', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), result: 'PENDING', pips: null },
  { id: '2', pair: 'GBP/USD', type: 'SELL', entryPrice: 1.26500, takeProfit1: 1.26300, takeProfit2: 1.26100, stopLoss: 1.26700, analysis: 'Bearish order block at resistance', status: 'HIT_TP1', createdAt: new Date(Date.now() - 86400000).toISOString(), result: 'WIN', pips: 45.5 },
  { id: '3', pair: 'XAU/USD', type: 'BUY', entryPrice: 2325.50, takeProfit1: 2340.00, takeProfit2: 2355.00, stopLoss: 2315.00, analysis: 'Gold support at liquidity zone', status: 'HIT_TP2', createdAt: new Date(Date.now() - 172800000).toISOString(), result: 'WIN', pips: 95.0 },
  { id: '4', pair: 'USD/JPY', type: 'SELL', entryPrice: 154.500, takeProfit1: 154.200, takeProfit2: 153.900, stopLoss: 154.800, analysis: 'BOJ intervention risk', status: 'HIT_SL', createdAt: new Date(Date.now() - 259200000).toISOString(), result: 'LOSS', pips: -30.0 },
  { id: '5', pair: 'GBP/JPY', type: 'BUY', entryPrice: 195.500, takeProfit1: 195.800, takeProfit2: 196.200, stopLoss: 195.100, analysis: 'Bullish momentum', status: 'ACTIVE', createdAt: new Date(Date.now() - 43200000).toISOString(), result: 'PENDING', pips: null },
  { id: '6', pair: 'AUD/USD', type: 'BUY', entryPrice: 0.65200, takeProfit1: 0.65450, takeProfit2: 0.65700, stopLoss: 0.64950, analysis: 'Bullish FVG', status: 'ACTIVE', createdAt: new Date(Date.now() - 21600000).toISOString(), result: 'PENDING', pips: null },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const startIndex = (page - 1) * limit;
  return NextResponse.json({ signals: mockSignals.slice(startIndex, startIndex + limit), pagination: { page, limit, total: mockSignals.length, totalPages: Math.ceil(mockSignals.length / limit) } });
}
