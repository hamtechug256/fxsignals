'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  TrendingUp,
  Target,
  Zap,
  Bell,
  Crown,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  stats: {
    totalSignals: number;
    winRate: number;
    avgPips: number;
  };
}

const planDetails = {
  FREE: { name: 'Free', color: 'bg-gray-500' },
  PREMIUM: { name: 'Premium', color: 'bg-emerald-500' },
  VIP: { name: 'VIP', color: 'bg-yellow-500' },
};

export function UserDashboard() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const hasFetched = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (session && !hasFetched.current) {
      hasFetched.current = true;
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
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const toggleNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast({ title: 'Not Supported', description: 'Push notifications not supported.', variant: 'destructive' });
      return;
    }

    if (Notification.permission === 'granted') {
      toast({ title: 'Notifications Already Enabled' });
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    
    if (permission === 'granted') {
      toast({ title: 'Notifications Enabled!', description: 'You will receive trading signal alerts.' });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentPlan = (session.user as any)?.plan || 'FREE';

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Welcome back, {session.user?.name || 'Trader'}!
                </h2>
                <p className="text-gray-400 text-sm">{session.user?.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${planDetails[currentPlan as keyof typeof planDetails]?.color || 'bg-gray-500'} text-white`}>
                  {planDetails[currentPlan as keyof typeof planDetails]?.name || 'Free'} Plan
                </Badge>
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-400" />
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={toggleNotifications}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Target className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Signals</p>
                  <p className="text-2xl font-bold text-white">{userData?.stats.totalSignals || 0}</p>
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
                  <p className="text-2xl font-bold text-white">{userData?.stats.winRate.toFixed(1) || 0}%</p>
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
                  <p className="text-2xl font-bold text-white">{userData?.stats.avgPips.toFixed(1) || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
            <a href="#signals">
              View Live Signals <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <a href="#calculator">Risk Calculator</a>
          </Button>
          <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <a href="#analytics">Analytics</a>
          </Button>
          {currentPlan === 'FREE' && (
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-black">
              <a href="#pricing">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Plan
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
