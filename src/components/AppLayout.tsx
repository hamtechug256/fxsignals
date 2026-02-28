'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  TrendingUp, LayoutDashboard, Signal, BarChart3, CreditCard, BookOpen,
  Settings, Bell, Search, Menu, X, LogOut, User, Moon, Sun, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoginButton } from '@/components/LoginButton';
import { AdminPanel } from '@/components/AdminPanel';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/signals', label: 'Signals', icon: Signal },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/pricing', label: 'Plans', icon: CreditCard },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#0d0d12] border-r border-white/5 transition-all duration-300 z-50 hidden lg:block ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-black" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg">FX<span className="text-emerald-400">Signals</span></span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'group-hover:text-emerald-400'}`} />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
                {isActive && sidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
            {/* Pro Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Get unlimited signals & advanced analytics</p>
              <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black">
                View Plans
              </Button>
            </div>

            {/* User Info */}
            {session ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                  {session.user?.name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                </div>
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#0d0d12] border-r border-white/5">
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-black" />
                </div>
                <span className="font-bold text-lg">FX<span className="text-emerald-400">Signals</span></span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search signals, pairs..."
                  className="pl-10 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Live Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">Live</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </Button>

              {/* Admin Panel */}
              <AdminPanel />

              {/* Auth */}
              {!session && <LoginButton />}

              {/* User Avatar */}
              {session && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all">
                  {session.user?.name?.[0] || 'U'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
