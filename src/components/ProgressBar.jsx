import React from 'react';

export default function ProgressBar({
  progress = 0,
  stage = '',
  status = 'processing',
  showPercent = true,
  className = ''
}) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  let barColor = 'from-brand-primary to-brand-secondary';
  if (status === 'completed') {
    barColor = 'from-emerald-500 to-teal-400';
  } else if (status === 'failed') {
    barColor = 'from-rose-500 to-red-600';
  } else if (status === 'queued') {
    barColor = 'from-slate-600 to-slate-500';
  }

  return (
    <div className={`w-full ${className}`}>
      {(stage || showPercent) && (
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-slate-300 truncate max-w-[80%]">{stage}</span>
          {showPercent && (
            <span className="text-slate-400 font-mono">{clampedProgress}%</span>
          )}
        </div>
      )}
      <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-300 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
