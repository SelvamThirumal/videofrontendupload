import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutTemplate,
  Search,
  Sparkles,
  Play,
  Film,
  Music,
  Clock,
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TEMPLATE_CATEGORIES, queryTemplates } from '../../data/templates/index';

export default function TemplateLibraryPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const { items, total, totalPages } = queryTemplates({
    category: selectedCategory,
    search: searchQuery,
    page: currentPage,
    pageSize: 24
  });

  const handleUseTemplate = (template) => {
    // Navigate to Video Editor with pre-hydrated timeline template state
    navigate('/studio/editor', { state: { initialTemplate: template } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>1,000 FREE EDITABLE VIDEO TEMPLATES</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
          Ready-to-Use Video Templates for <br />
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Reels, Shorts &amp; Cinematic Cuts
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Browse 1000 professionally designed editable templates. Pick any template, replace placeholders with your own photos or video clips, adjust titles, and export in 4K for free.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search 1,000 templates (e.g. Neon, Cinematic, Birthday)..."
            className="w-full pl-11 pr-4 py-3 bg-navy-900/90 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-lg"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory('all');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25 border border-pink-400/30'
              : 'bg-navy-900/60 text-slate-400 hover:text-slate-200 hover:bg-navy-900 border border-slate-800/80'
          }`}
        >
          All Categories (1000)
        </button>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25 border border-pink-400/30'
                : 'bg-navy-900/60 text-slate-400 hover:text-slate-200 hover:bg-navy-900 border border-slate-800/80'
            }`}
          >
            <span>{cat.name}</span>
            <span className="text-[10px] opacity-75 font-mono">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((tpl) => (
          <div
            key={tpl.id}
            className="group bg-navy-900/70 border border-slate-800/90 hover:border-pink-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-1"
          >
            {/* Card Graphic Header */}
            <div
              onClick={() => setPreviewTemplate(tpl)}
              className="relative aspect-video sm:aspect-square bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 cursor-pointer overflow-hidden flex flex-col items-center justify-center p-4 border-b border-slate-800/60"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Decorative Visual Card Badge */}
              <div className="relative z-10 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
                <h4 className="font-extrabold text-white text-sm tracking-wide px-2 uppercase line-clamp-1">
                  {tpl.title}
                </h4>
                <p className="text-[11px] text-pink-300 font-mono">{tpl.categoryName}</p>
              </div>

              {/* Badges on preview */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-slate-200 border border-slate-700/60 backdrop-blur-md">
                  {tpl.aspectRatio}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-300 border border-purple-500/40 backdrop-blur-md">
                  {tpl.clipsCount} Scenes
                </span>
              </div>

              <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{tpl.duration}s</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Music className="w-3 h-3 text-pink-400" />
                    <span className="truncate max-w-[130px]">{tpl.musicTrack}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">{tpl.transitionStyle}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setPreviewTemplate(tpl)}
                  className="flex-1 py-2 text-xs font-semibold bg-navy-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-all text-center"
                >
                  Inspect
                </button>
                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="flex-1 py-2 text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-1"
                >
                  <span>Use</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              currentPage === 1
                ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                : 'border-slate-700 text-slate-300 hover:bg-navy-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-400 font-mono">
            Page {currentPage} of {totalPages} ({total} templates)
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              currentPage === totalPages
                ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                : 'border-slate-700 text-slate-300 hover:bg-navy-900'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Template Inspection Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-6 animate-fade-in shadow-2xl relative">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase tracking-wider">
                {previewTemplate.categoryName}
              </span>
              <h3 className="text-xl font-extrabold text-white">{previewTemplate.title}</h3>
              <p className="text-xs text-slate-400">
                Ready-to-edit multi-track project configuration.
              </p>
            </div>

            {/* Template Specs */}
            <div className="grid grid-cols-3 gap-3 bg-navy-950 p-4 rounded-2xl border border-slate-800 text-center">
              <div>
                <p className="text-[11px] text-slate-500">Aspect Ratio</p>
                <p className="text-xs font-bold text-slate-200">{previewTemplate.aspectRatio}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Duration</p>
                <p className="text-xs font-bold text-slate-200">{previewTemplate.duration} seconds</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Scenes</p>
                <p className="text-xs font-bold text-slate-200">{previewTemplate.clipsCount} Clips</p>
              </div>
            </div>

            {/* Layer Breakdown */}
            <div className="space-y-2 text-xs">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-pink-400" />
                <span>Pre-Configured Timeline Layers:</span>
              </p>
              <div className="space-y-1.5 bg-navy-950/60 p-3 rounded-xl border border-slate-800 text-slate-400">
                <div className="flex justify-between">
                  <span>Audio Track:</span>
                  <span className="text-slate-200 font-medium">{previewTemplate.musicTrack}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transition Style:</span>
                  <span className="text-slate-200 font-medium">{previewTemplate.transitionStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Primary Effect:</span>
                  <span className="text-slate-200 font-medium uppercase font-mono">{previewTemplate.primaryEffect}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="flex-1 py-3 text-xs font-semibold bg-navy-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => handleUseTemplate(previewTemplate)}
                className="flex-1 py-3 text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-1.5"
              >
                <span>Open in Video Editor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
