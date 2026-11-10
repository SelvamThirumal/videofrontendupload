import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Minimize2,
  UserCheck,
  FileText,
  FileSpreadsheet,
  Archive,
  FolderArchive,
  RefreshCw,
  Camera,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

const TOOLS = [
  {
    id: 'video-merger',
    title: 'Smart Bulk Video Merger',
    description: 'Auto-detect series identifiers, numerically sort parts, and lossless stream-copy merge up to 1 TB.',
    category: 'Video Tools',
    icon: Film,
    path: '/',
    badge: 'Core Engine',
    color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'image-reducer',
    title: 'Image Size Reducer',
    description: 'Compress JPG, PNG, and WebP images to exact target KB/MB with quality sliders and before/after previews.',
    category: 'Image Tools',
    icon: Minimize2,
    path: '/tools/image-reducer',
    badge: 'Lossless Sharp',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'passport-photo',
    title: 'Passport Size Photo Generator',
    description: 'Instant Indian (35x45mm) & US (2x2") passport cropping, background color selection, and printable A4 grid PDF/JPG.',
    category: 'Image Tools',
    icon: UserCheck,
    path: '/tools/passport-photo',
    badge: 'Print-Ready',
    color: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30'
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word Converter',
    description: 'Convert PDF documents into editable Word (.docx) files preserving formatting, tables, and optional OCR support.',
    category: 'PDF Tools',
    icon: FileText,
    path: '/tools/pdf-to-word',
    badge: 'Editable DOCX',
    color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30'
  },
  {
    id: 'word-to-excel',
    title: 'Word to Excel Converter',
    description: 'Extract tables and structured data from DOC/DOCX files directly into clean, formatted Excel (.xlsx) spreadsheets.',
    category: 'Word & Excel Tools',
    icon: FileSpreadsheet,
    path: '/tools/word-to-excel',
    badge: 'Table Parser',
    color: 'from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'pdf-to-zip',
    title: 'PDF to ZIP Converter',
    description: 'Package single or bulk PDF documents into a clean ZIP archive with custom naming without quality compression.',
    category: 'PDF Tools',
    icon: Archive,
    path: '/tools/pdf-to-zip',
    badge: 'Bulk Packager',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
  },
  {
    id: 'zip-extractor',
    title: 'ZIP Extractor & Inspector',
    description: 'Extract ZIP archives safely with ZIP-Slip path traversal protection. View file list and download single or all files.',
    category: 'ZIP Tools',
    icon: FolderArchive,
    path: '/tools/zip-extractor',
    badge: 'ZIP-Slip Safe',
    color: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30'
  },
  {
    id: 'image-converter',
    title: 'Image Format Converter',
    description: 'Convert images seamlessly between JPG, PNG, WebP, GIF, BMP, and TIFF with custom quality and batch downloading.',
    category: 'Image Tools',
    icon: RefreshCw,
    path: '/tools/image-converter',
    badge: 'Multi-Format',
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'video-to-image',
    title: 'Video to Image Converter',
    description: 'Extract frames at custom timestamps, interval sequences (1s/5s/10s), or generate contact sheet storyboards from videos.',
    category: 'Video Tools',
    icon: Camera,
    path: '/tools/video-to-image',
    badge: 'FFmpeg Frames',
    color: 'from-fuchsia-500/20 to-pink-500/20 text-fuchsia-400 border-fuchsia-500/30'
  }
];

const CATEGORIES = ['All', 'Video Tools', 'Image Tools', 'PDF Tools', 'Word & Excel Tools', 'ZIP Tools'];

export default function ToolsDashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>All-in-One File Tools Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Powerful Utilities for Every File
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed">
          High-performance, secure file tools running on-premise with zero data retention and automatic 10-minute cleanup.
        </p>

        {/* Search Bar */}
        <div className="mt-8 relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools (e.g. compress, passport, excel, docx)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-brand-primary text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-200 flex flex-col justify-between group shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${tool.color} border flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {tool.category}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-brand-primary group-hover:text-indigo-300">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-base font-semibold">No tools found matching "{searchQuery}"</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="text-xs text-brand-primary mt-2 underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Trust & Performance Footer Badges */}
      <div className="mt-16 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict 10-Minute Temporary File Purge</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>High-Speed Native Node.js & Sharp/FFmpeg Execution</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-secondary" />
          <span>Zero Server Data Logging</span>
        </div>
      </div>
    </div>
  );
}
