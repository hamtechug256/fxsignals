'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Get started with basic signals',
    features: ['3 signals per day', 'Email alerts', 'Limited signal history'],
    buttonText: 'Get Started',
    popular: false,
  },
  {
    name: 'Premium',
    price: 29,
    description: 'For serious traders',
    features: ['Unlimited signals', 'Push notifications', 'Full signal history', 'Priority support', 'Market analysis'],
    buttonText: 'Subscribe',
    popular: true,
  },
  {
    name: 'VIP',
    price: 99,
    description: 'For professional traders',
    features: ['Everything in Premium', 'Early signals access', 'Direct WhatsApp support', 'Weekly analysis calls', 'Custom analysis requests'],
    buttonText: 'Subscribe',
    popular: false,
  },
];

export function SubscriptionManager() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {plans.map((plan, index) => (
        <Card key={index} className={`relative bg-gray-900/50 border-gray-800 ${plan.popular ? 'border-emerald-500/50 ring-1 ring-emerald-500/50' : ''}`}>
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-emerald-500 text-black">Most Popular</Badge>
            </div>
          )}
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold text-white">${plan.price}</span>
              <span className="text-gray-400">/month</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">{plan.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className={`w-full ${plan.popular ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:from-emerald-400 hover:to-emerald-500' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            >
              {plan.name === 'Free' ? 'Get Started' : <><Crown className="h-4 w-4 mr-2" />Subscribe</>}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
