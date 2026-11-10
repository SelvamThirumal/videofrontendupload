import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, Clock, CheckCircle, FileText } from 'lucide-react';

const STORAGE_KEY = 'fastbatch_tool_history';

export function addToolHistoryItem({ toolName, fileName, downloadUrl, details = '' }) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const history = raw ? JSON.parse(raw) : [];
    const newItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      toolName,
      fileName,
      downloadUrl,
      details,
      timestamp: new Date().toISOString()
    };
    // Keep last 30 items
    const updated = [newItem, ...history].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (_) {}
}

export default function ToolHistoryModal({ onClose }) {
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistoryItems(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistoryItems([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card rounded-2xl w-full max-w-lg border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Recent Conversion History</h3>
              <p className="text-xs text-slate-400">Stored locally in your browser session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {historyItems.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No recent tool conversions found</p>
              <p className="text-xs mt-1">Processed files will appear here for fast access</p>
            </div>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20">
                      {item.toolName}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-200 truncate">{item.fileName}</p>
                  {item.details && <p className="text-[11px] text-slate-400 truncate">{item.details}</p>}
                </div>

                {item.downloadUrl && (
                  <a
                    href={item.downloadUrl}
                    download={item.fileName}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary font-semibold border border-brand-primary/30 transition flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {historyItems.length > 0 && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs text-slate-500">{historyItems.length} records</span>
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

