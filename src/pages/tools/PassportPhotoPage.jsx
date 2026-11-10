import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { UserCheck, Download, Printer, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import ToolLayout from '../../components/tools/ToolLayout';
import ToolDropzone from '../../components/tools/ToolDropzone';
import ToolProgressBar from '../../components/tools/ToolProgressBar';
import { addToolHistoryItem } from '../../components/tools/ToolHistoryModal';
import { api, formatBytes } from '../../services/api';

export default function PassportPhotoPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [presetKey, setPresetKey] = useState('indian');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [bgColorKey, setBgColorKey] = useState('white');
  const [copiesOnA4, setCopiesOnA4] = useState(8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const handleFileSelected = (files) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setResults(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.error('Please upload a photo first.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      const res = await api.generatePassportPhoto({
        file: selectedFile,
        presetKey,
        customWidth: presetKey === 'custom' ? customWidth : null,
        customHeight: presetKey === 'custom' ? customHeight : null,
        bgColorKey,
        copiesOnA4,
        onUploadProgress: (pct) => setProgress(Math.min(90, Math.max(25, pct)))
      });

      setProgress(100);
      setResults(res);
      toast.success('Passport photos generated successfully!');

      addToolHistoryItem({
        toolName: 'Passport Photo',
        fileName: res.a4SheetPdf.fileName,
        downloadUrl: res.a4SheetPdf.downloadUrl,
        details: `${presetKey.toUpperCase()} preset (${copiesOnA4} photos on A4)`
      });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Generation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Passport Size Photo Generator"
      description="Create official passport size photos with standard dimensions (Indian 35x45mm, US 2x2 inch), background colors, and print-ready tiled A4 sheets in high-resolution JPG & PDF."
      category="Image Tools"
      badge="Print-Ready A4"
      icon={UserCheck}
    >
      <div className="space-y-8">
        {/* Dropzone */}
        <ToolDropzone
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple={false}
          files={selectedFile ? [selectedFile] : []}
          onFilesSelected={handleFileSelected}
          onFileRemoved={() => setSelectedFile(null)}
          onClearAll={() => { setSelectedFile(null); setResults(null); }}
          helperText="Upload your portrait photo (face centered)"
        />

        {/* Options Panel */}
        {selectedFile && (
          <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span>Passport Specifications</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
              {/* Preset Selector */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Photo Dimension Preset</label>
                <select
                  value={presetKey}
                  onChange={(e) => setPresetKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="indian">Indian Passport (35 x 45 mm)</option>
                  <option value="us">US / International (2 x 2 inch / 51x51 mm)</option>
                  <option value="square">Square Photo (35 x 35 mm)</option>
                  <option value="custom">Custom Dimensions</option>
                </select>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Background Color</label>
                <select
                  value={bgColorKey}
                  onChange={(e) => setBgColorKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="white">Standard White (#FFFFFF)</option>
                  <option value="blue">Blue (#3B82F6)</option>
                  <option value="light_blue">Light Blue (#E0F2FE)</option>
                  <option value="light_grey">Light Grey (#E2E8F0)</option>
                </select>
              </div>

              {/* Copies on A4 Sheet */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Photos on A4 Sheet</label>
                <select
                  value={copiesOnA4}
                  onChange={(e) => setCopiesOnA4(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value={4}>4 Photos (2 x 2)</option>
                  <option value={8}>8 Photos (4 x 2 Grid - Recommended)</option>
                  <option value={16}>16 Photos (4 x 4 Grid)</option>
                  <option value={32}>32 Photos (4 x 8 Grid)</option>
                </select>
              </div>

              {/* Custom Dimensions (if selected) */}
              {presetKey === 'custom' && (
                <div className="space-y-2 flex gap-2">
                  <div className="flex-1">
                    <label className="text-slate-300 font-semibold block">Width (px)</label>
                    <input
                      type="number"
                      placeholder="e.g. 413"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-slate-300 font-semibold block">Height (px)</label>
                    <input
                      type="number"
                      placeholder="e.g. 531"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleGenerate}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Generate Print-Ready Photos</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <ToolProgressBar
            progress={progress}
            stage="Generating single crop & printable A4 sheet grid..."
          />
        )}

        {/* Results */}
        {results && (
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-slate-900/80 shadow-2xl space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Passport Photos Ready to Download & Print</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option 1: Single JPG */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    Digital Crop
                  </span>
                  <h4 className="text-sm font-bold text-white mt-2">Single Passport Photo</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Standard high-res cropped portrait ({results.singlePhoto.width}x{results.singlePhoto.height} px).
                  </p>
                </div>
                <a
                  href={results.singlePhoto.downloadUrl}
                  download={results.singlePhoto.fileName}
                  className="w-full py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JPG</span>
                </a>
              </div>

              {/* Option 2: A4 Printable JPG */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    Printable Grid
                  </span>
                  <h4 className="text-sm font-bold text-white mt-2">A4 Sheet Grid (JPG)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {results.a4SheetJpg.copies} photos arranged on 300 DPI A4 sheet with border guidelines.
                  </p>
                </div>
                <a
                  href={results.a4SheetJpg.downloadUrl}
                  download={results.a4SheetJpg.fileName}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download A4 JPG</span>
                </a>
              </div>

              {/* Option 3: A4 Printable PDF */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                    Best for Printing
                  </span>
                  <h4 className="text-sm font-bold text-white mt-2">A4 Print Document (PDF)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct print-ready PDF formatted to standard A4 paper size.
                  </p>
                </div>
                <a
                  href={results.a4SheetPdf.downloadUrl}
                  download={results.a4SheetPdf.fileName}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download A4 PDF</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

