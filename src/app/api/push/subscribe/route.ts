import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { subscribeToPush, unsubscribeFromPush, getPushSubscriberCount } from '@/lib/push';

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { endpoint, keys, deviceInfo } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Missing required subscription data' },
        { status: 400 }
      );
    }

    const result = await subscribeToPush(
      {
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      },
      session?.user?.id,
      deviceInfo
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed to push notifications',
        id: result.id,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    const success = await unsubscribeFromPush(endpoint);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Unsubscribed from push notifications',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Push unsubscription error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

// GET - Get subscription count
export async function GET() {
  try {
    const count = await getPushSubscriberCount();

    return NextResponse.json({
      success: true,
      subscriberCount: count,
    });
  } catch (error) {
    console.error('Get subscriber count error:', error);
    return NextResponse.json(
      { error: 'Failed to get count' },
      { status: 500 }
    );
  }
}
