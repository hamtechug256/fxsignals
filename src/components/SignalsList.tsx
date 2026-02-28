'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Signal {
  id: string;
  pair: string;
  type: string;
  entryPrice: number;
  takeProfit1: number;
  takeProfit2: number | null;
  stopLoss: number;
  analysis: string | null;
  status: string;
  result: string | null;
  pips: number | null;
  createdAt: string;
}

export function SignalsList() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/signals?limit=5');
      if (response.ok) {
        const data = await response.json();
        setSignals(data.signals);
      }
    } catch (error) {
      console.error('Failed to fetch signals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  return (
    <section id="signals" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Live Trading Signals</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Real-time signals with ICT-based analysis</p>
        </div>

        <div className="flex justify-end mb-6">
          <Button variant="outline" size="sm" onClick={fetchSignals} className="border-gray-700 text-gray-300">
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No signals available. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-4 max-w-3xl mx-auto">
            {signals.map((signal) => (
              <Card key={signal.id} className="bg-gray-900/50 border-gray-800 hover:border-emerald-500/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${signal.type === 'BUY' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        {signal.type === 'BUY' ? (
                          <TrendingUp className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{signal.pair}</h3>
                        <Badge variant="outline" className={signal.type === 'BUY' ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}>
                          {signal.type}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      signal.status === 'ACTIVE' ? 'border-yellow-500 text-yellow-500' :
                      signal.status.includes('TP') ? 'border-emerald-500 text-emerald-500' :
                      'border-red-500 text-red-500'
                    }>
                      {signal.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Entry</p>
                      <p className="text-white font-semibold">{signal.entryPrice.toFixed(5)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">TP1 / TP2</p>
                      <p className="text-emerald-400 font-semibold">
                        {signal.takeProfit1.toFixed(5)}
                        {signal.takeProfit2 && ` / ${signal.takeProfit2.toFixed(5)}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stop Loss</p>
                      <p className="text-red-400 font-semibold">{signal.stopLoss.toFixed(5)}</p>
                    </div>
                  </div>

                  {signal.analysis && (
                    <p className="text-gray-400 text-sm mt-4 border-t border-gray-800 pt-4">{signal.analysis}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
