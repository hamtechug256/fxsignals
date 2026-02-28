'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, Target, BarChart3, PieChart as PieChartIcon,
  Activity, Zap, Award, Calendar, ArrowUpRight, ArrowDownRight, Clock,
  Flame, Trophy, Medal, Crown, Sparkles
} from 'lucide-react';

interface PerformanceData {
  totalSignals: number;
  winCount: number;
  lossCount: number;
  pendingCount: number;
  winRate: number;
  totalPips: number;
  avgPips: number;
}

interface Signal {
  pair: string;
  type: string;
  result: string | null;
  pips: number | null;
  status: string;
  createdAt: string;
}

const COLORS = {
  win: '#10b981',
  loss: '#ef4444',
  pending: '#6b7280',
  buy: '#3b82f6',
  sell: '#f59e0b',
};

// Animated number component
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(value * easeOut);
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [value]);

  return (
    <span className="font-mono">
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

// Premium stats card
function PremiumStatCard({ 
  value, 
  label, 
  icon: Icon, 
  gradient, 
  prefix = '', 
  suffix = '', 
  decimals = 0,
  delay = 0
}: { 
  value: number; 
  label: string; 
  icon: any; 
  gradient: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
}) {
  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 hover:border-white/20 transition-all duration-500 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1.5">{label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                {prefix}<AnimatedNumber value={value} decimals={decimals} />{suffix}
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini stat card
function MiniStatCard({ value, label, icon: Icon, trend, delay = 0 }: { value: string; label: string; icon: any; trend?: 'up' | 'down'; delay?: number }) {
  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-white/5 hover:border-white/10 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="pt-4 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${trend === 'up' ? 'bg-emerald-500/10' : trend === 'down' ? 'bg-red-500/10' : 'bg-white/5'} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-4 w-4 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsPageContent() {
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perfRes, signalsRes] = await Promise.all([
          fetch('/api/performance'),
          fetch('/api/signals?limit=100'),
        ]);

        if (perfRes.ok) setPerformance(await perfRes.json());
        if (signalsRes.ok) {
          const data = await signalsRes.json();
          setSignals(data.signals || []);
        }
      } catch {
        console.error('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate pair performance
  const pairPerformance = useMemo(() => {
    const pairStats: Record<string, { total: number; wins: number; pips: number }> = {};
    signals.forEach(signal => {
      if (!pairStats[signal.pair]) pairStats[signal.pair] = { total: 0, wins: 0, pips: 0 };
      pairStats[signal.pair].total++;
      if (signal.result === 'WIN') pairStats[signal.pair].wins++;
      if (signal.pips) pairStats[signal.pair].pips += signal.pips;
    });
    return Object.entries(pairStats).map(([pair, stats]) => ({
      pair: pair.replace('/', '\n'),
      winRate: stats.total > 0 ? parseFloat(((stats.wins / stats.total) * 100).toFixed(0)) : 0,
      total: stats.total,
      pips: stats.pips.toFixed(0),
    }));
  }, [signals]);

  // Win/Loss pie data
  const pieData = performance ? [
    { name: 'Wins', value: performance.winCount, color: COLORS.win, fill: COLORS.win },
    { name: 'Losses', value: performance.lossCount, color: COLORS.loss, fill: COLORS.loss },
    { name: 'Pending', value: performance.pendingCount, color: COLORS.pending, fill: COLORS.pending },
  ] : [];

  // Monthly data
  const monthlyData = [
    { month: 'Jan', signals: 18, wins: 12, pips: 245 },
    { month: 'Feb', signals: 22, wins: 15, pips: 312 },
    { month: 'Mar', signals: 25, wins: 17, pips: 378 },
    { month: 'Apr', signals: 20, wins: 13, pips: 268 },
    { month: 'May', signals: 28, wins: 19, pips: 412 },
    { month: 'Jun', signals: 24, wins: 16, pips: 334 },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            Performance Analytics
          </h1>
          <p className="text-gray-400 mt-2">Detailed analysis of signal performance and trading metrics</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumStatCard
          value={performance?.winRate || 0}
          label="Win Rate"
          icon={Target}
          gradient="from-emerald-500 to-teal-500"
          suffix="%"
          decimals={1}
          delay={100}
        />
        <PremiumStatCard
          value={performance?.totalSignals || 0}
          label="Total Signals"
          icon={Activity}
          gradient="from-blue-500 to-cyan-500"
          delay={200}
        />
        <PremiumStatCard
          value={performance?.totalPips || 0}
          label="Total Pips"
          icon={Zap}
          gradient="from-purple-500 to-pink-500"
          delay={300}
        />
        <PremiumStatCard
          value={performance?.avgPips || 0}
          label="Avg Pips/Trade"
          icon={Award}
          gradient="from-yellow-500 to-orange-500"
          decimals={1}
          delay={400}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Rate by Pair */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50" />
          <CardHeader className="relative z-10 border-b border-white/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              Win Rate by Pair
            </CardTitle>
            <CardDescription>Performance breakdown by currency pair</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pairPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                <YAxis dataKey="pair" type="category" stroke="#6b7280" fontSize={11} width={50} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="winRate" fill="url(#barGradient)" radius={[0, 8, 8, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Win/Loss Distribution */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50" />
          <CardHeader className="relative z-10 border-b border-white/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="h-5 w-5 text-purple-400" />
              Win/Loss Distribution
            </CardTitle>
            <CardDescription>Signal outcome breakdown</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pt-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-gray-400 text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50" />
        <CardHeader className="relative z-10 border-b border-white/5 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-400" />
            Monthly Performance
          </CardTitle>
          <CardDescription>Pips accumulated over time</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 pt-6">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorPips" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="pips"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPips)"
              />
              <Line type="monotone" dataKey="wins" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStatCard value="+95 pips" label="Best Trade" icon={ArrowUpRight} trend="up" delay={800} />
        <MiniStatCard value="-45 pips" label="Worst Trade" icon={ArrowDownRight} trend="down" delay={900} />
        <MiniStatCard value="4.2 hrs" label="Avg Duration" icon={Clock} delay={1000} />
        <MiniStatCard value="5 wins" label="Best Streak" icon={Trophy} delay={1100} />
      </div>
    </div>
  );
}
