'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    // Initialize with current state
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches;
    }
    return false;
  });
  const [showPrompt, setShowPrompt] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  useEffect(() => {
    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  }, [deferredPrompt]);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      // Show test notification
      new Notification('FXSignals Activated! 🎉', {
        body: 'You will now receive instant trading signal alerts.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'welcome'
      });
    }
  }, []);

  if (isInstalled && notificationPermission === 'granted') {
    return null; // Already set up
  }

  return (
    <>
      {/* Floating Install Banner */}
      {showPrompt && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
          <Card className="bg-gradient-to-r from-emerald-900 to-emerald-800 border-emerald-500/30 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">Install FXSignals App</h3>
                  <p className="text-xs text-emerald-200 mt-1">
                    Install for instant signal alerts on your phone!
                  </p>
                </div>
                <button 
                  onClick={() => setShowPrompt(false)}
                  className="text-emerald-300 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1 bg-emerald-500 text-black hover:bg-emerald-400"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Install
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPrompt(false)}
                  className="border-emerald-500/30 text-emerald-300"
                >
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Permission Button */}
      {isInstalled && notificationPermission !== 'granted' && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={requestNotificationPermission}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-lg"
          >
            {notificationPermission === 'denied' ? (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Notifications Blocked
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Enable Alerts
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}

// Hook for sending notifications (to be used by admin)
export function usePushNotifications() {
  const sendNotification = async (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      requireInteraction: true,
      ...options
    });

    return true;
  };

  return { sendNotification };
}
