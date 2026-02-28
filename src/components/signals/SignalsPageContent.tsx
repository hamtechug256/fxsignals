'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  TrendingUp, TrendingDown, Target, ShieldAlert, Clock, BarChart3,
  ChevronRight, CheckCircle2, XCircle, Zap, Activity,
  RefreshCw, Search, Eye, Sparkles, Signal, Filter, Crown,
  Flame, ArrowUpRight, ArrowDownRight, X, ExternalLink
} from 'lucide-react';
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

// Live indicator component
function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
      <div className="relative">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
      </div>
      <span className="text-[10px] font-medium text-emerald-400">LIVE</span>
    </div>
  );
}

// Signal card component
function SignalCard({ signal, onExpand, delay = 0 }: { signal: Signal; onExpand: () => void; delay?: number }) {
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

  const statusConfig: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    'ACTIVE': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: Zap },
    'HIT_TP': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle2 },
    'HIT_SL': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: XCircle },
    'CLOSED': { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', icon: Clock },
  };

  const statusStyle = statusConfig[signal.status] || statusConfig['ACTIVE'];
  const StatusIcon = statusStyle.icon;

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

  const getConfidenceGradient = (conf: number) => {
    if (conf >= 85) return 'from-emerald-500 to-teal-400';
    if (conf >= 70) return 'from-yellow-500 to-amber-400';
    return 'from-orange-500 to-orange-400';
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 hover:border-white/20 transition-all duration-500 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover gradient overlay */}
      <div className={`absolute inset-0 ${isBuy ? 'bg-gradient-to-br from-emerald-500/5' : 'bg-gradient-to-br from-red-500/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
              isBuy 
                ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20' 
                : 'bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20'
            }`}>
              {isBuy ? (
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-400" />
              )}
              {signal.status === 'ACTIVE' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
              )}
            </div>

            {/* Pair & Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-xl">{signal.pair}</h3>
                <Badge className={`${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} font-medium`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {signal.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-400">{signal.timeframe}</span>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-500">{timeAgo(signal.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Live Price */}
            {livePrice && (
              <div className="text-right hidden md:block">
                <div className="font-mono text-white text-xl font-semibold">
                  {formatPrice(signal.pair, livePrice)}
                </div>
                <LiveIndicator />
              </div>
            )}

            {/* Result Badge */}
            {signal.result && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                signal.result === 'WIN' 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/20' 
                  : 'bg-gradient-to-r from-red-500/20 to-red-500/10 border border-red-500/20'
              }`}>
                {signal.result === 'WIN' ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                )}
                <span className={`font-bold ${signal.result === 'WIN' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {signal.pips || 0} pips
                </span>
              </div>
            )}

            {/* Type Badge */}
            <div className={`px-4 py-2 rounded-xl font-bold text-sm ${
              isBuy 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/20'
            }`}>
              {signal.type}
            </div>
          </div>
        </div>
      </div>

      {/* Price Levels Grid */}
      <div className="relative z-10 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Entry */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/10 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-1.5 text-blue-400 text-xs mb-2">
              <Zap className="h-3.5 w-3.5" />
              Entry
            </div>
            <div className="font-mono text-white text-lg font-semibold">{formatPrice(signal.pair, signal.entryPrice)}</div>
            <div className={`text-xs mt-1.5 ${Math.abs(distanceToEntry) < 10 ? 'text-blue-400' : 'text-gray-500'}`}>
              {distanceToEntry > 0 ? '+' : ''}{distanceToEntry} pips
            </div>
          </div>

          {/* Stop Loss */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-colors">
            <div className="flex items-center gap-1.5 text-red-400 text-xs mb-2">
              <ShieldAlert className="h-3.5 w-3.5" />
              Stop Loss
            </div>
            <div className="font-mono text-white text-lg font-semibold">{formatPrice(signal.pair, signal.stopLoss)}</div>
            <div className="text-xs text-red-400 mt-1.5">
              {isBuy ? '-' : '+'}{Math.abs(distanceToSL)} pips
            </div>
          </div>

          {/* Take Profit 1 */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs mb-2">
              <Target className="h-3.5 w-3.5" />
              Take Profit 1
            </div>
            <div className="font-mono text-white text-lg font-semibold">{formatPrice(signal.pair, signal.takeProfit1)}</div>
            <div className="text-xs text-emerald-400 mt-1.5">
              {isBuy ? '+' : '-'}{Math.abs(distanceToTP1)} pips
            </div>
          </div>

          {/* Risk:Reward */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-1.5 text-purple-400 text-xs mb-2">
              <BarChart3 className="h-3.5 w-3.5" />
              Risk:Reward
            </div>
            <div className="font-mono text-white text-lg font-semibold">1:{rrRatio}</div>
            <div className="text-xs text-gray-400 mt-1.5">Risk {riskPips} pips</div>
          </div>
        </div>

        {/* TP2 & TP3 */}
        {(signal.takeProfit2 || signal.takeProfit3) && (
          <div className="flex gap-3 mt-3">
            {signal.takeProfit2 && (
              <div className="flex-1 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                <span className="text-sm text-emerald-400 font-medium">TP2</span>
                <span className="font-mono text-white">{formatPrice(signal.pair, signal.takeProfit2)}</span>
                <span className="text-xs text-gray-500">{calculatePips(signal.pair, currentPrice, signal.takeProfit2)} pips</span>
              </div>
            )}
            {signal.takeProfit3 && (
              <div className="flex-1 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                <span className="text-sm text-emerald-400 font-medium">TP3</span>
                <span className="font-mono text-white">{formatPrice(signal.pair, signal.takeProfit3)}</span>
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                  ICT Confidence
                </span>
                <span className={`text-sm font-bold bg-gradient-to-r ${getConfidenceGradient(signal.confidence)} bg-clip-text text-transparent`}>
                  {signal.confidence}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-800/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getConfidenceGradient(signal.confidence)} rounded-full transition-all duration-1000`}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Analysis */}
          {signal.analysis && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
                <Activity className="h-3.5 w-3.5" />
                ICT Analysis
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{signal.analysis}</p>
            </div>
          )}
        </div>

        {/* Expand Button */}
        <button
          onClick={onExpand}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 text-sm font-medium group/btn"
        >
          <Eye className="h-4 w-4" />
          View Chart Analysis
          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </Card>
  );
}

// Stats card
function StatCard({ value, label, icon: Icon, gradient, delay = 0 }: { value: number | string; label: string; icon: any; gradient: string; delay?: number }) {
  return (
    <Card 
      className="relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 hover:border-white/10 transition-all duration-300 group animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <CardContent className="pt-6 pb-6 text-center relative z-10">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className="text-xs text-gray-400 mt-1">{label}</div>
      </CardContent>
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
      <div className="space-y-4 max-w-6xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
              <Signal className="h-6 w-6 text-white" />
            </div>
            Trading Signals
          </h1>
          <p className="text-gray-400 mt-2">Real-time forex signals with professional ICT analysis</p>
        </div>

        <Button
          onClick={() => fetchSignals(true)}
          disabled={refreshing}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/25"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={stats.total} label="Total Signals" icon={Signal} gradient="from-blue-500 to-cyan-500" delay={100} />
        <StatCard value={stats.active} label="Active" icon={Flame} gradient="from-orange-500 to-yellow-500" delay={200} />
        <StatCard value={stats.wins} label="Wins" icon={CheckCircle2} gradient="from-emerald-500 to-teal-500" delay={300} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
          <Input
            placeholder="Search pairs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl text-sm"
          />
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 h-11 bg-white/5 border-white/10 rounded-xl">
            <Filter className="h-4 w-4 mr-2 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/10 rounded-xl">
            <SelectItem value="all">All Signals</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="wins">Wins Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={pairFilter} onValueChange={setPairFilter}>
          <SelectTrigger className="w-36 h-11 bg-white/5 border-white/10 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/10 rounded-xl">
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
          <Card className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5">
            <CardContent className="py-20 text-center">
              <Signal className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">No signals found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or check back later</p>
            </CardContent>
          </Card>
        ) : (
          filteredSignals.map((signal, index) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              onExpand={() => setSelectedSignal(signal)}
              delay={500 + index * 100}
            />
          ))
        )}
      </div>

      {/* Chart Modal */}
      {selectedSignal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-scale">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0d0d12] to-[#0a0a0f] rounded-3xl border border-white/10 shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedSignal.type === 'BUY' 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                    : 'bg-gradient-to-br from-red-500 to-rose-500'
                }`}>
                  {selectedSignal.type === 'BUY' ? (
                    <TrendingUp className="h-5 w-5 text-white" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-xl text-white">{selectedSignal.pair}</h2>
                  <p className="text-sm text-gray-400">{selectedSignal.type} Signal • {selectedSignal.timeframe}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSignal(null)}
                className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chart */}
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

            {/* Analysis */}
            {selectedSignal.analysis && (
              <div className="px-5 pb-5">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                    <Activity className="h-4 w-4" />
                    ICT Analysis
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedSignal.analysis}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
