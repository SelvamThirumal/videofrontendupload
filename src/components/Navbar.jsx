import React from 'react';
import { Film, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

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
                Lossless v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Smart Bulk Video Merger</p>
          </div>
        </Link>

        {/* Value Badges */}
        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Fast Stream Copy</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>10-Min Auto Cleanup</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
            <span>Smart Series Parser</span>
          </div>
        </div>

        {/* Quick Reset / New Batch */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-slate-700 transition-colors"
          >
            New Batch
          </Link>
        </div>
      </div>
    </header>
  );
}
