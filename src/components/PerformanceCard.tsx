'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, TrendingDown, Zap, Loader2 } from 'lucide-react';

interface Performance {
  totalSignals: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  avgPips: number;
}

export function PerformanceCard() {
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await fetch('/api/performance');
        if (response.ok) {
          setPerformance(await response.json());
        }
      } catch (error) {
        console.error('Failed to fetch performance:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (isLoading) {
    return (
      <section id="performance" className="py-20 relative">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </section>
    );
  }

  return (
    <section id="performance" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-900/5 to-transparent" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Performance Statistics</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Track record of our trading signals</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-center text-2xl">Signal Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-400 mb-2">{performance?.winRate.toFixed(1) || 0}%</div>
                <p className="text-gray-400">Win Rate</p>
                <Progress value={performance?.winRate || 0} className="h-3 mt-4 [&>div]:bg-emerald-500" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Target, label: 'Total Signals', value: performance?.totalSignals || 0, color: 'text-white' },
                  { icon: TrendingUp, label: 'Wins', value: performance?.winCount || 0, color: 'text-emerald-400' },
                  { icon: TrendingDown, label: 'Losses', value: performance?.lossCount || 0, color: 'text-red-400' },
                  { icon: Zap, label: 'Avg Pips', value: performance?.avgPips.toFixed(1) || 0, color: 'text-yellow-400' },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
