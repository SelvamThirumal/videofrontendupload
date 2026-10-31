import React, { useState } from 'react';
import { Layers, Play, AlertCircle, HelpCircle, CheckCircle2, FileQuestion } from 'lucide-react';
import SeriesGroupCard from './SeriesGroupCard';
import ConfirmDialog from './ConfirmDialog';

export default function SeriesGroups({
  groups = [],
  unrecognized = [],
  summary = {},
  onMovePart,
  onUpdatePart,
  onRemovePart,
  onSeriesIdChange,
  onAssignUnrecognized,
  onConfirmMerge,
  isMerging
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [unrecognizedAssigningId, setUnrecognizedAssigningId] = useState(null);
  const [targetSeriesInput, setTargetSeriesInput] = useState('');
  const [targetPartInput, setTargetPartInput] = useState(1);

  const totalWarnings = groups.reduce((acc, g) => acc + (g.warnings?.length || 0), 0);
  const seriesWithWarnings = groups.filter(g => g.warnings && g.warnings.length > 0).length;

  const handleAssignSubmit = (fileId) => {
    if (!targetSeriesInput.trim()) return;
    onAssignUnrecognized(fileId, targetSeriesInput.trim(), parseInt(targetPartInput, 10) || 1);
    setUnrecognizedAssigningId(null);
    setTargetSeriesInput('');
    setTargetPartInput(1);
  };

  return (
    <div className="space-y-6">
      {/* Top action and overview bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-primary" />
            <span>Detected Video Series ({groups.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review automatically detected series, part sequences, and resolve any duplicate or missing part warnings before merging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isMerging || groups.length === 0}
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 active:scale-95 text-white text-sm font-bold shadow-xl shadow-indigo-500/25 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Confirm & Start Merge</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Video Merge"
        message={`Are you ready to merge ${groups.length} series (${summary.totalFiles || 0} total video clips)? High-speed stream copy will be used where codecs match.`}
        confirmText="Start Merging"
        warningCount={seriesWithWarnings}
        onConfirm={() => {
          setShowConfirm(false);
          onConfirmMerge();
        }}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Unrecognized Files Section */}
      {unrecognized.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-amber-500/40 bg-amber-950/20">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-2">
            <FileQuestion className="w-4 h-4 text-amber-400" />
            <span>Unrecognized Files ({unrecognized.length})</span>
          </div>
          <p className="text-xs text-slate-300 mb-4">
            These files could not be mapped to a numbered series pattern automatically. You can assign them to an existing or new series ID.
          </p>

          <div className="space-y-2">
            {unrecognized.map((file) => {
              const fileId = file.id || file._id;
              const isAssigning = unrecognizedAssigningId === fileId;

              return (
                <div
                  key={fileId}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3"
                >
                  <span className="font-semibold text-slate-200">{file.originalName}</span>

                  {isAssigning ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Target Series ID (e.g. 5.1.1)"
                        value={targetSeriesInput}
                        onChange={(e) => setTargetSeriesInput(e.target.value)}
                        className="px-2.5 py-1 rounded bg-slate-800 border border-brand-primary text-white text-xs font-semibold focus:outline-none"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Part #"
                        value={targetPartInput}
                        onChange={(e) => setTargetPartInput(e.target.value)}
                        className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAssignSubmit(fileId)}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                      >
                        Assign
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnrecognizedAssigningId(null)}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setUnrecognizedAssigningId(fileId);
                        setTargetSeriesInput('');
                        setTargetPartInput(1);
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 font-semibold"
                    >
                      Assign to Series
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Series Cards */}
      <div className="space-y-4">
        {groups.map((group) => (
          <SeriesGroupCard
            key={group.seriesId}
            group={group}
            onMovePart={onMovePart}
            onUpdatePart={onUpdatePart}
            onRemovePart={onRemovePart}
            onSeriesIdChange={onSeriesIdChange}
          />
        ))}
      </div>
    </div>
  );
}
