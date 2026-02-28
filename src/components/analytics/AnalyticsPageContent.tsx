'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, RadialBarChart, RadialBar
} from 'recharts';
import {
  TrendingUp, TrendingDown, Target, BarChart3, PieChart as PieChartIcon,
  Activity, Zap, Award, Calendar, ArrowUpRight, ArrowDownRight, Clock
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
      const easeOut = 1 - Math.pow(1 - progress, 3);
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

  // Monthly data (simulated)
  const monthlyData = [
    { month: 'Jan', signals: 18, wins: 12, pips: 245 },
    { month: 'Feb', signals: 22, wins: 15, pips: 312 },
    { month: 'Mar', signals: 25, wins: 17, pips: 378 },
    { month: 'Apr', signals: 20, wins: 13, pips: 268 },
    { month: 'May', signals: 28, wins: 19, pips: 412 },
    { month: 'Jun', signals: 24, wins: 16, pips: 334 },
  ];

  // Win rate gauge data
  const gaugeData = performance ? [{ name: 'Win Rate', value: performance.winRate, fill: '#10b981' }] : [];

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
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-emerald-400" />
          Performance Analytics
        </h1>
        <p className="text-gray-400 mt-1">Detailed analysis of signal performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Win Rate</p>
                <p className="text-3xl font-bold text-emerald-400">
                  <AnimatedNumber value={performance?.winRate || 0} decimals={1} suffix="%" />
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Target className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Signals</p>
                <p className="text-3xl font-bold text-blue-400">
                  <AnimatedNumber value={performance?.totalSignals || 0} />
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Pips</p>
                <p className="text-3xl font-bold text-purple-400">
                  <AnimatedNumber value={performance?.totalPips || 0} decimals={0} />
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Avg Pips/Trade</p>
                <p className="text-3xl font-bold text-yellow-400">
                  <AnimatedNumber value={performance?.avgPips || 0} decimals={1} />
                </p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/20">
                <Award className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Rate by Pair */}
        <Card className="bg-gradient-to-br from-white/[0.03] to-transparent border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              Win Rate by Pair
            </CardTitle>
            <CardDescription>Performance breakdown by currency pair</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pairPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                <YAxis dataKey="pair" type="category" stroke="#6b7280" fontSize={11} width={50} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d0d12', border: '1px solid #1f2937', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="winRate" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Win/Loss Distribution */}
        <Card className="bg-gradient-to-br from-white/[0.03] to-transparent border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="h-5 w-5 text-purple-400" />
              Win/Loss Distribution
            </CardTitle>
            <CardDescription>Signal outcome breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d0d12', border: '1px solid #1f2937', borderRadius: '8px' }}
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
      <Card className="bg-gradient-to-br from-white/[0.03] to-transparent border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-400" />
            Monthly Performance
          </CardTitle>
          <CardDescription>Pips accumulated over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorPips" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d0d12', border: '1px solid #1f2937', borderRadius: '8px' }}
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
        <Card className="bg-white/[0.02] border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Best Trade</p>
              <p className="font-bold text-white">+95 pips</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white/[0.02] border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <ArrowDownRight className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Worst Trade</p>
              <p className="font-bold text-white">-45 pips</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white/[0.02] border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Avg Duration</p>
              <p className="font-bold text-white">4.2 hrs</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white/[0.02] border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Award className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Streak</p>
              <p className="font-bold text-white">5 wins</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
