import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';
import { formatBytes } from '../../services/api';

export default function ToolDropzone({
  accept = '*',
  multiple = false,
  files = [],
  onFilesSelected,
  onFileRemoved,
  onClearAll,
  maxFiles = 50,
  helperText = 'Drag & drop your files here, or click to browse'
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      if (!multiple) {
        onFilesSelected([droppedFiles[0]]);
      } else {
        onFilesSelected(droppedFiles.slice(0, maxFiles));
      }
    }
  };

  const handleInputChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      if (!multiple) {
        onFilesSelected([selected[0]]);
      } else {
        onFilesSelected(selected.slice(0, maxFiles));
      }
    }
    // Reset input so same file can be selected again
    e.target.value = null;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-brand-primary bg-brand-primary/10 scale-[1.01]'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-brand-primary shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-200">
              {helperText}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports: <span className="text-slate-300 font-mono">{accept}</span> {multiple ? `(Up to ${maxFiles} files)` : '(Single file)'}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Selected Files ({files.length})
            </span>
            {onClearAll && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 transition"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {files.map((file, idx) => (
              <div
                key={`${file.name}_${idx}`}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <File className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="text-slate-200 font-medium truncate" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px] flex-shrink-0">
                    ({formatBytes(file.size)})
                  </span>
                </div>

                {onFileRemoved && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileRemoved(idx);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
