import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Wand2,
  Download,
  Play,
  Pause,
  Volume2,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Film,
  Music,
  Sparkles,
  Info
} from 'lucide-react';
import ToolLayout from '../../components/tools/ToolLayout';
import ToolDropzone from '../../components/tools/ToolDropzone';
import ToolProgressBar from '../../components/tools/ToolProgressBar';
import { addToolHistoryItem } from '../../components/tools/ToolHistoryModal';
import { api, formatBytes } from '../../services/api';

const MODES = [
  {
    id: 'medium',
    name: 'Balanced Clean',
    desc: 'Standard reduction for computer fans, background hum, and moderate room noise.',
    badge: 'Recommended'
  },
  {
    id: 'voice_focus',
    name: 'Voice Focus & Isolation',
    desc: 'Boosts vocal clarity, centers speech presence, and dynamically suppresses background chatter.',
    badge: 'Podcasts & Calls'
  },
  {
    id: 'strong',
    name: 'Strong Suppression',
    desc: 'Aggressive removal of heavy traffic, outdoor wind, rain, and loud air conditioning.',
    badge: 'Outdoor'
  },
  {
    id: 'light',
    name: 'Light Ambient',
    desc: 'Subtle reduction preserving natural acoustic room atmosphere and musical dynamics.',
    badge: 'Music / Acoustic'
  },
  {
    id: 'custom',
    name: 'Custom Calibration',
    desc: 'Manually adjust the noise floor threshold and vocal frequency emphasis.',
    badge: 'Advanced'
  }
];

