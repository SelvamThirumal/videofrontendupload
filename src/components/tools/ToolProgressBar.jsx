import React from 'react';
import { Loader2, XCircle } from 'lucide-react';

export default function ToolProgressBar({
  progress = 0,
  stage = 'Processing...',
  onCancel = null
}) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-indigo-500/30 bg-slate-900/80 shadow-lg animate-pulse-subtle">
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
          <span>{stage}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-white font-bold">{progress}%</span>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-rose-400 transition"
              title="Cancel processing"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-brand-primary via-indigo-500 to-brand-secondary h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
