import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Minimize2, Download, Archive, ArrowRight, Percent, Sparkles, CheckCircle2 } from 'lucide-react';
import ToolLayout from '../../components/tools/ToolLayout';
import ToolDropzone from '../../components/tools/ToolDropzone';
import ToolProgressBar from '../../components/tools/ToolProgressBar';
import { addToolHistoryItem } from '../../components/tools/ToolHistoryModal';
import { api, formatBytes } from '../../services/api';

export default function ImageReducerPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [quality, setQuality] = useState(75);
  const [targetSizeKB, setTargetSizeKB] = useState('');
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [format, setFormat] = useState('original');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const handleFilesSelected = (newFiles) => {
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setResults(null);
  };

  const handleCompress = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please upload at least one image file.');
      return;
    }

    setIsProcessing(true);
    setProgress(15);

    try {
      const res = await api.reduceImageSize({
        files: selectedFiles,
        quality,
        targetSizeKB: targetSizeKB ? parseInt(targetSizeKB, 10) : null,
        maxWidth: maxWidth ? parseInt(maxWidth, 10) : null,
        maxHeight: maxHeight ? parseInt(maxHeight, 10) : null,
        format: format !== 'original' ? format : null,
        onUploadProgress: (pct) => setProgress(Math.min(90, Math.max(20, pct)))
      });

      setProgress(100);
      setResults(res);
      toast.success(`Successfully compressed ${res.results.length} images!`);

      // Add to history
      res.results.forEach((item) => {
        addToolHistoryItem({
          toolName: 'Image Reducer',
          fileName: item.fileName,
          downloadUrl: item.downloadUrl,
          details: `Saved ${item.percentSaved}% (${formatBytes(item.savedBytes)})`
        });
      });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Image compression failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Image Size Reducer"
      description="Compress and reduce image file sizes in KB or MB with customizable quality sliders, target size limits, and instant before/after size comparisons."
      category="Image Tools"
      badge="Lossless Sharp"
      icon={Minimize2}
    >
      <div className="space-y-8">
        {/* Dropzone */}
        <ToolDropzone
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple={true}
          files={selectedFiles}
          onFilesSelected={handleFilesSelected}
          onFileRemoved={handleRemoveFile}
          onClearAll={handleClearAll}
          helperText="Drop your JPG, PNG, or WebP images here"
        />

        {/* Compression Settings Panel */}
        {selectedFiles.length > 0 && (
          <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span>Compression Settings</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <label className="text-slate-300">Quality: {quality}%</label>
                  <span className="text-brand-primary font-mono">{quality >= 80 ? 'High' : quality >= 50 ? 'Balanced' : 'Max Compression'}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-primary cursor-pointer"
                />
              </div>

              {/* Target File Size in KB */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Target File Size (KB - Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 200 (for 200 KB)"
                  value={targetSizeKB}
                  onChange={(e) => setTargetSizeKB(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Max Width */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Max Width (px - Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 1920"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Output Format */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Output Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="original">Keep Original</option>
                  <option value="jpeg">JPG / JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP (Most Efficient)</option>
                </select>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompress}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
              >
                <span>Compress Images Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <ToolProgressBar
            progress={progress}
            stage="Compressing and optimizing images with Sharp..."
          />
        )}

        {/* Results Gallery */}
        {results && results.results && (
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-slate-900/80 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Compression Complete</h3>
              </div>

              {results.zipDownload && (
                <a
                  href={results.zipDownload.downloadUrl}
                  download={results.zipDownload.fileName}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-lg shadow-emerald-500/10"
                >
                  <Archive className="w-4 h-4" />
                  <span>Download All as ZIP ({formatBytes(results.zipDownload.fileSize)})</span>
                </a>
              )}
            </div>

            {/* Results Table */}
            <div className="divide-y divide-slate-800">
              {results.results.map((item, idx) => (
                <div key={idx} className="py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="min-w-0 max-w-sm">
                    <p className="font-semibold text-slate-200 truncate">{item.originalName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Output dimensions: {item.width} x {item.height} px
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Before / After Stats */}
                    <div className="text-right">
                      <span className="text-slate-500 line-through text-[11px] block">{formatBytes(item.originalSize)}</span>
                      <span className="font-bold text-white font-mono text-sm">{formatBytes(item.compressedSize)}</span>
                    </div>

                    {/* Savings Badge */}
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      <span>{item.percentSaved}% Saved</span>
                    </span>

                    {/* Download Button */}
                    <a
                      href={item.downloadUrl}
                      download={item.fileName}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition flex items-center gap-1.5 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

