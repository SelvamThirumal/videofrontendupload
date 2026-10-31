import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function CountdownTimer({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    if (!expiresAt) return { totalSeconds: 0, minutes: 0, seconds: 0, isExpired: false };
    const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    return {
      totalSeconds: diff,
      minutes: Math.floor(diff / 60),
      seconds: diff % 60,
      isExpired: diff <= 0
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.isExpired) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const isUrgent = timeLeft.totalSeconds <= 120 && !timeLeft.isExpired;

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 text-sm font-semibold">
        <AlertTriangle className="w-4 h-4" />
        <span>Expired — Files have been cleaned up</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
        isUrgent
          ? 'bg-amber-950/50 border-amber-500/60 text-amber-300 animate-pulse'
          : 'bg-slate-900/80 border-slate-700/80 text-slate-200'
      }`}
    >
      <Clock className={`w-4 h-4 ${isUrgent ? 'text-amber-400' : 'text-brand-primary'}`} />
      <span className="text-slate-400 text-xs">Auto Cleanup In:</span>
      <span className="font-mono text-base font-bold tracking-wider">
        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
