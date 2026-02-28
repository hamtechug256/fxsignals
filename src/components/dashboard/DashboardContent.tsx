'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, Target, Zap, Activity, ArrowUpRight,
  ArrowDownRight, Clock, BarChart3, Signal,
  RefreshCw, ChevronRight, Sparkles, Crown, Flame, PieChart,
  LineChart, Users, Globe, Layers, MoveRight, Play, Pause
} from 'lucide-react';
import Link from 'next/link';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const startTime = useRef(Date.now());
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime.current) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOut * end));

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
      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
    </span>
  );
}

// Market sentiment gauge
function SentimentGauge({ value }: { value: number }) {
  const rotation = (value / 100) * 180 - 90;
  
  return (
    <div className="relative w-36 h-20 mx-auto">
      <div className="absolute inset-0 rounded-t-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 opacity-30" />
      <div className="absolute inset-1 rounded-t-full bg-[#0a0a0f]" />
      <div 
        className="absolute bottom-0 left-1/2 w-0.5 h-16 bg-gradient-to-t from-emerald-400 to-emerald-300 origin-bottom transition-transform duration-1000 shadow-lg shadow-emerald-400/50"
        style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 ring-4 ring-[#0a0a0f]" />
    </div>
  );
}

// Circular progress
function CircularProgress({ value, size = 80, strokeWidth = 6, color = '#10b981' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white">{value}%</span>
      </div>
    </div>
  );
}

// Premium stats card
function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend,
  gradient = 'from-emerald-500 to-teal-500',
  delay = 0
}: { 
  title: string; 
  value: string | number; 
  change?: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  gradient?: string;
  delay?: number;
}) {
  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-white/[0.02] border-white/5 hover:border-white/20 transition-all duration-500 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1.5">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">{value}</span>
            </div>
            {change && (
              <div className={`flex items-center gap-1.5 mt-2 text-sm ${
                trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : trend === 'down' ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : null}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`} style={{ filter: `drop-shadow(0 4px 12px ${trend === 'up' ? 'rgba(16, 185, 129, 0.3)' : trend === 'down' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)'})` }}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Signal card for dashboard
function SignalPreviewCard({ signal, delay = 0 }: { signal: any; delay?: number }) {
  const isBuy = signal.type === 'BUY';
  
  return (
    <div 
      className="group relative flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover gradient */}
      <div className={`absolute inset-0 ${isBuy ? 'bg-gradient-to-r from-emerald-500/5 to-transparent' : 'bg-gradient-to-r from-red-500/5 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${isBuy ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20' : 'bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20'}`}>
          {isBuy ? (
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-400" />
          )}
          <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${isBuy ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{signal.pair}</span>
            <Badge variant="outline" className={`${isBuy ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'} text-xs font-medium`}>
              {signal.type}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-sm text-gray-500">
              Entry: <span className="text-white font-mono font-medium">{signal.entryPrice}</span>
            </span>
            <span className="text-sm text-gray-500">
              SL: <span className="text-red-400 font-mono font-medium">{signal.stopLoss}</span>
            </span>
            <span className="text-sm text-gray-500">
              TP: <span className="text-emerald-400 font-mono font-medium">{signal.takeProfit1}</span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Target className="h-4 w-4" />
            <span className="font-mono font-medium">{signal.confidence}%</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-24 h-1.5 rounded-full bg-gray-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${signal.confidence}%` }}
              />
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}

// Activity feed item
function ActivityItem({ type, message, time, delay = 0 }: { type: 'signal' | 'win' | 'loss' | 'info'; message: string; time: string; delay?: number }) {
  const styles = {
    signal: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: Signal },
    win: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: TrendingUp },
    loss: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: TrendingDown },
    info: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', icon: Activity },
  };
  
  const style = styles[type];
  const Icon = style.icon;
  
  return (
    <div 
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`p-2.5 rounded-xl ${style.bg} ${style.border} border`}>
        <Icon className={`h-4 w-4 ${style.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300">{message}</p>
        <p className="text-xs text-gray-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

// Mini chart placeholder
function MiniChart({ trend = 'up' }: { trend?: 'up' | 'down' }) {
  const points = trend === 'up' 
    ? '0,30 10,25 20,20 30,22 40,15 50,10 60,12 70,8 80,5'
    : '0,5 10,8 20,12 30,10 40,15 50,20 60,18 70,22 80,25';
  
  return (
    <svg viewBox="0 0 80 35" className="w-full h-10">
      <defs>
        <linearGradient id={`gradient-${trend}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={trend === 'up' ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={trend === 'up' ? '#10b981' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${points} 80,35 0,35`}
        fill={`url(#gradient-${trend})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={trend === 'up' ? '#10b981' : '#ef4444'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            {getGreeting()}, Trader
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-gray-400 mt-1">Here's what's happening in the markets today</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 rounded-xl">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/signals">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 rounded-xl">
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
          gradient="from-emerald-500 to-teal-500"
          delay={100}
        />
        <StatsCard
          title="Total Signals"
          value="156"
          change="12 this week"
          icon={Signal}
          trend="neutral"
          gradient="from-blue-500 to-cyan-500"
          delay={200}
        />
        <StatsCard
          title="Total Pips"
          value="2,847"
          change="+156 this week"
          icon={Zap}
          trend="up"
          gradient="from-yellow-500 to-orange-500"
          delay={300}
        />
        <StatsCard
          title="Active Signals"
          value="6"
          icon={Flame}
          trend="neutral"
          gradient="from-purple-500 to-pink-500"
          delay={400}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Signals */}
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <Card className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <LivePulse />
                Active Signals
              </CardTitle>
              <Link href="/signals">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
                ))
              ) : signals.length > 0 ? (
                signals.filter(s => s.status === 'ACTIVE').slice(0, 4).map((signal, index) => (
                  <SignalPreviewCard key={signal.id} signal={signal} delay={400 + index * 100} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Signal className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No active signals</p>
                  <p className="text-sm mt-1">Check back soon for new trading opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Sentiment */}
          <Card className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-400" />
                Market Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <SentimentGauge value={72} />
                <div className="mt-4 text-center">
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Bullish</span>
                  <p className="text-sm text-gray-400 mt-1">72% Buy Pressure</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-5 w-full">
                  <div className="text-center p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10">
                    <span className="text-xl font-bold text-emerald-400">68%</span>
                    <p className="text-xs text-gray-500 mt-0.5">Longs</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/10">
                    <span className="text-xl font-bold text-red-400">32%</span>
                    <p className="text-xs text-gray-500 mt-0.5">Shorts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-4 -mx-2">
              <ActivityItem type="win" message="EUR/USD hit TP1 (+45 pips)" time="2 min ago" delay={600} />
              <ActivityItem type="signal" message="New GBP/USD signal posted" time="15 min ago" delay={700} />
              <ActivityItem type="loss" message="USD/JPY stopped out (-30 pips)" time="1 hour ago" delay={800} />
              <ActivityItem type="info" message="Market session: London Open" time="2 hours ago" delay={900} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <Link href="/signals" className="group">
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Signal className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">View Signals</p>
                <p className="text-sm text-gray-400">6 active signals</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/analytics" className="group">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Analytics</p>
                <p className="text-sm text-gray-400">Performance stats</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/journal" className="group">
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Journal</p>
                <p className="text-sm text-gray-400">Track your trades</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pricing" className="group">
          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Crown className="h-6 w-6 text-white" />
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
