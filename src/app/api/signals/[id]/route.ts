import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get signal by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const signal = await db.signal.findUnique({
      where: { id },
    });

    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    return NextResponse.json(signal);
  } catch (error) {
    console.error('Error fetching signal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signal' },
      { status: 500 }
    );
  }
}

// PUT - Update signal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { pair, type, entryPrice, takeProfit1, takeProfit2, stopLoss, analysis, status, result, pips } = body;

    // Check if signal exists
    const existing = await db.signal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (pair) updateData.pair = pair;
    if (type) {
      if (type !== 'BUY' && type !== 'SELL') {
        return NextResponse.json(
          { error: 'Type must be either BUY or SELL' },
          { status: 400 }
        );
      }
      updateData.type = type;
    }
    if (entryPrice !== undefined) updateData.entryPrice = parseFloat(entryPrice);
    if (takeProfit1 !== undefined) updateData.takeProfit1 = parseFloat(takeProfit1);
    if (takeProfit2 !== undefined) updateData.takeProfit2 = parseFloat(takeProfit2);
    if (stopLoss !== undefined) updateData.stopLoss = parseFloat(stopLoss);
    if (analysis !== undefined) updateData.analysis = analysis;
    if (status) updateData.status = status;
    if (result) updateData.result = result;
    if (pips !== undefined) updateData.pips = parseFloat(pips);

    const signal = await db.signal.update({
      where: { id },
      data: updateData,
    });

    // Update performance stats if status changed
    if (status && status !== 'ACTIVE') {
      await updatePerformanceStats();
    }

    return NextResponse.json(signal);
  } catch (error) {
    console.error('Error updating signal:', error);
    return NextResponse.json(
      { error: 'Failed to update signal' },
      { status: 500 }
    );
  }
}

// DELETE - Delete signal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if signal exists
    const existing = await db.signal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    await db.signal.delete({ where: { id } });
    
    // Update performance stats
    await updatePerformanceStats();

    return NextResponse.json({ message: 'Signal deleted successfully' });
  } catch (error) {
    console.error('Error deleting signal:', error);
    return NextResponse.json(
      { error: 'Failed to delete signal' },
      { status: 500 }
    );
  }
}

// Helper function to update performance stats
async function updatePerformanceStats() {
  try {
    const signals = await db.signal.findMany({
      where: { status: { not: 'ACTIVE' } },
    });

    const totalSignals = signals.length;
    const winCount = signals.filter(s => s.result === 'WIN').length;
    const lossCount = signals.filter(s => s.result === 'LOSS').length;
    const pendingCount = signals.filter(s => s.result === 'PENDING').length;
    const winRate = totalSignals > 0 ? (winCount / totalSignals) * 100 : 0;
    const avgPips = signals.length > 0 
      ? signals.reduce((acc, s) => acc + (s.pips || 0), 0) / signals.length 
      : 0;

    const existing = await db.signalPerformance.findFirst();
    
    if (existing) {
      await db.signalPerformance.update({
        where: { id: existing.id },
        data: {
          totalSignals,
          winCount,
          lossCount,
          pendingCount,
          winRate,
          avgPips,
        },
      });
    } else {
      await db.signalPerformance.create({
        data: {
          totalSignals,
          winCount,
          lossCount,
          pendingCount,
          winRate,
          avgPips,
        },
      });
    }
  } catch (error) {
    console.error('Error updating performance stats:', error);
  }
}
