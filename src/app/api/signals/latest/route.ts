import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Return 5 most recent ACTIVE signals
export async function GET() {
  try {
    const signals = await db.signal.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json(signals);
  } catch (error) {
    console.error('Error fetching latest signals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest signals' },
      { status: 500 }
    );
  }
}
