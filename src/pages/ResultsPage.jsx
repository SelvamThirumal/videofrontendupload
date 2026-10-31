import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Download,
  Package,
  Film,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RotateCcw,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import ResultCard from '../components/ResultCard';
import CountdownTimer from '../components/CountdownTimer';
import { api, formatBytes } from '../services/api';

export default function ResultsPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [expiresAt, setExpiresAt] = useState(null);
  const [outputReadyAt, setOutputReadyAt] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [batchId]);

  const fetchResults = async () => {
    try {
      const data = await api.getResults(batchId);
      setResults(data.results || []);
      setExpiresAt(data.expiresAt);
      setOutputReadyAt(data.outputReadyAt);
      setIsExpired(data.isExpired || false);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 410) {
        setIsExpired(true);
        toast.error('This batch has expired and its files have been deleted.');
      } else {
        toast.error('Failed to load batch results.');
      }
      setLoading(false);
    }
  };

  const completedResults = results.filter(r => r.status === 'completed');
  const totalCompletedSize = completedResults.reduce((acc, r) => acc + (r.fileSize || 0), 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-sm text-slate-400">Loading output files &amp; download tokens...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Banner with Countdown */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Video Merging Complete!
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {completedResults.length} series merged successfully ({formatBytes(totalCompletedSize)} total output).
          </p>
        </div>

        {/* 10-Minute Expiration Countdown */}
        <div>
          <CountdownTimer
            expiresAt={expiresAt}
            onExpire={() => {
              setIsExpired(true);
              toast.error('10-minute retention expired. Files have been automatically wiped.');
            }}
          />
        </div>
      </div>

      {/* Expiration Notice & Privacy Policy */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Strict Privacy: Files are hosted on temporary storage and deleted 10 minutes after processing. Active downloads will stream completely before disk cleanup.
          </span>
        </div>

        <Link
          to="/"
          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Merge More Videos</span>
        </Link>
      </div>

      {/* Action Header: Download All as ZIP */}
      {completedResults.length > 1 && !isExpired && (
        <div className="flex justify-end">
          <a
            href={api.getDownloadAllZipUrl(batchId)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 active:scale-95 text-white font-bold text-xs shadow-xl shadow-indigo-500/20 transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Download All Series as ZIP</span>
          </a>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((res) => (
          <ResultCard
            key={res.jobId}
            result={res}
            downloadUrl={api.getDownloadUrl(batchId, res.jobId)}
            isExpired={isExpired}
          />
        ))}
      </div>
    </div>
  );
}
