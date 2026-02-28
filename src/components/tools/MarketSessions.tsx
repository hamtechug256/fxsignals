'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Sun, Moon, Clock } from 'lucide-react';

interface Session {
  name: string;
  city: string;
  open: number; // UTC hour
  close: number; // UTC hour
  color: string;
  bgColor: string;
}

const SESSIONS: Session[] = [
  { name: 'Sydney', city: 'Australia', open: 22, close: 7, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { name: 'Tokyo', city: 'Japan', open: 0, close: 9, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  { name: 'London', city: 'UK', open: 8, close: 17, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { name: 'New York', city: 'USA', open: 13, close: 22, color: 'text-green-400', bgColor: 'bg-green-500/20' },
];

export function MarketSessions() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const utcHour = currentTime.getUTCHours();
  const utcMinute = currentTime.getUTCMinutes();

  // Check if session is active
  const isSessionActive = (session: Session): boolean => {
    if (session.open > session.close) {
      // Session spans midnight
      return utcHour >= session.open || utcHour < session.close;
    }
    return utcHour >= session.open && utcHour < session.close;
  };

  // Calculate session progress
  const getSessionProgress = (session: Session): number => {
    if (!isSessionActive(session)) return 0;
    
    let sessionMinutes: number;
    let elapsedMinutes: number;
    
    if (session.open > session.close) {
      // Session spans midnight
      const totalMinutes = (24 - session.open + session.close) * 60;
      if (utcHour >= session.open) {
        elapsedMinutes = (utcHour - session.open) * 60 + utcMinute;
      } else {
        elapsedMinutes = (24 - session.open + utcHour) * 60 + utcMinute;
      }
      sessionMinutes = totalMinutes;
    } else {
      sessionMinutes = (session.close - session.open) * 60;
      elapsedMinutes = (utcHour - session.open) * 60 + utcMinute;
    }
    
    return Math.min(100, (elapsedMinutes / sessionMinutes) * 100);
  };

  // Get local time for each session
  const getLocalTime = (session: Session): string => {
    const offsets: Record<string, number> = {
      'Sydney': 10,
      'Tokyo': 9,
      'London': 0,
      'New York': -5,
    };
    const offset = offsets[session.name] || 0;
    const localHour = (utcHour + offset + 24) % 24;
    return `${localHour.toString().padStart(2, '0')}:${utcMinute.toString().padStart(2, '0')}`;
  };

  // Calculate next session open
  const getNextOpen = (session: Session): string => {
    if (isSessionActive(session)) return 'Now Open';
    
    let hoursUntil: number;
    if (session.open > utcHour) {
      hoursUntil = session.open - utcHour;
    } else {
      hoursUntil = 24 - utcHour + session.open;
    }
    
    if (hoursUntil < 1) return '< 1 hour';
    if (hoursUntil === 1) return '1 hour';
    return `${hoursUntil} hours`;
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="flex items-center gap-2 text-white">
          <Globe className="h-5 w-5 text-emerald-400" />
          Market Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Current Time */}
        <div className="text-center mb-6">
          <div className="text-3xl font-mono text-white mb-1">
            {currentTime.toISOString().slice(11, 19)} UTC
          </div>
          <div className="text-gray-400 text-sm">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SESSIONS.map((session) => {
            const isActive = isSessionActive(session);
            const progress = getSessionProgress(session);

            return (
              <div
                key={session.name}
                className={`relative rounded-xl p-4 border transition-all ${
                  isActive
                    ? `${session.bgColor} border-current ${session.color}`
                    : 'bg-gray-800/30 border-gray-700'
                }`}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  </div>
                )}

                {/* Session Name */}
                <div className="flex items-center gap-2 mb-2">
                  {isActive ? (
                    <Sun className={`h-4 w-4 ${session.color}`} />
                  ) : (
                    <Moon className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={`font-semibold ${isActive ? session.color : 'text-gray-400'}`}>
                    {session.name}
                  </span>
                </div>

                {/* Local Time */}
                <div className={`text-2xl font-mono ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {getLocalTime(session)}
                </div>

                {/* Status */}
                <div className={`text-xs mt-2 ${isActive ? session.color : 'text-gray-500'}`}>
                  {isActive ? 'Market Open' : `Opens in ${getNextOpen(session)}`}
                </div>

                {/* Progress Bar */}
                {isActive && (
                  <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${session.bgColor.replace('/20', '')} transition-all`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Session Overlaps */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h4 className="text-sm font-medium text-gray-400 mb-3">High Liquidity Overlaps</h4>
          <div className="flex flex-wrap gap-2">
            {/* London + NY Overlap */}
            {utcHour >= 13 && utcHour < 17 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-green-500/20 rounded-lg border border-purple-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-white">London + New York</span>
                <span className="text-xs text-emerald-400">High Volume</span>
              </div>
            )}
            {/* Tokyo + London Overlap */}
            {utcHour >= 8 && utcHour < 9 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-lg border border-red-500/30">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-sm text-white">Tokyo + London</span>
                <span className="text-xs text-yellow-400">Medium Volume</span>
              </div>
            )}
            {/* No overlap */}
            {((utcHour < 8 || utcHour >= 17) && (utcHour < 0 || utcHour >= 9)) && (
              <div className="text-gray-500 text-sm">
                No major overlaps currently
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
