'use client';

import { useEffect, useState } from 'react';
import { SignalCard } from './SignalCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Signal } from '@/lib/signals';
import { TrendingUp, RefreshCw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SignalsList() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/signals/latest');
      if (!response.ok) throw new Error('Failed to fetch signals');
      const data = await response.json();
      setSignals(data);
      setError(null);
    } catch (err) {
      setError('Failed to load signals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  return (
    <section id="signals" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Live Signals</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Latest Trading Signals
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Check out our most recent forex signals with precise entry, stop loss, and take profit levels.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
                <CardHeader className="h-24" />
                <CardContent className="h-48" />
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="bg-red-500/10 border-red-500/20 max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={fetchSignals}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Signals Grid */}
        {!loading && !error && signals.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && signals.length === 0 && (
          <Card className="bg-white/5 border-white/10 max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No active signals at the moment</p>
              <p className="text-sm text-gray-500">
                New signals are posted regularly. Join our Telegram for instant notifications.
              </p>
            </CardContent>
          </Card>
        )}

        {/* View All CTA */}
        {signals.length > 0 && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              asChild
            >
              <a
                href="https://t.me/hamcodz"
                target="_blank"
                rel="noopener noreferrer"
              >
                View All Signals on Telegram
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
