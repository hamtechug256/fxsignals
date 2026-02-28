'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I install the app on my phone?',
    answer: 'Visit the website in your mobile browser (Chrome/Safari). You will see a prompt to "Add to Home Screen" or "Install App". Tap it to install the app on your phone for quick access and push notifications.',
  },
  {
    question: 'How are signals generated?',
    answer: 'Our signals are based on ICT (Inner Circle Trader) concepts including Order Blocks, Fair Value Gaps, and Liquidity Sweeps. We combine these with technical indicators like EMA and RSI for confirmation.',
  },
  {
    question: 'What currency pairs do you cover?',
    answer: 'We provide signals for major forex pairs including EUR/USD, GBP/USD, USD/JPY, GBP/JPY, and XAU/USD (Gold). More pairs may be added based on demand.',
  },
  {
    question: 'How do push notifications work?',
    answer: 'Once you install the app and enable notifications, you will receive instant alerts when new signals are posted. You can customize notification settings in your dashboard.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel your subscription at any time. You will continue to have access until the end of your billing period. No questions asked.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Common questions about FXSignals</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-gray-900/50 border border-gray-800 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-emerald-400 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
