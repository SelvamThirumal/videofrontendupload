import axios from 'axios';

/**
 * Resolves and normalizes the backend API base URL.
 * Supports:
 * - Localhost dev server (Vite proxy fallback when empty)
 * - Explicit VITE_API_URL from .env / .env.production / Vercel
 * - Automatically strips trailing slashes and appends /api if omitted.
 */
function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '') {
    return '/api';
  }

  let cleanUrl = envUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl = `${cleanUrl}/api`;
  }
  return cleanUrl;
}

const API_BASE = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Accept': 'application/json'
  }
});

export const api = {
  /**
   * Uploads multiple video files with folder paths and progress tracking.
   */
  async uploadBatch({ files, relativePaths, batchId, onUploadProgress, cancelSignal }) {
    const formData = new FormData();
    if (batchId) {
      formData.append('batchId', batchId);
    }

    if (relativePaths && Object.keys(relativePaths).length > 0) {
      formData.append('relativePaths', JSON.stringify(relativePaths));
    }

    for (const file of files) {
      formData.append('videos', file, file.name);
    }

    const response = await apiClient.post('/batches', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent, progressEvent.loaded, progressEvent.total);
        }
      },
      signal: cancelSignal
    });

    return response.data;
  },

  /**
   * Fetches batch status.
   */
  async getBatch(batchId) {
    const response = await apiClient.get(`/batches/${batchId}`);
    return response.data;
  },

  /**
   * Fetches detected series groups.
   */
  async getBatchGroups(batchId) {
    const response = await apiClient.get(`/batches/${batchId}/groups`);
    return response.data;
  },

  /**
   * Saves manual user adjustments to series and parts.
   */
  async updateBatchGroups(batchId, { groups, unrecognized }) {
    const response = await apiClient.put(`/batches/${batchId}/groups`, {
      groups,
      unrecognized
    });
    return response.data;
  },

  /**
   * Starts the merge process for a batch.
   */
  async startMerge(batchId, seriesConfigs) {
    const response = await apiClient.post(`/batches/${batchId}/merge`, {
      seriesConfigs
    });
    return response.data;
  },

  /**
   * Fetches live progress for a batch.
   */
  async getProgress(batchId) {
    const response = await apiClient.get(`/batches/${batchId}/progress`);
    return response.data;
  },

  /**
   * Fetches final results.
   */
  async getResults(batchId) {
    const response = await apiClient.get(`/batches/${batchId}/results`);
    return response.data;
  },

  /**
   * Cancels and deletes a batch.
   */
  async deleteBatch(batchId) {
    const response = await apiClient.delete(`/batches/${batchId}`);
    return response.data;
  },

  /**
   * Generates download URL for single output.
   */
  getDownloadUrl(batchId, jobId) {
    return `${API_BASE}/batches/${batchId}/download/${jobId}`;
  },

  /**
   * Generates download URL for all outputs as ZIP.
   */
  getDownloadAllZipUrl(batchId) {
    return `${API_BASE}/batches/${batchId}/download-all`;
  },

  // ==========================================
  // New All-in-One File Utility Tools APIs
  // ==========================================

  /**
   * 1. Reduce image size
   */
  async reduceImageSize({ files, quality, targetSizeKB, maxWidth, maxHeight, format, onUploadProgress, cancelSignal }) {
    const formData = new FormData();
    for (const f of files) formData.append('images', f);
    if (quality) formData.append('quality', quality);
    if (targetSizeKB) formData.append('targetSizeKB', targetSizeKB);
    if (maxWidth) formData.append('maxWidth', maxWidth);
    if (maxHeight) formData.append('maxHeight', maxHeight);
    if (format) formData.append('format', format);

    const res = await apiClient.post('/tools/image-reducer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
      signal: cancelSignal
    });
    return res.data;
  },

  /**
   * 2. Passport photo generator
   */
  async generatePassportPhoto({ file, presetKey, customWidth, customHeight, bgColorKey, copiesOnA4, onUploadProgress, cancelSignal }) {
    const formData = new FormData();
    formData.append('photo', file);
    if (presetKey) formData.append('presetKey', presetKey);
    if (customWidth) formData.append('customWidth', customWidth);
    if (customHeight) formData.append('customHeight', customHeight);
    if (bgColorKey) formData.append('bgColorKey', bgColorKey);
    if (copiesOnA4) formData.append('copiesOnA4', copiesOnA4);

    const res = await apiClient.post('/tools/passport-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
      signal: cancelSignal
    });
    return res.data;
  },

  /**
   * 3. PDF to Word converter
   */
  async convertPdfToWord({ file, enableOcr, onUploadProgress, cancelSignal }) {
    const formData = new FormData();
    formData.append('pdf', file);
    if (enableOcr) formData.append('enableOcr', 'true');

    const res = await apiClient.post('/tools/pdf-to-word', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
      signal: cancelSignal
    });
    return res.data;
  },

  /**
   * 4. Word to Excel converter
   */
  async convertWordToExcel({ file, onUploadProgress, cancelSignal }) {
    const formData = new FormData();
    formData.append('document', file);

    const res = await apiClient.post('/tools/word-to-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
      signal: cancelSignal
    });
    return res.data;
  },

  /**
   * 5. PDF to ZIP converter
   */
  async bundlePdfsToZip({ files, customZipName, onUploadProgress, cancelSignal }) {
    const formData = new FormData();
    for (const f of files) formData.append('pdfs', f);
    if (customZipName) formData.append('customZipName', customZipName);

    const res = await apiClient.post('/tools/pdf-to-zip', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
      signal: cancelSignal
    });
    return res.data;
  },

  /**
   * 6. ZIP Extractor
   */
  async extractZip({ file, onUploadProgress, cancelSignal }) {
    const formData = new FormData();
    formData.append('zipFile', file);

    const res = await apiClient.post('/tools/zip-extractor', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
      signal: cancelSignal
    });
    return res.data;
  },

  /**
   * 7. Image Format Converter
   */
  async convertImageFormat({ files, targetFormat, quality, onUploadProgress, cancelSignal }) {
    const formData = new FormData();
    for (const f of files) formData.append('images', f);
    if (targetFormat) formData.append('targetFormat', targetFormat);
    if (quality) formData.append('quality', quality);

    const res = await apiClient.post('/tools/image-converter', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
      signal: cancelSignal
    });
    return res.data;
  },

  /**
   * 8. Video to Image Converter
   */
  async extractVideoImages({ file, mode, timestamp, intervalSeconds, contactSheetCols, onUploadProgress, cancelSignal }) {
    const formData = new FormData();
    formData.append('video', file);
    if (mode) formData.append('mode', mode);
    if (timestamp) formData.append('timestamp', timestamp);
    if (intervalSeconds) formData.append('intervalSeconds', intervalSeconds);
    if (contactSheetCols) formData.append('contactSheetCols', contactSheetCols);

    const res = await apiClient.post('/tools/video-to-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
      signal: cancelSignal
    });
    return res.data;
  },

  /**
   * Generates download URL for tool outputs
   */
  getToolDownloadUrl(token, fileName) {
    return `${API_BASE}/tools/download/${token}/${encodeURIComponent(fileName)}`;
  }
};

/**
 * Helper to format byte counts into human-readable strings.
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Helper to format seconds into HH:MM:SS or MM:SS.
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
  const totalSecs = Math.round(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
