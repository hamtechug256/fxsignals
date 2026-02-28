'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Crown,
  Clock,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

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
  FREE: { name: 'Free', color: 'bg-gray-500' },
  PREMIUM: { name: 'Premium', color: 'bg-emerald-500' },
  VIP: { name: 'VIP', color: 'bg-yellow-500' },
};

export function UserDashboard() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
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

  // Not logged in - don't show dashboard
  if (status === 'loading' || isLoading) {
    return null;
  }

  if (!session) {
    return null;
  }

  const currentPlan = (session.user as any)?.plan || 'FREE';
  const isAdmin = (session.user as any)?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-white text-xl">
                Welcome, {session.user?.name || 'Trader'}!
              </CardTitle>
              <CardDescription className="text-gray-400">
                {session.user?.email}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${planDetails[currentPlan as keyof typeof planDetails]?.color || 'bg-gray-500'} text-white`}>
                {planDetails[currentPlan as keyof typeof planDetails]?.name || 'Free'} Plan
              </Badge>
              {isAdmin && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between flex-wrap gap-4">
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

      {/* Quick Links */}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
          <a href="#signals">View All Signals</a>
        </Button>
        <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
          <a href="#calculator">Risk Calculator</a>
        </Button>
        <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
          <a href="#analytics">Analytics</a>
        </Button>
        {currentPlan === 'FREE' && (
          <Button 
            onClick={() => setShowUpgrade(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-black"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Upgrade Your Plan</DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              Get more signals and features
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <p className="text-center text-gray-400 text-sm">
              Premium plans include unlimited signals, push notifications, and more!
            </p>
            <Button
              onClick={() => {
                toast({ title: 'Demo Mode', description: 'Payment integration coming soon!' });
                setShowUpgrade(false);
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-black"
            >
              <Crown className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
