'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Target, Award, BarChart3 } from 'lucide-react';

interface PerformanceData {
  totalSignals: number;
  winCount: number;
  lossCount: number;
  pendingCount: number;
  winRate: number;
  avgPips: number;
}

interface PerformanceCardProps {
  initialData?: PerformanceData;
}

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const hasStartedRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  const startAnimation = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [startAnimation]);

  return { count, ref };
}

export function PerformanceCard({ initialData }: PerformanceCardProps) {
  const [data, setData] = useState<PerformanceData>(
    initialData || {
      totalSignals: 0,
      winCount: 0,
      lossCount: 0,
      pendingCount: 0,
      winRate: 67,
      avgPips: 45,
    }
  );
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    const fetchPerformance = async () => {
      try {
        const response = await fetch('/api/performance');
        if (response.ok) {
          const result = await response.json();
          setData({
            totalSignals: result.totalSignals || 0,
            winCount: result.winCount || 0,
            lossCount: result.lossCount || 0,
            pendingCount: result.pendingCount || 0,
            winRate: result.winRate || 67,
            avgPips: result.avgPips || 45,
          });
        }
      } catch (error) {
        console.error('Failed to fetch performance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [initialData]);

  const winRateCounter = useAnimatedCounter(Math.round(data.winRate));
  const totalSignalsCounter = useAnimatedCounter(data.totalSignals);
  const avgPipsCounter = useAnimatedCounter(Math.round(data.avgPips));

  const stats = [
    {
      label: 'Win Rate',
      value: winRateCounter.count,
      suffix: '%',
      icon: Target,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      ref: winRateCounter.ref,
    },
    {
      label: 'Total Signals',
      value: totalSignalsCounter.count,
      suffix: '+',
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      ref: totalSignalsCounter.ref,
    },
    {
      label: 'Avg. Pips',
      value: avgPipsCounter.count,
      suffix: '',
      icon: BarChart3,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      ref: avgPipsCounter.ref,
    },
  ];

  return (
    <section id="performance" className="py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-900/10 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-4">
            <Award className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Performance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Transparent Track Record
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We believe in full transparency. All our signals are tracked and verified.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              ref={stat.ref as React.RefObject<HTMLDivElement>}
              className="group bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all duration-300"
            >
              <CardContent className="p-8 text-center">
                <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {stat.value}
                  <span className={stat.color}>{stat.suffix}</span>
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Win/Loss Breakdown */}
        <Card className="mt-8 max-w-4xl mx-auto bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-400 mb-1">Win/Loss Ratio</p>
                <p className="text-2xl font-bold text-white">
                  <span className="text-emerald-400">{data.winCount}</span>
                  <span className="text-gray-600 mx-2">/</span>
                  <span className="text-red-400">{data.lossCount}</span>
                </p>
              </div>
              <div className="h-px w-full sm:h-12 sm:w-px bg-white/10" />
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-400 mb-1">Pending Signals</p>
                <p className="text-2xl font-bold text-blue-400">{data.pendingCount}</p>
              </div>
              <div className="h-px w-full sm:h-12 sm:w-px bg-white/10" />
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-400 mb-1">Total Trades</p>
                <p className="text-2xl font-bold text-white">{data.totalSignals}</p>
              </div>
            </div>
            
            {/* Win Rate Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-emerald-400">Wins</span>
                <span className="text-gray-400">{data.winRate.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${data.winRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
