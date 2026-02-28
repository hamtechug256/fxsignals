'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check, X, Crown, Zap, Star, ArrowRight, Shield, Clock,
  Bell, TrendingUp, Sparkles, Gem, Rocket, ChevronDown, ChevronUp
} from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started with forex trading',
    gradient: 'from-gray-500 to-gray-600',
    icon: Sparkles,
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
    cta: 'Get Started Free',
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    description: 'Best for active traders seeking consistent profits',
    gradient: 'from-emerald-500 to-teal-500',
    icon: Zap,
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
    cta: 'Start Premium',
    popular: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 79,
    description: 'For serious professionals who want the edge',
    gradient: 'from-yellow-500 to-orange-500',
    icon: Crown,
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
    location: 'London, UK',
    content: 'The signals are incredibly accurate. I\'ve been profitable for 3 straight months now! The ICT analysis really helps understand the market structure.',
    rating: 5,
    profit: '+$4,250',
  },
  {
    name: 'Sarah T.',
    role: 'Part-time Trader',
    location: 'New York, USA',
    content: 'The ICT analysis helped me understand WHY trades work. Game changer for my trading journey. Highly recommend the Premium plan.',
    rating: 5,
    profit: '+$2,180',
  },
  {
    name: 'James W.',
    role: 'Day Trader',
    location: 'Sydney, Australia',
    content: 'VIP is worth every penny. The weekly calls alone are worth the subscription. The mentorship has transformed my trading.',
    rating: 5,
    profit: '+$8,420',
  },
];

const faqs = [
  {
    q: 'How accurate are your signals?',
    a: 'Our signals maintain a 67%+ win rate based on verified performance data. We use ICT concepts including Order Blocks, Fair Value Gaps, and Liquidity analysis to identify high-probability setups.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, you can cancel your subscription at any time. No questions asked, no hidden fees. Your access will continue until the end of your billing period.',
  },
  {
    q: 'How are signals delivered?',
    a: 'Signals are delivered via push notification to your phone (PWA), email, and our private Telegram channel for premium members. Real-time alerts ensure you never miss a trade.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 7-day money-back guarantee. If you\'re not satisfied with our service, contact our support team for a full refund, no questions asked.',
  },
];

// Trust badge component
function TrustBadge({ icon: Icon, label, sublabel, delay = 0 }: { icon: any; label: string; sublabel: string; delay?: number }) {
  return (
    <div 
      className="group flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5 hover:border-white/10 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-2.5 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
        <Icon className="h-5 w-5 text-emerald-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500">{sublabel}</p>
      </div>
    </div>
  );
}

// Testimonial card
function TestimonialCard({ t, delay = 0 }: { t: typeof testimonials[0]; delay?: number }) {
  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 hover:border-white/10 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="pt-6 relative z-10">
        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {[...Array(t.rating)].map((_, j) => (
            <Star key={j} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
        
        {/* Content */}
        <p className="text-gray-300 mb-6 leading-relaxed">"{t.content}"</p>
        
        {/* Author */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
              {t.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{t.name}</p>
              <p className="text-xs text-gray-500">{t.role}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-400">{t.profit}</p>
            <p className="text-xs text-gray-500">This month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
      <div className="text-center max-w-2xl mx-auto animate-fade-in-up">
        <Badge className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20 mb-4 px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Simple Pricing
        </Badge>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Choose Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Trading Edge</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Start free and upgrade when you need more signals and features
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
          >
            Monthly
          </button>
          <div 
            className="relative w-16 h-8 rounded-full bg-gray-800 cursor-pointer transition-colors hover:bg-gray-700"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 shadow-lg ${billingCycle === 'yearly' ? 'right-1' : 'left-1'}`} />
          </div>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`text-sm font-medium flex items-center gap-2 transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
          >
            Yearly
            <Badge className="bg-emerald-500/20 text-emerald-400 text-xs border-0">Save 17%</Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card
            key={plan.id}
            className={`group relative overflow-hidden transition-all duration-500 animate-fade-in-up ${
              plan.popular
                ? 'bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 scale-[1.02] z-10 shadow-2xl shadow-emerald-500/10'
                : 'bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 hover:border-white/10'
            }`}
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            )}
            {plan.popular && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold border-0 shadow-lg">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  MOST POPULAR
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
                  <plan.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <CardDescription className="text-gray-400">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">${getPrice(plan.price)}</span>
                  <span className="text-gray-500">/{billingCycle === 'yearly' ? 'mo' : 'month'}</span>
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
                      <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <X className="h-3 w-3 text-gray-600" />
                      </div>
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full rounded-xl transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/25'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
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
        <TrustBadge icon={Shield} label="Secure Payments" sublabel="256-bit encryption" delay={400} />
        <TrustBadge icon={Clock} label="24/7 Support" sublabel="Always available" delay={500} />
        <TrustBadge icon={Bell} label="Instant Alerts" sublabel="Never miss a trade" delay={600} />
        <TrustBadge icon={TrendingUp} label="67%+ Win Rate" sublabel="Verified results" delay={700} />
      </div>

      {/* Testimonials */}
      <div className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">What Traders Say</h2>
          <p className="text-gray-400">Join thousands of profitable traders</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} t={t} delay={900 + i * 100} />
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-400">Everything you need to know</p>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5 overflow-hidden hover:border-white/10 transition-colors"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-white">{faq.q}</span>
                {expandedFaq === i ? (
                  <ChevronUp className="h-5 w-5 text-emerald-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
