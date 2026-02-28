import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ totalSignals: 156, winCount: 105, lossCount: 51, winRate: 67.3, avgPips: 23.5 });
}
