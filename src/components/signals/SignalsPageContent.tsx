'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  TrendingUp, TrendingDown, Target, ShieldAlert, Clock, BarChart3,
  ChevronUp, ChevronDown, ChevronRight, CheckCircle2, XCircle, Zap, Activity, Timer,
  RefreshCw, Filter, Search, Eye, EyeOff, AlertTriangle, Sparkles, Signal
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { TradingChart } from '@/components/charts/TradingChart';
import { calculatePips, formatPrice } from '@/lib/forex-api';

interface Signal {
  id: string;
  pair: string;
  type: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number | null;
  takeProfit3: number | null;
  analysis: string | null;
  confidence: number;
  timeframe: string;
  status: string;
  result: string | null;
  pips: number | null;
  createdAt: string;
}

// Signal card component
function SignalCard({ signal, onExpand }: { signal: Signal; onExpand: () => void }) {
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(`/api/forex/live?pair=${signal.pair}`);
        if (response.ok) {
          const data = await response.json();
          setLivePrice(data.bid);
        }
      } catch {
        // Silent fail
      }
    };

    fetchPrice();
    intervalRef.current = setInterval(fetchPrice, 20000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [signal.pair]);

  const currentPrice = livePrice || signal.entryPrice;
  const isBuy = signal.type === 'BUY';

  const distanceToEntry = calculatePips(signal.pair, currentPrice, signal.entryPrice);
  const distanceToSL = calculatePips(signal.pair, currentPrice, signal.stopLoss);
  const distanceToTP1 = calculatePips(signal.pair, currentPrice, signal.takeProfit1);
  const riskPips = Math.abs(calculatePips(signal.pair, signal.entryPrice, signal.stopLoss));
  const rewardPips = Math.abs(calculatePips(signal.pair, signal.entryPrice, signal.takeProfit1));
  const rrRatio = (rewardPips / riskPips).toFixed(1);

  const statusColors: Record<string, string> = {
    'ACTIVE': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'HIT_TP': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'HIT_SL': 'bg-red-500/10 text-red-400 border-red-500/20',
    'CLOSED': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 85) return 'from-emerald-500 to-emerald-400';
    if (conf >= 70) return 'from-yellow-500 to-yellow-400';
    return 'from-orange-500 to-orange-400';
  };

  return (
    <Card className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-white/5 hover:border-emerald-500/20 transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isBuy ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
            }`}>
              {isBuy ? (
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg">{signal.pair}</h3>
                <Badge className={statusColors[signal.status] || statusColors['ACTIVE']}>
                  {signal.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-400">{signal.timeframe}</span>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-400">{timeAgo(signal.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Price */}
            {livePrice && (
              <div className="text-right hidden sm:block">
                <div className="font-mono text-white text-lg">
                  {formatPrice(signal.pair, livePrice)}
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400">LIVE</span>
                </div>
              </div>
            )}

            {/* Result Badge */}
            {signal.result && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                signal.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {signal.result === 'WIN' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span className="font-bold">{signal.pips || 0} pips</span>
              </div>
            )}

            {/* Type Badge */}
            <Badge className={`text-sm font-bold ${isBuy ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} border`}>
              {signal.type}
            </Badge>
          </div>
        </div>
      </div>

      {/* Price Levels Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Entry */}
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-center gap-1.5 text-blue-400 text-xs mb-1">
              <Zap className="h-3 w-3" />
              Entry
            </div>
            <div className="font-mono text-white text-lg">{formatPrice(signal.pair, signal.entryPrice)}</div>
            <div className={`text-xs mt-1 ${Math.abs(distanceToEntry) < 10 ? 'text-blue-400' : 'text-gray-500'}`}>
              {distanceToEntry > 0 ? '+' : ''}{distanceToEntry} pips
            </div>
          </div>

          {/* Stop Loss */}
          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
            <div className="flex items-center gap-1.5 text-red-400 text-xs mb-1">
              <ShieldAlert className="h-3 w-3" />
              Stop Loss
            </div>
            <div className="font-mono text-white text-lg">{formatPrice(signal.pair, signal.stopLoss)}</div>
            <div className="text-xs text-red-400 mt-1">
              {isBuy ? '-' : '+'}{Math.abs(distanceToSL)} pips
            </div>
          </div>

          {/* Take Profit 1 */}
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs mb-1">
              <Target className="h-3 w-3" />
              TP1
            </div>
            <div className="font-mono text-white text-lg">{formatPrice(signal.pair, signal.takeProfit1)}</div>
            <div className="text-xs text-emerald-400 mt-1">
              {isBuy ? '+' : '-'}{Math.abs(distanceToTP1)} pips
            </div>
          </div>

          {/* Risk:Reward */}
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <div className="flex items-center gap-1.5 text-purple-400 text-xs mb-1">
              <BarChart3 className="h-3 w-3" />
              Risk:Reward
            </div>
            <div className="font-mono text-white text-lg">1:{rrRatio}</div>
            <div className="text-xs text-gray-400 mt-1">Risk {riskPips} pips</div>
          </div>
        </div>

        {/* TP2 & TP3 */}
        {(signal.takeProfit2 || signal.takeProfit3) && (
          <div className="flex gap-3 mt-3">
            {signal.takeProfit2 && (
              <div className="flex-1 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                <span className="text-xs text-emerald-400">TP2</span>
                <span className="font-mono text-white text-sm">{formatPrice(signal.pair, signal.takeProfit2)}</span>
                <span className="text-xs text-gray-500">{calculatePips(signal.pair, currentPrice, signal.takeProfit2)} pips</span>
              </div>
            )}
            {signal.takeProfit3 && (
              <div className="flex-1 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                <span className="text-xs text-emerald-400">TP3</span>
                <span className="font-mono text-white text-sm">{formatPrice(signal.pair, signal.takeProfit3)}</span>
                <span className="text-xs text-gray-500">{calculatePips(signal.pair, currentPrice, signal.takeProfit3)} pips</span>
              </div>
            )}
          </div>
        )}

        {/* Confidence & Analysis */}
        <div className="mt-4 space-y-3">
          {/* Confidence */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Confidence
                </span>
                <span className={`text-sm font-bold bg-gradient-to-r ${getConfidenceColor(signal.confidence)} bg-clip-text text-transparent`}>
                  {signal.confidence}%
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getConfidenceColor(signal.confidence)} rounded-full transition-all`}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Analysis */}
          {signal.analysis && (
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                <Activity className="h-3 w-3" />
                ICT Analysis
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{signal.analysis}</p>
            </div>
          )}
        </div>

        {/* Expand Button */}
        <button
          onClick={onExpand}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
        >
          <Eye className="h-4 w-4" />
          View Chart Analysis
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

