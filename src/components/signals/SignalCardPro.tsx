'use client';

import { useEffect, useState, useRef } from 'react';
import {
  TrendingUp, TrendingDown, Target, ShieldAlert, Clock, BarChart3,
  ChevronUp, ChevronDown, AlertTriangle, CheckCircle2, XCircle,
  Zap, Activity, Timer
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TradingChart } from '@/components/charts/TradingChart';
import { calculatePips, formatPrice, calculatePipValue } from '@/lib/forex-api';

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

interface LivePrice {
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
}

interface SignalCardProProps {
  signal: Signal;
  showChart?: boolean;
}

export function SignalCardPro({ signal, showChart = true }: SignalCardProProps) {
  const [livePrice, setLivePrice] = useState<LivePrice | null>(null);
  const [expanded, setExpanded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live price effect
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(`/api/forex/live?pair=${signal.pair}`);
        if (response.ok) {
          const data = await response.json();
          setLivePrice(data);
        }
      } catch {
        // Silent fail for price fetch
      }
    };

    fetchPrice();
    intervalRef.current = setInterval(fetchPrice, 15000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [signal.pair]);

  // Calculate pip distances
  const currentPrice = livePrice?.bid || signal.entryPrice;
  const isBuy = signal.type === 'BUY';
  const isJpyPair = signal.pair.includes('JPY');
  const isXau = signal.pair.includes('XAU');

  const distanceToEntry = calculatePips(signal.pair, currentPrice, signal.entryPrice);
  const distanceToSL = calculatePips(signal.pair, currentPrice, signal.stopLoss);
  const distanceToTP1 = calculatePips(signal.pair, currentPrice, signal.takeProfit1);
  const distanceToTP2 = signal.takeProfit2 ? calculatePips(signal.pair, currentPrice, signal.takeProfit2) : null;
  const distanceToTP3 = signal.takeProfit3 ? calculatePips(signal.pair, currentPrice, signal.takeProfit3) : null;

  // Risk:Reward calculation
  const riskPips = Math.abs(calculatePips(signal.pair, signal.entryPrice, signal.stopLoss));
  const reward1Pips = Math.abs(calculatePips(signal.pair, signal.entryPrice, signal.takeProfit1));
  const rrRatio = (reward1Pips / riskPips).toFixed(1);

  // Status colors
  const statusColors: Record<string, string> = {
    'ACTIVE': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'HIT_TP': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'HIT_SL': 'bg-red-500/20 text-red-400 border-red-500/30',
    'CLOSED': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  // Time ago
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

  // Confidence color
  const getConfidenceColor = (conf: number) => {
    if (conf >= 85) return 'text-emerald-400';
    if (conf >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  // Progress to entry
  const progressToEntry = () => {
    const maxDistance = riskPips * 2;
    const current = Math.abs(distanceToEntry);
    return Math.min(100, (current / maxDistance) * 100);
  };

  return (
    <Card className={`bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden ${
      signal.status === 'ACTIVE' ? 'ring-1 ring-blue-500/20' : ''
    }`}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            {/* Direction Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm ${
              isBuy 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {isBuy ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {signal.type}
            </div>

            {/* Pair */}
            <div>
              <h3 className="font-bold text-white text-lg">{signal.pair}</h3>
              <p className="text-xs text-gray-500">{signal.timeframe} • {timeAgo(signal.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Price */}
            {livePrice && (
              <div className="text-right mr-2">
                <div className="font-mono text-white text-sm">
                  {formatPrice(signal.pair, livePrice.bid)}
                </div>
                <div className={`text-xs ${livePrice.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {livePrice.change >= 0 ? '+' : ''}{livePrice.changePercent.toFixed(2)}%
                </div>
              </div>
            )}

            {/* Status */}
            <Badge className={statusColors[signal.status] || statusColors['ACTIVE']}>
              {signal.status}
            </Badge>

            {/* Result */}
            {signal.result && (
              <div className={`flex items-center gap-1 ${signal.result === 'WIN' ? 'text-emerald-400' : 'text-red-400'}`}>
                {signal.result === 'WIN' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span className="text-sm font-medium">{signal.pips || 0} pips</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {/* Price Levels Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {/* Entry */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-blue-400 text-xs mb-1">
                <Zap className="h-3 w-3" />
                Entry
              </div>
              <div className="font-mono text-white text-lg">{formatPrice(signal.pair, signal.entryPrice)}</div>
              <div className={`text-xs mt-1 ${Math.abs(distanceToEntry) < 5 ? 'text-blue-400' : 'text-gray-500'}`}>
                {distanceToEntry > 0 ? '+' : ''}{distanceToEntry} pips
              </div>
            </div>

            {/* Stop Loss */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-red-400 text-xs mb-1">
                <ShieldAlert className="h-3 w-3" />
                Stop Loss
              </div>
              <div className="font-mono text-white text-lg">{formatPrice(signal.pair, signal.stopLoss)}</div>
              <div className="text-xs text-red-400 mt-1">
                {isBuy ? '-' : '+'}{distanceToSL} pips
              </div>
            </div>

            {/* TP1 */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs mb-1">
                <Target className="h-3 w-3" />
                Take Profit 1
              </div>
              <div className="font-mono text-white text-lg">{formatPrice(signal.pair, signal.takeProfit1)}</div>
              <div className="text-xs text-emerald-400 mt-1">
                {isBuy ? '+' : '-'}{distanceToTP1} pips
              </div>
            </div>

            {/* Risk:Reward */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-purple-400 text-xs mb-1">
                <BarChart3 className="h-3 w-3" />
                Risk:Reward
              </div>
              <div className="font-mono text-white text-lg">1:{rrRatio}</div>
              <div className="text-xs text-gray-400 mt-1">
                Risk {riskPips} pips
              </div>
            </div>
          </div>

          {/* TP2 & TP3 if available */}
          {(signal.takeProfit2 || signal.takeProfit3) && (
            <div className="flex gap-3 mb-4">
              {signal.takeProfit2 && (
                <div className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400">TP2</span>
                    <span className="font-mono text-white text-sm">{formatPrice(signal.pair, signal.takeProfit2)}</span>
                    <span className="text-xs text-gray-500">{distanceToTP2} pips</span>
                  </div>
                </div>
              )}
              {signal.takeProfit3 && (
                <div className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400">TP3</span>
                    <span className="font-mono text-white text-sm">{formatPrice(signal.pair, signal.takeProfit3)}</span>
                    <span className="text-xs text-gray-500">{distanceToTP3} pips</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confidence & Progress */}
          <div className="flex items-center gap-4 mb-4">
            {/* Confidence */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Confidence</span>
                <span className={`text-sm font-bold ${getConfidenceColor(signal.confidence)}`}>
                  {signal.confidence}%
                </span>
              </div>
              <Progress 
                value={signal.confidence} 
                className="h-2 bg-gray-800"
                indicatorClassName={signal.confidence >= 85 ? 'bg-emerald-500' : signal.confidence >= 70 ? 'bg-yellow-500' : 'bg-orange-500'}
              />
            </div>

            {/* Time Active */}
            <div className="flex items-center gap-2 text-gray-400">
              <Timer className="h-4 w-4" />
              <span className="text-sm">{timeAgo(signal.createdAt)}</span>
            </div>
          </div>

          {/* Analysis */}
          {signal.analysis && (
            <div className="bg-gray-800/30 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
                <Activity className="h-3 w-3" />
                Analysis
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{signal.analysis}</p>
            </div>
          )}

          {/* Expand Button */}
          {showChart && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-white transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide Chart
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show Chart
                </>
              )}
            </button>
          )}
        </div>

        {/* Chart (Expanded) */}
        {expanded && showChart && (
          <div className="border-t border-gray-800 p-4 bg-gray-900/30">
            <TradingChart
              pair={signal.pair}
              signal={{
                entryPrice: signal.entryPrice,
                stopLoss: signal.stopLoss,
                takeProfit1: signal.takeProfit1,
                takeProfit2: signal.takeProfit2 || undefined,
                takeProfit3: signal.takeProfit3 || undefined,
                type: signal.type as 'BUY' | 'SELL',
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
