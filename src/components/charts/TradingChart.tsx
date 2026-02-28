'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ZoomIn, ZoomOut, RotateCcw, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { getMarketStatus, generateCandleData } from '@/lib/forex-api';

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

export function TradingChart({ pair, signal }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [timeframe, setTimeframe] = useState('H1');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketStatus, setMarketStatus] = useState(getMarketStatus());

  // Update market status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketStatus(getMarketStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const initChart = useCallback(async () => {
    if (!chartContainerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Dynamic import of lightweight-charts
      const LightweightCharts = await import('lightweight-charts');
      
      const createChart = LightweightCharts.createChart;
      
      if (!createChart) {
        throw new Error('Chart library not loaded properly');
      }

      // Clear existing chart
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        chartRef.current = null;
      }

      // Generate candle data
      const candleData = generateCandleData(pair, timeframe, 150);

      if (candleData.length === 0) {
        throw new Error('No chart data available');
      }

      // Create chart
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: 'transparent' },
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
        crosshair: {
          mode: 1,
        },
      });

      // Add candlestick series - handle both v4 and v5 API
      let candlestickSeries: any;
      
      try {
        // Try v5 API first
        candlestickSeries = chart.addSeries({
          type: 'Candlestick',
          upColor: '#10b981',
          downColor: '#ef4444',
          borderUpColor: '#10b981',
          borderDownColor: '#ef4444',
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });
      } catch (e) {
        // Fall back to v4 API
        candlestickSeries = chart.addCandlestickSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          borderUpColor: '#10b981',
          borderDownColor: '#ef4444',
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });
      }

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

    } catch (err: any) {
      console.error('Chart error:', err);
      setError(err.message || 'Failed to load chart');
      setIsLoading(false);
    }
  }, [pair, timeframe, signal]);

  useEffect(() => {
    initChart();

    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {}
        chartRef.current = null;
      }
    };
  }, [initChart]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return (
    <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5 rounded-xl overflow-hidden">
      {/* Chart Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/5">
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
          
          {/* Market Status Badge */}
          <div className={`px-2 py-0.5 rounded text-xs font-medium ${
            marketStatus.isOpen 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {marketStatus.isOpen ? marketStatus.session : 'Closed'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-16 h-8 bg-white/5 border-white/10 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10">
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
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/5"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/5"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChart}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/5"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Market Closed Warning */}
      {!marketStatus.isOpen && (
        <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20">
          <p className="text-xs text-yellow-400 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5" />
            {marketStatus.message}
          </p>
        </div>
      )}

      {/* Chart Container */}
      <div ref={chartContainerRef} className="relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/50 z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="text-sm text-gray-400">Loading chart...</span>
            </div>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2 text-center p-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={initChart}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      {signal && (
        <div className="flex items-center gap-4 p-3 border-t border-white/5 bg-white/[0.02] flex-wrap">
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
