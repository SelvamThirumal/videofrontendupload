import React from 'react';
import { Trash2, Video, Folder, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { formatBytes } from '../services/api';

export default function FileList({
  files = [],
  relativePaths = {},
  totalSize = 0,
  maxBatchSizeBytes,
  onRemoveFile,
  onClearAll,
  onStartUpload,
  isUploading
}) {
  if (files.length === 0) return null;

  const isOverLimit = totalSize > maxBatchSizeBytes;

  return (
    <div className="w-full glass-card rounded-2xl p-6 border border-slate-800 shadow-xl mt-6">
      {/* Header with counts and actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Selected Videos</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Combined Size: <strong className={isOverLimit ? 'text-rose-400' : 'text-slate-200'}>{formatBytes(totalSize)}</strong>
            {maxBatchSizeBytes && ` / ${formatBytes(maxBatchSizeBytes)} limit`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isUploading}
            onClick={onClearAll}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition disabled:opacity-50"
          >
            Clear All
          </button>

          <button
            type="button"
            disabled={isUploading || isOverLimit}
            onClick={onStartUpload}
            className="flex items-center gap-2 text-xs font-bold px-5 py-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 active:scale-95 text-white shadow-lg shadow-indigo-500/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Upload & Analyze</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Batch size warning */}
      {isOverLimit && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>
            Batch exceeds the maximum allowed size of {formatBytes(maxBatchSizeBytes)}. Please remove some files to proceed.
          </span>
        </div>
      )}

      {/* Scrollable list of files */}
      <div className="mt-4 max-h-72 overflow-y-auto space-y-2 pr-1">
        {files.map((file, idx) => {
          const relPath = relativePaths[file.name] || file.name;
          const hasFolder = relPath.includes('/') || relPath.includes('\\');

          return (
            <div
              key={`${file.name}-${file.size}-${idx}`}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 text-xs transition"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-brand-primary">
                  {hasFolder ? <Folder className="w-4 h-4 text-indigo-400" /> : <Video className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                  {hasFolder && (
                    <p className="text-[11px] text-slate-500 truncate">{relPath}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="font-mono text-slate-400">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => onRemoveFile(idx)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition disabled:opacity-50"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
