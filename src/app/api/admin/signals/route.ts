import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const signals = await prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(signals);
  } catch (error) {
    console.error('Fetch signals error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pair, type, entryPrice, takeProfit1, takeProfit2, stopLoss, analysis } = body;

    if (!pair || !type || !entryPrice || !takeProfit1 || !stopLoss) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const signal = await prisma.signal.create({
      data: {
        pair,
        type: type.toUpperCase(),
        entryPrice: parseFloat(entryPrice),
        takeProfit1: parseFloat(takeProfit1),
        takeProfit2: takeProfit2 ? parseFloat(takeProfit2) : null,
        stopLoss: parseFloat(stopLoss),
        analysis: analysis || null,
        status: 'ACTIVE',
        result: 'PENDING',
      },
    });

    // Update performance stats
    await updatePerformance();

    return NextResponse.json(signal, { status: 201 });
  } catch (error) {
    console.error('Create signal error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updatePerformance() {
  const signals = await prisma.signal.findMany({
    where: { result: { not: null } },
  });

  const winCount = signals.filter(s => s.result === 'WIN').length;
  const lossCount = signals.filter(s => s.result === 'LOSS').length;
  const pendingCount = signals.filter(s => s.result === 'PENDING').length;
  const totalPips = signals.reduce((acc, s) => acc + (s.pips || 0), 0);
  const avgPips = signals.length > 0 ? totalPips / signals.length : 0;
  const winRate = signals.length > 0 ? (winCount / signals.length) * 100 : 0;

  const existing = await prisma.signalPerformance.findFirst();

  if (existing) {
    await prisma.signalPerformance.update({
      where: { id: existing.id },
      data: {
        totalSignals: signals.length,
        winCount,
        lossCount,
        pendingCount,
        winRate,
        avgPips,
      },
    });
  } else {
    await prisma.signalPerformance.create({
      data: {
        totalSignals: signals.length,
        winCount,
        lossCount,
        pendingCount,
        winRate,
        avgPips,
      },
    });
  }
}
