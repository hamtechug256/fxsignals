import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { SignalsList } from '@/components/SignalsList';
import { PerformanceCard } from '@/components/PerformanceCard';
import { Features } from '@/components/Features';
import { FAQ } from '@/components/FAQ';
import { CTA } from '@/components/CTA';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { UserDashboard } from '@/components/UserDashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* User Dashboard (for logged in users) */}
      <section id="dashboard" className="py-8 px-4">
        <div className="container mx-auto">
          <UserDashboard />
        </div>
      </section>

      {/* Live Signals Section */}
      <SignalsList />

      {/* Performance Section */}
      <PerformanceCard />

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
    </main>
  );
}
