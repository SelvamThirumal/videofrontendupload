import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import SeriesGroups from '../components/SeriesGroups';
import { api } from '../services/api';

export default function SeriesPreviewPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [isMerging, setIsMerging] = useState(false);
  const [groups, setGroups] = useState([]);
  const [unrecognized, setUnrecognized] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    if (location.state?.batchData?.groups) {
      setGroups(location.state.batchData.groups);
      setUnrecognized(location.state.batchData.unrecognized || []);
      setSummary(location.state.batchData.summary || {});
      setLoading(false);
    } else {
      fetchGroups();
    }
  }, [batchId]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await api.getBatchGroups(batchId);
      setGroups(data.groups || []);
      setUnrecognized(data.unrecognized || []);
      setSummary(data.summary || {});
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to fetch series groups.');
    } finally {
      setLoading(false);
    }
  };

  const syncGroupsWithServer = async (updatedGroups, updatedUnrecognized = unrecognized) => {
    try {
      const saved = await api.updateBatchGroups(batchId, {
        groups: updatedGroups,
        unrecognized: updatedUnrecognized
      });
      setGroups(saved.groups || []);
      setUnrecognized(saved.unrecognized || []);
      setSummary(saved.summary || {});
    } catch (err) {
      toast.error('Failed to sync changes with server.');
    }
  };

  // Move part up or down in a series
  const handleMovePart = (seriesId, partIndex, direction) => {
    const targetIdx = partIndex + direction;
    const group = groups.find(g => g.seriesId === seriesId);
    if (!group || targetIdx < 0 || targetIdx >= group.parts.length) return;

    const updatedParts = [...group.parts];
    const [moved] = updatedParts.splice(partIndex, 1);
    updatedParts.splice(targetIdx, 0, moved);

    // Re-assign part numbers sequentially based on new order
    updatedParts.forEach((p, idx) => {
      p.partNumber = idx + 1;
    });

    const updatedGroups = groups.map(g => (g.seriesId === seriesId ? { ...g, parts: updatedParts } : g));
    setGroups(updatedGroups);
    syncGroupsWithServer(updatedGroups);
  };

  // Update a single part's seriesId or partNumber
  const handleUpdatePart = (fileId, { seriesId: newSeriesId, partNumber: newPartNumber }) => {
    let targetPart = null;
    const newGroups = groups.map(g => {
      const remainingParts = g.parts.filter(p => {
        const id = p.id || p._id;
        if (id === fileId) {
          targetPart = { ...p, seriesId: newSeriesId, partNumber: newPartNumber };
          return false;
        }
        return true;
      });
      return { ...g, parts: remainingParts };
    }).filter(g => g.parts.length > 0);

    if (targetPart) {
      let destGroup = newGroups.find(g => g.seriesId === newSeriesId);
      if (destGroup) {
        destGroup.parts.push(targetPart);
        destGroup.parts.sort((a, b) => a.partNumber - b.partNumber);
      } else {
        newGroups.push({
          seriesId: newSeriesId,
          parts: [targetPart],
          totalParts: 1,
          totalSize: targetPart.fileSize || 0,
          warnings: targetPart.partNumber !== 1 ? [`Missing Part 1`] : [],
          isReadyForMerge: targetPart.partNumber === 1
        });
      }
    }

    setGroups(newGroups);
    syncGroupsWithServer(newGroups);
    toast.success('Part updated successfully.');
  };

  // Rename an entire series ID
  const handleSeriesIdChange = (oldSeriesId, newSeriesId) => {
    const updatedGroups = groups.map(g => {
      if (g.seriesId === oldSeriesId) {
        return {
          ...g,
          seriesId: newSeriesId,
          parts: g.parts.map(p => ({ ...p, seriesId: newSeriesId }))
        };
      }
      return g;
    });
    setGroups(updatedGroups);
    syncGroupsWithServer(updatedGroups);
    toast.success(`Series renamed to ${newSeriesId}`);
  };

  // Remove a file from series
  const handleRemovePart = async (fileId) => {
    const updatedGroups = groups.map(g => ({
      ...g,
      parts: g.parts.filter(p => (p.id || p._id) !== fileId)
    })).filter(g => g.parts.length > 0);

    setGroups(updatedGroups);
    syncGroupsWithServer(updatedGroups);
    toast.success('File removed from merge group.');
  };

  // Assign unrecognized file to series
  const handleAssignUnrecognized = (fileId, targetSeriesId, targetPartNum) => {
    const unrecFile = unrecognized.find(f => (f.id || f._id) === fileId);
    if (!unrecFile) return;

    const remainingUnrec = unrecognized.filter(f => (f.id || f._id) !== fileId);
    const assignedFile = { ...unrecFile, seriesId: targetSeriesId, partNumber: targetPartNum };

    let updatedGroups = [...groups];
    let destGroup = updatedGroups.find(g => g.seriesId === targetSeriesId);

    if (destGroup) {
      destGroup.parts.push(assignedFile);
      destGroup.parts.sort((a, b) => a.partNumber - b.partNumber);
    } else {
      updatedGroups.push({
        seriesId: targetSeriesId,
        parts: [assignedFile],
        totalParts: 1,
        totalSize: assignedFile.fileSize || 0,
        warnings: targetPartNum !== 1 ? [`Missing Part 1`] : [],
        isReadyForMerge: targetPartNum === 1
      });
    }

    setGroups(updatedGroups);
    setUnrecognized(remainingUnrec);
    syncGroupsWithServer(updatedGroups, remainingUnrec);
    toast.success(`Assigned file to series ${targetSeriesId}`);
  };

  // Start the actual merge
  const handleConfirmMerge = async () => {
    setIsMerging(true);
    try {
      toast.loading('Enqueuing video merge jobs...', { id: 'merge-toast' });

      // Construct seriesConfigs
      const seriesConfigs = groups.map(g => ({
        seriesId: g.seriesId,
        partFileIds: g.parts.map(p => (p.id || p._id))
      }));

      await api.startMerge(batchId, seriesConfigs);
      toast.success('Merge jobs enqueued! Processing in background.', { id: 'merge-toast' });
      navigate(`/batch/${batchId}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to start merge.', { id: 'merge-toast' });
    } finally {
      setIsMerging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-sm text-slate-400">Analyzing video filenames &amp; series groupings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button & title */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Upload More Files</span>
        </button>

        <button
          type="button"
          onClick={fetchGroups}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-primary transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      <SeriesGroups
        groups={groups}
        unrecognized={unrecognized}
        summary={summary}
        onMovePart={handleMovePart}
        onUpdatePart={handleUpdatePart}
        onRemovePart={handleRemovePart}
        onSeriesIdChange={handleSeriesIdChange}
        onAssignUnrecognized={handleAssignUnrecognized}
        onConfirmMerge={handleConfirmMerge}
        isMerging={isMerging}
      />
    </div>
  );
}
