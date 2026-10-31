import React from 'react';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Film,
  Zap,
  HardDrive,
  Gauge,
  AlertCircle
} from 'lucide-react';
import ProgressBar from './ProgressBar';
import { formatBytes, formatDuration } from '../services/api';

export default function MergeDashboard({
  batchStatus,
  overallProgress = 0,
  totalJobs = 0,
  completedJobs = 0,
  failedJobs = 0,
  jobs = [],
  elapsedSeconds = 0,
  completedWithinTarget = null,
  targetSeconds = 300,
  onCancelBatch
}) {
  const queuedCount = jobs.filter(j => j.status === 'queued').length;
  const processingCount = jobs.filter(j => j.status === 'processing').length;

  const isUnderTarget = elapsedSeconds <= targetSeconds;

  return (
    <div className="space-y-6">
      {/* Top Queue Overview */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-brand-primary" />
              <span>Processing Video Merge Queue</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Engine uses direct stream-copy whenever streams match, and auto-adapts hardware/CPU transcode if streams differ.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 5-Minute Performance Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs">
              <Gauge className="w-4 h-4 text-brand-primary" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  5-Min Target
                </span>
                <span className={`font-mono font-bold ${
                  completedWithinTarget === true || (batchStatus === 'processing' && isUnderTarget)
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}>
                  {formatDuration(elapsedSeconds)} / {formatDuration(targetSeconds)}
                  {completedWithinTarget === true && ' (Met ✓)'}
                </span>
              </div>
            </div>

            {batchStatus === 'processing' && (
              <button
                type="button"
                onClick={onCancelBatch}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel All</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Progress */}
        <ProgressBar
          progress={overallProgress}
          stage={`Overall Batch Progress: ${completedJobs} of ${totalJobs} series merged (${formatDuration(elapsedSeconds)} elapsed)`}
          status={batchStatus === 'completed' ? 'completed' : 'processing'}
          className="mb-6"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-800/80 text-center">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs text-slate-400">Total Series</p>
            <p className="text-lg font-bold text-white font-mono mt-0.5">{totalJobs}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs text-emerald-400">Completed</p>
            <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{completedJobs}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs text-indigo-400">In Progress</p>
            <p className="text-lg font-bold text-indigo-400 font-mono mt-0.5">{processingCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs text-slate-400">Queued</p>
            <p className="text-lg font-bold text-slate-300 font-mono mt-0.5">{queuedCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-400">Elapsed Time</p>
            <p className="text-lg font-bold text-white font-mono mt-0.5">{formatDuration(elapsedSeconds)}</p>
          </div>
        </div>
      </div>

      {/* Individual Series Job Cards */}
      <div className="space-y-3">
        {jobs.map((job, index) => {
          let statusBadge = null;
          if (job.status === 'completed') {
            statusBadge = (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Done {job.elapsedSeconds > 0 && `(${job.elapsedSeconds}s)`}
              </span>
            );
          } else if (job.status === 'processing') {
            statusBadge = (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 text-xs font-semibold">
                <Loader2 className="w-3.5 h-3.5 text-brand-primary animate-spin" />
                Merging {job.elapsedSeconds > 0 && `(${formatDuration(job.elapsedSeconds)})`}
              </span>
            );
          } else if (job.status === 'failed') {
            statusBadge = (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/40 text-xs font-semibold">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                Failed
              </span>
            );
          } else if (job.status === 'cancelled') {
            statusBadge = (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold">
                <Ban className="w-3.5 h-3.5" />
                Cancelled
              </span>
            );
          } else {
            statusBadge = (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                Queue #{index + 1}
              </span>
            );
          }

          return (
            <div
              key={job.jobId || index}
              className="p-4 rounded-2xl glass-card border border-slate-800/80 bg-slate-900/50 flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-extrabold text-base text-white">
                    {job.seriesId}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    → {job.outputFileName || `${job.seriesId}.mp4`}
                  </span>

                  {/* Processing Type Indicator */}
                  {job.status === 'completed' || job.status === 'processing' ? (
                    job.isTranscoded ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/30">
                        Transcoded
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        Stream Copy
                      </span>
                    )
                  ) : null}
                </div>
                <div>{statusBadge}</div>
              </div>

              {/* Progress for this job */}
              <ProgressBar
                progress={job.progress}
                stage={
                  job.stage ||
                  (job.status === 'queued' ? 'Waiting in queue...' : '')
                }
                status={job.status}
              />

              {/* Performance & ETA Ticker */}
              {(job.status === 'processing' || job.status === 'completed') && (
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Elapsed: {formatDuration(job.elapsedSeconds)}</span>
                    {job.estimatedRemainingSeconds && job.status === 'processing' && (
                      <span className="text-indigo-400">
                        | ETA: ~{formatDuration(job.estimatedRemainingSeconds)}
                      </span>
                    )}
                  </div>
                  {job.status === 'completed' && job.completedWithinTarget && (
                    <span className="text-emerald-400 font-medium">
                      ✓ Completed within 5-min target
                    </span>
                  )}
                </div>
              )}

              {/* Informative note if transcoding was required */}
              {job.isTranscoded && job.transcodeReason && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300/90">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Transcode Reason:</strong> {job.transcodeReason}. Re-encoding ensures video/audio synchronization and standardized output.
                  </span>
                </div>
              )}

              {/* Error message if failed */}
              {job.errorMessage && (
                <p className="text-xs text-rose-400 bg-rose-950/30 p-2 rounded-lg border border-rose-500/20">
                  {job.errorMessage}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

