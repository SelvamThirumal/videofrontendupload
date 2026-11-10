import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Download, Archive, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import ToolLayout from '../../components/tools/ToolLayout';
import ToolDropzone from '../../components/tools/ToolDropzone';
import ToolProgressBar from '../../components/tools/ToolProgressBar';
import { addToolHistoryItem } from '../../components/tools/ToolHistoryModal';
import { api, formatBytes } from '../../services/api';

const SUPPORTED_FORMATS = [
  { value: 'webp', label: 'WebP (Modern & Lightweight)' },
  { value: 'jpeg', label: 'JPG / JPEG (Universal)' },
  { value: 'png', label: 'PNG (Lossless Transparency)' },
  { value: 'gif', label: 'GIF (Graphics)' },
  { value: 'tiff', label: 'TIFF (High-res Print)' },
  { value: 'avif', label: 'AVIF (Next-Gen)' }
];

export default function ImageConverterPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('webp');
  const [quality, setQuality] = useState(85);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const handleFilesSelected = (newFiles) => {
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setResults(null);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setResults(null);
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please upload at least one image file.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      const res = await api.convertImageFormat({
        files: selectedFiles,
        targetFormat,
        quality,
        onUploadProgress: (pct) => setProgress(Math.min(90, Math.max(25, pct)))
      });

      setProgress(100);
      setResults(res);
      toast.success(`Successfully converted ${res.results.length} image(s) to ${targetFormat.toUpperCase()}!`);

      res.results.forEach((item) => {
        addToolHistoryItem({
          toolName: 'Image Converter',
          fileName: item.fileName,
          downloadUrl: item.downloadUrl,
          details: `Converted to ${item.format.toUpperCase()} (${formatBytes(item.convertedSize)})`
        });
      });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Image conversion failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Image Format Converter"
      description="Convert images between JPG, PNG, WebP, GIF, TIFF, and AVIF formats in bulk with custom quality settings and single or ZIP downloads."
      category="Image Tools"
      badge="Multi-Format"
      icon={RefreshCw}
    >
      <div className="space-y-8">
        {/* Dropzone */}
        <ToolDropzone
          accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.avif"
          multiple={true}
          files={selectedFiles}
          onFilesSelected={handleFilesSelected}
          onFileRemoved={handleRemoveFile}
          onClearAll={handleClearAll}
          helperText="Upload JPG, PNG, WebP, GIF, BMP, or TIFF images"
        />

        {/* Settings Panel */}
        {selectedFiles.length > 0 && (
          <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span>Conversion Target Settings</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Target Format */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Convert All To</label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-primary font-medium"
                >
                  {SUPPORTED_FORMATS.map((fmt) => (
                    <option key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <label className="text-slate-300">Encoding Quality: {quality}%</label>
                  <span className="text-brand-primary font-mono">{quality >= 85 ? 'High Fidelity' : 'Standard'}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-primary cursor-pointer mt-2"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConvert}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
              >
                <span>Convert {selectedFiles.length} Image(s) Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <ToolProgressBar
            progress={progress}
            stage={`Converting images to ${targetFormat.toUpperCase()} with Sharp...`}
          />
        )}

        {/* Results Gallery */}
        {results && results.results && (
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-slate-900/80 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Conversion Complete</h3>
              </div>

              {results.zipDownload && (
                <a
                  href={results.zipDownload.downloadUrl}
                  download={results.zipDownload.fileName}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-lg shadow-emerald-500/10"
                >
                  <Archive className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </a>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-slate-800">
              {results.results.map((item, idx) => (
                <div key={idx} className="py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="min-w-0 max-w-sm">
                    <p className="font-semibold text-slate-200 truncate">{item.originalName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      New Format: <span className="text-indigo-400 font-bold uppercase">{item.format}</span> • {item.width} x {item.height} px
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="font-bold text-white font-mono text-sm">{formatBytes(item.convertedSize)}</span>

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
