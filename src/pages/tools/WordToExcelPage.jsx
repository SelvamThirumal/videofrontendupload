import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FileSpreadsheet, Download, Sparkles, CheckCircle2, Table, Eye } from 'lucide-react';
import ToolLayout from '../../components/tools/ToolLayout';
import ToolDropzone from '../../components/tools/ToolDropzone';
import ToolProgressBar from '../../components/tools/ToolProgressBar';
import { addToolHistoryItem } from '../../components/tools/ToolHistoryModal';
import { api, formatBytes } from '../../services/api';

export default function WordToExcelPage() {
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

  const handleConvert = async () => {
    if (!selectedFile) {
      toast.error('Please upload a Word (.docx/.doc) document first.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      const res = await api.convertWordToExcel({
        file: selectedFile,
        onUploadProgress: (pct) => setProgress(Math.min(85, Math.max(25, pct)))
      });

      setProgress(100);
      setResult(res);
      toast.success(`Extracted ${res.tablesCount} table(s) into Excel!`);

      addToolHistoryItem({
        toolName: 'Word to Excel',
        fileName: res.fileName,
        downloadUrl: res.downloadUrl,
        details: `${res.tablesCount} table(s) extracted • ${formatBytes(res.fileSize)}`
      });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Conversion failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Word to Excel Converter"
      description="Extract tables and structured data from Word (.docx / .doc) documents and convert them into organized, styled Excel (.xlsx) spreadsheets with live table preview."
      category="Word & Excel Tools"
      badge="Table Parser"
      icon={FileSpreadsheet}
    >
      <div className="space-y-8">
        {/* Dropzone */}
        <ToolDropzone
          accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
          multiple={false}
          files={selectedFile ? [selectedFile] : []}
          onFilesSelected={handleFileSelected}
          onFileRemoved={() => setSelectedFile(null)}
          onClearAll={() => { setSelectedFile(null); setResult(null); }}
          helperText="Upload your Word document (.docx or .doc) containing tables"
        />

        {/* Action Button */}
        {selectedFile && !result && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConvert}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Table className="w-4 h-4" />
              <span>Extract Tables to Excel (.xlsx)</span>
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <ToolProgressBar
            progress={progress}
            stage="Parsing document tables and constructing Excel workbook..."
          />
        )}

        {/* Result & Table Preview */}
        {result && (
          <div className="space-y-6">
            {/* Download Card */}
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-slate-900/80 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Excel Spreadsheet Ready</h3>
                  <p className="text-xs text-slate-400">
                    Extracted {result.tablesCount} table(s) • Size: {formatBytes(result.fileSize)}
                  </p>
                </div>
              </div>

              <a
                href={result.downloadUrl}
                download={result.fileName}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Excel (.xlsx)</span>
              </a>
            </div>

            {/* Tables Preview Section */}
            {result.tablesPreview && result.tablesPreview.length > 0 && (
              <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Eye className="w-4 h-4 text-brand-primary" />
                  <span>Extracted Tables Preview</span>
                </div>

                <div className="space-y-6">
                  {result.tablesPreview.map((tbl, tIdx) => (
                    <div key={tIdx} className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        {tbl.title} ({tbl.rows.length} rows)
                      </span>
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-xs text-left">
                          <tbody>
                            {tbl.rows.slice(0, 10).map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={rIdx === 0 ? 'bg-indigo-950/60 font-bold text-indigo-200 border-b border-slate-800' : 'border-b border-slate-800/40 text-slate-300 hover:bg-slate-800/30'}
                              >
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-3.5 py-2.5 border-r border-slate-800/40 last:border-r-0 whitespace-nowrap">
                                    {cell || '—'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {tbl.rows.length > 10 && (
                        <p className="text-[11px] text-slate-500 italic">
                          Showing first 10 rows of {tbl.rows.length}. Full table is included in download.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

