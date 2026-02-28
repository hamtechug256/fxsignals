'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Plus,
  Send,
  TrendingUp,
  TrendingDown,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Signal {
  id: string;
  pair: string;
  type: string;
  entryPrice: number;
  takeProfit1: number;
  takeProfit2: number | null;
  takeProfit3: number | null;
  stopLoss: number;
  status: string;
  result: string | null;
  pips: number | null;
  analysis: string | null;
  confidence: number;
  timeframe: string;
  createdAt: string;
}

export function AdminPanel() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const hasFetched = useRef(false);
  const { toast } = useToast();

  const [newSignal, setNewSignal] = useState({
    pair: 'EUR/USD',
    type: 'BUY',
    entryPrice: '',
    takeProfit1: '',
    takeProfit2: '',
    takeProfit3: '',
    stopLoss: '',
    analysis: '',
    confidence: 75,
    timeframe: 'H1',
  });

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  if (!isAdmin || status !== 'authenticated') {
    return null;
  }

  const fetchSignals = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    try {
      const response = await fetch('/api/signals');
      if (response.ok) {
        const data = await response.json();
        setSignals(data.signals || []);
      }
    } catch (error) {
      console.error('Failed to fetch signals:', error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      hasFetched.current = false;
      fetchSignals();
    }
  };

  const handleCreateSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair: newSignal.pair,
          type: newSignal.type,
          entryPrice: parseFloat(newSignal.entryPrice),
          takeProfit1: parseFloat(newSignal.takeProfit1),
          takeProfit2: newSignal.takeProfit2 ? parseFloat(newSignal.takeProfit2) : null,
          takeProfit3: newSignal.takeProfit3 ? parseFloat(newSignal.takeProfit3) : null,
          stopLoss: parseFloat(newSignal.stopLoss),
          analysis: newSignal.analysis || null,
          confidence: newSignal.confidence,
          timeframe: newSignal.timeframe,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Signal Created!',
          description: `${newSignal.pair} ${newSignal.type} signal has been created.`,
        });
        setNewSignal({
          pair: 'EUR/USD',
          type: 'BUY',
          entryPrice: '',
          takeProfit1: '',
          takeProfit2: '',
          takeProfit3: '',
          stopLoss: '',
          analysis: '',
          confidence: 75,
          timeframe: 'H1',
        });
        hasFetched.current = false;
        fetchSignals();
      } else {
        throw new Error('Failed to create signal');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create signal',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSignalStatus = async (signalId: string, status: string, result?: string) => {
    try {
      const response = await fetch(`/api/admin/signals/${signalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, result }),
      });

      if (response.ok) {
        toast({ title: 'Signal Updated', description: 'Signal status has been updated.' });
        hasFetched.current = false;
        fetchSignals();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update signal', variant: 'destructive' });
    }
  };

  return (
    <>
      <Button
        onClick={() => handleOpenChange(true)}
        variant="outline"
        size="sm"
        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
      >
        <Settings className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Admin</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-yellow-400" />
              Admin Dashboard
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage signals and view performance
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="create" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="create" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <Plus className="h-4 w-4 mr-2" />
                Create Signal
              </TabsTrigger>
              <TabsTrigger value="manage" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <TrendingUp className="h-4 w-4 mr-2" />
                Manage Signals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4 mt-4">
              <form onSubmit={handleCreateSignal} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Pair</Label>
                    <Select value={newSignal.pair} onValueChange={(v) => setNewSignal({ ...newSignal, pair: v })}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                        <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                        <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                        <SelectItem value="USD/CHF">USD/CHF</SelectItem>
                        <SelectItem value="AUD/USD">AUD/USD</SelectItem>
                        <SelectItem value="USD/CAD">USD/CAD</SelectItem>
                        <SelectItem value="XAU/USD">XAU/USD (Gold)</SelectItem>
                        <SelectItem value="GBP/JPY">GBP/JPY</SelectItem>
                        <SelectItem value="EUR/GBP">EUR/GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Type</Label>
                    <Select value={newSignal.type} onValueChange={(v) => setNewSignal({ ...newSignal, type: v })}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Entry Price *</Label>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="1.08500"
                      value={newSignal.entryPrice}
                      onChange={(e) => setNewSignal({ ...newSignal, entryPrice: e.target.value })}
                      required
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Stop Loss *</Label>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="1.08200"
                      value={newSignal.stopLoss}
                      onChange={(e) => setNewSignal({ ...newSignal, stopLoss: e.target.value })}
                      required
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-emerald-400">TP1 *</Label>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="1.08750"
                      value={newSignal.takeProfit1}
                      onChange={(e) => setNewSignal({ ...newSignal, takeProfit1: e.target.value })}
                      required
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">TP2</Label>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="1.08950"
                      value={newSignal.takeProfit2}
                      onChange={(e) => setNewSignal({ ...newSignal, takeProfit2: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">TP3</Label>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="1.09200"
                      value={newSignal.takeProfit3}
                      onChange={(e) => setNewSignal({ ...newSignal, takeProfit3: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Confidence</Label>
                    <Select value={newSignal.confidence.toString()} onValueChange={(v) => setNewSignal({ ...newSignal, confidence: parseInt(v) })}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {[70, 75, 80, 85, 90, 95].map(c => (
                          <SelectItem key={c} value={c.toString()}>{c}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Timeframe</Label>
                    <Select value={newSignal.timeframe} onValueChange={(v) => setNewSignal({ ...newSignal, timeframe: v })}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {['M15', 'M30', 'H1', 'H4', 'D1'].map(tf => (
                          <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Analysis</Label>
                  <Textarea
                    placeholder="ICT Order Block + FVG confluence at key support zone..."
                    value={newSignal.analysis}
                    onChange={(e) => setNewSignal({ ...newSignal, analysis: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Signal
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="manage" className="space-y-3 mt-4">
              {signals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No signals yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {signals.slice(0, 15).map((signal) => (
                    <div
                      key={signal.id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${signal.type === 'BUY' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                          {signal.type === 'BUY' ? (
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{signal.pair}</span>
                            <span className="text-xs text-gray-500">{signal.timeframe}</span>
                          </div>
                          <span className="text-xs text-gray-400">Entry: {signal.entryPrice}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={
                          signal.status === 'ACTIVE' ? 'border-blue-500 text-blue-400' :
                          signal.status === 'HIT_TP' ? 'border-emerald-500 text-emerald-400' :
                          'border-red-500 text-red-400'
                        }>
                          {signal.status}
                        </Badge>

                        <Select
                          onValueChange={(v) => {
                            const [status, result] = v.split('|');
                            handleUpdateSignalStatus(signal.id, status, result);
                          }}
                        >
                          <SelectTrigger className="w-8 h-8 bg-gray-700 border-gray-600 p-0">
                            <Settings className="h-4 w-4 text-gray-400" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="HIT_TP|WIN">✓ TP Hit (WIN)</SelectItem>
                            <SelectItem value="HIT_SL|LOSS">✗ SL Hit (LOSS)</SelectItem>
                            <SelectItem value="CLOSED|PENDING">○ Close</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
