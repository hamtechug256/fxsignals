'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  BookOpen, Plus, TrendingUp, TrendingDown, Target, Calendar,
  Filter, Search, ChevronRight, Clock, DollarSign, BarChart3,
  Edit, Trash2, CheckCircle2, XCircle, AlertCircle, Sparkles
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-400" />
            Trading Journal
          </h1>
          <p className="text-gray-400 mt-1">Track, analyze, and improve your trading</p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-500 hover:bg-purple-400 text-black"
        >
          {showForm ? (
            <>
              <XCircle className="h-4 w-4 mr-2" />
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400">Total Trades</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/10">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.winRate}%</div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/10">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.wins}</div>
            <div className="text-xs text-gray-400">Wins</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/10">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.totalPips}</div>
            <div className="text-xs text-gray-400">Total Pips</div>
          </CardContent>
        </Card>
        <Card className={`${stats.totalProfit >= 0 ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
          <CardContent className="pt-4 pb-4 text-center">
            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit}
            </div>
            <div className="text-xs text-gray-400">P/L</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <Card className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Log New Trade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Pair</Label>
                <Select value={newEntry.pair} onValueChange={(v) => setNewEntry({ ...newEntry, pair: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900">
                    {['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'GBP/JPY', 'EUR/GBP'].map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Type</Label>
                <Select value={newEntry.type} onValueChange={(v: 'BUY' | 'SELL') => setNewEntry({ ...newEntry, type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900">
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
                  className="bg-white/5 border-white/10"
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
                  className="bg-white/5 border-white/10"
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
                  className="bg-white/5 border-white/10"
                  placeholder="0.10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Emotions</Label>
                <Input
                  value={newEntry.emotions}
                  onChange={(e) => setNewEntry({ ...newEntry, emotions: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="Confident, patient..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Lessons Learned</Label>
                <Input
                  value={newEntry.lessons}
                  onChange={(e) => setNewEntry({ ...newEntry, lessons: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="What did you learn?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Notes</Label>
              <Textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                className="bg-white/5 border-white/10 min-h-[80px]"
                placeholder="Describe the trade setup, why you took it, what happened..."
              />
            </div>

            <Button onClick={handleAddEntry} className="w-full bg-purple-500 hover:bg-purple-400 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Save Entry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32 bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="wins">Wins</SelectItem>
            <SelectItem value="losses">Losses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Journal Entries */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    entry.type === 'BUY' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    {entry.type === 'BUY' ? (
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{entry.pair}</span>
                      <Badge className={`${entry.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {entry.type}
                      </Badge>
                      <Badge className={`${entry.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' : entry.result === 'LOSS' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'}`}>
                        {entry.result}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {entry.date}
                      </span>
                      <span>Entry: {entry.entryPrice}</span>
                      <span>Exit: {entry.exitPrice}</span>
                      <span>{entry.lotSize} lots</span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-1">{entry.notes}</p>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={`text-lg font-bold ${entry.pips >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {entry.pips >= 0 ? '+' : ''}{entry.pips} pips
                  </div>
                  <div className={`text-sm ${entry.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {entry.profit >= 0 ? '+' : ''}${entry.profit}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {(entry.emotions || entry.lessons) && (
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {entry.emotions && (
                    <div>
                      <span className="text-xs text-gray-500">Emotions:</span>
                      <p className="text-sm text-gray-400">{entry.emotions}</p>
                    </div>
                  )}
                  {entry.lessons && (
                    <div>
                      <span className="text-xs text-gray-500">Lessons:</span>
                      <p className="text-sm text-gray-400">{entry.lessons}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredEntries.length === 0 && (
          <Card className="bg-white/[0.02] border-white/5">
            <CardContent className="py-16 text-center">
              <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No journal entries yet</p>
              <p className="text-gray-500 text-sm mt-1">Start logging your trades to improve</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
