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
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

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
      new Notification('FXSignals Activated!', {
        body: 'You will now receive instant trading signal alerts.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'welcome'
      });
    }
  }, []);

  if (isInstalled && notificationPermission === 'granted') {
    return null;
  }

  return (
    <>
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
                <button onClick={() => setShowPrompt(false)} className="text-emerald-300 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleInstall} className="flex-1 bg-emerald-500 text-black hover:bg-emerald-400">
                  <Check className="h-4 w-4 mr-1" />
                  Install
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowPrompt(false)} className="border-emerald-500/30 text-emerald-300">
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isInstalled && notificationPermission !== 'granted' && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button onClick={requestNotificationPermission} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-lg">
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
