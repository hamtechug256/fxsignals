'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Send, Sparkles } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/50 via-emerald-800/30 to-emerald-900/50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Start Trading Today</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Level Up Your
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              Trading Journey?
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
            Install this app on your phone and get instant push notifications for every trading signal.
            No Telegram needed - works directly in your browser!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:from-emerald-400 hover:to-emerald-500 h-14 px-8 text-base font-semibold"
              onClick={() => {
                // Scroll to subscription
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Send className="mr-2 h-5 w-5" />
              Subscribe for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 h-14 px-8 text-base"
              onClick={() => {
                document.getElementById('signals')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Live Signals
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Install as app on phone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Push notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>No credit card required</span>
            </div>
          </div>
          
          {/* PWA Hint */}
          <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10 max-w-md mx-auto">
            <p className="text-xs text-gray-400">
              💡 <span className="text-emerald-400">Pro Tip:</span> On mobile, tap "Add to Home Screen" in your browser menu to install this as a native app!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
