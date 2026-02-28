'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, TrendingUp, Send } from 'lucide-react';
import { LoginButton } from './LoginButton';
import { AdminPanel } from './AdminPanel';
import { useSession } from 'next-auth/react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { status } = useSession();
  const isAdmin = status === 'authenticated';

  const navItems = [
    { href: '#signals', label: 'Signals' },
    { href: '#calculator', label: 'Calculator' },
    { href: '#analytics', label: 'Analytics' },
    { href: '#pricing', label: 'Pricing' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-800 bg-black/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">FXSignals</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-gray-300 hover:text-emerald-400 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <AdminPanel />
            <LoginButton />

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-900 border-l border-gray-800 p-0 w-72">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between border-b border-gray-800 p-4">
                    <span className="font-bold text-white">Menu</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-gray-400">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <nav className="flex-1 p-4">
                    {navItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="block py-3 px-4 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
