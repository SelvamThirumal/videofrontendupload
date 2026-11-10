import React from 'react';
import { Film, Sparkles, ShieldCheck, Zap, Wrench, Layers, Video, LayoutTemplate } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isToolsActive = location.pathname.startsWith('/tools');
  const isMergerActive = location.pathname === '/' || location.pathname.startsWith('/batch');
  const isEditorActive = location.pathname.startsWith('/studio/editor');
  const isTemplatesActive = location.pathname.startsWith('/studio/templates');

  return (
    <header className="sticky top-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
                AVINZ
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                Creative Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Free Video Editor, Templates &amp; File Tools</p>
          </div>
        </Link>

        {/* Central Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/studio/editor"
            className={`text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
              isEditorActive
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Video className="w-4 h-4 text-purple-400" />
            <span>Video Editor</span>
            <span className="text-[10px] bg-gradient-to-r from-pink-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              PRO
            </span>
          </Link>

          <Link
            to="/studio/templates"
            className={`text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
              isTemplatesActive
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <LayoutTemplate className="w-4 h-4 text-pink-400" />
            <span>Templates</span>
            <span className="hidden sm:inline-block text-[10px] bg-pink-500/25 text-pink-300 px-1.5 py-0.2 rounded font-bold">
              1000
            </span>
          </Link>

          <Link
            to="/"
            className={`text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
              isMergerActive
                ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>File Merge</span>
          </Link>

          <Link
            to="/tools"
            className={`text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
              isToolsActive
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Wrench className="w-4 h-4 text-indigo-400" />
            <span>All Tools</span>
          </Link>
        </nav>

        {/* Right Status / Privacy Badge */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Free &amp; Private (10m Cleanup)</span>
          </div>
        </div>
      </div>
    </header>
  );
}
