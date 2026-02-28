'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Target, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

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

export function AnalyticsDashboard() {
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

        if (perfRes.ok) {
          const perfData = await perfRes.json();
          setPerformance(perfData);
        }

        if (signalsRes.ok) {
          const signalsData = await signalsRes.json();
          setSignals(signalsData.signals || []);
        }
      } catch (error) {
        console.error('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate pair performance
  const pairPerformance = signals.reduce((acc, signal) => {
    if (!acc[signal.pair]) {
      acc[signal.pair] = { total: 0, wins: 0, pips: 0 };
    }
    acc[signal.pair].total++;
    if (signal.result === 'WIN') acc[signal.pair].wins++;
    if (signal.pips) acc[signal.pair].pips += signal.pips;
    return acc;
  }, {} as Record<string, { total: number; wins: number; pips: number }>);

  const pairChartData = Object.entries(pairPerformance).map(([pair, data]) => ({
    pair: pair.replace('/', '\n'),
    winRate: data.total > 0 ? ((data.wins / data.total) * 100).toFixed(0) : 0,
    total: data.total,
    pips: data.pips.toFixed(0),
  }));

  // Win/Loss pie chart data
  const pieData = performance ? [
    { name: 'Wins', value: performance.winCount, color: COLORS.win },
    { name: 'Losses', value: performance.lossCount, color: COLORS.loss },
    { name: 'Pending', value: performance.pendingCount, color: COLORS.pending },
  ] : [];

  // Monthly performance (simulated for demo)
  const monthlyData = [
    { month: 'Jan', signals: 12, wins: 8, pips: 156 },
    { month: 'Feb', signals: 15, wins: 10, pips: 198 },
    { month: 'Mar', signals: 18, wins: 12, pips: 245 },
    { month: 'Apr', signals: 14, wins: 9, pips: 178 },
    { month: 'May', signals: 20, wins: 14, pips: 312 },
    { month: 'Jun', signals: 16, wins: 11, pips: 234 },
  ];

  // Buy vs Sell performance
  const buyVsSell = signals.reduce((acc, signal) => {
    const type = signal.type;
    if (!acc[type]) {
      acc[type] = { total: 0, wins: 0 };
    }
    acc[type].total++;
    if (signal.result === 'WIN') acc[type].wins++;
    return acc;
  }, {} as Record<string, { total: number; wins: number }>);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Target className="h-4 w-4" />
              <span className="text-sm">Total Signals</span>
            </div>
            <div className="text-3xl font-bold text-white">{performance?.totalSignals || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Win Rate</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400">
              {performance?.winRate?.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Activity className="h-4 w-4" />
              <span className="text-sm">Total Pips</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {performance?.totalPips?.toFixed(0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">Avg Pips/Trade</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">
              {performance?.avgPips?.toFixed(1) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Rate by Pair */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              Win Rate by Pair
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pairChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="pair" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="winRate" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Win/Loss Distribution */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-purple-400" />
              Win/Loss Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
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
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Monthly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              />
              <Area
                type="monotone"
                dataKey="pips"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="wins"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
