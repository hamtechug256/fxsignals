import webpush from 'web-push';
import { db } from './db';

// Configure web-push with VAPID keys
if (process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

/**
 * Send push notification to a single subscriber
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify(payload)
    );
    return true;
  } catch (error) {
    console.error('Push notification error:', error);
    return false;
  }
}

/**
 * Send push notification to all active subscribers
 */
export async function broadcastNotification(
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  const subscribers = await db.pushSubscriber.findMany({
    where: { active: true },
  });

  let sent = 0;
  let failed = 0;

  const promises = subscribers.map(async (sub) => {
    const success = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      },
      payload
    );

    if (success) {
      sent++;
    } else {
      failed++;
      // Deactivate invalid subscriptions
      await db.pushSubscriber.update({
        where: { id: sub.id },
        data: { active: false },
      });
    }
  });

  await Promise.allSettled(promises);

  return { sent, failed };
}

/**
 * Subscribe a user to push notifications
 */
export async function subscribeToPush(
  subscription: PushSubscription,
  userId?: string,
  deviceInfo?: string
): Promise<{ success: boolean; id?: string }> {
  try {
    // Check if subscription already exists
    const existing = await db.pushSubscriber.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      // Update existing subscription
      const updated = await db.pushSubscriber.update({
        where: { endpoint: subscription.endpoint },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          deviceInfo,
          active: true,
        },
      });

      return { success: true, id: updated.id };
    }

    // Create new subscription
    const newSub = await db.pushSubscriber.create({
      data: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        deviceInfo,
        active: true,
      },
    });

    return { success: true, id: newSub.id };
  } catch (error) {
    console.error('Push subscription error:', error);
    return { success: false };
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(
  endpoint: string
): Promise<boolean> {
  try {
    await db.pushSubscriber.update({
      where: { endpoint },
      data: { active: false },
    });
    return true;
  } catch (error) {
    console.error('Push unsubscription error:', error);
    return false;
  }
}

/**
 * Get push subscriber count
 */
export async function getPushSubscriberCount(): Promise<number> {
  return db.pushSubscriber.count({
    where: { active: true },
  });
}

/**
 * Generate VAPID keys (run once to get keys for .env)
 */
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  return webpush.generateVAPIDKeys();
}
