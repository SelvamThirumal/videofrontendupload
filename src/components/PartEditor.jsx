import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

export default function PartEditor({
  file,
  currentSeriesId,
  currentPartNumber,
  onSave,
  onCancel
}) {
  const [seriesId, setSeriesId] = useState(currentSeriesId || '');
  const [partNumber, setPartNumber] = useState(currentPartNumber || 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!seriesId.trim()) return;
    onSave({
      seriesId: seriesId.trim(),
      partNumber: parseInt(partNumber, 10) || 1
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-slate-900 border border-brand-primary/40 text-xs">
      <div className="flex-1 min-w-[120px]">
        <label className="block text-[10px] text-slate-400 mb-0.5">Series ID</label>
        <input
          type="text"
          value={seriesId}
          onChange={(e) => setSeriesId(e.target.value)}
          placeholder="e.g. 5.1.1"
          className="w-full px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100 font-semibold focus:outline-none focus:border-brand-primary"
          required
        />
      </div>

      <div className="w-20">
        <label className="block text-[10px] text-slate-400 mb-0.5">Part #</label>
        <input
          type="number"
          min="1"
          value={partNumber}
          onChange={(e) => setPartNumber(e.target.value)}
          className="w-full px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100 font-semibold focus:outline-none focus:border-brand-primary"
          required
        />
      </div>

      <div className="flex items-center gap-1 self-end mt-2">
        <button
          type="submit"
          className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition"
          title="Save Changes"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
