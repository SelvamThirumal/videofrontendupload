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
