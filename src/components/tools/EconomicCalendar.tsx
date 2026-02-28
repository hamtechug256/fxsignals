'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertTriangle, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  currency: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
  forecast?: string;
  previous?: string;
  actual?: string;
}

// Simulated economic events (in production, these would come from an API)
const generateEvents = (): EconomicEvent[] => {
  const today = new Date();
  const events: EconomicEvent[] = [];
  
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
  const eventTypes = [
    { name: 'Interest Rate Decision', impact: 'High' as const },
    { name: 'GDP (QoQ)', impact: 'High' as const },
    { name: 'CPI (YoY)', impact: 'High' as const },
    { name: 'Non-Farm Payrolls', impact: 'High' as const },
    { name: 'Unemployment Rate', impact: 'High' as const },
    { name: 'PMI Manufacturing', impact: 'Medium' as const },
    { name: 'Retail Sales', impact: 'Medium' as const },
    { name: 'Trade Balance', impact: 'Medium' as const },
    { name: 'Consumer Confidence', impact: 'Low' as const },
    { name: 'Industrial Production', impact: 'Low' as const },
  ];

  // Generate events for next 7 days
  for (let i = 0; i < 14; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + Math.floor(i / 2));
    
    const eventType = eventTypes[i % eventTypes.length];
    const currency = currencies[i % currencies.length];
    
    events.push({
      id: `event-${i}`,
      date: eventDate.toISOString().split('T')[0],
      time: `${String(8 + (i * 3) % 12).padStart(2, '0')}:00`,
      currency,
      event: `${currency} ${eventType.name}`,
      impact: eventType.impact,
      forecast: (Math.random() * 5 - 2.5).toFixed(1) + '%',
      previous: (Math.random() * 5 - 2.5).toFixed(1) + '%',
    });
  }

  return events;
};

export function EconomicCalendar() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Use useMemo instead of useEffect with useState
  const events = useMemo(() => generateEvents(), []);

  const todayEvents = events.filter(e => e.date === selectedDate);
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date(selectedDate)).slice(0, 5);

  const impactColors = {
    High: 'bg-red-500/20 text-red-400 border-red-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const currencyColors: Record<string, string> = {
    USD: 'text-blue-400',
    EUR: 'text-purple-400',
    GBP: 'text-emerald-400',
    JPY: 'text-red-400',
    AUD: 'text-yellow-400',
    CAD: 'text-orange-400',
    CHF: 'text-cyan-400',
    NZD: 'text-pink-400',
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="flex items-center gap-2 text-white">
          <Calendar className="h-5 w-5 text-emerald-400" />
          Economic Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Date Selector */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[...Array(7)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();
            const isSelected = dateStr === selectedDate;
            const isToday = i === 0;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center p-3 rounded-lg min-w-[70px] transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 border border-emerald-500/50'
                    : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                }`}
              >
                <span className="text-xs text-gray-400">{dayName}</span>
                <span className={`text-lg font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                  {dayNum}
                </span>
                {isToday && (
                  <span className="text-[10px] text-emerald-400">Today</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {todayEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No major events scheduled for this day</p>
            </div>
          ) : (
            todayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                {/* Time */}
                <div className="flex items-center gap-1 min-w-[60px]">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-sm font-mono text-gray-400">{event.time}</span>
                </div>

                {/* Currency */}
                <div className={`font-bold ${currencyColors[event.currency] || 'text-white'} min-w-[40px]`}>
                  {event.currency}
                </div>

                {/* Event Name */}
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{event.event}</p>
                </div>

                {/* Impact */}
                <div className={`px-2 py-1 rounded text-xs font-medium border ${impactColors[event.impact]}`}>
                  {event.impact}
                </div>

                {/* Values */}
                <div className="flex items-center gap-4 text-xs">
                  {event.forecast && (
                    <div className="text-right">
                      <span className="text-gray-500">Forecast</span>
                      <div className="text-blue-400 font-mono">{event.forecast}</div>
                    </div>
                  )}
                  {event.previous && (
                    <div className="text-right">
                      <span className="text-gray-500">Previous</span>
                      <div className="text-gray-400 font-mono">{event.previous}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upcoming High Impact */}
        {upcomingEvents.filter(e => e.impact === 'High').length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Upcoming High Impact Events
            </h4>
            <div className="space-y-2">
              {upcomingEvents
                .filter(e => e.impact === 'High')
                .slice(0, 3)
                .map((event) => {
                  const eventDate = new Date(event.date);
                  const formattedDate = eventDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  });

                  return (
                    <div key={event.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${currencyColors[event.currency]}`}>
                          {event.currency}
                        </span>
                        <span className="text-gray-400">{event.event}</span>
                      </div>
                      <span className="text-gray-500">{formattedDate}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
