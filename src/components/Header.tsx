'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, TrendingUp, Send, Loader2 } from 'lucide-react';
import { LoginButton } from './LoginButton';
import { UserDashboard } from './UserDashboard';
import { AdminPanel } from './AdminPanel';
import { useSession } from 'next-auth/react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { status } = useSession();

  const navItems = [
    { href: '#signals', label: 'Live Signals' },
    { href: '#performance', label: 'Performance' },
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
              <TrendingUp className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">
              FX<span className="text-emerald-400">Signals</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-gray-300 transition-colors hover:text-emerald-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {status === 'loading' ? (
              <Button variant="ghost" size="icon" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => {
                    document.getElementById('signals')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  View Signals
                </Button>
                <UserDashboard />
                <AdminPanel />
                <LoginButton />
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-white/10 bg-gray-900 p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-white/10 p-4">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                      <TrendingUp className="h-5 w-5 text-black" />
                    </div>
                    <span className="text-xl font-bold text-white">
                      FX<span className="text-emerald-400">Signals</span>
                    </span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="block rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-white/5 hover:text-emerald-400"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="border-t border-white/10 p-4 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => {
                      setIsOpen(false);
                      document.getElementById('signals')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    View Signals
                  </Button>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <UserDashboard />
                      <AdminPanel />
                    </div>
                    <LoginButton />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
