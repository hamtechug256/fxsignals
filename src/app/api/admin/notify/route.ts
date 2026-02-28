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

    // Get all push subscribers
    const pushSubscribers = await prisma.pushSubscriber.findMany({
      where: { active: true },
    });

    let successCount = 0;
    let failCount = 0;

    // In production, you would use web-push library to send actual notifications
    // For now, we'll simulate it and log the notification
    console.log(`[NOTIFICATION] Title: ${title}`);
    console.log(`[NOTIFICATION] Body: ${message}`);
    console.log(`[NOTIFICATION] Subscribers: ${pushSubscribers.length}`);

    // Log the notification
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

    // If running on server with VAPID keys configured, send actual push notifications
    if (process.env.VAPID_PRIVATE_KEY && pushSubscribers.length > 0) {
      try {
        // Dynamic import to avoid build errors if web-push is not installed
        const webpush = await import('web-push');

        webpush.default.setVapidDetails(
          'mailto:support@fxsignals.com',
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          process.env.VAPID_PRIVATE_KEY
        );

        const notificationPayload = JSON.stringify({
          title,
          body: message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'signal',
          data: { url: '/' },
        });

        // Send to all subscribers
        const pushPromises = pushSubscribers.map(async (sub) => {
          try {
            await webpush.default.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              notificationPayload
            );
            successCount++;
          } catch (error) {
            console.error(`Push failed for ${sub.endpoint}:`, error);
            failCount++;

            // Deactivate invalid subscriptions
            if (error instanceof Error && error.message.includes('410')) {
              await prisma.pushSubscriber.update({
                where: { id: sub.id },
                data: { active: false },
              });
            }
          }
        });

        await Promise.allSettled(pushPromises);
      } catch (webPushError) {
        console.log('Web push not available, notification logged only');
      }
    }

    return NextResponse.json({
      message: 'Notification sent',
      sentCount: pushSubscribers.length,
      successCount,
      failCount,
    });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
