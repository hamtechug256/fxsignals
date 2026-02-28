'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Signal, getStatusColor, getSignalTypeColor, formatPrice, formatSignalDate, getPotentialPips } from '@/lib/signals';
import { TrendingUp, TrendingDown, Target, Shield, Clock } from 'lucide-react';

interface SignalCardProps {
  signal: Signal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const isBuy = signal.type === 'BUY';
  const pips = getPotentialPips(signal);

  return (
    <Card className="group relative overflow-hidden bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
      {/* Gradient accent */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1 ${
          isBuy ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-red-400'
        }`}
      />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isBuy ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              {isBuy ? (
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg text-white">{signal.pair}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getSignalTypeColor(signal.type)}>
                  {signal.type}
                </Badge>
                <Badge className={getStatusColor(signal.status)}>
                  {signal.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatSignalDate(signal.createdAt)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Levels */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="text-xs text-gray-500 mb-1">Entry</div>
            <div className="text-sm font-semibold text-white">
              {formatPrice(signal.entryPrice, signal.pair)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1 text-xs text-emerald-400 mb-1">
              <Target className="h-3 w-3" />
              TP1
            </div>
            <div className="text-sm font-semibold text-emerald-400">
              {formatPrice(signal.takeProfit1, signal.pair)}
            </div>
            <div className="text-xs text-emerald-400/60">+{pips.tp1} pips</div>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-1 text-xs text-red-400 mb-1">
              <Shield className="h-3 w-3" />
              SL
            </div>
            <div className="text-sm font-semibold text-red-400">
              {formatPrice(signal.stopLoss, signal.pair)}
            </div>
            <div className="text-xs text-red-400/60">-{pips.sl} pips</div>
          </div>
        </div>

        {/* TP2 if exists */}
        {signal.takeProfit2 && (
          <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
            <span className="text-xs text-emerald-400">TP2 Target</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-emerald-400">
                {formatPrice(signal.takeProfit2, signal.pair)}
              </span>
              <span className="text-xs text-emerald-400/60 ml-2">
                +{pips.tp2} pips
              </span>
            </div>
          </div>
        )}

        {/* Analysis */}
        {signal.analysis && (
          <div className="pt-3 border-t border-white/5">
            <p className="text-sm text-gray-400 line-clamp-2">{signal.analysis}</p>
          </div>
        )}

        {/* Result */}
        {signal.result && signal.result !== 'PENDING' && (
          <div className={`p-3 rounded-lg text-center font-semibold ${
            signal.result === 'WIN' 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {signal.result === 'WIN' ? `+${signal.pips?.toFixed(1)} pips` : `${signal.pips?.toFixed(1)} pips`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
