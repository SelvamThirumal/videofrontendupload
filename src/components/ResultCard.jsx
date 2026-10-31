import React from 'react';
import { Download, Film, Clock, HardDrive, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatBytes, formatDuration } from '../services/api';

export default function ResultCard({ result, downloadUrl, isExpired }) {
  const isReady = result.status === 'completed';

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-white font-mono tracking-tight">
                {result.outputFileName}
              </h4>
              <p className="text-[11px] text-slate-400">Series: {result.seriesId}</p>
            </div>
          </div>

          <div>
            {result.isTranscoded ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                Transcoded
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                <Zap className="w-3 h-3 text-emerald-400" />
                Stream Copy
              </span>
            )}
          </div>
        </div>

        {/* Metadata info */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 py-2 border-t border-b border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatBytes(result.fileSize)}</span>
          </div>

          {result.duration > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatDuration(result.duration)}</span>
            </div>
          )}

          {result.elapsedSeconds > 0 && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Zap className="w-3 h-3 text-brand-primary" />
              <span>{result.elapsedSeconds}s merge</span>
              {result.completedWithinTarget && (
                <span className="text-emerald-400 font-bold text-[11px]">(&le; 5m &check;)</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 ml-auto text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready</span>
          </div>
        </div>

        {/* Transcode note if applicable */}
        {result.isTranscoded && result.transcodeReason && (
          <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-950/20 p-2 rounded-lg border border-amber-500/20 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>Transcode Reason: {result.transcodeReason}</span>
          </div>
        )}
      </div>

      {/* Download Action */}
      <div>
        <a
          href={isExpired ? '#' : downloadUrl}
          download={result.outputFileName}
          onClick={(e) => {
            if (isExpired) {
              e.preventDefault();
              alert('This batch has expired. Files have been automatically deleted.');
            }
          }}
          className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            isExpired
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 active:scale-95 text-white shadow-lg shadow-indigo-500/20'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download MP4</span>
        </a>
      </div>
    </div>
  );
}
