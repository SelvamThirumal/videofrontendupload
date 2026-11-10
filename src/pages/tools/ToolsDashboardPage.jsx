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
  Zap,
  Mic,
  Volume2,
  Video,
  LayoutTemplate,
  Wand2
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Video Editor',
  'Video Tools',
  'Template Library',
  'Audio Tools',
  'Image Tools',
  'PDF Tools',
  'Word & Excel Tools',
  'ZIP Tools'
];

const TOOLS = [
  {
    id: 'studio-editor',
    title: 'Professional Video Editor',
    description: 'CapCut & VN-inspired multi-track timeline editor. Multi-video/audio tracks, split, trim, 25+ effects, transitions, text titles & 4K export.',
    category: 'Video Editor',
    icon: Video,
    path: '/studio/editor',
    badge: 'Flagship Studio',
    color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
  },
  {
    id: 'template-library',
    title: '1000 Free Video Templates',
    description: '10 categories × 100 editable templates: Reels, Shorts, Cinematic, Birthday, Wedding, Travel, Devotional & Ads with 1-click timeline import.',
    category: 'Template Library',
    icon: LayoutTemplate,
    path: '/studio/templates',
    badge: '1000 Presets',
    color: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30'
  },
  {
    id: 'ai-noise-remover',
    title: 'AI Background Noise Remover',
    description: 'Eliminate AC hum, fan noise, traffic, wind, and typing from audio and video files. Speech enhancement with dual waveform preview.',
    category: 'Audio Tools',
    icon: Wand2,
    path: '/tools/ai-noise-remover',
    badge: 'AI Speech Clean',
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'audio-studio',
    title: 'Audio Editing Studio',
    description: 'Multi-track audio workspace. Upload MP3/WAV, trim, split, volume mixing, fade-in/out, live mic voiceover, and royalty-free SFX stems.',
    category: 'Audio Tools',
    icon: Mic,
    path: '/tools/audio-studio',
    badge: 'Multitrack DAW',
    color: 'from-violet-500/20 to-indigo-500/20 text-violet-400 border-violet-500/30'
  },
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
    id: 'video-to-image',
    title: 'Video to Image Converter',
    description: 'Extract crisp frames at specific timestamps, periodic intervals (1s/5s/10s), auto-thumbnails, and contact sheets into ZIP.',
    category: 'Video Tools',
    icon: Camera,
    path: '/tools/video-to-image',
    badge: 'FFmpeg Extractor',
    color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
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
    id: 'image-converter',
    title: 'Image Format Converter',
    description: 'Convert between JPG, PNG, WebP, GIF, TIFF, and AVIF in bulk with custom quality settings and ZIP download.',
    category: 'Image Tools',
    icon: RefreshCw,
    path: '/tools/image-converter',
    badge: 'Multi-Format',
    color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30'
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
    id: 'pdf-to-zip',
    title: 'PDF to ZIP Converter',
    description: 'Bundle single or multiple PDF documents into an uncorrupted ZIP archive with custom naming and instant download.',
    category: 'PDF Tools',
    icon: Archive,
    path: '/tools/pdf-to-zip',
    badge: 'Lossless Bundle',
    color: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30'
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
    id: 'zip-extractor',
    title: 'ZIP Extractor & Inspector',
    description: 'Safely unpack and inspect ZIP archives with ZIP-Slip & ZIP-bomb protection. Download individual files or all as ZIP.',
    category: 'ZIP Tools',
    icon: FolderArchive,
    path: '/tools/zip-extractor',
    badge: 'Protected Unpack',
    color: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30'
  }
];

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AVINZ ALL-IN-ONE CREATIVE STUDIO</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
          Professional Creative Studio &amp; <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            File Utility Platform
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Browser-based video editing, 1000 free templates, AI noise suppression, audio workstation, and fast document processing. All 100% free with automatic 10-minute privacy cleanup.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools, formats, or studio features..."
            className="w-full pl-11 pr-4 py-3 bg-navy-900/90 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-lg"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30'
                : 'bg-navy-900/60 text-slate-400 hover:text-slate-200 hover:bg-navy-900 border border-slate-800/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className="group relative bg-navy-900/60 border border-slate-800/80 hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    {tool.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
                <span>Open Tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-slate-400 text-sm">No tools found matching "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Privacy Banner */}
      <div className="bg-navy-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-200 text-sm">100% Privacy-Guaranteed File Processing</p>
            <p>
              Uploaded media, editor projects, and generated outputs are kept in isolated temporary sandboxes and automatically deleted after 10 minutes.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500 shrink-0">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Zero Server Storage • No Account Required</span>
        </div>
      </div>
    </div>
  );
}
