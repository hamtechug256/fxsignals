'use client';

import { useEffect, useState } from 'react';
import { SignalCardPro } from './SignalCardPro';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, Filter } from 'lucide-react';

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

export function SignalsListPro() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [pairFilter, setPairFilter] = useState('all');

  const fetchSignals = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const response = await fetch('/api/signals?limit=20');
      if (response.ok) {
        const data = await response.json();
        setSignals(data.signals || []);
      }
    } catch (error) {
      console.error('Failed to fetch signals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchSignals(), 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter signals
  const filteredSignals = signals.filter(signal => {
    if (filter === 'active' && signal.status !== 'ACTIVE') return false;
    if (filter === 'closed' && signal.status === 'ACTIVE') return false;
    if (filter === 'wins' && signal.result !== 'WIN') return false;
    if (pairFilter !== 'all' && signal.pair !== pairFilter) return false;
    return true;
  });

  // Get unique pairs for filter
  const uniquePairs = [...new Set(signals.map(s => s.pair))];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <div className="flex items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Tabs value={filter} onValueChange={setFilter} className="w-auto">
              <TabsList className="bg-gray-800 border border-gray-700">
                <TabsTrigger value="all" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                  All
                </TabsTrigger>
                <TabsTrigger value="active" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                  Active
                </TabsTrigger>
                <TabsTrigger value="closed" className="data-[state=active]:bg-gray-500/20 data-[state=active]:text-gray-400">
                  Closed
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Pair Filter */}
          <Select value={pairFilter} onValueChange={setPairFilter}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Pair" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Pairs</SelectItem>
              {uniquePairs.map(pair => (
                <SelectItem key={pair} value={pair}>{pair}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchSignals(true)}
          disabled={refreshing}
          className="border-gray-700 text-gray-300 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/30 rounded-lg border border-gray-800/50">
        <div className="flex items-center gap-2 text-gray-400">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span className="text-sm">
            {filteredSignals.length} signal{filteredSignals.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-blue-400">
            {filteredSignals.filter(s => s.status === 'ACTIVE').length} active
          </span>
          <span className="text-emerald-400">
            {filteredSignals.filter(s => s.result === 'WIN').length} wins
          </span>
        </div>
      </div>

      {/* Signals List */}
      {filteredSignals.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
          <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No signals found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSignals.map((signal) => (
            <SignalCardPro key={signal.id} signal={signal} />
          ))}
        </div>
      )}
    </div>
  );
}
