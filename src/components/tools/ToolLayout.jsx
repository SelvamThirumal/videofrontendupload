import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, History, Shield, Sparkles } from 'lucide-react';
import ToolHistoryModal from './ToolHistoryModal';

export default function ToolLayout({
  title,
  description,
  category,
  badge,
  icon: Icon,
  children
}) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
      {/* Top Breadcrumb & History Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Tools</span>
        </Link>

        <button
          onClick={() => setShowHistory(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <History className="w-3.5 h-3.5 text-brand-secondary" />
          <span>Recent History</span>
        </button>
      </div>

      {/* Tool Header Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/60 shadow-xl mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-primary/30 to-brand-secondary/30 border border-brand-primary/40 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/10">
                <Icon className="w-6 h-6 text-brand-primary" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {category || 'File Tool'}
                </span>
                {badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {badge}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium px-3 py-1.5 rounded-full bg-slate-950/70 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted & 10-Min Auto Cleanup</span>
          </div>
        </div>
      </div>

      {/* Main Tool Content Slot */}
      {children}

      {/* History Modal */}
      {showHistory && <ToolHistoryModal onClose={() => setShowHistory(false)} />}
    </div>
  );
}
