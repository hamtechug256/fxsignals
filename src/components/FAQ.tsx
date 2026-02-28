'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How do I receive the signals?',
    answer: 'All signals are delivered via Telegram. Once you subscribe, you\'ll be added to our private channel where signals are posted in real-time with all the details you need: entry price, stop loss, take profit levels, and analysis.',
  },
  {
    question: 'What pairs do you trade?',
    answer: 'We primarily focus on major forex pairs (EUR/USD, GBP/USD, USD/JPY, etc.) and cross pairs. VIP members also get access to exotic pairs and gold (XAU/USD) signals.',
  },
  {
    question: 'How many signals do you send per day?',
    answer: 'It depends on market conditions. On average, we send 2-4 high-quality signals per day. We focus on quality over quantity - we only take trades that meet our strict criteria.',
  },
  {
    question: 'What is your win rate?',
    answer: 'Our verified win rate is consistently above 67%. We track all our signals transparently, and you can verify our performance on our Telegram channel.',
  },
  {
    question: 'How much capital do I need to start?',
    answer: 'You can start with as little as $100-500 with proper risk management. We recommend risking 1-2% per trade and never over-leveraging. Our signals include proper position sizing guidance.',
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes! We have a free Telegram channel where we post delayed signals (24h delay). This gives you a chance to see our analysis quality before subscribing to a paid plan.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Absolutely. You can cancel your subscription at any time. Your access will continue until the end of your billing period. We also offer a 7-day money-back guarantee.',
  },
  {
    question: 'What trading style do you use?',
    answer: 'Our signals are based on ICT (Inner Circle Trader) concepts including order blocks, fair value gaps, liquidity sweeps, and market structure. We focus on swing trades with 1-3 day holding periods.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-4">
            <HelpCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Got questions? We've got answers. If you can't find what you're looking for, reach out on Telegram.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Card className="max-w-3xl mx-auto bg-white/5 border-white/10">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-white/10"
                >
                  <AccordionTrigger className="text-left text-white hover:text-emerald-400 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
