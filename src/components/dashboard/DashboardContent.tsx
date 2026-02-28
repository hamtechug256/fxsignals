'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, Target, Zap, Activity, ArrowUpRight,
  ArrowDownRight, Clock, DollarSign, Percent, BarChart3, Signal,
  AlertTriangle, CheckCircle, RefreshCw, ChevronRight, Play, Pause
} from 'lucide-react';
import Link from 'next/link';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime.current) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      countRef.current = Math.floor(easeOut * end);
      setCount(countRef.current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, [end, duration]);

  return count;
}

// Live pulse animation component
function LivePulse() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
    </span>
  );
}

// Market sentiment gauge
function SentimentGauge({ value }: { value: number }) {
  const rotation = (value / 100) * 180 - 90;
  
  return (
    <div className="relative w-32 h-16 overflow-hidden">
      <div className="absolute inset-0 rounded-t-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 opacity-20" />
      <div className="absolute inset-1 rounded-t-full bg-[#0d0d12]" />
      <div 
        className="absolute bottom-0 left-1/2 w-0.5 h-14 bg-emerald-400 origin-bottom transition-transform duration-1000"
        style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
    </div>
  );
}

// Stats card with glass effect
function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend,
  prefix = '',
  suffix = ''
}: { 
  title: string; 
  value: string | number; 
  change?: string;
  icon: any;
  trend?: 'up' | 'down';
  prefix?: string;
  suffix?: string;
}) {
  return (
    <Card className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-white/5 hover:border-emerald-500/20 transition-all duration-300 group">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              {prefix && <span className="text-gray-400 text-lg">{prefix}</span>}
              <span className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">{value}</span>
              {suffix && <span className="text-gray-400 text-sm">{suffix}</span>}
            </div>
            {change && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : trend === 'down' ? <ArrowDownRight className="h-4 w-4" /> : null}
                {change}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${trend === 'up' ? 'bg-emerald-500/10' : trend === 'down' ? 'bg-red-500/10' : 'bg-white/5'} group-hover:scale-110 transition-transform`}>
            <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Signal card for dashboard
function SignalPreviewCard({ signal }: { signal: any }) {
  const isBuy = signal.type === 'BUY';
  
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isBuy ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          {isBuy ? <TrendingUp className="h-5 w-5 text-emerald-400" /> : <TrendingDown className="h-5 w-5 text-red-400" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{signal.pair}</span>
            <Badge variant="outline" className={`${isBuy ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'} text-xs`}>
              {signal.type}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-400">Entry: <span className="text-white font-mono">{signal.entryPrice}</span></span>
            <span className="text-sm text-gray-400">SL: <span className="text-red-400 font-mono">{signal.stopLoss}</span></span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="flex items-center gap-1 text-emerald-400">
            <Target className="h-4 w-4" />
            <span className="font-mono">{signal.takeProfit1}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
              </div>
              <span className="text-xs text-gray-400">{signal.confidence}%</span>
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-emerald-400 transition-colors" />
      </div>
    </div>
  );
}

// Activity feed item
function ActivityItem({ type, message, time }: { type: 'signal' | 'win' | 'loss' | 'info'; message: string; time: string }) {
  const colors = {
    signal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    win: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    loss: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  
  const icons = {
    signal: Signal,
    win: CheckCircle,
    loss: AlertTriangle,
    info: Activity,
  };
  
  const Icon = icons[type];
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
      <div className={`p-2 rounded-lg ${colors[type]} border`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300">{message}</p>
        <p className="text-xs text-gray-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

export function DashboardContent() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const winRate = useAnimatedCounter(67);
  
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await fetch('/api/signals?limit=5');
        if (response.ok) {
          const data = await response.json();
          setSignals(data.signals || []);
        }
      } catch (error) {
        console.error('Failed to fetch signals');
      } finally {
        setLoading(false);
      }
    };
    fetchSignals();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Good morning, Trader
            <span className="text-lg">👋</span>
          </h1>
          <p className="text-gray-400 mt-1">Here's what's happening in the markets today</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/signals">
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black">
              <Signal className="h-4 w-4 mr-2" />
              View All Signals
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Win Rate"
          value={`${winRate}%`}
          change="+2.3% this month"
          icon={Target}
          trend="up"
        />
        <StatsCard
          title="Total Signals"
          value="156"
          change="12 this week"
          icon={Signal}
        />
        <StatsCard
          title="Total Pips"
          value="2,847"
          change="+156 this week"
          icon={Zap}
          trend="up"
        />
        <StatsCard
          title="Active Signals"
          value="6"
          icon={Activity}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Signals */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LivePulse />
                Active Signals
              </CardTitle>
              <Link href="/signals">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
                ))
              ) : signals.length > 0 ? (
                signals.filter(s => s.status === 'ACTIVE').slice(0, 4).map((signal) => (
                  <SignalPreviewCard key={signal.id} signal={signal} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Signal className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No active signals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Sentiment */}
          <Card className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                Market Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <SentimentGauge value={72} />
                <div className="mt-4 text-center">
                  <span className="text-2xl font-bold text-emerald-400">Bullish</span>
                  <p className="text-sm text-gray-400 mt-1">72% Buy Pressure</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                  <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                    <span className="text-lg font-bold text-emerald-400">68%</span>
                    <p className="text-xs text-gray-400">Longs</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-500/10">
                    <span className="text-lg font-bold text-red-400">32%</span>
                    <p className="text-xs text-gray-400">Shorts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 -mx-2">
              <ActivityItem type="win" message="EUR/USD hit TP1 (+45 pips)" time="2 min ago" />
              <ActivityItem type="signal" message="New GBP/USD signal posted" time="15 min ago" />
              <ActivityItem type="loss" message="USD/JPY stopped out (-30 pips)" time="1 hour ago" />
              <ActivityItem type="info" message="Market session: London Open" time="2 hours ago" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/signals" className="group">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                <Signal className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-white">View Signals</p>
                <p className="text-sm text-gray-400">6 active signals</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/analytics" className="group">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-all">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Analytics</p>
                <p className="text-sm text-gray-400">Performance stats</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/journal" className="group">
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <Activity className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Journal</p>
                <p className="text-sm text-gray-400">Track your trades</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pricing" className="group">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                <Zap className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Upgrade</p>
                <p className="text-sm text-gray-400">Get premium</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
