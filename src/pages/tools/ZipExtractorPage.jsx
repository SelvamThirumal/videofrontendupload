import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FolderArchive, Download, File, Folder, CheckCircle2, ShieldCheck, Eye } from 'lucide-react';
import ToolLayout from '../../components/tools/ToolLayout';
import ToolDropzone from '../../components/tools/ToolDropzone';
import ToolProgressBar from '../../components/tools/ToolProgressBar';
import { addToolHistoryItem } from '../../components/tools/ToolHistoryModal';
import { api, formatBytes } from '../../services/api';

export default function ZipExtractorPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleFileSelected = (files) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setResult(null);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      toast.error('Please upload a ZIP file first.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      const res = await api.extractZip({
        file: selectedFile,
        onUploadProgress: (pct) => setProgress(Math.min(85, Math.max(25, pct)))
      });

      setProgress(100);
      setResult(res);
      toast.success(`Extracted ${res.totalFiles} files successfully!`);

      addToolHistoryItem({
        toolName: 'ZIP Extractor',
        fileName: selectedFile.name,
        downloadUrl: null,
        details: `${res.totalFiles} files extracted (${formatBytes(res.totalUncompressedSize)})`
      });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'ZIP extraction failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="ZIP Extractor & Inspector"
      description="Extract and inspect ZIP archives safely on the server with active ZIP-Slip path traversal protection. View extracted file contents and download individual files."
      category="ZIP Tools"
      badge="ZIP-Slip Safe"
      icon={FolderArchive}
    >
      <div className="space-y-8">
        {/* Dropzone */}
        <ToolDropzone
          accept=".zip,application/zip,application/x-zip-compressed"
          multiple={false}
          files={selectedFile ? [selectedFile] : []}
          onFilesSelected={handleFileSelected}
          onFileRemoved={() => setSelectedFile(null)}
          onClearAll={() => { setSelectedFile(null); setResult(null); }}
          helperText="Upload your ZIP archive here"
        />

        {/* Action Button */}
        {selectedFile && !result && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleExtract}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Inspect & Extract ZIP</span>
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <ToolProgressBar
            progress={progress}
            stage="Inspecting entries and securely extracting files..."
          />
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-slate-900/80 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ZIP Archive Extracted Safely</h3>
                  <p className="text-xs text-slate-400">
                    {result.totalFiles} file(s), {result.totalFolders} folder(s) • Uncompressed: {formatBytes(result.totalUncompressedSize)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-xs font-semibold text-emerald-400 border border-slate-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Clean & Protected</span>
              </div>
            </div>

            {/* Extracted Files List */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-primary" />
                <span>Extracted Files ({result.files.length})</span>
              </h4>

              <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {result.files.map((f, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {f.isDirectory ? (
                        <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      ) : (
                        <File className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      )}
                      <span className="text-slate-200 font-medium truncate" title={f.relativePath}>
                        {f.relativePath}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-slate-400 font-mono text-[11px]">
                        {f.isDirectory ? 'Folder' : formatBytes(f.size)}
                      </span>
                      {f.downloadUrl && (
                        <a
                          href={f.downloadUrl}
                          download={f.name}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition flex items-center gap-1 border border-slate-700"
                        >
                          <Download className="w-3 h-3 text-brand-primary" />
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

