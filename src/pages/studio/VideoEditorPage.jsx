import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Scissors,
  Trash2,
  Copy,
  Sliders,
  Sparkles,
  Type,
  Music,
  Video,
  Download,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  RotateCcw,
  Volume2,
  VolumeX,
  Layers,
  Wand2,
  Grid,
  Clock,
  Film,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Radio
} from 'lucide-react';
import { api, formatBytes, formatDuration } from '../../services/api';

const ASPECT_RATIOS = [
  { label: '16:9 (YouTube)', value: '16:9', width: 'w-full', aspectClass: 'aspect-video' },
  { label: '9:16 (Reels/TikTok)', value: '9:16', width: 'w-64', aspectClass: 'aspect-[9/16]' },
  { label: '1:1 (Square)', value: '1:1', width: 'w-80', aspectClass: 'aspect-square' },
  { label: '4:5 (Instagram)', value: '4:5', width: 'w-72', aspectClass: 'aspect-[4/5]' }
];

const EFFECTS = [
  { id: 'none', name: 'Original', css: '' },
  { id: 'cinematic', name: 'Cinematic Teal', css: 'contrast-125 saturate-125' },
  { id: 'vignette', name: 'Vignette', css: 'brightness-95 contrast-110' },
  { id: 'film_grain', name: 'Film Grain', css: 'contrast-115 brightness-105' },
  { id: 'glow', name: 'Dreamy Glow', css: 'brightness-110 saturate-120 blur-[0.3px]' },
  { id: 'black_and_white', name: 'B&W Noir', css: 'grayscale' },
  { id: 'sepia', name: 'Vintage Sepia', css: 'sepia' },
  { id: 'retro', name: 'Retro VHS', css: 'hue-rotate-15 contrast-125' },
  { id: 'neon', name: 'Cyber Neon', css: 'hue-rotate-90 saturate-200' },
  { id: 'blur', name: 'Soft Focus', css: 'blur-[1.5px]' }
];

const TRANSITIONS = [
  { id: 'fade', name: 'Cross Dissolve' },
  { id: 'fadeblack', name: 'Fade to Black' },
  { id: 'slidelt', name: 'Slide Left' },
  { id: 'slidergt', name: 'Slide Right' },
  { id: 'zoomin', name: 'Zoom In' },
  { id: 'wipe', name: 'Wipe' }
];

