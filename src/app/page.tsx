import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { FAQ } from '@/components/FAQ';
import { CTA } from '@/components/CTA';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { PriceTicker } from '@/components/charts/PriceTicker';
import { MarketSessions } from '@/components/tools/MarketSessions';
import { RiskCalculator } from '@/components/tools/RiskCalculator';
import { EconomicCalendar } from '@/components/tools/EconomicCalendar';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { SignalsListPro } from '@/components/signals/SignalsListPro';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <Header />

      {/* Price Ticker - Below header */}
      <div className="fixed top-16 left-0 right-0 z-40">
        <PriceTicker />
      </div>

      {/* Main Content - Padding for fixed header + ticker */}
      <div className="pt-28">
        {/* Hero Section */}
        <Hero />

        {/* Market Sessions & Economic Calendar */}
        <section className="py-12 px-4 border-b border-gray-800">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MarketSessions />
            <EconomicCalendar />
          </div>
        </section>

        {/* Live Signals Section */}
        <section id="signals" className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Live Trading Signals
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Professional ICT-based signals with entry, stop loss, and multiple take profits.
                Updated in real-time with live price tracking.
              </p>
            </div>
            <SignalsListPro />
          </div>
        </section>

        {/* Risk Calculator */}
        <section id="calculator" className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Risk Management Calculator
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Calculate your position size, pip value, and potential profit/loss.
                Professional risk management at your fingertips.
              </p>
            </div>
            <RiskCalculator />
          </div>
        </section>

        {/* Performance Analytics */}
        <section id="analytics" className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Performance Analytics
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Track our performance with detailed analytics. Real data, real results.
              </p>
            </div>
            <AnalyticsDashboard />
          </div>
        </section>

        {/* Features Section */}
        <Features />

        {/* Subscription Plans */}
        <section id="pricing" className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-900/10 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Choose Your Plan
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Subscribe to receive instant trading signals directly on your device
              </p>
            </div>
            
            <SubscriptionManager />
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Section */}
        <CTA />

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}
