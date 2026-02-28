import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const performance = await prisma.signalPerformance.findFirst();
    const signals = await prisma.signal.findMany({ where: { result: { not: null } } });
    const winCount = signals.filter(s => s.result === 'WIN').length;
    const lossCount = signals.filter(s => s.result === 'LOSS').length;

    return NextResponse.json({
      totalSignals: performance?.totalSignals || signals.length,
      winCount: performance?.winCount || winCount,
      lossCount: performance?.lossCount || lossCount,
      winRate: performance?.winRate || (signals.length > 0 ? (winCount / signals.length) * 100 : 0),
      avgPips: performance?.avgPips || 0,
    });
  } catch (error) {
    console.error('Fetch performance error:', error);
    return NextResponse.json({ totalSignals: 0, winCount: 0, lossCount: 0, winRate: 0, avgPips: 0 });
  }
}
