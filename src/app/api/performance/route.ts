import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Return performance stats
export async function GET() {
  try {
    // Get or create performance record
    let performance = await db.signalPerformance.findFirst();

    if (!performance) {
      // Calculate from signals if no performance record exists
      const signals = await db.signal.findMany();
      const activeSignals = signals.filter(s => s.status === 'ACTIVE');
      const closedSignals = signals.filter(s => s.status !== 'ACTIVE');
      
      const winCount = closedSignals.filter(s => s.result === 'WIN').length;
      const lossCount = closedSignals.filter(s => s.result === 'LOSS').length;
      const totalClosed = closedSignals.length;
      const winRate = totalClosed > 0 ? (winCount / totalClosed) * 100 : 0;
      const avgPips = closedSignals.length > 0 
        ? closedSignals.reduce((acc, s) => acc + (s.pips || 0), 0) / closedSignals.length 
        : 0;

      performance = await db.signalPerformance.create({
        data: {
          totalSignals: signals.length,
          winCount,
          lossCount,
          pendingCount: activeSignals.length,
          winRate,
          avgPips,
        },
      });
    }

    // Get recent signals for additional context
    const recentSignals = await db.signal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get signals by pair
    const allSignals = await db.signal.findMany();
    const pairsStats = allSignals.reduce((acc, signal) => {
      if (!acc[signal.pair]) {
        acc[signal.pair] = { total: 0, wins: 0 };
      }
      acc[signal.pair].total++;
      if (signal.result === 'WIN') {
        acc[signal.pair].wins++;
      }
      return acc;
    }, {} as Record<string, { total: number; wins: number }>);

    const pairs = Object.entries(pairsStats).map(([pair, stats]) => ({
      pair,
      total: stats.total,
      wins: stats.wins,
      winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
    }));

    return NextResponse.json({
      ...performance,
      recentSignals,
      pairs,
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance stats' },
      { status: 500 }
    );
  }
}
