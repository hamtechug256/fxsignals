import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;

    if (!['PREMIUM', 'VIP'].includes(plan)) {
      return NextResponse.json({ message: 'Invalid plan' }, { status: 400 });
    }

    // Update user plan
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        plan,
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    return NextResponse.json({
      message: 'Plan upgraded successfully',
      user: {
        plan: user.plan,
        subscriptionEnd: user.subscriptionEnd,
      },
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
