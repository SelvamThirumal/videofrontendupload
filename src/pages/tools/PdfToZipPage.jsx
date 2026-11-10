import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Archive, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import ToolLayout from '../../components/tools/ToolLayout';
import ToolDropzone from '../../components/tools/ToolDropzone';
import ToolProgressBar from '../../components/tools/ToolProgressBar';
import { addToolHistoryItem } from '../../components/tools/ToolHistoryModal';
import { api, formatBytes } from '../../services/api';

export default function PdfToZipPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [customZipName, setCustomZipName] = useState('pdf_collection.zip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleFilesSelected = (newFiles) => {
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setResult(null);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setResult(null);
  };

  const handleBundle = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please upload at least one PDF file.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      const res = await api.bundlePdfsToZip({
        files: selectedFiles,
        customZipName,
        onUploadProgress: (pct) => setProgress(Math.min(85, Math.max(25, pct)))
      });

      setProgress(100);
      setResult(res);
      toast.success(`Bundled ${res.filesCount} PDFs into ZIP archive!`);

      addToolHistoryItem({
        toolName: 'PDF to ZIP',
        fileName: res.fileName,
        downloadUrl: res.downloadUrl,
        details: `${res.filesCount} PDF(s) bundled • ${formatBytes(res.fileSize)}`
      });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'ZIP bundling failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to ZIP Converter"
      description="Bundle single or multiple PDF documents into an uncompressed or optimized ZIP archive with custom naming without altering your documents."
      category="PDF Tools"
      badge="Bulk Packager"
      icon={Archive}
    >
      <div className="space-y-8">
        {/* Dropzone */}
        <ToolDropzone
          accept="application/pdf,.pdf"
          multiple={true}
          files={selectedFiles}
          onFilesSelected={handleFilesSelected}
          onFileRemoved={handleRemoveFile}
          onClearAll={handleClearAll}
          helperText="Upload one or multiple PDF documents here"
        />

        {/* Options */}
        {selectedFiles.length > 0 && (
          <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[240px]">
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Custom ZIP Archive Name
                </label>
                <input
                  type="text"
                  value={customZipName}
                  onChange={(e) => setCustomZipName(e.target.value)}
                  placeholder="e.g. my_documents.zip"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleBundle}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  <span>Create ZIP Archive ({selectedFiles.length} files)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <ToolProgressBar
            progress={progress}
            stage="Packaging and compressing PDFs into ZIP archive..."
          />
        )}

        {/* Result Card */}
        {result && (
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-slate-900/80 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ZIP Archive Created</h3>
                <p className="text-xs text-slate-400">
                  {result.filesCount} file(s) bundled • Total size: {formatBytes(result.fileSize)}
                </p>
              </div>
            </div>

            <a
              href={result.downloadUrl}
              download={result.fileName}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP ({formatBytes(result.fileSize)})</span>
            </a>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
