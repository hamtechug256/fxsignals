'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  Bell, 
  BarChart3, 
  Shield, 
  Zap, 
  Clock,
  Target,
  Users
} from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'ICT Concepts Based',
    description: 'Signals based on Inner Circle Trader concepts including order blocks, fair value gaps, and liquidity sweeps.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  {
    icon: Bell,
    title: 'Real-Time Telegram Delivery',
    description: 'Instant signal delivery to your Telegram with detailed analysis and clear entry/exit levels.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  {
    icon: BarChart3,
    title: 'Transparent Track Record',
    description: 'Every signal is tracked and verified. See our complete performance history with no hidden losses.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Clear stop loss levels on every trade. Proper risk-to-reward ratios to protect your capital.',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  {
    icon: Zap,
    title: 'Quick Analysis',
    description: 'Concise market analysis explaining the reasoning behind each trade setup.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  {
    icon: Clock,
    title: 'Timely Updates',
    description: 'Get updates on signal progress, targets hit, and trade management suggestions.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  {
    icon: Target,
    title: 'Precise Entry Levels',
    description: 'Exact entry prices with multiple take profit targets for optimal trade management.',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Join a community of like-minded traders. Share ideas and learn from each other.',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-4">
            <Zap className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why Choose Our Signals?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We provide professional-grade trading signals with all the tools you need to succeed.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
