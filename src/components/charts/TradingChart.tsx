'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ZoomIn, ZoomOut, RotateCcw, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

// Dynamic import type
type IChartApi = any;
type ISeriesApi = any;

interface TradingChartProps {
  pair: string;
  signal?: {
    entryPrice: number;
    stopLoss: number;
    takeProfit1: number;
    takeProfit2?: number;
    takeProfit3?: number;
    type: 'BUY' | 'SELL';
  };
}

const TIMEFRAMES = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];

// Generate realistic candle data
function generateCandleData(pair: string, timeframe: string = 'H1', count: number = 100) {
  const basePrices: Record<string, number> = {
    'EUR/USD': 1.0850,
    'GBP/USD': 1.2650,
    'USD/JPY': 149.50,
    'USD/CHF': 0.8850,
    'AUD/USD': 0.6550,
    'USD/CAD': 1.3620,
    'XAU/USD': 2325.50,
    'GBP/JPY': 189.10,
    'EUR/GBP': 0.8580,
  };

  const basePrice = basePrices[pair] || 1.0000;
  const isJpyPair = pair.includes('JPY');
  const isXau = pair.includes('XAU');
  const volatility = isXau ? 0.003 : isJpyPair ? 0.002 : 0.001;
  
  const candles = [];
  let currentPrice = basePrice;
  const now = Math.floor(Date.now() / 1000);
  
  const tfMultipliers: Record<string, number> = {
    'M1': 60, 'M5': 300, 'M15': 900, 'H1': 3600, 'H4': 14400, 'D1': 86400
  };
  
  const interval = tfMultipliers[timeframe] || 3600;
  
  for (let i = count - 1; i >= 0; i--) {
    const open = currentPrice;
    const change = (Math.random() - 0.5) * volatility * basePrice * 2;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * basePrice;
    const low = Math.min(open, close) - Math.random() * volatility * basePrice;
    
    candles.push({
      time: now - (i * interval),
      open: parseFloat(open.toFixed(isJpyPair || isXau ? 3 : 5)),
      high: parseFloat(high.toFixed(isJpyPair || isXau ? 3 : 5)),
      low: parseFloat(low.toFixed(isJpyPair || isXau ? 3 : 5)),
      close: parseFloat(close.toFixed(isJpyPair || isXau ? 3 : 5)),
    });
    
    currentPrice = close;
  }
  
  return candles;
}

export function TradingChart({ pair, signal }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [timeframe, setTimeframe] = useState('H1');
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Only render on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !chartContainerRef.current) return;

    let mounted = true;

    // Dynamically import lightweight-charts only on client
    import('lightweight-charts').then(({ createChart, ColorType }) => {
      if (!mounted || !chartContainerRef.current) return;

      // Clear existing chart
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }

      const candleData = generateCandleData(pair, timeframe, 150);

      // Create chart
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#9ca3af',
        },
        grid: {
          vertLines: { color: 'rgba(75, 85, 99, 0.2)' },
          horzLines: { color: 'rgba(75, 85, 99, 0.2)' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
        rightPriceScale: {
          borderColor: 'rgba(75, 85, 99, 0.3)',
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
          borderColor: 'rgba(75, 85, 99, 0.3)',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      candlestickSeries.setData(candleData);

      // Add signal levels if provided
      if (signal) {
        candlestickSeries.createPriceLine({
          price: signal.entryPrice,
          color: '#3b82f6',
          lineWidth: 2,
          title: 'Entry',
        });

        candlestickSeries.createPriceLine({
          price: signal.stopLoss,
          color: '#ef4444',
          lineWidth: 2,
          lineStyle: 2,
          title: 'SL',
        });

        candlestickSeries.createPriceLine({
          price: signal.takeProfit1,
          color: '#10b981',
          lineWidth: 2,
          lineStyle: 2,
          title: 'TP1',
        });

        if (signal.takeProfit2) {
          candlestickSeries.createPriceLine({
            price: signal.takeProfit2,
            color: '#22c55e',
            lineWidth: 1,
            lineStyle: 2,
            title: 'TP2',
          });
        }

        if (signal.takeProfit3) {
          candlestickSeries.createPriceLine({
            price: signal.takeProfit3,
            color: '#059669',
            lineWidth: 1,
            lineStyle: 2,
            title: 'TP3',
          });
        }
      }

      chart.timeScale().fitContent();
      chartRef.current = chart;
      setIsLoading(false);

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);
    }).catch((err) => {
      console.error('Failed to load chart:', err);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [isClient, pair, timeframe, signal]);

  const zoomIn = () => {
    if (chartRef.current) {
      const visibleRange = chartRef.current.timeScale().getVisibleLogicalRange();
      if (visibleRange) {
        const center = (visibleRange.from + visibleRange.to) / 2;
        const range = (visibleRange.to - visibleRange.from) / 2;
        chartRef.current.timeScale().setVisibleLogicalRange({
          from: center - range * 0.5,
          to: center + range * 0.5,
        });
      }
    }
  };

  const zoomOut = () => {
    if (chartRef.current) {
      const visibleRange = chartRef.current.timeScale().getVisibleLogicalRange();
      if (visibleRange) {
        const center = (visibleRange.from + visibleRange.to) / 2;
        const range = (visibleRange.to - visibleRange.from) / 2;
        chartRef.current.timeScale().setVisibleLogicalRange({
          from: center - range * 1.5,
          to: center + range * 1.5,
        });
      }
    }
  };

  const resetChart = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  // Don't render on server
  if (!isClient) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      {/* Chart Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-white">{pair}</h3>
          {signal && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
              signal.type === 'BUY' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {signal.type === 'BUY' ? (
                <>
                  <TrendingUp className="h-3 w-3" />
                  LONG
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3" />
                  SHORT
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-16 h-8 bg-gray-800 border-gray-700 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {TIMEFRAMES.map(tf => (
                <SelectItem key={tf} value={tf} className="text-xs">
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChart}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} className="relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        )}
      </div>

      {/* Chart Legend */}
      {signal && (
        <div className="flex items-center gap-4 p-3 border-t border-gray-800 bg-gray-900/30 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-blue-500" />
            <span className="text-xs text-gray-400">Entry: <span className="text-white font-mono">{signal.entryPrice}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-red-500" />
            <span className="text-xs text-gray-400">SL: <span className="text-red-400 font-mono">{signal.stopLoss}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-emerald-500" />
            <span className="text-xs text-gray-400">TP1: <span className="text-emerald-400 font-mono">{signal.takeProfit1}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
