'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  BookOpen, Plus, TrendingUp, TrendingDown, Calendar,
  Search, Clock, DollarSign, BarChart3,
  Sparkles, X, Target, Award, Zap, Flame
} from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  pips: number;
  profit: number;
  result: 'WIN' | 'LOSS' | 'BE';
  notes: string;
  emotions: string;
  lessons: string;
}

// Sample journal entries
const sampleEntries: JournalEntry[] = [
  {
    id: '1',
    date: '2024-02-28',
    pair: 'EUR/USD',
    type: 'BUY',
    entryPrice: 1.08250,
    exitPrice: 1.08550,
    lotSize: 0.10,
    pips: 30,
    profit: 30,
    result: 'WIN',
    notes: 'Entered on bullish order block retest. Perfect ICT setup.',
    emotions: 'Confident, patient',
    lessons: 'Wait for confirmation before entry',
  },
  {
    id: '2',
    date: '2024-02-27',
    pair: 'GBP/USD',
    type: 'SELL',
    entryPrice: 1.26800,
    exitPrice: 1.26500,
    lotSize: 0.10,
    pips: 30,
    profit: 30,
    result: 'WIN',
    notes: 'FVG fill + liquidity sweep. textbook setup.',
    emotions: 'Calm, focused',
    lessons: 'Trust the analysis',
  },
  {
    id: '3',
    date: '2024-02-26',
    pair: 'USD/JPY',
    type: 'BUY',
    entryPrice: 149.800,
    exitPrice: 149.600,
    lotSize: 0.10,
    pips: -20,
    profit: -20,
    result: 'LOSS',
    notes: 'Got stopped out. Should have waited for better entry.',
    emotions: 'Impatient',
    lessons: 'Never chase entries',
  },
];

// Stats card
function StatCard({ value, label, icon: Icon, gradient, delay = 0 }: { value: string | number; label: string; icon: any; gradient: string; delay?: number }) {
  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 hover:border-white/10 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <CardContent className="pt-5 pb-5 text-center relative z-10">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-gray-400 mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
}