export default function VideoEditorPage() {
  const location = useLocation();
  const initialTemplate = location.state?.initialTemplate;

  // Active Editor State
  const [aspectRatio, setAspectRatio] = useState(initialTemplate?.aspectRatio || '16:9');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialTemplate?.duration || 15);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Active Tab: 'media' | 'effects' | 'transitions' | 'text' | 'audio'
  const [activeTab, setActiveTab] = useState('media');

  // Media Library
  const [mediaLibrary, setMediaLibrary] = useState([]);

  // Multi-Track Timeline Layers
  const [videoClips, setVideoClips] = useState(
    initialTemplate?.layers?.videoClips || []
  );
  const [selectedClipId, setSelectedClipId] = useState(null);

  // Text Overlays
  const [textOverlays, setTextOverlays] = useState(
    initialTemplate?.layers?.textOverlays || [
      { id: 'txt_1', text: 'AVINZ CREATIVE STUDIO', startTime: 0, duration: 6, fontSize: 32, fontColor: '#FFFFFF' }
    ]
  );
  const [selectedTextId, setSelectedTextId] = useState('txt_1');

  // Effects & Filters
  const [activeEffect, setActiveEffect] = useState(initialTemplate?.layers?.effects?.[0] || 'none');
  const [activeTransition, setActiveTransition] = useState(initialTemplate?.transitionStyle || 'fade');

  // Audio Tracks
  const [audioTracks, setAudioTracks] = useState(
    initialTemplate?.layers?.audioTrack
      ? [{ id: 'aud_1', name: initialTemplate.layers.audioTrack.name, volume: 1.0, startTime: 0 }]
      : []
  );

  // Export State Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportResolution, setExportResolution] = useState('1080p');
  const [exportFps, setExportFps] = useState(30);
  const [exportFormat, setExportFormat] = useState('mp4');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResult, setExportResult] = useState(null);

  const videoPlayerRef = useRef(null);
  const playbackIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Playback Loop Simulation
  useEffect(() => {
    if (isPlaying) {
      playbackIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(duration, prev + 0.1);
        });
      }, 100);
    } else {
      clearInterval(playbackIntervalRef.current);
    }
    return () => clearInterval(playbackIntervalRef.current);
  }, [isPlaying, duration]);

  // Handle Spacebar to Play/Pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
      if (e.code === 'KeyS') {
        // 'S' for Split
        handleSplitAtPlayhead();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, selectedClipId, videoClips]);

  // Import Media Files
  const handleImportMedia = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imported = files.map((f, idx) => ({
      id: `media_${Date.now()}_${idx}`,
      file: f,
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : 'image',
      size: f.size,
      url: URL.createObjectURL(f)
    }));

    setMediaLibrary((prev) => [...prev, ...imported]);
    toast.success(`Imported ${imported.length} file(s) into Media Pool.`);
    e.target.value = null;
  };

  // Add Clip to Timeline
  const handleAddMediaToTimeline = (media) => {
    const newClip = {
      id: `clip_${Date.now()}`,
      mediaId: media.id,
      title: media.name,
      filePath: media.file,
      url: media.url,
      type: media.type,
      startTime: currentTime,
      duration: 5,
      speed: 1.0,
      scale: 1.0,
      posX: 0,
      posY: 0,
      rotation: 0,
      opacity: 1.0,
      volume: 1.0
    };

    setVideoClips((prev) => [...prev, newClip]);
    setSelectedClipId(newClip.id);
    const newTotal = Math.max(duration, currentTime + 5);
    setDuration(newTotal);
    toast.success(`Added "${media.name}" to Timeline at ${formatDuration(currentTime)}.`);
  };

  // Slicing / Split at Playhead
  const handleSplitAtPlayhead = () => {
    const targetClip = videoClips.find(
      (c) => currentTime > c.startTime && currentTime < c.startTime + c.duration
    );

    if (!targetClip) {
      toast('Move playhead inside an active clip to split.', { icon: '✂️' });
      return;
    }

    const firstHalfDuration = currentTime - targetClip.startTime;
    const secondHalfDuration = targetClip.duration - firstHalfDuration;

    const splitClip1 = {
      ...targetClip,
      duration: Math.max(0.5, firstHalfDuration)
    };

    const splitClip2 = {
      ...targetClip,
      id: `clip_${Date.now()}_split`,
      startTime: currentTime,
      duration: Math.max(0.5, secondHalfDuration)
    };

    setVideoClips((prev) =>
      prev.map((c) => (c.id === targetClip.id ? splitClip1 : c)).concat(splitClip2)
    );
    toast.success(`Split clip into 2 segments at ${formatDuration(currentTime)}.`);
  };

  // Delete Selected Clip
  const handleDeleteSelected = () => {
    if (selectedClipId) {
      setVideoClips((prev) => prev.filter((c) => c.id !== selectedClipId));
      setSelectedClipId(null);
      toast.success('Clip removed from Timeline.');
    }
  };

  // Update Selected Clip Properties
  const updateSelectedClip = (field, value) => {
    if (!selectedClipId) return;
    setVideoClips((prev) =>
      prev.map((c) => (c.id === selectedClipId ? { ...c, [field]: value } : c))
    );
  };

  const selectedClip = videoClips.find((c) => c.id === selectedClipId);
  const selectedText = textOverlays.find((t) => t.id === selectedTextId);

  // Active clip currently visible under playhead
  const activeClipUnderPlayhead = videoClips.find(
    (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration
  );

  // Active effect CSS filter
  const activeEffectObj = EFFECTS.find((e) => e.id === activeEffect);
  const effectCss = activeEffectObj ? activeEffectObj.css : '';

  // Render Video Export
  const handleRenderExport = async () => {
    const mediaFiles = videoClips.map((c) => c.filePath).filter(Boolean);
    if (mediaFiles.length === 0) {
      toast.error('Please import and place at least one video or photo clip on the timeline.');
      return;
    }

    setIsExporting(true);
    setExportProgress(25);

    try {
      const timelineData = {
        videoClips: videoClips.map((c) => ({
          trimStart: 0,
          duration: c.duration,
          speed: c.speed
        })),
        effects: activeEffect !== 'none' ? [activeEffect] : [],
        textOverlays: textOverlays.map((t) => ({
          text: t.text,
          fontSize: t.fontSize,
          fontColor: t.fontColor
        }))
      };

      const res = await api.exportStudioVideo({
        mediaFiles,
        timeline: timelineData,
        resolution: exportResolution,
        aspectRatio,
        fps: exportFps,
        format: exportFormat,
        onUploadProgress: (pct) => setExportProgress(Math.min(90, Math.max(30, pct)))
      });

      setExportProgress(100);
      setExportResult(res);
      toast.success('Studio Video successfully rendered & encoded in ' + exportResolution + '!');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Export rendering failed.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-navy-950 text-slate-100 select-none">
      {/* Studio Top Navigation Bar */}
      <div className="h-14 border-b border-slate-800 bg-navy-900/90 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/tools"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 font-semibold"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Tools</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <h2 className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            AVINZ VIDEO STUDIO PRO
          </h2>
          {initialTemplate && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Template: {initialTemplate.title}
            </span>
          )}
        </div>

        {/* Aspect Ratio & Workspace Tools */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-navy-950 border border-slate-800 rounded-xl p-1 text-xs">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.value}
                onClick={() => setAspectRatio(ar.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  aspectRatio === ar.value
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ar.value}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Video</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Left Sidebar, Center Monitor, Right Inspector */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden min-h-[440px]">
        {/* Left Drawer (Media, Effects, Transitions, Text, Audio) */}
        <div className="col-span-3 border-r border-slate-800 bg-navy-900/60 flex flex-col">
          {/* Tabs header */}
          <div className="grid grid-cols-4 border-b border-slate-800 text-[11px] font-semibold text-center bg-navy-950/70">
            {[
              { id: 'media', label: 'Media', icon: Video },
              { id: 'effects', label: 'Effects', icon: Sparkles },
              { id: 'transitions', label: 'Transitions', icon: Wand2 },
              { id: 'text', label: 'Titles', icon: Type }
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                    activeTab === t.id
                      ? 'border-purple-500 text-purple-300 bg-purple-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
            {/* Media Pool */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportMedia}
                  multiple
                  accept="video/*,image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Import Videos &amp; Photos</span>
                </button>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Media Pool ({mediaLibrary.length})
                  </p>
                  {mediaLibrary.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                      No media imported yet. Click above to add videos or photos.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {mediaLibrary.map((item) => (
                        <div
                          key={item.id}
                          className="bg-navy-950/80 border border-slate-800 rounded-xl overflow-hidden p-2 group hover:border-purple-500/40 transition-all text-left"
                        >
                          <div className="aspect-video bg-black/60 rounded-lg flex items-center justify-center text-slate-500 overflow-hidden mb-1 relative">
                            {item.type === 'video' ? (
                              <video src={item.url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={item.url} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-slate-200 truncate">{item.name}</p>
                          <button
                            onClick={() => handleAddMediaToTimeline(item)}
                            className="w-full mt-1.5 py-1 text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all"
                          >
                            <Plus className="w-3 h-3" /> Add to Timeline
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Effects & Filters */}
            {activeTab === 'effects' && (
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Real-Time Video Shaders (25+)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EFFECTS.map((eff) => (
                    <button
                      key={eff.id}
                      onClick={() => {
                        setActiveEffect(eff.id);
                        toast.success(`Applied ${eff.name} effect`);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        activeEffect === eff.id
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-md'
                          : 'border-slate-800 bg-navy-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold block text-slate-200">{eff.name}</span>
                      <span className="text-[10px] text-slate-500">Live Preview &amp; Export</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Transitions */}
            {activeTab === 'transitions' && (
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Scene Transitions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {TRANSITIONS.map((tr) => (
                    <button
                      key={tr.id}
                      onClick={() => {
                        setActiveTransition(tr.id);
                        toast.success(`Selected transition: ${tr.name}`);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        activeTransition === tr.id
                          ? 'border-pink-500 bg-pink-500/20 text-pink-300 shadow-md'
                          : 'border-slate-800 bg-navy-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold block text-slate-200">{tr.name}</span>
                      <span className="text-[10px] text-slate-500">1.0s Duration</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text & Titles */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Text &amp; Titles Generator
                </p>
                {textOverlays.map((tItem) => (
                  <div
                    key={tItem.id}
                    className="p-3 bg-navy-950/80 border border-slate-800 rounded-xl space-y-2"
                  >
                    <label className="text-xs text-slate-400">Headline Text:</label>
                    <input
                      type="text"
                      value={tItem.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTextOverlays((prev) =>
                          prev.map((t) => (t.id === tItem.id ? { ...t, text: val } : t))
                        );
                      }}
                      className="w-full px-3 py-1.5 bg-navy-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-purple-500"
                    />

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400">Font Size:</span>
                      <input
                        type="number"
                        min="16"
                        max="72"
                        value={tItem.fontSize}
                        onChange={(e) => {
                          const sz = parseInt(e.target.value, 10);
                          setTextOverlays((prev) =>
                            prev.map((t) => (t.id === tItem.id ? { ...t, fontSize: sz } : t))
                          );
                        }}
                        className="w-16 px-2 py-1 bg-navy-900 border border-slate-700 rounded text-center text-slate-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Canvas / Video Preview Monitor */}
        <div className="col-span-6 bg-black flex flex-col justify-between items-center p-6 border-r border-slate-800 relative">
          {/* Main Display Screen */}
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
            <div
              className={`relative bg-neutral-950 border border-slate-800 rounded-xl shadow-2xl flex items-center justify-center overflow-hidden transition-all ${
                aspectRatio === '9:16'
                  ? 'h-full aspect-[9/16]'
                  : aspectRatio === '1:1'
                  ? 'h-full aspect-square'
                  : 'w-full aspect-video max-h-full'
              }`}
            >
              {/* Active Clip Preview */}
              {activeClipUnderPlayhead?.url ? (
                activeClipUnderPlayhead.type === 'video' ? (
                  <video
                    ref={videoPlayerRef}
                    src={activeClipUnderPlayhead.url}
                    className={`w-full h-full object-contain ${effectCss}`}
                    style={{
                      transform: `scale(${activeClipUnderPlayhead.scale || 1}) rotate(${activeClipUnderPlayhead.rotation || 0}deg)`,
                      opacity: activeClipUnderPlayhead.opacity || 1
                    }}
                  />
                ) : (
                  <img
                    src={activeClipUnderPlayhead.url}
                    alt=""
                    className={`w-full h-full object-contain ${effectCss}`}
                  />
                )
              ) : (
                <div className="text-center space-y-2 p-6">
                  <Film className="w-12 h-12 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">Timeline Monitor</p>
                  <p className="text-[10px] text-slate-600">Import media and add clips to begin editing</p>
                </div>
              )}

              {/* Text Overlay on Monitor */}
              {textOverlays.map((tItem) => (
                <div
                  key={tItem.id}
                  className="absolute bottom-10 left-0 right-0 text-center px-4 pointer-events-none drop-shadow-md"
                >
                  <span
                    style={{
                      fontSize: `${Math.max(16, tItem.fontSize * 0.7)}px`,
                      color: tItem.fontColor || '#FFFFFF'
                    }}
                    className="font-extrabold uppercase tracking-wide bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm"
                  >
                    {tItem.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monitor Transport Controls */}
          <div className="w-full pt-4 flex items-center justify-between text-xs text-slate-400">
            <div className="font-mono text-purple-400 font-bold">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentTime(0)}
                className="p-1.5 hover:text-white transition-colors"
                title="Rewind to start"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              <button
                onClick={() => setCurrentTime(duration)}
                className="p-1.5 hover:text-white transition-colors"
                title="Forward to end"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">Space = Play</span>
              <span className="text-[10px] text-slate-500">S = Split</span>
            </div>
          </div>
        </div>

        {/* Right Inspector & Clip Properties */}
        <div className="col-span-3 border-l border-slate-800 bg-navy-900/60 p-4 overflow-y-auto custom-scrollbar space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Clip Inspector</span>
            </h4>
            {selectedClip && (
              <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full font-mono">
                {selectedClip.title?.substring(0, 16)}
              </span>
            )}
          </div>

          {selectedClip ? (
            <div className="space-y-4 text-xs">
              {/* Transform Scale */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Scale Zoom:</span>
                  <span className="font-mono text-purple-400">{Math.round((selectedClip.scale || 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={selectedClip.scale || 1}
                  onChange={(e) => updateSelectedClip('scale', parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Playback Speed */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Playback Speed:</span>
                  <span className="font-mono text-purple-400">{selectedClip.speed || 1}x</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="3"
                  step="0.25"
                  value={selectedClip.speed || 1}
                  onChange={(e) => updateSelectedClip('speed', parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Opacity:</span>
                  <span className="font-mono text-purple-400">{Math.round((selectedClip.opacity || 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={selectedClip.opacity || 1}
                  onChange={(e) => updateSelectedClip('opacity', parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Audio Volume */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Audio Volume:</span>
                  <span className="font-mono text-purple-400">{Math.round((selectedClip.volume || 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.0"
                  step="0.1"
                  value={selectedClip.volume || 1}
                  onChange={(e) => updateSelectedClip('volume', parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <button
                onClick={handleDeleteSelected}
                className="w-full py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold hover:bg-rose-600/30 flex items-center justify-center gap-1.5 transition-all mt-4"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Clip</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2">
              <Sliders className="w-8 h-8 mx-auto text-slate-700" />
              <p>Select any clip on the timeline to inspect and edit its scale, speed, and volume.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Multi-Track Timeline (VN / CapCut Style) */}
      <div className="h-64 border-t border-slate-800 bg-navy-950 flex flex-col">
        {/* Timeline Header Controls */}
        <div className="h-10 border-b border-slate-800/80 px-4 flex items-center justify-between text-xs bg-navy-900/40">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSplitAtPlayhead}
              className="px-2.5 py-1 bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
              title="Split clip at playhead (S)"
            >
              <Scissors className="w-3.5 h-3.5 text-purple-400" />
              <span>Split (S)</span>
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={!selectedClipId}
              className={`px-2.5 py-1 border rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                selectedClipId
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                  : 'border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          {/* Timeline Zoom Slider */}
          <div className="flex items-center gap-2 text-slate-400">
            <ZoomOut className="w-3.5 h-3.5" />
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-20 accent-purple-500"
            />
            <ZoomIn className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Tracks Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 space-y-2 relative custom-scrollbar">
          {/* Playhead Scrubber Bar */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
            style={{
              left: `${Math.min(95, Math.max(2, (currentTime / Math.max(1, duration)) * 100))}%`
            }}
          >
            <div className="w-3 h-3 bg-purple-500 rounded-sm rotate-45 -mb-1 shadow-md shadow-purple-500/50" />
            <div className="w-0.5 flex-1 bg-purple-500" />
          </div>

          {/* Track 1: Video Track V1 */}
          <div className="flex items-center gap-2 h-14 bg-navy-900/60 rounded-xl p-1.5 border border-slate-800 relative">
            <span className="w-8 shrink-0 text-center font-mono text-[10px] font-bold text-slate-500">
              V1
            </span>
            <div className="flex-1 h-full flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {videoClips.map((clip) => (
                <div
                  key={clip.id}
                  onClick={() => setSelectedClipId(clip.id)}
                  style={{ width: `${Math.max(80, clip.duration * 25 * zoomLevel)}px` }}
                  className={`h-full shrink-0 rounded-lg px-2 flex items-center justify-between text-xs font-semibold cursor-pointer border transition-all ${
                    selectedClipId === clip.id
                      ? 'bg-purple-600/40 border-purple-500 text-white shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="truncate max-w-[90px]">{clip.title}</span>
                  <span className="text-[10px] font-mono text-purple-300">{clip.duration}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* Track 2: Text Track T1 */}
          <div className="flex items-center gap-2 h-10 bg-navy-900/40 rounded-xl p-1 border border-slate-800/60 relative">
            <span className="w-8 shrink-0 text-center font-mono text-[10px] font-bold text-slate-500">
              T1
            </span>
            <div className="flex-1 h-full flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {textOverlays.map((tItem) => (
                <div
                  key={tItem.id}
                  style={{ width: `${Math.max(120, tItem.duration * 30 * zoomLevel)}px` }}
                  className="h-full shrink-0 rounded-lg px-2.5 bg-pink-500/20 border border-pink-500/30 text-pink-300 flex items-center justify-between text-[11px] font-medium"
                >
                  <span className="truncate">{tItem.text}</span>
                  <span className="text-[10px] font-mono opacity-80">{tItem.duration}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* Track 3: Audio Track A1 */}
          <div className="flex items-center gap-2 h-10 bg-navy-900/40 rounded-xl p-1 border border-slate-800/60 relative">
            <span className="w-8 shrink-0 text-center font-mono text-[10px] font-bold text-slate-500">
              A1
            </span>
            <div className="flex-1 h-full flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {audioTracks.length > 0 ? (
                audioTracks.map((aItem) => (
                  <div
                    key={aItem.id}
                    className="h-full w-64 rounded-lg px-2.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-between text-[11px] font-medium"
                  >
                    <span className="truncate">{aItem.name}</span>
                    <span className="text-[10px] font-mono">100% Vol</span>
                  </div>
                ))
              ) : (
                <span className="text-[10px] text-slate-600 px-2">No background audio track</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Studio Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-6 animate-fade-in shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-purple-400" />
                <span>Export Studio Video</span>
              </h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Resolution selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Resolution:</label>
              <div className="grid grid-cols-4 gap-2">
                {['480p', '720p', '1080p', '4K'].map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setExportResolution(res)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      exportResolution === res
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-navy-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Frame Rate (FPS):</label>
              <div className="grid grid-cols-3 gap-2">
                {[24, 30, 60].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setExportFps(f)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      exportFps === f
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-navy-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {f} FPS
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar during render */}
            {isExporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Compiling Timeline &amp; Encoding Video...</span>
                  <span className="font-mono text-purple-400">{exportProgress}%</span>
                </div>
                <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success download link */}
            {exportResult && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Ready for Download ({formatBytes(exportResult.fileSize)})
                </p>
                <a
                  href={exportResult.download.downloadUrl}
                  download={exportResult.fileName}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" /> Download Exported Video
                </a>
              </div>
            )}

            {!exportResult && (
              <button
                type="button"
                onClick={handleRenderExport}
                disabled={isExporting}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isExporting ? 'Encoding with FFmpeg Engine...' : 'Start Render & Download'}
              </button>
            )}

            <div className="text-center">
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero tracking • Output auto-deleted in 10 minutes
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
