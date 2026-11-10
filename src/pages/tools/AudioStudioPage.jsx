import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Mic,
  Music,
  Download,
  Trash2,
  Play,
  Pause,
  Plus,
  Volume2,
  Sliders,
  Scissors,
  FastForward,
  ShieldCheck,
  CheckCircle2,
  FileAudio,
  Radio
} from 'lucide-react';
import ToolLayout from '../../components/tools/ToolLayout';
import ToolProgressBar from '../../components/tools/ToolProgressBar';
import { addToolHistoryItem } from '../../components/tools/ToolHistoryModal';
import { api, formatBytes } from '../../services/api';

const SFX_PRESETS = [
  { name: 'Cinematic Whoosh', file: 'sfx_whoosh.wav', duration: '1.2s' },
  { name: 'Celebration Cheer', file: 'sfx_cheer.wav', duration: '2.5s' },
  { name: 'Pop Impact', file: 'sfx_pop.wav', duration: '0.6s' },
  { name: 'Digital Notification', file: 'sfx_bell.wav', duration: '1.0s' },
  { name: 'Camera Click', file: 'sfx_click.wav', duration: '0.4s' }
];

export default function AudioStudioPage() {
  const [tracks, setTracks] = useState([]);
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Add audio file track
  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newTracks = files.map((file, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      file,
      name: file.name,
      size: file.size,
      volume: 1.0,
      fadeIn: 0,
      fadeOut: 0,
      speed: 1.0,
      startTime: 0,
      previewUrl: URL.createObjectURL(file)
    }));

    setTracks((prev) => [...prev, ...newTracks]);
    setResult(null);
    e.target.value = null;
  };

  // Live microphone recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const recordedFile = new File([audioBlob], `Voiceover_${Date.now()}.webm`, { type: 'audio/webm' });

        setTracks((prev) => [
          ...prev,
          {
            id: `rec_${Date.now()}`,
            file: recordedFile,
            name: `Live Voiceover (${recordingSeconds}s)`,
            size: audioBlob.size,
            volume: 1.2,
            fadeIn: 0,
            fadeOut: 0,
            speed: 1.0,
            startTime: 0,
            previewUrl: URL.createObjectURL(audioBlob)
          }
        ]);
        toast.success('Voiceover recorded and added to track!');
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error('Could not access microphone: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleUpdateTrack = (id, field, value) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleRemoveTrack = (id) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAll = async () => {
    if (result?.sessionId) {
      try {
        await api.clearStudioSession(result.sessionId);
        toast.success('Temporary files deleted.');
      } catch (_) {}
    }
    tracks.forEach((t) => URL.revokeObjectURL(t.previewUrl));
    setTracks([]);
    setResult(null);
  };

  // Mix and export audio
  const handleMixAudio = async () => {
    if (tracks.length === 0) {
      toast.error('Please add at least one audio track or record a voiceover.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      const files = tracks.map((t) => t.file);
      const tracksConfig = tracks.map((t) => ({
        startTime: t.startTime,
        volume: t.volume,
        fadeIn: t.fadeIn,
        fadeOut: t.fadeOut,
        speed: t.speed
      }));

      const res = await api.mixAudioTracks({
        audioFiles: files,
        tracksConfig,
        outputFormat,
        onUploadProgress: (pct) => setProgress(Math.min(85, Math.max(25, pct)))
      });

      setProgress(100);
      setResult(res);
      toast.success('Audio mix rendered successfully!');

      if (res.download) {
        addToolHistoryItem({
          toolName: 'Audio Studio',
          fileName: res.fileName,
          downloadUrl: res.download.downloadUrl,
          details: `${tracks.length} tracks mixed (${formatBytes(res.fileSize)})`
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Audio mixing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Audio Editing Studio"
      description="Multi-track audio workstation. Layer background music, sound effects, and live recorded voiceovers with volume, fade, speed, and timing controls."
    >
      <div className="space-y-8">
        {/* Top Control Bar */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAddFiles}
              multiple
              accept="audio/*,video/mp4"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Import Audio / Video</span>
            </button>

            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-4 py-2.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Record Voiceover</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce transition-all"
              >
                <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                <span>Stop Recording ({recordingSeconds}s)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>Format:</span>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="bg-navy-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
              >
                <option value="mp3">MP3 (Universal 256kbps)</option>
                <option value="wav">WAV (Lossless 16-bit)</option>
              </select>
            </div>

            {tracks.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-all"
              >
                Clear All Tracks
              </button>
            )}
          </div>
        </div>

        {/* Tracks Timeline View */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-2">
            <span>ACTIVE AUDIO TRACKS ({tracks.length})</span>
            <span>TIMELINE &amp; MIX CONTROLS</span>
          </div>

          {tracks.length === 0 ? (
            <div className="bg-navy-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <FileAudio className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-semibold text-sm">No audio tracks added yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click "Import Audio / Video" above to load MP3/WAV/MP4 tracks, or click "Record Voiceover" to capture your microphone directly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="bg-navy-900/70 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-mono text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200 max-w-sm truncate">{track.name}</h4>
                        <span className="text-[11px] text-slate-500">{formatBytes(track.size)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTrack(track.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Audio Player Strip */}
                  <audio src={track.previewUrl} controls className="w-full h-8" />

                  {/* Mixing Controls Slider Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80 text-xs">
                    {/* Volume */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Volume:</span>
                        <span className="font-mono text-violet-400">{Math.round(track.volume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={track.volume}
                        onChange={(e) => handleUpdateTrack(track.id, 'volume', parseFloat(e.target.value))}
                        className="w-full accent-violet-400"
                      />
                    </div>

                    {/* Start Offset */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Delay / Start:</span>
                        <span className="font-mono text-violet-400">{track.startTime}s</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="0.5"
                        value={track.startTime}
                        onChange={(e) => handleUpdateTrack(track.id, 'startTime', parseFloat(e.target.value))}
                        className="w-full accent-violet-400"
                      />
                    </div>

                    {/* Fade In */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Fade In:</span>
                        <span className="font-mono text-violet-400">{track.fadeIn}s</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={track.fadeIn}
                        onChange={(e) => handleUpdateTrack(track.id, 'fadeIn', parseFloat(e.target.value))}
                        className="w-full accent-violet-400"
                      />
                    </div>

                    {/* Speed */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Speed:</span>
                        <span className="font-mono text-violet-400">{track.speed}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={track.speed}
                        onChange={(e) => handleUpdateTrack(track.id, 'speed', parseFloat(e.target.value))}
                        className="w-full accent-violet-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button & Export */}
        {tracks.length > 0 && (
          <div className="flex justify-end pt-4">
            <button
              onClick={handleMixAudio}
              disabled={isProcessing}
              className={`px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-xl transition-all ${
                isProcessing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-600/25'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Rendering Multitrack Mix...</span>
                </>
              ) : (
                <>
                  <Music className="w-4 h-4" />
                  <span>Mix &amp; Export Audio ({outputFormat.toUpperCase()})</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <ToolProgressBar
            progress={progress}
            status="Synchronizing audio tracks, applying volume envelopes & rendering..."
          />
        )}

        {/* Result Card */}
        {result && (
          <div className="bg-navy-900/90 border border-emerald-500/30 rounded-2xl p-6 space-y-5 animate-fade-in shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Multitrack Mix Render Complete</span>
              </div>
              <a
                href={result.download.downloadUrl}
                download={result.fileName}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs rounded-xl shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Download Final Master ({formatBytes(result.fileSize)})
              </a>
            </div>

            <audio src={result.download.downloadUrl} controls className="w-full" />

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Auto-deletes in 10 minutes
              </span>
              <span className="font-mono text-[11px]">Master: {result.fileName}</span>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
