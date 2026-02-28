'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calculator, DollarSign, Percent, Target, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { calculatePipValue } from '@/lib/forex-api';

const FOREX_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'XAU/USD'
];

export function RiskCalculator() {
  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [pair, setPair] = useState('EUR/USD');
  const [entryPrice, setEntryPrice] = useState(1.0850);
  const [stopLoss, setStopLoss] = useState(1.0820);
  const [takeProfit, setTakeProfit] = useState(1.0910);
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');

  // Calculate results
  const riskAmount = (accountBalance * riskPercent) / 100;
  const pipSize = pair.includes('JPY') ? 0.01 : pair.includes('XAU') ? 0.01 : 0.0001;
  const slDistance = Math.abs(entryPrice - stopLoss);
  const tpDistance = Math.abs(takeProfit - entryPrice);
  const slPips = slDistance / pipSize;
  const tpPips = tpDistance / pipSize;
  const pipValue = calculatePipValue(pair, 1);
  const lotSize = Math.max(0.01, riskAmount / (slPips * pipValue));
  const potentialProfit = tpPips * pipValue * lotSize;
  const potentialLoss = slPips * pipValue * lotSize;
  const rrRatio = tpPips / slPips;

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="flex items-center gap-2 text-white">
          <Calculator className="h-5 w-5 text-emerald-400" />
          Risk Management Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Account Balance */}
            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Account Balance
              </Label>
              <Input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(Number(e.target.value))}
                className="bg-gray-800 border-gray-700 text-white font-mono text-lg"
              />
            </div>

            {/* Risk Percentage */}
            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <Percent className="h-4 w-4 text-yellow-400" />
                Risk Per Trade: {riskPercent}%
              </Label>
              <Slider
                value={[riskPercent]}
                onValueChange={([value]) => setRiskPercent(value)}
                min={0.5}
                max={10}
                step={0.5}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.5%</span>
                <span>5%</span>
                <span>10%</span>
              </div>
            </div>

            {/* Pair Selection */}
            <div className="space-y-2">
              <Label className="text-gray-300">Currency Pair</Label>
              <Select value={pair} onValueChange={(value) => {
                setPair(value);
                // Update default prices based on pair
                const defaults: Record<string, { entry: number; sl: number; tp: number }> = {
                  'EUR/USD': { entry: 1.0850, sl: 1.0820, tp: 1.0910 },
                  'GBP/USD': { entry: 1.2650, sl: 1.2620, tp: 1.2710 },
                  'USD/JPY': { entry: 149.50, sl: 149.20, tp: 150.10 },
                  'XAU/USD': { entry: 2325.00, sl: 2310.00, tp: 2355.00 },
                };
                const d = defaults[value] || { entry: 1.0000, sl: 0.9970, tp: 1.0060 };
                setEntryPrice(d.entry);
                setStopLoss(d.sl);
                setTakeProfit(d.tp);
              }}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {FOREX_PAIRS.map(p => (
                    <SelectItem key={p} value={p} className="text-white">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Direction */}
            <div className="space-y-2">
              <Label className="text-gray-300">Direction</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDirection('BUY')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                    direction === 'BUY'
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  BUY
                </button>
                <button
                  onClick={() => setDirection('SELL')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                    direction === 'SELL'
                      ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <TrendingDown className="h-4 w-4" />
                  SELL
                </button>
              </div>
            </div>

            {/* Price Levels */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Entry Price</Label>
                <Input
                  type="number"
                  step={pair.includes('JPY') || pair.includes('XAU') ? 0.01 : 0.00001}
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-400 text-xs">Stop Loss</Label>
                <Input
                  type="number"
                  step={pair.includes('JPY') || pair.includes('XAU') ? 0.01 : 0.00001}
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="bg-gray-800 border-red-500/30 text-white font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-400 text-xs">Take Profit</Label>
                <Input
                  type="number"
                  step={pair.includes('JPY') || pair.includes('XAU') ? 0.01 : 0.00001}
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(Number(e.target.value))}
                  className="bg-gray-800 border-emerald-500/30 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {/* Risk Amount */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Risk Amount</span>
                <span className="text-2xl font-bold text-yellow-400">
                  ${riskAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Lot Size - Main Result */}
            <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/20 rounded-xl p-6 border border-emerald-500/30">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Recommended Position Size</p>
                <p className="text-5xl font-bold text-emerald-400 mb-2">
                  {lotSize.toFixed(2)}
                </p>
                <p className="text-gray-400 text-sm">Lots</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <AlertTriangle className="h-3 w-3 text-red-400" />
                  Stop Loss Distance
                </div>
                <p className="text-xl font-bold text-red-400">{slPips.toFixed(1)} pips</p>
                <p className="text-xs text-gray-500">${potentialLoss.toFixed(2)} risk</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Target className="h-3 w-3 text-emerald-400" />
                  Take Profit Distance
                </div>
                <p className="text-xl font-bold text-emerald-400">{tpPips.toFixed(1)} pips</p>
                <p className="text-xs text-gray-500">${potentialProfit.toFixed(2)} profit</p>
              </div>
            </div>

            {/* R:R Ratio */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Risk : Reward Ratio</span>
                <span className={`text-2xl font-bold ${rrRatio >= 2 ? 'text-emerald-400' : rrRatio >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                  1 : {rrRatio.toFixed(1)}
                </span>
              </div>
              {rrRatio < 1.5 && (
                <p className="text-xs text-yellow-400 mt-2">
                  ⚠️ Consider a higher R:R ratio (minimum 1:1.5 recommended)
                </p>
              )}
            </div>

            {/* Pip Value */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Pip Value (1 lot)</span>
                <span className="text-lg font-mono text-white">${pipValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
