import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const signals = await prisma.signal.findMany({
      where: { status: 'ACTIVE' },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ signals });
  } catch (error) {
    console.error('Fetch latest signals error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
