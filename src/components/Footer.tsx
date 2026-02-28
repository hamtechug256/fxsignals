'use client';

import Link from 'next/link';
import { TrendingUp, Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white">
                FX<span className="text-emerald-400">Signals</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Professional forex trading signals with ICT-based analysis. Install as app for instant push notifications.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/hamtechug256" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400">
                <Github className="h-5 w-5" />
              </a>
              <a href="mailto:admin@fxsignals.com" className="text-gray-400 hover:text-emerald-400">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#signals" className="text-gray-400 hover:text-emerald-400">Live Signals</a></li>
              <li><a href="#performance" className="text-gray-400 hover:text-emerald-400">Performance</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-emerald-400">Pricing</a></li>
              <li><a href="#faq" className="text-gray-400 hover:text-emerald-400">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-emerald-400">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400">Risk Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>Trading involves risk. Past performance does not guarantee future results.</p>
          <p className="mt-2">© 2025 FXSignals by HAMCODZ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
