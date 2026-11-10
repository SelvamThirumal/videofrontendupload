import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Download, Sparkles, CheckCircle2, FileCheck, Layers } from 'lucide-react';
import ToolLayout from '../../components/tools/ToolLayout';
import ToolDropzone from '../../components/tools/ToolDropzone';
import ToolProgressBar from '../../components/tools/ToolProgressBar';
import { addToolHistoryItem } from '../../components/tools/ToolHistoryModal';
import { api, formatBytes } from '../../services/api';

export default function PdfToWordPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [enableOcr, setEnableOcr] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleFileSelected = (files) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setResult(null);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      toast.error('Please upload a PDF document first.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      const res = await api.convertPdfToWord({
        file: selectedFile,
        enableOcr,
        onUploadProgress: (pct) => setProgress(Math.min(85, Math.max(25, pct)))
      });

      setProgress(100);
      setResult(res);
      toast.success('PDF successfully converted to Word (.docx)!');

      addToolHistoryItem({
        toolName: 'PDF to Word',
        fileName: res.fileName,
        downloadUrl: res.downloadUrl,
        details: `${res.pagesProcessed} page(s) • ${formatBytes(res.fileSize)}`
      });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Conversion failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to Word Converter"
      description="Convert PDF documents into editable Word (.docx) files while preserving layout, text formatting, and paragraphs. Includes optional OCR for scanned pages."
      category="PDF Tools"
      badge="Editable DOCX"
      icon={FileText}
    >
      <div className="space-y-8">
        {/* Dropzone */}
        <ToolDropzone
          accept="application/pdf,.pdf"
          multiple={false}
          files={selectedFile ? [selectedFile] : []}
          onFilesSelected={handleFileSelected}
          onFileRemoved={() => setSelectedFile(null)}
          onClearAll={() => { setSelectedFile(null); setResult(null); }}
          helperText="Upload your PDF file here"
        />

        {/* Options */}
        {selectedFile && (
          <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  <span>Conversion Settings</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Configure text and scanned document parsing
                </p>
              </div>

              {/* OCR Toggle */}
              <label className="flex items-center gap-3 cursor-pointer bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                <input
                  type="checkbox"
                  checked={enableOcr}
                  onChange={(e) => setEnableOcr(e.target.checked)}
                  className="rounded accent-brand-primary cursor-pointer w-4 h-4"
                />
                <div className="text-xs">
                  <span className="font-semibold text-white block">Enable OCR for Scanned Pages</span>
                  <span className="text-[10px] text-slate-400">Extracts text from scanned images using OCR</span>
                </div>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConvert}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Convert to Word (.docx)</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <ToolProgressBar
            progress={progress}
            stage={enableOcr ? 'Parsing PDF and running OCR text extraction...' : 'Extracting text and generating DOCX...'}
          />
        )}

        {/* Result Card */}
        {result && (
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-slate-900/80 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Word Document Ready</h3>
                  <p className="text-xs text-slate-400">
                    Processed {result.pagesProcessed} page(s) • {result.paragraphsCount} paragraphs generated
                  </p>
                </div>
              </div>

              <a
                href={result.downloadUrl}
                download={result.fileName}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download DOCX ({formatBytes(result.fileSize)})</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
