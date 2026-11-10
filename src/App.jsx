import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ToastNotifications from './components/ToastNotifications';
import HomePage from './pages/HomePage';
import SeriesPreviewPage from './pages/SeriesPreviewPage';
import DashboardPage from './pages/DashboardPage';
import ResultsPage from './pages/ResultsPage';

// All-in-One File Utility Tools Pages
import ToolsDashboardPage from './pages/tools/ToolsDashboardPage';
import ImageReducerPage from './pages/tools/ImageReducerPage';
import PassportPhotoPage from './pages/tools/PassportPhotoPage';
import PdfToWordPage from './pages/tools/PdfToWordPage';
import WordToExcelPage from './pages/tools/WordToExcelPage';
import PdfToZipPage from './pages/tools/PdfToZipPage';
import ZipExtractorPage from './pages/tools/ZipExtractorPage';
import ImageConverterPage from './pages/tools/ImageConverterPage';
import VideoToImagePage from './pages/tools/VideoToImagePage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 selection:bg-brand-primary selection:text-white">
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* Existing File Merge Routes (Preserved Exactly) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/batch/:batchId/preview" element={<SeriesPreviewPage />} />
            <Route path="/batch/:batchId/dashboard" element={<DashboardPage />} />
            <Route path="/batch/:batchId/results" element={<ResultsPage />} />

            {/* New File Utility Tools Routes */}
            <Route path="/tools" element={<ToolsDashboardPage />} />
            <Route path="/tools/image-reducer" element={<ImageReducerPage />} />
            <Route path="/tools/passport-photo" element={<PassportPhotoPage />} />
            <Route path="/tools/pdf-to-word" element={<PdfToWordPage />} />
            <Route path="/tools/word-to-excel" element={<WordToExcelPage />} />
            <Route path="/tools/pdf-to-zip" element={<PdfToZipPage />} />
            <Route path="/tools/zip-extractor" element={<ZipExtractorPage />} />
            <Route path="/tools/image-converter" element={<ImageConverterPage />} />
            <Route path="/tools/video-to-image" element={<VideoToImagePage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-500 bg-navy-950/60">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} FASTBATCH — Smart Bulk Video Merger &amp; File Tools Platform. Built with FFmpeg &amp; MERN.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Free &amp; Open Source</span>
              <span>•</span>
              <span>8 File Utility Tools</span>
              <span>•</span>
              <span>Stream-Copy Engine</span>
              <span>•</span>
              <span>Zero Logging</span>
            </div>
          </div>
        </footer>

        <ToastNotifications />
      </div>
    </BrowserRouter>
  );
}
