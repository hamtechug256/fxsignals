import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get recent signals based on plan
    const signalLimit = user.plan === 'FREE' ? 3 : user.plan === 'PREMIUM' ? 20 : 100;

    const signals = await prisma.signal.findMany({
      take: signalLimit,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const allSignals = await prisma.signal.findMany({
      where: { result: { not: null } },
    });

    const winCount = allSignals.filter(s => s.result === 'WIN').length;
    const totalWithResult = allSignals.length;
    const winRate = totalWithResult > 0 ? (winCount / totalWithResult) * 100 : 0;

    const totalPips = allSignals.reduce((acc, s) => acc + (s.pips || 0), 0);
    const avgPips = totalWithResult > 0 ? totalPips / totalWithResult : 0;

    const performance = await prisma.signalPerformance.findFirst();

    return NextResponse.json({
      signals: signals.map(s => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      stats: {
        totalSignals: performance?.totalSignals || signals.length,
        winRate: performance?.winRate || winRate,
        avgPips: performance?.avgPips || avgPips,
      },
      user: {
        plan: user.plan,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
