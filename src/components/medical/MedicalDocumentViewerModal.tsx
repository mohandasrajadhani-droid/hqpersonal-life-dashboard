import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Printer,
  Sliders,
  Sun,
  Moon,
  Pill,
  Activity,
  Building,
  Stethoscope,
  Calendar,
  User,
  Copy,
  Check,
  Move,
  Info,
} from 'lucide-react';
import { MedicalAttachment, MedicalRecord } from '../../types';

export interface MedicalDocumentViewerModalProps {
  /** Single attachment (backwards compatibility) */
  attachment?: MedicalAttachment | null;
  /** Array of attachments for carousel and navigation */
  attachments?: MedicalAttachment[];
  /** Starting index for attachments array */
  initialIndex?: number;
  /** Associated medical record for contextual information */
  record?: MedicalRecord | null;
  /** Callback to close viewer */
  onClose: () => void;
}

export const MedicalDocumentViewerModal: React.FC<MedicalDocumentViewerModalProps> = ({
  attachment: singleAttachment,
  attachments: propAttachments,
  initialIndex = 0,
  record,
  onClose,
}) => {
  // Normalize attachment list
  const attachmentsList: MedicalAttachment[] = propAttachments && propAttachments.length > 0
    ? propAttachments
    : singleAttachment
    ? [singleAttachment]
    : record && record.attachments && record.attachments.length > 0
    ? record.attachments
    : [];

  const [currentIndex, setCurrentIndex] = useState<number>(
    Math.min(Math.max(initialIndex, 0), Math.max(attachmentsList.length - 1, 0))
  );

  // Active attachment
  const currentAttachment = attachmentsList[currentIndex] || singleAttachment || null;

  // Transform & Viewport State
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [fitMode, setFitMode] = useState<'contain' | 'width' | 'page'>('contain');
  const [invertColors, setInvertColors] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(attachmentsList.length > 1);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Pan / Drag State (when zoomed in)
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerModalRef = useRef<HTMLDivElement>(null);

  // PDF Page parameter
  const [pdfPage, setPdfPage] = useState<number>(1);

  // Reset transforms whenever changing attachments
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPanPosition({ x: 0, y: 0 });
    setFitMode('contain');
    setPdfPage(1);
  }, [currentIndex]);

  // Keep index synchronized if prop changes
  useEffect(() => {
    if (propAttachments && propAttachments.length > 0) {
      setCurrentIndex((prev) => Math.min(prev, propAttachments.length - 1));
    }
  }, [propAttachments]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotate();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setInvertColors((v) => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, attachmentsList.length, onClose]);

  if (!currentAttachment) return null;

  const isPdf =
    currentAttachment.fileType === 'application/pdf' ||
    currentAttachment.fileName.toLowerCase().endsWith('.pdf') ||
    currentAttachment.dataUrl?.startsWith('data:application/pdf');

  const isImage =
    currentAttachment.fileType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(currentAttachment.fileName) ||
    currentAttachment.dataUrl?.startsWith('data:image/');

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleNext = () => {
    if (attachmentsList.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % attachmentsList.length);
  };

  const handlePrev = () => {
    if (attachmentsList.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + attachmentsList.length) % attachmentsList.length);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(Math.round((z + 0.25) * 100) / 100, 4));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(Math.round((z - 0.25) * 100) / 100, 0.25));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateCcw = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPanPosition({ x: 0, y: 0 });
    setFitMode('contain');
  };

  const handleFitWidth = () => {
    setFitMode('width');
    setZoom(1.5);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleFitPage = () => {
    setFitMode('page');
    setZoom(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Mouse wheel zoom when hovering viewport
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom((z) => Math.min(Math.max(Math.round((z + delta) * 100) / 100, 0.25), 4));
    }
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Double click to toggle quick zoom
  const handleDoubleClick = () => {
    if (zoom > 1) {
      handleReset();
    } else {
      setZoom(2);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentAttachment.dataUrl;
    link.download = currentAttachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (isImage) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${currentAttachment.fileName}</title>
              <style>
                body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
                img { max-width: 100%; max-height: 100vh; object-contain: fit; }
              </style>
            </head>
            <body>
              <img src="${currentAttachment.dataUrl}" onload="window.print();window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      // For PDF, download or print window
      const printWindow = window.open(currentAttachment.dataUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      }
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerModalRef.current) return;
    if (!document.fullscreenElement) {
      containerModalRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCopyDetails = () => {
    const details = [
      `File: ${currentAttachment.fileName}`,
      `Size: ${formatFileSize(currentAttachment.fileSize)}`,
      record?.title ? `Record: ${record.title}` : '',
      record?.doctorName ? `Doctor: Dr. ${record.doctorName}` : '',
      record?.hospitalClinic ? `Hospital: ${record.hospitalClinic}` : '',
      record?.diagnosis ? `Diagnosis: ${record.diagnosis}` : '',
      record?.date ? `Date: ${record.date}` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(details).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    });
  };

  // Image filter styles for night reading / contrast
  const getImageFilterStyle = () => {
    const filters: string[] = [];
    if (invertColors) filters.push('invert(0.92) hue-rotate(180deg)');
    if (highContrast) filters.push('contrast(1.35) brightness(1.05)');
    return filters.length > 0 ? filters.join(' ') : 'none';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dedicated-doc-viewer-title"
      className="fixed inset-0 z-[9998] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none"
    >
      <div
        ref={containerModalRef}
        className="relative flex flex-col w-full h-[94vh] max-w-6xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
      >
        {/* TOP TOOLBAR */}
        <header className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur shrink-0 gap-2">
          {/* Left: Document info & Record metadata */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/40 dark:border-teal-800/40">
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="dedicated-doc-viewer-title"
                  className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate"
                  title={currentAttachment.fileName}
                >
                  {currentAttachment.fileName}
                </h3>

                {attachmentsList.length > 1 && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 shrink-0">
                    {currentIndex + 1} of {attachmentsList.length}
                  </span>
                )}

                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3" /> Secure Record
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                <span>{formatFileSize(currentAttachment.fileSize)}</span>
                <span>•</span>
                <span>{isPdf ? 'PDF Document' : isImage ? 'Image Scan' : 'Attachment'}</span>
                {record?.title && (
                  <>
                    <span>•</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                      {record.title}
                    </span>
                  </>
                )}
                {record?.doctorName && (
                  <span className="hidden sm:inline text-teal-600 dark:text-teal-400">
                    (Dr. {record.doctorName})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions & Dismiss */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Record details toggle */}
            {record && (
              <button
                type="button"
                id="doc-viewer-toggle-details-btn"
                onClick={() => setShowDetailsPanel((prev) => !prev)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  showDetailsPanel
                    ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-300/60 dark:border-teal-700/60'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Toggle Record Clinical Details Panel"
              >
                <Info className="w-4 h-4" />
                <span className="hidden lg:inline">Record Details</span>
              </button>
            )}

            {/* Print */}
            <button
              type="button"
              id="doc-viewer-print-btn"
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Print Document"
              aria-label="Print document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              type="button"
              id="doc-viewer-download-btn"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
              title="Download original file"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              id="doc-viewer-fullscreen-btn"
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Toggle Fullscreen (F)"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              id="doc-viewer-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer ml-1"
              aria-label="Close document viewer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* SECONDARY FLOATING/DEDICATED CONTROLS BAR: Zoom, Navigation, Filters */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2 bg-slate-100/90 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 gap-2 flex-wrap">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Zoom:
            </span>

            <button
              type="button"
              id="doc-viewer-zoom-out-btn"
              onClick={handleZoomOut}
              disabled={zoom <= 0.25}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              title="Zoom Out (-)"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Current Zoom Pill & Slider */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="font-bold min-w-[42px] text-center text-teal-700 dark:text-teal-300">
                {Math.round(zoom * 100)}%
              </span>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-16 sm:w-24 accent-teal-600 cursor-pointer hidden md:inline-block"
                title="Adjust Zoom"
              />
            </div>

            <button
              type="button"
              id="doc-viewer-zoom-in-btn"
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              title="Zoom In (+)"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Fit Presets */}
            <button
              type="button"
              id="doc-viewer-reset-btn"
              onClick={handleReset}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer transition text-[11px]"
              title="Reset Zoom to 100% (0)"
            >
              100%
            </button>

            <button
              type="button"
              id="doc-viewer-fit-width-btn"
              onClick={handleFitWidth}
              className={`px-2 py-1 rounded-lg border font-semibold cursor-pointer transition text-[11px] hidden sm:inline-block ${
                fitMode === 'width'
                  ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
              }`}
              title="Fit to Width"
            >
              Fit Width
            </button>

            <button
              type="button"
              id="doc-viewer-fit-page-btn"
              onClick={handleFitPage}
              className={`px-2 py-1 rounded-lg border font-semibold cursor-pointer transition text-[11px] hidden sm:inline-block ${
                fitMode === 'page'
                  ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
              }`}
              title="Fit to Page"
            >
              Fit Page
            </button>
          </div>

          {/* Orientation & Visual Filters */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              id="doc-viewer-rotate-ccw-btn"
              onClick={handleRotateCcw}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Rotate Counter-Clockwise (-90°)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id="doc-viewer-rotate-cw-btn"
              onClick={handleRotate}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Rotate Clockwise (+90°) (R)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Invert Colors (Night scan reading mode) */}
            <button
              type="button"
              id="doc-viewer-invert-btn"
              onClick={() => setInvertColors((v) => !v)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                invertColors
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title="Invert Colors / Night Scan Reading Mode (I)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            {/* High Contrast */}
            <button
              type="button"
              id="doc-viewer-contrast-btn"
              onClick={() => setHighContrast((v) => !v)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                highContrast
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title="High Contrast for faint handwriting / stamps"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Pan mode indicator if zoomed in */}
            {zoom > 1 && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                <Move className="w-3 h-3" /> Drag to pan
              </span>
            )}
          </div>

          {/* Document Navigation Controls (Next / Prev) */}
          {attachmentsList.length > 1 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                id="doc-viewer-prev-btn"
                onClick={handlePrev}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition cursor-pointer text-xs"
                title="Previous Document (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                {currentIndex + 1} / {attachmentsList.length}
              </span>

              <button
                type="button"
                id="doc-viewer-next-btn"
                onClick={handleNext}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition cursor-pointer text-xs"
                title="Next Document (Right Arrow)"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* MAIN BODY: VIEWPORT + OPTIONAL DETAILS SPLIT PANEL */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* VIEWPORT CANVAS */}
          <div
            ref={viewportRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            className={`flex-1 w-full h-full overflow-auto bg-slate-200/70 dark:bg-slate-950 flex items-center justify-center p-2 sm:p-6 relative select-none ${
              zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
            }`}
          >
            {isPdf ? (
              <div
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg) translate(${panPosition.x / zoom}px, ${panPosition.y / zoom}px)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  filter: getImageFilterStyle(),
                }}
                className={`w-full max-w-4xl h-[78vh] rounded-xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-800 bg-white ${
                  fitMode === 'width' ? 'w-full' : ''
                }`}
              >
                {/* Embedded PDF Viewer with fallback */}
                <iframe
                  key={`${currentAttachment.id}-${pdfPage}`}
                  src={`${currentAttachment.dataUrl}#page=${pdfPage}&toolbar=0&navpanes=0&scrollbar=1`}
                  title={currentAttachment.fileName}
                  className="w-full h-full border-0"
                />
              </div>
            ) : isImage ? (
              <div
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg) translate(${panPosition.x / zoom}px, ${panPosition.y / zoom}px)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  filter: getImageFilterStyle(),
                }}
                className="max-h-full max-w-full flex items-center justify-center pointer-events-auto"
              >
                <img
                  src={currentAttachment.dataUrl}
                  alt={currentAttachment.fileName}
                  draggable={false}
                  className="max-h-[78vh] max-w-[85vw] object-contain rounded-xl shadow-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 pointer-events-none"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md shadow-xl">
                <FileText className="w-16 h-16 text-slate-400 mb-3" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {currentAttachment.fileName}
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  This file format ({currentAttachment.fileType || 'binary'}) cannot be directly rendered inline in browser. You can safely download and review it on your device.
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  Download File ({formatFileSize(currentAttachment.fileSize)})
                </button>
              </div>
            )}

            {/* Quick Floating Zoom Overlay indicator */}
            {zoom !== 1 && (
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg pointer-events-none flex items-center gap-1.5 border border-white/10">
                <ZoomIn className="w-3.5 h-3.5 text-teal-400" />
                <span>{Math.round(zoom * 100)}%</span>
                {rotation !== 0 && <span>• {rotation}°</span>}
              </div>
            )}

            {/* Floating Navigation Chevrons on side of viewport */}
            {attachmentsList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur flex items-center justify-center shadow-xl transition cursor-pointer border border-white/20 hover:scale-105"
                  title="Previous Document"
                  aria-label="Previous document"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur flex items-center justify-center shadow-xl transition cursor-pointer border border-white/20 hover:scale-105"
                  title="Next Document"
                  aria-label="Next document"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* RIGHT SIDE DETAILS DRAWER: Associated Medical Record Clinical Context */}
          {showDetailsPanel && record && (
            <aside className="w-80 sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 sm:p-5 overflow-y-auto space-y-4 shrink-0 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Record Details
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailsPanel(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Record Title & Type */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400">
                  {record.recordType.replace('_', ' ')}
                </span>
                <h5 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {record.title}
                </h5>
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{record.date} {record.time || ''}</span>
                </div>
              </div>

              {/* Doctor / Hospital */}
              {(record.doctorName || record.hospitalClinic) && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-xs">
                  {record.doctorName && (
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      <span>Dr. {record.doctorName}</span>
                      {record.specialty && (
                        <span className="text-slate-500 font-normal">({record.specialty})</span>
                      )}
                    </div>
                  )}
                  {record.hospitalClinic && (
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{record.hospitalClinic}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Diagnosis */}
              {record.diagnosis && (
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Diagnosis / Clinical Impression:
                  </span>
                  <p className="p-2.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 text-slate-800 dark:text-slate-200 border border-teal-200/50 dark:border-teal-800/50">
                    {record.diagnosis}
                  </p>
                </div>
              )}

              {/* Prescribed Medicines (if any) */}
              {record.medicines && record.medicines.length > 0 && (
                <div className="text-xs space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-teal-600" /> Prescriptions ({record.medicines.length}):
                  </span>
                  <div className="space-y-1.5">
                    {record.medicines.map((m) => (
                      <div
                        key={m.id}
                        className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <div className="font-bold text-slate-900 dark:text-slate-100">{m.name}</div>
                        <div className="text-slate-500">{m.dosage} • {m.frequency}</div>
                        {m.instructions && (
                          <div className="text-slate-400 italic mt-0.5">{m.instructions}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lab Test Results (if any) */}
              {record.testResults && record.testResults.length > 0 && (
                <div className="text-xs space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-blue-600" /> Lab Results ({record.testResults.length}):
                  </span>
                  <div className="space-y-1.5">
                    {record.testResults.map((t) => (
                      <div
                        key={t.id}
                        className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{t.testName}</div>
                          <div className="text-slate-400 text-[10px]">Ref: {t.referenceRange || '—'}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 dark:text-white">{t.result} {t.unit}</span>
                          {t.flag && (
                            <div className={`text-[9px] font-bold uppercase ${t.flag === 'Normal' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {t.flag}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy details */}
              <button
                type="button"
                onClick={handleCopyDetails}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Document &amp; Clinical Info</span>
                  </>
                )}
              </button>
            </aside>
          )}
        </div>

        {/* BOTTOM THUMBNAILS FILMSTRIP (If multiple attachments) */}
        {attachmentsList.length > 1 && (
          <footer className="px-4 py-2.5 bg-slate-100/90 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Documents:
            </span>

            {attachmentsList.map((att, idx) => {
              const isSelected = idx === currentIndex;
              const attIsPdf = att.fileType === 'application/pdf' || att.fileName.toLowerCase().endsWith('.pdf');
              return (
                <button
                  key={att.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left transition cursor-pointer shrink-0 max-w-[200px] ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-500 text-teal-800 dark:text-teal-200 shadow-sm ring-1 ring-teal-500'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                  title={att.fileName}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {attIsPdf ? <FileText className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold truncate leading-tight">{att.fileName}</p>
                    <p className="text-[9px] text-slate-400">{formatFileSize(att.fileSize)}</p>
                  </div>
                </button>
              );
            })}
          </footer>
        )}
      </div>
    </div>
  );
};
