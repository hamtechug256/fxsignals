'use client';

import { Bell, Smartphone, TrendingUp, Shield, Zap, Clock } from 'lucide-react';

export function Features() {
  const features = [
    { icon: TrendingUp, title: 'ICT-Based Analysis', description: 'Signals based on Order Blocks, Fair Value Gaps, and Liquidity concepts' },
    { icon: Bell, title: 'Push Notifications', description: 'Instant alerts on your phone when new signals are posted' },
    { icon: Smartphone, title: 'Install as App', description: 'Add to home screen for quick access and better experience' },
    { icon: Zap, title: 'Real-Time Updates', description: 'Signals are generated hourly with fresh market analysis' },
    { icon: Shield, title: 'Verified Results', description: 'All past signals are tracked with transparent performance stats' },
    { icon: Clock, title: '24/7 Coverage', description: 'Signals for major forex pairs and gold around the clock' },
  ];

  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Choose FXSignals?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Professional trading signals with modern features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
