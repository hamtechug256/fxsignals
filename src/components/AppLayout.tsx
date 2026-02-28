'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useSyncExternalStore, useCallback } from 'react';
import {
  TrendingUp, LayoutDashboard, Signal, BarChart3, CreditCard, BookOpen,
  Bell, Search, Menu, X, ChevronRight, Sparkles, Crown, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoginButton } from '@/components/LoginButton';
import { AdminPanel } from '@/components/AdminPanel';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, gradient: 'from-emerald-500 to-teal-500' },
  { href: '/signals', label: 'Signals', icon: Signal, gradient: 'from-blue-500 to-cyan-500' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, gradient: 'from-purple-500 to-pink-500' },
  { href: '/journal', label: 'Journal', icon: BookOpen, gradient: 'from-orange-500 to-yellow-500' },
  { href: '/pricing', label: 'Plans', icon: CreditCard, gradient: 'from-rose-500 to-red-500' },
];

// Animated background particles
function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-particle" />
      <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-particle" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/2 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl animate-particle" style={{ animationDelay: '4s' }} />
    </div>
  );
}

// Grid background
function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
    </div>
  );
}

// Navigation item with hover effect
function NavItem({ 
  item, 
  isActive, 
  collapsed 
}: { 
  item: typeof navItems[0]; 
  isActive: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'text-white' 
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {/* Active background */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10" />
      )}
      
      {/* Gradient hover effect */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${item.gradient} bg-opacity-10`} style={{ opacity: isActive ? 0 : undefined }} />
      
      {/* Icon */}
      <div className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 ${
        isActive 
          ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
          : 'bg-white/5 group-hover:bg-white/10'
      }`}>
        <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
      </div>
      
      {/* Label */}
      {collapsed && (
        <span className="relative z-10 font-medium text-sm">{item.label}</span>
      )}
      
      {/* Active indicator */}
      {isActive && collapsed && (
        <div className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      )}
    </Link>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Proper hydration handling
  const mounted = useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => true,
    () => false
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex">
      {/* Animated Background */}
      <GridBackground />
      <Particles />

      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#0a0a0f]/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-50 hidden lg:block ${
        sidebarOpen ? 'w-72' : 'w-20'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-300">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight">
                  FX<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Signals</span>
                </span>
                <span className="text-[10px] text-gray-500 -mt-0.5">by HAMCODZ</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.href} 
              item={item} 
              isActive={pathname === item.href}
              collapsed={sidebarOpen}
            />
          ))}
        </nav>

        {/* Bottom Section */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
            {/* Pro Banner */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/20">
              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl border-gradient-animated" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  Unlock unlimited signals, advanced analytics & priority alerts
                </p>
                <Link href="/pricing">
                  <Button size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    View Plans
                  </Button>
                </Link>
              </div>
            </div>

            {/* User Info */}
            {session ? (
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-violet-500/20">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0a0f]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{session.user?.name || 'User'}</p>
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
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <aside className="absolute left-0 top-0 h-full w-80 bg-[#0a0a0f]/95 backdrop-blur-xl border-r border-white/5 animate-slide-in-left">
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">FX<span className="text-emerald-400">Signals</span></span>
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    pathname === item.href
                      ? `bg-gradient-to-r ${item.gradient} text-white`
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 relative z-10 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-[#000000]/80 backdrop-blur-xl border-b border-white/5">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-lg">
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  placeholder="Search signals, pairs, analysis..."
                  className="pl-10 h-10 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl text-sm placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Live Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="text-xs font-medium text-emerald-400">Live</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white hover:bg-white/5 rounded-xl">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#000000]" />
              </Button>

              {/* Admin Panel */}
              <AdminPanel />

              {/* Auth */}
              {!session && <LoginButton />}

              {/* User Avatar */}
              {session && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all shadow-lg shadow-violet-500/20">
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
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
