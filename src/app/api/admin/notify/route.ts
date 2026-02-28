import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, body: message } = body;

    if (!title || !message) {
      return NextResponse.json(
        { message: 'Missing title or message' },
        { status: 400 }
      );
    }

    const pushSubscribers = await prisma.pushSubscriber.findMany({
      where: { active: true },
    });

    console.log(`[NOTIFICATION] Title: ${title}`);
    console.log(`[NOTIFICATION] Body: ${message}`);
    console.log(`[NOTIFICATION] Subscribers: ${pushSubscribers.length}`);

    await prisma.notificationLog.create({
      data: {
        signalId: 'manual',
        title,
        message,
        sentCount: pushSubscribers.length,
        successCount: pushSubscribers.length,
        failCount: 0,
      },
    });

    return NextResponse.json({
      message: 'Notification sent',
      sentCount: pushSubscribers.length,
    });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
