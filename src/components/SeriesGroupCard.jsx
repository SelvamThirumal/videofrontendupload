import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HardDrive
} from 'lucide-react';
import PartEditor from './PartEditor';
import { formatBytes, formatDuration } from '../services/api';

export default function SeriesGroupCard({
  group,
  onMovePart,
  onUpdatePart,
  onRemovePart,
  onSeriesIdChange
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingFileId, setEditingFileId] = useState(null);
  const [isRenamingSeries, setIsRenamingSeries] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState(group.seriesId);

  const totalDuration = group.parts.reduce((acc, p) => acc + (p.duration || 0), 0);
  const hasWarnings = group.warnings && group.warnings.length > 0;

  const handleSeriesRename = (e) => {
    e.preventDefault();
    if (newSeriesName.trim() && newSeriesName !== group.seriesId) {
      onSeriesIdChange(group.seriesId, newSeriesName.trim());
    }
    setIsRenamingSeries(false);
  };

  return (
    <div
      className={`glass-card rounded-2xl border transition-all duration-200 overflow-hidden ${
        hasWarnings
          ? 'border-amber-500/40 bg-slate-900/80 shadow-amber-900/10'
          : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
      }`}
    >
      {/* Group Card Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {isRenamingSeries ? (
            <form onSubmit={handleSeriesRename} className="flex items-center gap-2">
              <input
                type="text"
                value={newSeriesName}
                onChange={(e) => setNewSeriesName(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-brand-primary text-white text-sm font-bold focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="text-xs px-2.5 py-1 rounded bg-brand-primary text-white font-semibold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsRenamingSeries(false)}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-white font-mono">
                {group.seriesId}
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewSeriesName(group.seriesId);
                  setIsRenamingSeries(true);
                }}
                className="text-slate-500 hover:text-brand-primary transition p-1"
                title="Rename Series"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {group.totalParts} {group.totalParts === 1 ? 'part' : 'parts'}
          </span>
        </div>

        {/* Status badges & metrics */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-400">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatBytes(group.totalSize)}</span>
          </div>

          {totalDuration > 0 && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatDuration(totalDuration)}</span>
            </div>
          )}

          {hasWarnings ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/40">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              {group.warnings.length} {group.warnings.length === 1 ? 'Warning' : 'Warnings'}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Ready to Merge
            </span>
          )}
        </div>
      </div>

      {/* Warning banner */}
      {hasWarnings && (
        <div className="bg-amber-950/30 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-300 space-y-1">
          {group.warnings.map((w, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Parts List */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-2">
          {group.parts.map((part, index) => {
            const fileId = part.id || part._id;
            const isEditing = editingFileId === fileId;

            return (
              <div key={fileId} className="transition-all">
                {isEditing ? (
                  <PartEditor
                    file={part}
                    currentSeriesId={group.seriesId}
                    currentPartNumber={part.partNumber}
                    onSave={(updated) => {
                      onUpdatePart(fileId, updated);
                      setEditingFileId(null);
                    }}
                    onCancel={() => setEditingFileId(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 text-xs transition">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="w-7 h-7 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-mono font-bold flex items-center justify-center flex-shrink-0">
                        {part.partNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-200 truncate">{part.originalName}</p>
                        {part.relativePath && part.relativePath !== part.originalName && (
                          <p className="text-[11px] text-slate-500 truncate">{part.relativePath}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-mono text-slate-400">{formatBytes(part.fileSize)}</span>
                      {part.duration > 0 && (
                        <span className="font-mono text-slate-500">{formatDuration(part.duration)}</span>
                      )}

                      {/* Reorder and Edit Actions */}
                      <div className="flex items-center gap-0.5 border-l border-slate-800 pl-2">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => onMovePart(group.seriesId, index, -1)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === group.parts.length - 1}
                          onClick={() => onMovePart(group.seriesId, index, 1)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFileId(fileId)}
                          className="p-1 rounded text-slate-400 hover:text-brand-primary hover:bg-slate-800 transition"
                          title="Edit Series ID or Part #"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemovePart(fileId)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Remove File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