// Signals page content
export function SignalsPageContent() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [pairFilter, setPairFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  const fetchSignals = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);

    try {
      const response = await fetch('/api/signals?limit=50');
      if (response.ok) {
        const data = await response.json();
        setSignals(data.signals || []);
      }
    } catch {
      console.error('Failed to fetch signals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(() => fetchSignals(), 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredSignals = signals.filter(signal => {
    if (filter === 'active' && signal.status !== 'ACTIVE') return false;
    if (filter === 'closed' && signal.status === 'ACTIVE') return false;
    if (filter === 'wins' && signal.result !== 'WIN') return false;
    if (pairFilter !== 'all' && signal.pair !== pairFilter) return false;
    if (searchQuery && !signal.pair.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const uniquePairs = [...new Set(signals.map(s => s.pair))];

  const stats = {
    total: signals.length,
    active: signals.filter(s => s.status === 'ACTIVE').length,
    wins: signals.filter(s => s.result === 'WIN').length,
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Signal className="h-6 w-6 text-emerald-400" />
            Trading Signals
          </h1>
          <p className="text-gray-400 mt-1">Real-time forex signals with ICT analysis</p>
        </div>

        <Button
          onClick={() => fetchSignals(true)}
          disabled={refreshing}
          variant="outline"
          className="border-white/10 text-gray-300 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400">Total Signals</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/10">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.active}</div>
            <div className="text-xs text-gray-400">Active</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/10">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.wins}</div>
            <div className="text-xs text-gray-400">Wins</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search pairs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 focus:border-emerald-500/50"
          />
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32 bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/10">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="wins">Wins</SelectItem>
          </SelectContent>
        </Select>

        <Select value={pairFilter} onValueChange={setPairFilter}>
          <SelectTrigger className="w-32 bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/10">
            <SelectItem value="all">All Pairs</SelectItem>
            {uniquePairs.map(pair => (
              <SelectItem key={pair} value={pair}>{pair}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Signals List */}
      <div className="space-y-4">
        {filteredSignals.length === 0 ? (
          <Card className="bg-white/[0.02] border-white/5">
            <CardContent className="py-16 text-center">
              <Signal className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No signals found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredSignals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              onExpand={() => setSelectedSignal(signal)}
            />
          ))
        )}
      </div>

      {/* Chart Modal */}
      {selectedSignal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0d0d12] rounded-2xl border border-white/10">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                {selectedSignal.pair} - {selectedSignal.type}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSignal(null)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <TradingChart
                pair={selectedSignal.pair}
                signal={{
                  entryPrice: selectedSignal.entryPrice,
                  stopLoss: selectedSignal.stopLoss,
                  takeProfit1: selectedSignal.takeProfit1,
                  takeProfit2: selectedSignal.takeProfit2 || undefined,
                  takeProfit3: selectedSignal.takeProfit3 || undefined,
                  type: selectedSignal.type as 'BUY' | 'SELL',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
