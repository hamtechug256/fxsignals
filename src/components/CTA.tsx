'use client';

import { Button } from '@/components/ui/button';
import { Send, Download } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-transparent" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Trading Smarter?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join thousands of traders receiving professional forex signals.
            Install the app for instant push notifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:from-emerald-400 hover:to-emerald-500 text-lg px-8" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              <Send className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-lg px-8">
              <Download className="mr-2 h-5 w-5" />
              Install App
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