// Journal entry card
function EntryCard({ entry, delay = 0 }: { entry: JournalEntry; delay?: number }) {
  const isWin = entry.result === 'WIN';
  
  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5 hover:border-white/10 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover gradient */}
      <div className={`absolute inset-0 ${isWin ? 'bg-gradient-to-br from-emerald-500/5' : 'bg-gradient-to-br from-red-500/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <CardContent className="p-5 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
              entry.type === 'BUY' 
                ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20' 
                : 'bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20'
            }`}>
              {entry.type === 'BUY' ? (
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-400" />
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-bold text-white text-lg">{entry.pair}</span>
                <Badge className={`${entry.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} border font-medium`}>
                  {entry.type}
                </Badge>
                <Badge className={`${isWin ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : entry.result === 'LOSS' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'} border font-medium`}>
                  {entry.result}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {entry.date}
                </span>
                <span className="text-gray-500">Entry: <span className="text-white font-mono">{entry.entryPrice}</span></span>
                <span className="text-gray-500">Exit: <span className="text-white font-mono">{entry.exitPrice}</span></span>
                <span className="text-gray-500">{entry.lotSize} lots</span>
              </div>
              {entry.notes && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-1">{entry.notes}</p>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="text-right flex-shrink-0">
            <div className={`text-xl font-bold ${entry.pips >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {entry.pips >= 0 ? '+' : ''}{entry.pips} pips
            </div>
            <div className={`text-sm font-medium ${entry.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {entry.profit >= 0 ? '+' : ''}${entry.profit}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        {(entry.emotions || entry.lessons) && (
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {entry.emotions && (
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <span className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3 w-3" />
                  Emotions
                </span>
                <p className="text-sm text-gray-300">{entry.emotions}</p>
              </div>
            )}
            {entry.lessons && (
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <span className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                  <Target className="h-3 w-3" />
                  Lessons Learned
                </span>
                <p className="text-sm text-gray-300">{entry.lessons}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function JournalPageContent() {
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newEntry, setNewEntry] = useState({
    pair: 'EUR/USD',
    type: 'BUY' as 'BUY' | 'SELL',
    entryPrice: '',
    exitPrice: '',
    lotSize: '0.10',
    notes: '',
    emotions: '',
    lessons: '',
  });

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (filter === 'wins' && e.result !== 'WIN') return false;
      if (filter === 'losses' && e.result !== 'LOSS') return false;
      if (searchQuery && !e.pair.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [entries, filter, searchQuery]);

  const stats = useMemo(() => {
    const wins = entries.filter(e => e.result === 'WIN').length;
    const total = entries.length;
    const totalPips = entries.reduce((acc, e) => acc + e.pips, 0);
    const totalProfit = entries.reduce((acc, e) => acc + e.profit, 0);
    return {
      total,
      wins,
      winRate: total > 0 ? ((wins / total) * 100).toFixed(1) : 0,
      totalPips,
      totalProfit,
    };
  }, [entries]);

  const handleAddEntry = () => {
    const entry = parseFloat(newEntry.entryPrice);
    const exit = parseFloat(newEntry.exitPrice);
    const lots = parseFloat(newEntry.lotSize);
    
    // Calculate pips
    const isJpy = newEntry.pair.includes('JPY');
    const pipSize = isJpy ? 0.01 : 0.0001;
    const pipDiff = newEntry.type === 'BUY' 
      ? (exit - entry) / pipSize 
      : (entry - exit) / pipSize;
    
    const pips = Math.round(pipDiff * 10) / 10;
    const profit = pipDiff * 10 * lots;
    
    const entry_obj: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      pair: newEntry.pair,
      type: newEntry.type,
      entryPrice: entry,
      exitPrice: exit,
      lotSize: lots,
      pips,
      profit: Math.round(profit * 100) / 100,
      result: pips > 0 ? 'WIN' : pips < 0 ? 'LOSS' : 'BE',
      notes: newEntry.notes,
      emotions: newEntry.emotions,
      lessons: newEntry.lessons,
    };
    
    setEntries([entry_obj, ...entries]);
    setShowForm(false);
    setNewEntry({
      pair: 'EUR/USD',
      type: 'BUY',
      entryPrice: '',
      exitPrice: '',
      lotSize: '0.10',
      notes: '',
      emotions: '',
      lessons: '',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg shadow-orange-500/20">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            Trading Journal
          </h1>
          <p className="text-gray-400 mt-2">Track, analyze, and improve your trading performance</p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className={`${showForm ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400'} text-white border-0 shadow-lg ${showForm ? '' : 'shadow-orange-500/25'} transition-all duration-300`}
        >
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard value={stats.total} label="Total Trades" icon={BarChart3} gradient="from-blue-500 to-cyan-500" delay={100} />
        <StatCard value={`${stats.winRate}%`} label="Win Rate" icon={Target} gradient="from-emerald-500 to-teal-500" delay={200} />
        <StatCard value={stats.wins} label="Wins" icon={Award} gradient="from-purple-500 to-pink-500" delay={300} />
        <StatCard value={stats.totalPips} label="Total Pips" icon={Zap} gradient="from-yellow-500 to-orange-500" delay={400} />
        <StatCard 
          value={`${stats.totalProfit >= 0 ? '+' : ''}$${stats.totalProfit}`} 
          label="P/L" 
          icon={Flame} 
          gradient={stats.totalProfit >= 0 ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-rose-500'} 
          delay={500} 
        />
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-yellow-500/5 border-orange-500/20 animate-fade-in-scale">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
          <CardHeader className="relative z-10 border-b border-white/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-orange-400" />
              Log New Trade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Pair</Label>
                <Select value={newEntry.pair} onValueChange={(v) => setNewEntry({ ...newEntry, pair: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 rounded-xl">
                    {['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'GBP/JPY', 'EUR/GBP'].map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Type</Label>
                <Select value={newEntry.type} onValueChange={(v: 'BUY' | 'SELL') => setNewEntry({ ...newEntry, type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 rounded-xl">
                    <SelectItem value="BUY">BUY</SelectItem>
                    <SelectItem value="SELL">SELL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Entry Price</Label>
                <Input
                  type="number"
                  step="0.00001"
                  value={newEntry.entryPrice}
                  onChange={(e) => setNewEntry({ ...newEntry, entryPrice: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-xl"
                  placeholder="1.08500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Exit Price</Label>
                <Input
                  type="number"
                  step="0.00001"
                  value={newEntry.exitPrice}
                  onChange={(e) => setNewEntry({ ...newEntry, exitPrice: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-xl"
                  placeholder="1.08750"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Lot Size</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newEntry.lotSize}
                  onChange={(e) => setNewEntry({ ...newEntry, lotSize: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-xl"
                  placeholder="0.10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Emotions</Label>
                <Input
                  value={newEntry.emotions}
                  onChange={(e) => setNewEntry({ ...newEntry, emotions: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-xl"
                  placeholder="Confident, patient..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Lessons Learned</Label>
                <Input
                  value={newEntry.lessons}
                  onChange={(e) => setNewEntry({ ...newEntry, lessons: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-xl"
                  placeholder="What did you learn?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Notes</Label>
              <Textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                className="bg-white/5 border-white/10 min-h-[80px] rounded-xl"
                placeholder="Describe the trade setup, why you took it, what happened..."
              />
            </div>

            <Button onClick={handleAddEntry} className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white border-0 shadow-lg shadow-orange-500/25">
              <Plus className="h-4 w-4 mr-2" />
              Save Entry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <div className="relative flex-1 max-w-xs group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 rounded-xl"
          />
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32 bg-white/5 border-white/10 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/10 rounded-xl">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="wins">Wins</SelectItem>
            <SelectItem value="losses">Losses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Journal Entries */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <Card className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/5">
            <CardContent className="py-20 text-center">
              <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">No journal entries yet</p>
              <p className="text-gray-500 text-sm mt-2">Start logging your trades to improve your performance</p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry, index) => (
            <EntryCard key={entry.id} entry={entry} delay={700 + index * 100} />
          ))
        )}
      </div>
    </div>
  );
}
