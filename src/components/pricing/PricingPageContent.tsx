'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check, X, Crown, Zap, Star, ArrowRight, Shield, Clock,
  Bell, TrendingUp, Users, MessageCircle, Video, Sparkles
} from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    highlight: false,
    features: [
      { text: '3 signals per day', included: true },
      { text: 'Basic entry alerts', included: true },
      { text: 'Community access', included: true },
      { text: 'Email support', included: true },
      { text: 'Push notifications', included: false },
      { text: 'Real-time signals', included: false },
      { text: 'Private Telegram', included: false },
      { text: 'Weekly analysis', included: false },
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    description: 'Best for active traders',
    highlight: true,
    features: [
      { text: 'Unlimited signals', included: true },
      { text: 'Real-time push alerts', included: true },
      { text: 'All currency pairs', included: true },
      { text: 'Entry, SL, TP levels', included: true },
      { text: 'ICT analysis included', included: true },
      { text: 'Priority support', included: true },
      { text: 'Private Telegram', included: false },
      { text: 'Weekly analysis', included: false },
    ],
    cta: 'Subscribe Now',
    popular: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 79,
    description: 'For serious professionals',
    highlight: false,
    features: [
      { text: 'Everything in Premium', included: true },
      { text: 'Early signal access', included: true },
      { text: 'Private Telegram group', included: true },
      { text: 'Weekly analysis calls', included: true },
      { text: '1-on-1 mentorship', included: true },
      { text: 'Custom analysis requests', included: true },
      { text: 'Trading psychology guide', included: true },
      { text: 'Lifetime updates', included: true },
    ],
    cta: 'Go VIP',
    popular: false,
  },
];

const testimonials = [
  {
    name: 'Michael K.',
    role: 'Forex Trader',
    image: null,
    content: 'The signals are incredibly accurate. I\'ve been profitable for 3 straight months now!',
    rating: 5,
  },
  {
    name: 'Sarah T.',
    role: 'Part-time Trader',
    image: null,
    content: 'The ICT analysis helped me understand WHY trades work. Game changer.',
    rating: 5,
  },
  {
    name: 'James W.',
    role: 'Day Trader',
    image: null,
    content: 'VIP is worth every penny. The weekly calls alone are worth the subscription.',
    rating: 5,
  },
];

const faqs = [
  {
    q: 'How accurate are your signals?',
    a: 'Our signals maintain a 67%+ win rate based on verified performance data. We use ICT concepts including Order Blocks, Fair Value Gaps, and Liquidity analysis.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, you can cancel your subscription at any time. No questions asked, no hidden fees.',
  },
  {
    q: 'How are signals delivered?',
    a: 'Signals are delivered via push notification to your phone, email, and our private Telegram channel for premium members.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 7-day money-back guarantee. If you\'re not satisfied, contact support for a full refund.',
  },
];

export function PricingPageContent() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const getPrice = (monthlyPrice: number) => {
    if (billingCycle === 'yearly') {
      return Math.round(monthlyPrice * 10); // ~17% discount
    }
    return monthlyPrice;
  };

  return (
    <div className="space-y-16 max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-4">
          Simple Pricing
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Choose Your Trading Edge
        </h1>
        <p className="text-gray-400">
          Start free and upgrade when you need more signals and features
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}
          >
            Monthly
          </button>
          <div className="relative">
            <div className="w-14 h-7 rounded-full bg-gray-700 cursor-pointer" onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}>
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-emerald-500 transition-all ${billingCycle === 'yearly' ? 'right-1' : 'left-1'}`} />
            </div>
          </div>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'} flex items-center gap-2`}
          >
            Yearly
            <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Save 17%</Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden ${
              plan.popular
                ? 'bg-gradient-to-b from-emerald-500/10 to-transparent border-emerald-500/30 scale-105 z-10'
                : 'bg-white/[0.02] border-white/5'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0">
                <div className="bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  POPULAR
                </div>
              </div>
            )}

            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                {plan.id === 'vip' && <Crown className="h-5 w-5 text-yellow-400" />}
                {plan.id === 'premium' && <Zap className="h-5 w-5 text-emerald-400" />}
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">${getPrice(plan.price)}</span>
                  <span className="text-gray-400">/{billingCycle === 'yearly' ? 'month' : 'month'}</span>
                </div>
                {billingCycle === 'yearly' && plan.price > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Billed ${getPrice(plan.price) * 12}/year
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <X className="h-3 w-3 text-gray-500" />
                      </div>
                    )}
                    <span className={feature.included ? 'text-gray-300' : 'text-gray-500'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full ${
                  plan.popular
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Shield, label: 'Secure Payments', sublabel: '256-bit encryption' },
          { icon: Clock, label: '24/7 Support', sublabel: 'Always available' },
          { icon: Bell, label: 'Instant Alerts', sublabel: 'Never miss a trade' },
          { icon: TrendingUp, label: '67%+ Win Rate', sublabel: 'Verified results' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <item.icon className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-gray-500">{item.sublabel}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div>
        <h2 className="text-2xl font-bold text-white text-center mb-8">What Traders Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} className="bg-white/[0.02] border-white/5">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-black font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-white">{faq.q}</span>
                <ArrowRight className={`h-4 w-4 text-gray-400 transition-transform ${expandedFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {expandedFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-gray-400 text-sm">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
