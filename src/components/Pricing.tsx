'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Star } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with free signals',
    features: [
      '2-3 signals per week',
      'Basic pair analysis',
      'Telegram delivery',
      'Community access',
      'Delayed signals (24h)',
    ],
    notIncluded: [
      'Real-time alerts',
      'Detailed analysis',
      'Priority support',
    ],
    cta: 'Join Free',
    ctaLink: 'https://t.me/hamcodz',
    popular: false,
    gradient: false,
  },
  {
    name: 'Premium',
    price: '$29',
    period: '/month',
    description: 'Perfect for active traders',
    features: [
      '10-15 signals per week',
      'All major & cross pairs',
      'Real-time Telegram alerts',
      'Detailed ICT analysis',
      'Entry, TP1, TP2, SL levels',
      'Trade management updates',
      'Email support',
    ],
    notIncluded: [
      'VIP exclusive pairs',
      '1-on-1 mentoring',
    ],
    cta: 'Get Premium',
    ctaLink: 'https://t.me/hamcodz',
    popular: true,
    gradient: true,
  },
  {
    name: 'VIP',
    price: '$79',
    period: '/month',
    description: 'For serious professionals',
    features: [
      '15-25 signals per week',
      'All pairs + exotic pairs',
      'Instant Telegram alerts',
      'Full ICT breakdown',
      'Live trade commentary',
      'Weekly market outlook',
      'Priority support',
      '1-on-1 monthly session',
      'Exclusive VIP group',
    ],
    notIncluded: [],
    cta: 'Go VIP',
    ctaLink: 'https://t.me/hamcodz',
    popular: false,
    gradient: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-900/10 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-4">
            <Star className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your trading style. Cancel anytime.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative bg-white/5 border-white/10 transition-all duration-300 ${
                plan.popular
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-105'
                  : 'hover:border-emerald-500/30'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-black border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className={`text-4xl font-bold ${plan.gradient ? 'text-emerald-400' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 opacity-50">
                      <Check className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-500 line-through">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:from-emerald-400 hover:to-emerald-500'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                  asChild
                >
                  <a
                    href={plan.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {plan.cta}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-400">
            🛡️ 7-day money-back guarantee on all paid plans. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
}
