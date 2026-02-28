'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  Crown,
  Clock,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Signal {
  id: string;
  pair: string;
  type: string;
  entryPrice: number;
  takeProfit1: number;
  takeProfit2: number | null;
  stopLoss: number;
  status: string;
  result: string | null;
  pips: number | null;
  createdAt: string;
}

interface UserData {
  signals: Signal[];
  stats: {
    totalSignals: number;
    winRate: number;
    avgPips: number;
  };
}

const planDetails = {
  FREE: {
    name: 'Free',
    price: 0,
    features: ['3 signals per day', 'Basic email alerts', 'Limited history'],
    color: 'bg-gray-500',
  },
  PREMIUM: {
    name: 'Premium',
    price: 29,
    features: ['Unlimited signals', 'Push notifications', 'Full history', 'Priority support'],
    color: 'bg-emerald-500',
  },
  VIP: {
    name: 'VIP',
    price: 99,
    features: ['Everything in Premium', 'Early signals', 'Direct WhatsApp support', 'Weekly analysis calls'],
    color: 'bg-yellow-500',
  },
};

export function UserDashboard() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'PREMIUM' | 'VIP'>('PREMIUM');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      fetchUserData();
      checkNotificationPermission();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/dashboard');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in this browser.',
        variant: 'destructive',
      });
      return;
    }

    if (Notification.permission === 'granted') {
      toast({
        title: 'Notifications Enabled',
        description: 'You will receive trading signal alerts.',
      });
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');

    if (permission === 'granted') {
      // Subscribe to push notifications
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        // Save subscription to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });

        toast({
          title: 'Notifications Enabled!',
          description: 'You will receive instant trading signal alerts.',
        });
      } catch (error) {
        console.error('Push subscription error:', error);
      }
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);

    try {
      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (response.ok) {
        toast({
          title: 'Plan Upgraded!',
          description: `You are now on the ${planDetails[selectedPlan].name} plan.`,
        });
        setShowUpgrade(false);
        // Refresh session would happen here in production
        window.location.reload();
      } else {
        throw new Error('Upgrade failed');
      }
    } catch (error) {
      toast({
        title: 'Upgrade Failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentPlan = (session.user as any)?.plan || 'FREE';

  return (
    <div className="space-y-6" id="dashboard">
      {/* User Info Card */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Welcome, {session.user?.name || 'Trader'}!</CardTitle>
              <CardDescription className="text-gray-400">
                {session.user?.email}
              </CardDescription>
            </div>
            <Badge className={`${planDetails[currentPlan as keyof typeof planDetails]?.color || 'bg-gray-500'} text-white`}>
              {planDetails[currentPlan as keyof typeof planDetails]?.name || 'Free'} Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-400" />
              <Label htmlFor="notifications" className="text-sm text-gray-400">
                Push Notifications
              </Label>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Target className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Signals</p>
                <p className="text-2xl font-bold text-white">
                  {userData?.stats.totalSignals || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-white">
                  {userData?.stats.winRate.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Zap className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg Pips</p>
                <p className="text-2xl font-bold text-white">
                  {userData?.stats.avgPips.toFixed(1) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signal History */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Signal History
              </CardTitle>
              <CardDescription>Your recent trading signals</CardDescription>
            </div>
            {currentPlan === 'FREE' && (
              <Button
                onClick={() => setShowUpgrade(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-black"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade for Full History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {userData?.signals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No signals yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userData?.signals.map((signal) => (
                <div
                  key={signal.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      signal.type === 'BUY' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                    }`}>
                      {signal.type === 'BUY' ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{signal.pair}</p>
                      <p className="text-xs text-gray-400">
                        Entry: {signal.entryPrice.toFixed(5)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {signal.result === 'WIN' && (
                      <div className="flex items-center gap-1 text-emerald-500">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-semibold">+{signal.pips?.toFixed(1)} pips</span>
                      </div>
                    )}
                    {signal.result === 'LOSS' && (
                      <div className="flex items-center gap-1 text-red-500">
                        <XCircle className="h-4 w-4" />
                        <span className="font-semibold">{signal.pips?.toFixed(1)} pips</span>
                      </div>
                    )}
                    {signal.result === 'PENDING' && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Upgrade Your Plan</DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              Get more signals and features
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            {(['PREMIUM', 'VIP'] as const).map((plan) => (
              <Card
                key={plan}
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {planDetails[plan].name}
                      </h3>
                      <p className="text-2xl font-bold text-emerald-500">
                        ${planDetails[plan].price}
                        <span className="text-sm text-gray-400">/month</span>
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedPlan === plan
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-600'
                    }`}>
                      {selectedPlan === plan && (
                        <CheckCircle className="h-4 w-4 text-black" />
                      )}
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {planDetails[plan].features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black"
          >
            {isUpgrading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to {planDetails[selectedPlan].name}
              </>
            )}
          </Button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Demo mode - No actual payment required
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
