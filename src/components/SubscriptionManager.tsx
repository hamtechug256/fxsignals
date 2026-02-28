'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bell, Check, Smartphone, Crown, Star, Zap, Loader2 } from 'lucide-react';
import { LoginButton } from './LoginButton';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  icon: typeof Bell;
  popular?: boolean;
  color: string;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    period: 'forever',
    features: [
      '2-3 signals per day',
      'Push notifications',
      'Basic performance stats',
      'Community access'
    ],
    icon: Zap,
    color: 'from-gray-600 to-gray-700'
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 29,
    period: 'month',
    features: [
      '5-8 signals per day',
      'Instant push alerts',
      'Full signal history',
      'No advertisements',
      'Priority support',
      'ICT analysis details'
    ],
    icon: Star,
    popular: true,
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'VIP',
    name: 'VIP',
    price: 79,
    period: 'month',
    features: [
      'All Premium features',
      'Early signals (5 min before)',
      'Personal mentorship',
      'Weekly market outlook',
      'Risk management tips',
      'Direct WhatsApp contact',
      'Custom analysis requests'
    ],
    icon: Crown,
    color: 'from-amber-500 to-amber-600'
  }
];

export function SubscriptionManager() {
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('PREMIUM');
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    checkPushStatus();
  }, []);

  const checkPushStatus = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
  };

  const enablePushNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Push notifications are not supported in this browser');
      return false;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        // Send subscription to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.toJSON().keys?.p256dh,
              auth: subscription.toJSON().keys?.auth,
            },
          }),
        });
      } catch (error) {
        console.error('Push subscription error:', error);
      }

      setPushEnabled(true);

      new Notification('FXSignals Activated! 🎉', {
        body: 'You will now receive instant trading signal alerts.',
        icon: '/icons/icon-192x192.png',
        tag: 'welcome'
      });

      return true;
    }

    return false;
  };

  const handleSubscribe = async () => {
    if (!session) {
      alert('Please sign in first');
      return;
    }

    setIsLoading(true);

    try {
      // Mock payment processing
      // In production, integrate with Stripe or other payment provider
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update user plan
      const response = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (response.ok) {
        // Enable push notifications
        await enablePushNotifications();

        // Update session
        await update();

        setShowPayment(false);
        alert(`Successfully subscribed to ${selectedPlan} plan!`);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Test Signal 📊', {
        body: 'EUR/USD BUY @ 1.0850\nTP: 1.0870 | SL: 1.0830',
        icon: '/icons/icon-192x192.png',
        tag: 'test',
        requireInteraction: true
      });
    }
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </CardContent>
      </Card>
    );
  }

  // Show current plan if logged in
  if (session?.user) {
    const currentPlan = plans.find(p => p.id === session.user?.plan) || plans[0];
    const PlanIcon = currentPlan.icon;

    return (
      <div className="space-y-8">
        {/* Current Plan Card */}
        <Card className="bg-white/5 border-emerald-500/30">
          <CardHeader className="text-center">
            <div className={`mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-r ${currentPlan.color} flex items-center justify-center`}>
              <PlanIcon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-white">
              Current Plan: {currentPlan.name}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {pushEnabled ? 'Push notifications enabled' : 'Enable push for instant alerts'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!pushEnabled && (
              <Button
                onClick={enablePushNotifications}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-black"
              >
                <Bell className="mr-2 h-4 w-4" />
                Enable Push Notifications
              </Button>
            )}

            {pushEnabled && (
              <Button
                onClick={handleTestNotification}
                variant="outline"
                className="w-full border-emerald-500/30 text-emerald-400"
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Test Notification
              </Button>
            )}

            {session.user?.plan === 'FREE' && (
              <Button
                onClick={() => setShowPayment(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black"
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Dialog */}
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="sm:max-w-md bg-gray-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Upgrade Your Plan</DialogTitle>
              <DialogDescription className="text-gray-400">
                Choose a plan to unlock premium features
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {plans.filter(p => p.id !== 'FREE').map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <plan.icon className={`h-6 w-6 ${plan.id === 'VIP' ? 'text-amber-400' : 'text-emerald-400'}`} />
                      <div>
                        <p className="text-white font-medium">{plan.name}</p>
                        <p className="text-gray-400 text-sm">${plan.price}/{plan.period}</p>
                      </div>
                    </div>
                    {selectedPlan === plan.id && (
                      <Check className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>
                </div>
              ))}

              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:from-emerald-400 hover:to-emerald-500"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Processing...' : 'Subscribe Now'}
              </Button>

              <p className="text-xs text-center text-gray-500">
                This is a demo. In production, integrate with Stripe.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pricing Cards (shown for upgrade options) */}
        {session.user?.plan === 'FREE' && (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 ${
                  plan.id === 'PREMIUM'
                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'border-white/10 hover:border-white/20'
                } ${plan.popular ? 'md:-mt-4' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  return (
    <div className="space-y-8">
      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative transition-all duration-300 ${
              plan.id === 'PREMIUM'
                ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'border-white/10 hover:border-white/20'
            } ${plan.popular ? 'md:-mt-4' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black">
                Most Popular
              </Badge>
            )}

            <CardHeader className="text-center">
              <div className={`mx-auto mb-4 w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                <plan.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white">
                  ${plan.price}
                </span>
                <span className="text-gray-400">/{plan.period}</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Login Prompt */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            Sign In to Subscribe
          </CardTitle>
          <CardDescription>
            Create an account or sign in to access premium trading signals
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <LoginButton />
        </CardContent>
      </Card>
    </div>
  );
}
