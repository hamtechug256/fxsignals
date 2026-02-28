import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { message: 'Missing subscription data' },
        { status: 400 }
      );
    }

    const existing = await prisma.pushSubscriber.findUnique({
      where: { endpoint },
    });

    if (existing) {
      await prisma.pushSubscriber.update({
        where: { endpoint },
        data: { active: true },
      });
      return NextResponse.json({ message: 'Subscription updated' });
    }

    await prisma.pushSubscriber.create({
      data: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { message: 'Missing endpoint' },
        { status: 400 }
      );
    }

    await prisma.pushSubscriber.update({
      where: { endpoint },
      data: { active: false },
    });

    return NextResponse.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
