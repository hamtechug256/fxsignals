import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, result, pips } = body;

    const updateData: any = {};

    if (status) updateData.status = status;
    if (result) updateData.result = result;
    if (pips !== undefined) updateData.pips = parseFloat(pips);

    const signal = await prisma.signal.update({
      where: { id },
      data: updateData,
    });

    // Update performance stats
    await updatePerformance();

    return NextResponse.json(signal);
  } catch (error) {
    console.error('Update signal error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.signal.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Signal deleted' });
  } catch (error) {
    console.error('Delete signal error:', error);
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
