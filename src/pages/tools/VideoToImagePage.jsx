import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Film, Download, Archive, Play, Clock, Grid, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import ToolLayout from '../../components/tools/ToolLayout';
import ToolDropzone from '../../components/tools/ToolDropzone';
import ToolProgressBar from '../../components/tools/ToolProgressBar';
import { addToolHistoryItem } from '../../components/tools/ToolHistoryModal';
import { api, formatBytes, formatDuration } from '../../services/api';

export default function VideoToImagePage() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const [mode, setMode] = useState('interval'); // 'interval', 'timestamp', 'thumbnail', 'contact_sheet'
  const [intervalSeconds, setIntervalSeconds] = useState(5);
  const [timestamp, setTimestamp] = useState('00:00:02');
  const [contactSheetCols, setContactSheetCols] = useState(4);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const videoRef = useRef(null);
  const abortControllerRef = useRef(null);

  const handleFilesSelected = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setVideoFile(file);
    setResult(null);

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  };

  const handleClearFile = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setResult(null);
    setVideoDuration(0);
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setVideoDuration(dur);
      if (dur > 2) {
        setTimestamp(formatDuration(Math.min(5, Math.floor(dur / 2))));
      }
    }
  };

  const handleCaptureCurrentTime = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setTimestamp(formatDuration(current));
      setMode('timestamp');
      toast.success(`Set timestamp to ${formatDuration(current)}`);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      setProgress(0);
      toast('Processing cancelled by user.', { icon: '🛑' });
    }
  };

  const handleProcess = async () => {
    if (!videoFile) {
      toast.error('Please upload a video file first.');
      return;
    }

    setIsProcessing(true);
    setProgress(15);
    abortControllerRef.current = new AbortController();

    try {
      const data = await api.extractVideoImages({
        file: videoFile,
        mode,
        timestamp,
        intervalSeconds,
        contactSheetCols,
        onUploadProgress: (pct) => setProgress(Math.min(85, Math.max(20, pct))),
        cancelSignal: abortControllerRef.current.signal
      });

      setProgress(100);
      setResult(data);
      toast.success('Video frame extraction completed successfully!');

      if (data.singleDownload) {
        addToolHistoryItem({
          toolName: 'Video to Image',
          fileName: data.singleImage.fileName,
          downloadUrl: data.singleDownload.downloadUrl,
          details: `Mode: ${mode.replace('_', ' ')} (${formatBytes(data.singleImage.fileSize)})`
        });
      }

      if (data.zipDownload) {
        addToolHistoryItem({
          toolName: 'Video to Image (ZIP)',
          fileName: data.zipArchive.fileName,
          downloadUrl: data.zipDownload.downloadUrl,
          details: `${data.totalFrames} frames extracted (ZIP ${formatBytes(data.zipArchive.fileSize)})`
        });
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        // cancelled
      } else {
        toast.error(err.response?.data?.error || err.message || 'Frame extraction failed.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Video to Image Converter"
      description="Extract high-resolution JPG images from videos at custom timestamps, periodic frame intervals, smart thumbnails, or storyboard contact sheets."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Video Player */}
        <div className="lg:col-span-7 space-y-6">
          {!videoFile ? (
            <ToolDropzone
              accept="video/mp4,video/quicktime,video/x-matroska,video/webm,video/x-msvideo"
              acceptedExtensions={['.mp4', '.mov', '.mkv', '.webm', '.avi']}
              multiple={false}
              maxFiles={1}
              onFilesSelected={handleFilesSelected}
              helperText="Upload any video file (MP4, MOV, MKV, WebM, AVI up to 1GB)"
            />
          ) : (
            <div className="bg-navy-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200 truncate max-w-xs">{videoFile.name}</h3>
                    <p className="text-xs text-slate-400">
                      {formatBytes(videoFile.size)} {videoDuration > 0 && `• Duration: ${formatDuration(videoDuration)}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearFile}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
                >
                  Change Video
                </button>
              </div>

              {/* Video Player */}
              {videoPreviewUrl && (
                <div className="relative rounded-xl overflow-hidden bg-black/60 border border-slate-800 aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoPreviewUrl}
                    controls
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 bg-navy-950/60 p-3 rounded-xl border border-slate-800/80">
                <span>Play the video to pause at any exact moment.</span>
                <button
                  type="button"
                  onClick={handleCaptureCurrentTime}
                  className="text-brand-primary hover:text-brand-secondary font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Use Current Video Time
                </button>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <ToolProgressBar
              progress={progress}
              status="Analyzing video and extracting frame images with FFmpeg..."
              onCancel={handleCancel}
            />
          )}

          {/* Results Display */}
          {result && (
            <div className="bg-navy-900/80 border border-emerald-500/30 rounded-2xl p-6 space-y-6 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Frame Extraction Complete</span>
                </div>
                {result.zipDownload && (
                  <a
                    href={result.zipDownload.downloadUrl}
                    download={result.zipDownload.fileName}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs rounded-xl shadow-lg transition-all"
                  >
                    <Archive className="w-4 h-4" />
                    Download All as ZIP ({formatBytes(result.zipArchive?.fileSize)})
                  </a>
                )}
                {result.singleDownload && (
                  <a
                    href={result.singleDownload.downloadUrl}
                    download={result.singleDownload.fileName}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs rounded-xl shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download Frame ({formatBytes(result.singleImage?.fileSize)})
                  </a>
                )}
              </div>

              {/* Single Image / Storyboard Result Preview */}
              {result.singleImage && result.singleDownload && (
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/40 flex items-center justify-center p-2">
                    <img
                      src={result.singleDownload.downloadUrl}
                      alt="Extracted Frame"
                      className="max-h-80 w-auto object-contain rounded-lg shadow-md"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>File: {result.singleImage.fileName}</span>
                    <span>Size: {formatBytes(result.singleImage.fileSize)}</span>
                  </div>
                </div>
              )}

              {/* Interval Frames Result Grid Preview */}
              {result.frames && result.frames.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Extracted {result.totalFrames} total frames (showing first {result.frames.length})</span>
                    <span>Interval: Every {result.intervalSeconds}s</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1 custom-scrollbar">
                    {result.frames.map((frame, idx) => (
                      <div key={idx} className="bg-navy-950/70 border border-slate-800 rounded-xl overflow-hidden p-2 text-center group">
                        <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center text-slate-500 mb-1.5 border border-slate-800/60 overflow-hidden">
                          <ImageIcon className="w-6 h-6 text-slate-600" />
                        </div>
                        <p className="text-[11px] font-mono text-slate-300 truncate">{frame.fileName}</p>
                        <p className="text-[10px] text-slate-500">{formatDuration(frame.timestampSeconds)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Settings & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-navy-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Extraction Mode
            </h3>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('interval')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  mode === 'interval'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300 shadow-md'
                    : 'border-slate-800 bg-navy-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Clock className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-semibold">Periodic Interval</span>
                <span className="text-[10px] text-slate-500">Every 1s, 5s, 10s</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('timestamp')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  mode === 'timestamp'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300 shadow-md'
                    : 'border-slate-800 bg-navy-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Play className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-semibold">Exact Timestamp</span>
                <span className="text-[10px] text-slate-500">Specific second/time</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('thumbnail')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  mode === 'thumbnail'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300 shadow-md'
                    : 'border-slate-800 bg-navy-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ImageIcon className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-semibold">Smart Thumbnail</span>
                <span className="text-[10px] text-slate-500">Auto-chosen frame</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('contact_sheet')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  mode === 'contact_sheet'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300 shadow-md'
                    : 'border-slate-800 bg-navy-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Grid className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-semibold">Contact Sheet</span>
                <span className="text-[10px] text-slate-500">Storyboard grid</span>
              </button>
            </div>

            {/* Mode-Specific Settings */}
            <div className="pt-2 border-t border-slate-800/80 space-y-4">
              {mode === 'interval' && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-300">Extract One Frame Every:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 5, 10].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setIntervalSeconds(sec)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          intervalSeconds === sec
                            ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                            : 'bg-navy-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-slate-400">Custom seconds:</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={intervalSeconds}
                      onChange={(e) => setIntervalSeconds(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-20 px-3 py-1.5 bg-navy-950 border border-slate-800 rounded-lg text-sm text-slate-200 text-center focus:border-purple-500 outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    All extracted frames will be automatically packed into a single organized ZIP archive.
                  </p>
                </div>
              )}

              {mode === 'timestamp' && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-300">Target Timestamp (HH:MM:SS or Seconds):</label>
                  <input
                    type="text"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    placeholder="00:00:05"
                    className="w-full px-4 py-2.5 bg-navy-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-sm focus:border-purple-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    Tip: You can also pause the video player on the left and click "Use Current Video Time".
                  </p>
                </div>
              )}

              {mode === 'thumbnail' && (
                <div className="p-3 bg-navy-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
                  <p className="text-slate-200 font-medium">Automatic Frame Detection</p>
                  <p>Our FFmpeg engine scans into the first key action segment of the video to capture a crisp, representative cover image.</p>
                </div>
              )}

              {mode === 'contact_sheet' && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-300">Grid Columns:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 4, 6].map((cols) => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => setContactSheetCols(cols)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          contactSheetCols === cols
                            ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                            : 'bg-navy-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {cols} Columns
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Extracts frames evenly distributed throughout the entire video and stitches them into a high-res storyboard image.
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleProcess}
              disabled={isProcessing || !videoFile}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isProcessing || !videoFile
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-purple-500/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Extracting Frames...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>Extract Images Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

