import Link from 'next/link';
import { TrendingUp, Send, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    platform: [
      { href: '#signals', label: 'Live Signals' },
      { href: '#performance', label: 'Performance' },
      { href: '#pricing', label: 'Pricing' },
    ],
    legal: [
      { href: '#', label: 'Terms of Service' },
      { href: '#', label: 'Privacy Policy' },
      { href: '#', label: 'Risk Disclaimer' },
    ],
    social: [
      { href: 'https://t.me/hamcodz', label: 'Telegram', icon: Send },
    ],
  };

  return (
    <footer className="border-t border-white/10 bg-black/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white">
                FX<span className="text-emerald-400">Signals</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">
              Professional forex trading signals based on ICT concepts. 
              Transparent track record with verified performance.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>hamcodz.duckdns.org</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Platform
            </h3>
            <ul className="space-y-3">
              {links.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://t.me/hamcodz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-emerald-400"
                >
                  <Send className="h-4 w-4" />
                  @hamcodz
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@hamcodz.duckdns.org"
                  className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-emerald-400"
                >
                  <Mail className="h-4 w-4" />
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">
              © {currentYear} FXSignals by Hamza. All rights reserved.
            </p>
            <p className="text-xs text-gray-600 text-center md:text-right max-w-md">
              <span className="text-yellow-500/80">⚠️ Risk Disclaimer:</span> Trading forex carries a high level of risk. 
              Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
