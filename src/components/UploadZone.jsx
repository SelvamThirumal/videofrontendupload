import React, { useRef, useState } from 'react';
import { UploadCloud, FolderUp, Film, FilePlus2, AlertCircle } from 'lucide-react';
import { formatBytes } from '../services/api';

const SUPPORTED_EXTS = ['.mp4', '.mov', '.mkv', '.webm', '.avi', '.m4v', '.ts', '.flv'];

export default function UploadZone({ onFilesSelected, isUploading, maxBatchSizeMB = 1024 }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFiles = (fileList, relativePathPrefix = '') => {
    if (!fileList || fileList.length === 0) return;

    const validFiles = [];
    const relativePaths = {};

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (SUPPORTED_EXTS.includes(ext)) {
        validFiles.push(file);
        // Store relative path from webkitRelativePath or construct
        const relPath = file.webkitRelativePath || (relativePathPrefix ? `${relativePathPrefix}/${file.name}` : file.name);
        relativePaths[file.name] = relPath;
      }
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles, relativePaths);
    }
  };

  // Drag and drop directory scanner
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isUploading) return;

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) {
      handleFiles(e.dataTransfer.files);
      return;
    }

    const files = [];
    const relativePaths = {};

    const scanEntry = async (entry, currentPath = '') => {
      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file((file) => {
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            if (SUPPORTED_EXTS.includes(ext)) {
              files.push(file);
              const rel = currentPath ? `${currentPath}/${file.name}` : file.name;
              relativePaths[file.name] = rel;
            }
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const readEntries = async () => {
          return new Promise((resolve) => {
            dirReader.readEntries(async (entries) => {
              if (!entries || entries.length === 0) {
                resolve();
                return;
              }
              for (const child of entries) {
                await scanEntry(child, currentPath ? `${currentPath}/${entry.name}` : entry.name);
              }
              // readEntries can return results in batches; call again until empty
              await readEntries();
              resolve();
            });
          });
        };
        await readEntries();
      }
    };

    const promises = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          promises.push(scanEntry(entry));
        }
      } else if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    await Promise.all(promises);

    if (files.length > 0) {
      onFilesSelected(files, relativePaths);
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file and folder inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,.mkv,.ts,.flv"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-brand-primary bg-indigo-950/30 scale-[1.01] shadow-2xl shadow-indigo-500/20'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <div className="flex flex-col items-center justify-center max-w-lg mx-auto">
          {/* Animated upload icon */}
          <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-tr from-brand-primary/20 via-brand-secondary/20 to-cyan-500/10 border border-indigo-500/30 flex items-center justify-center shadow-inner group">
            <UploadCloud className="w-10 h-10 text-brand-primary animate-bounce" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
            Drag & drop video files or an entire folder
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Upload split video lessons or multi-part episodes. Series codes and part numbers are detected automatically.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 active:scale-95 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-150 disabled:opacity-50"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Select Files</span>
            </button>

            <button
              type="button"
              disabled={isUploading}
              onClick={() => folderInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 text-sm font-semibold border border-slate-700 shadow-md transition-all duration-150 disabled:opacity-50"
            >
              <FolderUp className="w-4 h-4 text-brand-secondary" />
              <span>Select Folder</span>
            </button>
          </div>

          {/* Badges footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 w-full flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              MP4, MOV, MKV, WebM, AVI, TS
            </span>
            <span>•</span>
            <span>Max Batch: <strong className="text-slate-300">{maxBatchSizeMB >= 1048576 ? `${(maxBatchSizeMB / 1048576).toFixed(0)} TB` : maxBatchSizeMB >= 1024 ? `${(maxBatchSizeMB / 1024).toFixed(0)} GB` : `${maxBatchSizeMB} MB`}</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Free & Zero Watermark</span>
          </div>
        </div>
      </div>
    </div>
  );
}
