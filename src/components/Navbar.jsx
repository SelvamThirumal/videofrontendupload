import React from 'react';
import { Film, Sparkles, ShieldCheck, Zap, Wrench, Layers } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isToolsActive = location.pathname.startsWith('/tools');
  const isMergerActive = location.pathname === '/' || location.pathname.startsWith('/batch');

  return (
    <header className="sticky top-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                FASTBATCH
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30 uppercase tracking-wider">
                All-in-One
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Smart File Tools & Video Merger</p>
          </div>
        </Link>

        {/* Central Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
              isMergerActive
                ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Video Merger</span>
          </Link>

          <Link
            to="/tools"
            className={`text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
              isToolsActive
                ? 'bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Wrench className="w-4 h-4 text-brand-secondary" />
            <span>All Tools</span>
            <span className="hidden sm:inline-block text-[10px] bg-brand-secondary/30 text-white px-1.5 py-0.2 rounded font-bold">
              8 NEW
            </span>
          </Link>
        </nav>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>10-Min Auto Cleanup</span>
          </div>

          <Link
            to="/"
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-slate-700 transition-colors"
          >
            New Batch
          </Link>
        </div>
      </div>
    </header>
  );
}
