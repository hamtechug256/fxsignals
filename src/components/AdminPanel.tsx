'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Plus,
  Send,
  Users,
  TrendingUp,
  TrendingDown,
  Trash2,
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
  stopLoss: number;
  status: string;
  result: string | null;
  pips: number | null;
  analysis: string | null;
  createdAt: string;
}

export function AdminPanel() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const { toast } = useToast();

  // New signal form
  const [newSignal, setNewSignal] = useState({
    pair: 'EUR/USD',
    type: 'BUY',
    entryPrice: '',
    takeProfit1: '',
    takeProfit2: '',
    stopLoss: '',
    analysis: '',
  });

  // Notification form
  const [notification, setNotification] = useState({
    title: 'New Trading Signal!',
    body: '',
  });

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  if (!isAdmin || status !== 'authenticated') {
    return null;
  }

  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/signals');
      if (response.ok) {
        const data = await response.json();
        setSignals(data);
      }
    } catch (error) {
      console.error('Failed to fetch signals:', error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribers');
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchSignals();
      fetchSubscribers();
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
          stopLoss: parseFloat(newSignal.stopLoss),
          analysis: newSignal.analysis || null,
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
          stopLoss: '',
          analysis: '',
        });
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
        toast({
          title: 'Signal Updated',
          description: 'Signal status has been updated.',
        });
        fetchSignals();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update signal',
        variant: 'destructive',
      });
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });

      if (response.ok) {
        toast({
          title: 'Notification Sent!',
          description: 'Push notification sent to all subscribers.',
        });
        setNotification({ title: 'New Trading Signal!', body: '' });
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Admin Dashboard</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage signals, subscribers, and notifications
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="create" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="create" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </TabsTrigger>
              <TabsTrigger value="signals" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <TrendingUp className="h-4 w-4 mr-2" />
                Signals
              </TabsTrigger>
              <TabsTrigger value="notify" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <Send className="h-4 w-4 mr-2" />
                Notify
              </TabsTrigger>
            </TabsList>

            {/* Create Signal Tab */}
            <TabsContent value="create" className="space-y-4 mt-4">
              <form onSubmit={handleCreateSignal} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pair</Label>
                    <Select
                      value={newSignal.pair}
                      onValueChange={(v) => setNewSignal({ ...newSignal, pair: v })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                        <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                        <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                        <SelectItem value="XAU/USD">XAU/USD (Gold)</SelectItem>
                        <SelectItem value="GBP/JPY">GBP/JPY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newSignal.type}
                      onValueChange={(v) => setNewSignal({ ...newSignal, type: v })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
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
                    <Label>Entry Price</Label>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="1.08500"
                      value={newSignal.entryPrice}
                      onChange={(e) => setNewSignal({ ...newSignal, entryPrice: e.target.value })}
                      required
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stop Loss</Label>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="1.08300"
                      value={newSignal.stopLoss}
                      onChange={(e) => setNewSignal({ ...newSignal, stopLoss: e.target.value })}
                      required
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Take Profit 1</Label>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="1.08700"
                      value={newSignal.takeProfit1}
                      onChange={(e) => setNewSignal({ ...newSignal, takeProfit1: e.target.value })}
                      required
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Take Profit 2 (Optional)</Label>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="1.08900"
                      value={newSignal.takeProfit2}
                      onChange={(e) => setNewSignal({ ...newSignal, takeProfit2: e.target.value })}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Analysis (Optional)</Label>
                  <Textarea
                    placeholder="ICT Order Block + FVG confluence..."
                    value={newSignal.analysis}
                    onChange={(e) => setNewSignal({ ...newSignal, analysis: e.target.value })}
                    className="bg-gray-800 border-gray-700"
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

            {/* Manage Signals Tab */}
            <TabsContent value="signals" className="space-y-4 mt-4">
              <div className="space-y-3">
                {signals.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No signals yet</p>
                ) : (
                  signals.slice(0, 10).map((signal) => (
                    <Card key={signal.id} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              signal.type === 'BUY' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                            }`}>
                              {signal.type === 'BUY' ? (
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{signal.pair}</p>
                              <p className="text-xs text-gray-400">
                                Entry: {signal.entryPrice.toFixed(5)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                              signal.status === 'ACTIVE' ? 'border-yellow-500 text-yellow-500' :
                              signal.status === 'HIT_TP1' || signal.status === 'HIT_TP2' ? 'border-emerald-500 text-emerald-500' :
                              'border-red-500 text-red-500'
                            }>
                              {signal.status}
                            </Badge>

                            <Select
                              onValueChange={(v) => {
                                const [status, result] = v.split('|');
                                handleUpdateSignalStatus(signal.id, status, result);
                              }}
                            >
                              <SelectTrigger className="w-8 h-8 bg-gray-700 border-gray-600">
                                <Settings className="h-4 w-4" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="HIT_TP1|WIN">TP1 Hit (WIN)</SelectItem>
                                <SelectItem value="HIT_TP2|WIN">TP2 Hit (WIN)</SelectItem>
                                <SelectItem value="HIT_SL|LOSS">SL Hit (LOSS)</SelectItem>
                                <SelectItem value="CLOSED|PENDING">Close (Pending)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Send Notification Tab */}
            <TabsContent value="notify" className="space-y-4 mt-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Subscribers: {subscribers.length}
                  </CardTitle>
                </CardHeader>
              </Card>

              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={notification.title}
                    onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="EUR/USD Buy signal hit TP1! +45 pips"
                    value={notification.body}
                    onChange={(e) => setNotification({ ...notification, body: e.target.value })}
                    required
                    className="bg-gray-800 border-gray-700"
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
                      <Send className="h-4 w-4 mr-2" />
                      Send to All Subscribers
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
