import { NextRequest, NextResponse } from 'next/server';

// Mock forex prices with realistic values
const mockPrices: Record<string, { bid: number; ask: number; change: number; changePercent: number }> = {
  'EUR/USD': { bid: 1.0856, ask: 1.0858, change: 0.0023, changePercent: 0.21 },
  'GBP/USD': { bid: 1.2634, ask: 1.2636, change: -0.0015, changePercent: -0.12 },
  'USD/JPY': { bid: 149.85, ask: 149.87, change: 0.45, changePercent: 0.30 },
  'AUD/USD': { bid: 0.6542, ask: 0.6544, change: 0.0018, changePercent: 0.28 },
  'USD/CAD': { bid: 1.3621, ask: 1.3623, change: -0.0025, changePercent: -0.18 },
  'USD/CHF': { bid: 0.8745, ask: 0.8747, change: 0.0012, changePercent: 0.14 },
  'NZD/USD': { bid: 0.5987, ask: 0.5989, change: -0.0008, changePercent: -0.13 },
  'EUR/GBP': { bid: 0.8589, ask: 0.8591, change: 0.0025, changePercent: 0.29 },
  'EUR/JPY': { bid: 162.58, ask: 162.60, change: 0.78, changePercent: 0.48 },
  'GBP/JPY': { bid: 189.25, ask: 189.27, change: -0.32, changePercent: -0.17 },
};

// GET - Return price for given pair
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pair = searchParams.get('pair');

    if (!pair) {
      // Return all prices if no pair specified
      return NextResponse.json({
        prices: mockPrices,
        timestamp: new Date().toISOString(),
      });
    }

    const normalizedPair = pair.toUpperCase();
    
    if (!mockPrices[normalizedPair]) {
      return NextResponse.json(
        { error: `Pair ${normalizedPair} not found` },
        { status: 404 }
      );
    }

    // Add slight random variation to simulate live prices
    const basePrice = mockPrices[normalizedPair];
    const variation = (Math.random() - 0.5) * 0.0002;
    
    const price = {
      pair: normalizedPair,
      bid: Number((basePrice.bid + variation).toFixed(normalizedPair.includes('JPY') ? 2 : 4)),
      ask: Number((basePrice.ask + variation).toFixed(normalizedPair.includes('JPY') ? 2 : 4)),
      spread: Number(((basePrice.ask - basePrice.bid) * 10000).toFixed(1)),
      change: basePrice.change,
      changePercent: basePrice.changePercent,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(price);
  } catch (error) {
    console.error('Error fetching forex price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forex price' },
      { status: 500 }
    );
  }
}
