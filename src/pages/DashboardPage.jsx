import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import MergeDashboard from '../components/MergeDashboard';
import { api } from '../services/api';

export default function DashboardPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [batchStatus, setBatchStatus] = useState('processing');
  const [overallProgress, setOverallProgress] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [failedJobs, setFailedJobs] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedWithinTarget, setCompletedWithinTarget] = useState(null);
  const [targetSeconds, setTargetSeconds] = useState(300);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchProgress();
    // Start polling every 1.5 seconds for live progress
    pollIntervalRef.current = setInterval(fetchProgress, 1500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [batchId]);

  const fetchProgress = async () => {
    try {
      const data = await api.getProgress(batchId);
      setBatchStatus(data.status);
      setOverallProgress(data.overallProgress || 0);
      setTotalJobs(data.totalJobs || 0);
      setCompletedJobs(data.completedJobs || 0);
      setFailedJobs(data.failedJobs || 0);
      setJobs(data.jobs || []);
      setElapsedSeconds(data.elapsedSeconds || 0);
      setCompletedWithinTarget(data.completedWithinTarget);
      if (data.targetSeconds) setTargetSeconds(data.targetSeconds);
      setLoading(false);

      // If completed, navigate to results page
      if (data.status === 'completed') {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        toast.success('All video series merged successfully!', { id: 'complete-toast' });
        setTimeout(() => {
          navigate(`/batch/${batchId}/results`);
        }, 1200);
      } else if (data.status === 'failed' && data.totalJobs > 0 && data.completedJobs === 0 && data.failedJobs === data.totalJobs) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        toast.error('All merge jobs failed.');
      }
    } catch (err) {
      console.warn('Progress poll error:', err);
    }
  };

  const handleCancelBatch = async () => {
    if (!window.confirm('Are you sure you want to cancel the entire merge job?')) return;
    try {
      await api.deleteBatch(batchId);
      toast.success('Batch cancelled and cleaned up.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to cancel batch.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-sm text-slate-400">Loading merge queue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {batchStatus === 'completed' && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between gap-4 text-emerald-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-sm">All series have finished merging!</span>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/batch/${batchId}/results`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
          >
            <span>View Outputs &amp; Downloads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <MergeDashboard
        batchStatus={batchStatus}
        overallProgress={overallProgress}
        totalJobs={totalJobs}
        completedJobs={completedJobs}
        failedJobs={failedJobs}
        jobs={jobs}
        elapsedSeconds={elapsedSeconds}
        completedWithinTarget={completedWithinTarget}
        targetSeconds={targetSeconds}
        onCancelBatch={handleCancelBatch}
      />
    </div>
  );
}
