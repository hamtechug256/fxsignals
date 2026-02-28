'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ForexPrice {
  pair: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  timestamp: string;
}

export function PriceTicker() {
  const [prices, setPrices] = useState<ForexPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch('/api/forex/live');
      if (!response.ok) throw new Error('Failed to fetch prices');
      const data = await response.json();
      setPrices(data.prices || []);
      setError(null);
    } catch (err) {
      setError('Unable to load prices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const formatPrice = (pair: string, price: number) => {
    if (pair.includes('XAU')) return price.toFixed(2);
    if (pair.includes('JPY')) return price.toFixed(3);
    return price.toFixed(5);
  };

  if (loading) {
    return (
      <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center px-4">
        <div className="flex gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-14 bg-gray-800 rounded" />
              <div className="h-4 w-20 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center px-4">
        <span className="text-gray-500 text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="h-10 bg-gray-900 border-b border-gray-800 overflow-hidden relative">
      <div className="ticker-scroll flex gap-2 h-full items-center px-4">
        {[...prices, ...prices].map((price, index) => {
          const isPositive = price.change >= 0;
          const color = isPositive ? 'text-emerald-400' : 'text-red-400';
          const bgColor = isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10';

          return (
            <div
              key={`${price.pair}-${index}`}
              className={`flex items-center gap-2 px-3 py-1 rounded-md ${bgColor} border border-gray-800/50 whitespace-nowrap text-sm`}
            >
              <span className="font-medium text-white">{price.pair}</span>
              <span className="font-mono text-gray-300">
                {formatPrice(price.pair, price.bid)}
              </span>
              <span className={`${color} text-xs font-medium`}>
                {isPositive ? '+' : ''}{price.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .ticker-scroll {
          animation: ticker-scroll 40s linear infinite;
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// Compact live price badge for signal cards
export function LivePriceBadge({ pair }: { pair: string }) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchPrice = async () => {
      try {
        const response = await fetch(`/api/forex/live?pair=${pair}`);
        if (response.ok && mounted) {
          const data = await response.json();
          setPrice(data.bid);
        }
      } catch {
        // Silent error
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 15000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pair]);

  if (!price) return null;

  const formatPrice = (pair: string, price: number) => {
    if (pair.includes('XAU')) return price.toFixed(2);
    if (pair.includes('JPY')) return price.toFixed(3);
    return price.toFixed(5);
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-800/50 rounded-md">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span className="font-mono text-xs text-gray-300">
        {formatPrice(pair, price)}
      </span>
    </div>
  );
}
