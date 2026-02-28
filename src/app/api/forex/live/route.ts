import { NextRequest, NextResponse } from 'next/server';
import { getForexPrices, getForexPrice } from '@/lib/forex-api';

// GET - Live forex prices
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pairsParam = searchParams.get('pairs');
    const pair = searchParams.get('pair');
    
    // If single pair requested
    if (pair) {
      const price = await getForexPrice(pair);
      if (!price) {
        return NextResponse.json({ error: 'Pair not found' }, { status: 404 });
      }
      return NextResponse.json(price);
    }
    
    // Get all or specified pairs
    const pairs = pairsParam ? pairsParam.split(',') : undefined;
    const prices = await getForexPrices(pairs);
    
    return NextResponse.json({
      prices,
      timestamp: new Date().toISOString(),
      count: prices.length
    });
  } catch (error) {
    console.error('Forex price error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forex prices' },
      { status: 500 }
    );
  }
}
