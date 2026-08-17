import React, { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  User,
  Calendar,
  Tag,
  Trash2,
  Share2,
  Maximize2,
  Check,
} from 'lucide-react';
import { MediaItem } from '../types';

interface MediaLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: MediaItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onLike?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  isOpen,
  onClose,
  mediaList,
  currentIndex,
  onNavigate,
  onLike,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Prevent background page from scrolling
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < mediaList.length - 1) onNavigate(currentIndex + 1);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, mediaList.length, onClose, onNavigate]);

  if (!isOpen || !mediaList[currentIndex]) return null;

  const current = mediaList[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < mediaList.length - 1;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = current.url;
    const safeTitle = (current.title || 'media_dokumentasi').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `${safeTitle}.jpg`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.click();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*${current.title}*\nAlbum: ${current.albumName}\nOleh: ${current.uploadedBy}\n\n${current.description || ''}\n\nLihat di Portal Warga Green Bussan Village`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDelete = () => {
    if (onDelete && window.confirm(`Hapus dokumentasi "${current.title}" dari galeri?`)) {
      onDelete(current.id);
      onClose();
    }
  };

  return (
    <div
      id="media-lightbox-modal"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar - Sticky / Always accessible */}
      <div className="sticky top-0 z-30 flex items-center justify-between text-white bg-black/40 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-white/10 mb-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            {current.albumName}
          </span>
          <span className="text-xs text-slate-300 font-medium">
            {currentIndex + 1} dari {mediaList.length}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Share WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-emerald-600 text-slate-200 hover:text-white transition-all shadow"
            title="Bagikan ke WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Download */}
          {current.type === 'photo' && (
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition-all shadow"
              title="Unduh Gambar"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Delete Photo */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white transition-all shadow"
              title="Hapus Foto/Video Ini"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-rose-600 text-slate-200 hover:text-white transition-all shadow ml-1"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex items-center justify-center my-3 select-none max-w-5xl mx-auto w-full">
        {/* Prev Button */}
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex - 1);
            }}
            className="absolute left-1 sm:left-2 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white transition-all shadow-xl hover:scale-110 border border-white/10"
            title="Foto Sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Media Display */}
        <div className="w-full flex items-center justify-center py-2">
          {current.type === 'photo' ? (
            <img
              src={current.url}
              alt={current.title}
              className="max-h-[60vh] sm:max-h-[68vh] max-w-full object-contain rounded-2xl shadow-2xl transition-transform"
            />
          ) : (
            <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800">
              <iframe
                src={current.url}
                title={current.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Next Button */}
        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex + 1);
            }}
            className="absolute right-1 sm:right-2 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white transition-all shadow-xl hover:scale-110 border border-white/10"
            title="Foto Selanjutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Info Bar - Fully Scrollable & Readable */}
      <div className="bg-slate-900/95 border border-slate-800/80 rounded-2xl p-4 sm:p-5 text-white max-w-5xl mx-auto w-full z-10 shadow-2xl mt-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {current.title}
            </h3>

            {current.description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line">
                {current.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {current.date}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                Diunggah oleh: <strong className="text-slate-200">{current.uploadedBy}</strong>
              </span>

              {current.tags && current.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  {current.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {onLike && (
              <button
                onClick={() => onLike(current.id)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-rose-950/60 text-rose-400 border border-slate-700 hover:border-rose-500 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
              >
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>{current.likes || 0} Disukai Warga</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