export default function AiNoiseRemoverPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);

  const [mode, setMode] = useState('medium');
  const [customNoiseFloor, setCustomNoiseFloor] = useState(-35);
  const [customVoiceBoost, setCustomVoiceBoost] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const abortControllerRef = useRef(null);

  const handleFilesSelected = (files) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setSelectedFile(f);
    setResult(null);

    const ext = f.name.split('.').pop().toLowerCase();
    const isVid = ['mp4', 'mov', 'mkv', 'webm', 'avi'].includes(ext);
    setIsVideo(isVid);

    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(URL.createObjectURL(f));
  };

  const handleClearFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setResult(null);
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      setProgress(0);
      toast('Processing cancelled.', { icon: '🛑' });
    }
  };

  const handlePurgeSession = async () => {
    if (result?.sessionId) {
      try {
        await api.clearStudioSession(result.sessionId);
        toast.success('Session files permanently deleted from server.');
      } catch (_) {}
    }
    handleClearFile();
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      toast.error('Please upload an audio or video file.');
      return;
    }

    setIsProcessing(true);
    setProgress(15);
    abortControllerRef.current = new AbortController();

    try {
      const data = await api.removeAudioNoise({
        file: selectedFile,
        mode,
        customNoiseFloor,
        customVoiceBoost,
        onUploadProgress: (pct) => setProgress(Math.min(85, Math.max(20, pct))),
        cancelSignal: abortControllerRef.current.signal
      });

      setProgress(100);
      setResult(data);
      toast.success(
        isVideo
          ? 'Video audio cleaned successfully with lossless video stream copy!'
          : 'Audio noise removed and voice enhanced successfully!'
      );

      if (data.download) {
        addToolHistoryItem({
          toolName: 'AI Noise Remover',
          fileName: data.fileName,
          downloadUrl: data.download.downloadUrl,
          details: `${mode.toUpperCase()} mode (${formatBytes(data.fileSize)})`
        });
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        // user cancelled
      } else {
        toast.error(err.response?.data?.error || err.message || 'Noise reduction failed.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="AI Background Noise Remover"
      description="Eliminate fan hum, AC noise, street traffic, wind, and microphone hiss from audio & video files while isolating and boosting natural voice clarity."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Media Upload & Dual Comparison */}
        <div className="lg:col-span-7 space-y-6">
          {!selectedFile ? (
            <ToolDropzone
              accept="audio/*,video/mp4,video/quicktime,video/x-matroska,video/webm"
              acceptedExtensions={['.mp3', '.wav', '.aac', '.m4a', '.flac', '.mp4', '.mov', '.mkv', '.webm']}
              multiple={false}
              maxFiles={1}
              onFilesSelected={handleFilesSelected}
              helperText="Upload any Audio (MP3, WAV, AAC, FLAC) or Video (MP4, MOV, MKV, WebM up to 1GB)"
            />
          ) : (
            <div className="bg-navy-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    {isVideo ? <Film className="w-5 h-5" /> : <Music className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200 truncate max-w-xs">{selectedFile.name}</h3>
                    <p className="text-xs text-slate-400">
                      {formatBytes(selectedFile.size)} • {isVideo ? 'Video with Audio' : 'Audio File'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearFile}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
                >
                  Change File
                </button>
              </div>

              {/* Original Preview Player */}
              <div className="space-y-2 bg-navy-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-slate-300">Original (Unfiltered Source)</span>
                  <span className="text-[11px] text-amber-400/80">Contains ambient noise</span>
                </div>
                {isVideo ? (
                  <video src={filePreviewUrl} controls className="w-full max-h-60 rounded-lg bg-black" />
                ) : (
                  <audio src={filePreviewUrl} controls className="w-full" />
                )}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <ToolProgressBar
              progress={progress}
              status="Applying multi-band spectral noise suppression & voice normalization..."
              onCancel={handleCancel}
            />
          )}

          {/* Cleaned Result Comparison */}
          {result && (
            <div className="bg-navy-900/80 border border-emerald-500/30 rounded-2xl p-6 space-y-6 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Noise Cleaned &amp; Voice Enhanced</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePurgeSession}
                    title="Permanently delete from server immediately"
                    className="p-2 text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs flex items-center gap-1 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear Files</span>
                  </button>
                  <a
                    href={result.download.downloadUrl}
                    download={result.fileName}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs rounded-xl shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download Cleaned {result.type === 'video' ? 'Video' : 'Audio'} ({formatBytes(result.fileSize)})
                  </a>
                </div>
              </div>

              {/* Cleaned Media Player */}
              <div className="space-y-2 bg-navy-950/80 p-4 rounded-xl border border-emerald-500/20">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Cleaned Output ({result.mode.toUpperCase()})
                  </span>
                  <span className="text-[11px] text-emerald-400/90 font-mono">Zero Noise • Crisp Voice</span>
                </div>
                {result.type === 'video' ? (
                  <video src={result.download.downloadUrl} controls className="w-full max-h-72 rounded-lg bg-black" />
                ) : (
                  <audio src={result.download.downloadUrl} controls className="w-full" />
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Auto-deletes in 10 minutes
                </span>
                <span className="font-mono text-[11px] text-slate-400">File: {result.fileName}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Settings & Modes */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-navy-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-cyan-400" />
              Noise Suppression Modes
            </h3>

            {/* Mode Cards */}
            <div className="space-y-2.5">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    mode === m.id
                      ? 'border-cyan-500 bg-cyan-500/10 text-slate-100 shadow-md'
                      : 'border-slate-800 bg-navy-950/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{m.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        mode === m.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
                </button>
              ))}
            </div>

            {/* Custom Mode Calibration */}
            {mode === 'custom' && (
              <div className="p-4 bg-navy-950/80 rounded-xl border border-slate-800 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Noise Floor Threshold</span>
                    <span className="font-mono text-cyan-400 font-semibold">{customNoiseFloor} dB</span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="-15"
                    step="1"
                    value={customNoiseFloor}
                    onChange={(e) => setCustomNoiseFloor(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>-60 dB (Aggressive)</span>
                    <span>-15 dB (Subtle)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-300">Vocal Frequency Boost</span>
                  <input
                    type="checkbox"
                    checked={customVoiceBoost}
                    onChange={(e) => setCustomVoiceBoost(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded"
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={handleProcess}
              disabled={isProcessing || !selectedFile}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isProcessing || !selectedFile
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-cyan-500/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enhancing Audio...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Remove Noise &amp; Enhance Voice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
