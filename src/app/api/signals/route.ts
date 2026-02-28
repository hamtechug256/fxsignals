import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all signals with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [signals, total] = await Promise.all([
      db.signal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.signal.count({ where }),
    ]);

    return NextResponse.json({
      signals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching signals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signals' },
      { status: 500 }
    );
  }
}

// POST - Create new signal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pair, type, entryPrice, takeProfit1, takeProfit2, stopLoss, analysis } = body;

    // Validation
    if (!pair || !type || !entryPrice || !takeProfit1 || !stopLoss) {
      return NextResponse.json(
        { error: 'Missing required fields: pair, type, entryPrice, takeProfit1, stopLoss' },
        { status: 400 }
      );
    }

    if (type !== 'BUY' && type !== 'SELL') {
      return NextResponse.json(
        { error: 'Type must be either BUY or SELL' },
        { status: 400 }
      );
    }

    const signal = await db.signal.create({
      data: {
        pair,
        type,
        entryPrice: parseFloat(entryPrice),
        takeProfit1: parseFloat(takeProfit1),
        takeProfit2: takeProfit2 ? parseFloat(takeProfit2) : null,
        stopLoss: parseFloat(stopLoss),
        analysis,
        status: 'ACTIVE',
        result: 'PENDING',
      },
    });

    // Update performance stats
    await updatePerformanceStats();

    return NextResponse.json(signal, { status: 201 });
  } catch (error) {
    console.error('Error creating signal:', error);
    return NextResponse.json(
      { error: 'Failed to create signal' },
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

    // Upsert performance record
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
