import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  FolderTree,
  FileCheck2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import UploadZone from '../components/UploadZone';
import FileList from '../components/FileList';
import ProgressBar from '../components/ProgressBar';
import { api, formatBytes } from '../services/api';

const MAX_BATCH_BYTES = 1024 * 1024 * 1024 * 1024; // 1 TB

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [relativePaths, setRelativePaths] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cancelController, setCancelController] = useState(null);

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  const handleFilesSelected = (newFiles, newPaths) => {
    // Append or deduplicate files
    const existingNames = new Set(selectedFiles.map(f => f.name));
    const mergedFiles = [...selectedFiles];
    const mergedPaths = { ...relativePaths, ...newPaths };

    for (const f of newFiles) {
      if (!existingNames.has(f.name)) {
        mergedFiles.push(f);
      }
    }

    setSelectedFiles(mergedFiles);
    setRelativePaths(mergedPaths);
    toast.success(`Added ${newFiles.length} video files.`);
  };

  const handleRemoveFile = (index) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles(updated);
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setRelativePaths({});
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;

    if (totalSize > MAX_BATCH_BYTES) {
      toast.error('Total batch size exceeds the 1 TB limit. Please remove some files.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const controller = new AbortController();
    setCancelController(controller);

    try {
      toast.loading('Uploading and analyzing video series...', { id: 'upload-toast' });

      const response = await api.uploadBatch({
        files: selectedFiles,
        relativePaths,
        onUploadProgress: (percent) => {
          setUploadProgress(percent);
        },
        cancelSignal: controller.signal
      });

      toast.success('Upload complete! Video series identified.', { id: 'upload-toast' });
      navigate(`/batch/${response.batchId}/preview`, { state: { batchData: response } });
    } catch (err) {
      if (controller.signal.aborted) {
        toast.error('Upload was cancelled.', { id: 'upload-toast' });
      } else {
        toast.error(err.response?.data?.error || err.message || 'Upload failed.', { id: 'upload-toast' });
      }
    } finally {
      setIsUploading(false);
      setCancelController(null);
    }
  };

  const handleCancelUpload = () => {
    if (cancelController) {
      cancelController.abort();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
          <span>Intelligent Multi-Series Grouping & Lossless Stream Merger</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          FASTBATCH
          <span className="block text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent mt-1">
            Smart Bulk Video Merger
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
          Upload whole folders or multiple split video lessons. FASTBATCH automatically recognizes series numbers (e.g. <span className="font-mono text-indigo-300">5.1.1 Part 2</span>), sorts parts numerically, and merges each series into a single high-quality MP4.
        </p>
      </div>

      {/* Upload Zone & File List Area */}
      <div className="space-y-6">
        <UploadZone
          onFilesSelected={handleFilesSelected}
          isUploading={isUploading}
          maxBatchSizeMB={1048576}
        />

        {/* Upload in Progress Display */}
        {isUploading && (
          <div className="glass-card rounded-2xl p-6 border border-brand-primary/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-indigo-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                Uploading & Streaming to Server ({formatBytes(totalSize)})
              </span>
              <button
                type="button"
                onClick={handleCancelUpload}
                className="text-slate-400 hover:text-rose-400 transition"
              >
                Cancel Upload
              </button>
            </div>
            <ProgressBar progress={uploadProgress} stage="Streaming files to disk..." />
          </div>
        )}

        <FileList
          files={selectedFiles}
          relativePaths={relativePaths}
          totalSize={totalSize}
          maxBatchSizeBytes={MAX_BATCH_BYTES}
          onRemoveFile={handleRemoveFile}
          onClearAll={handleClearAll}
          onStartUpload={handleStartUpload}
          isUploading={isUploading}
        />
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-800/80">
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-brand-primary flex items-center justify-center mb-4">
            <FolderTree className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">Intelligent Parser</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Detects <code className="text-indigo-300">5.1.1.mp4</code> as Part 1, handles roman &amp; explicit part keywords, and strictly isolates different series like <code className="text-indigo-300">5.1.1</code> from <code className="text-indigo-300">5.1.10</code>.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">Fast Stream Copy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspects video streams with FFprobe. When codecs and parameters align, merges instantly using <code className="text-amber-300">-c copy</code> without lossy re-encoding.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">10-Minute Auto Cleanup</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Zero account required. When your outputs are ready, an exact 10-minute countdown begins, safely wiping all uploaded and merged videos from disk.
          </p>
        </div>
      </div>
    </div>
  );
}
