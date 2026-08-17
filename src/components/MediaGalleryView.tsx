import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Film,
  Plus,
  Heart,
  Calendar,
  User,
  Search,
  Filter,
  Maximize2,
  Play,
  Share2,
  Sparkles,
  Layers,
  Trash2,
  HelpCircle,
  Smartphone,
  Video,
  FolderPlus,
  RefreshCw,
  Upload,
  Info,
} from 'lucide-react';
import { MediaItem } from '../types';
import { MediaLightboxModal } from './MediaLightboxModal';
import { MediaUploadModal } from './MediaUploadModal';

interface MediaGalleryViewProps {
  mediaList: MediaItem[];
  onSaveMedia: (item: MediaItem) => void;
  onDeleteMedia: (id: string) => void;
  onLikeMedia: (id: string) => void;
  onResetDemoMedia?: () => void;
  onClearAllMedia?: () => void;
}

export const MediaGalleryView: React.FC<MediaGalleryViewProps> = ({
  mediaList,
  onSaveMedia,
  onDeleteMedia,
  onLikeMedia,
  onResetDemoMedia,
  onClearAllMedia,
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string>('Semua');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Extract unique album names
  const existingAlbums = Array.from(new Set(mediaList.map((m) => m.albumName).filter(Boolean)));

  // Filter media items
  const filteredMedia = mediaList.filter((item) => {
    const matchesAlbum = selectedAlbum === 'Semua' || item.albumName === selectedAlbum;
    const matchesType = mediaTypeFilter === 'all' || item.type === mediaTypeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesAlbum && matchesType && matchesSearch;
  });

  const photoCount = mediaList.filter((m) => m.type === 'photo').length;
  const videoCount = mediaList.filter((m) => m.type === 'video').length;

  const handleClearAll = () => {
    if (
      window.confirm(
        'Kosongkan semua foto & video di galeri agar warga bisa mulai mengunggah foto asli dari nol?'
      )
    ) {
      if (onClearAllMedia) {
        onClearAllMedia();
      } else {
        mediaList.forEach((m) => onDeleteMedia(m.id));
      }
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-700/80 border border-emerald-500/30 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Galeri Dokumentasi Warga Green Bussan
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dokumentasi Foto & Video Kegiatan
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
              Arsip momen gotong royong, kegiatan warga, posyandu, peringatan kemerdekaan, dan perayaan bersama. Warga dapat mengunggah langsung dari HP/laptop.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Unggah Foto / Video
            </button>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
              title="Petunjuk cara warga mengunggah foto & video"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              {showGuide ? 'Tutup Panduan' : 'Cara Upload'}
            </button>

            {mediaList.length > 0 && (
              <button
                onClick={handleClearAll}
                className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white font-semibold text-xs px-3.5 py-3 rounded-2xl border border-rose-800/60 transition-all flex items-center gap-1.5"
                title="Kosongkan semua foto galeri untuk diisi foto asli warga"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Kosongkan Galeri</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Counter */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t border-white/10 max-w-lg">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-emerald-200 font-semibold uppercase">Total Dokumentasi</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{mediaList.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-emerald-200 font-semibold uppercase">Foto Warga</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{photoCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-emerald-200 font-semibold uppercase">Video Sematan</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{videoCount}</p>
          </div>
        </div>
      </div>

      {/* Panduan & Tutorial Banner (Expandable / Visible when empty) */}
      {(showGuide || mediaList.length === 0) && (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Panduan Mudah Mengisi & Mengganti Foto / Video Galeri
                </h3>
                <p className="text-xs text-slate-600">
                  Warga atau pengurus RT dapat mengunggah momen kapan saja dengan 4 langkah praktis:
                </p>
              </div>
            </div>

            {mediaList.length > 0 && (
              <button
                onClick={() => setShowGuide(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
              >
                ✕ Tutup
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                1
              </div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                Pilih Foto dari HP / Laptop
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Klik tombol <strong>Unggah Foto / Video</strong>, pilih foto dari galeri HP atau kamera. Foto otomatis <strong>dikompres hemat kuota</strong> tanpa buram.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">
                2
              </div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-600" />
                Video YouTube & Shorts
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Untuk video, pilih tab <strong>Video Sematan</strong> dan tempel tautan YouTube kegiatan. Video bisa langsung diputar di portal warga.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                3
              </div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-teal-600" />
                Kelompokkan Album
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pilih album yang ada atau buat album baru (misal: <em>Kerja Bakti Blok A</em>, <em>Senam Minggu Pagi</em>, <em>Posyandu</em>).
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                4
              </div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-amber-600" />
                Download & Share WA
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Klik gambar untuk melihat layar penuh, membaca keterangan lengkap, download resolusi asli, atau share ke grup WhatsApp warga.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        {/* Search & Type Segmented Control */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari foto, momen, album, atau pengunggah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="flex rounded-xl bg-slate-100 p-1 w-full sm:w-auto">
              <button
                onClick={() => setMediaTypeFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mediaTypeFilter === 'all'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({mediaList.length})
              </button>
              <button
                onClick={() => setMediaTypeFilter('photo')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  mediaTypeFilter === 'photo'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Foto ({photoCount})
              </button>
              <button
                onClick={() => setMediaTypeFilter('video')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  mediaTypeFilter === 'video'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                Video ({videoCount})
              </button>
            </div>
          </div>
        </div>

        {/* Album Pills */}
        {existingAlbums.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
              <Layers className="w-3.5 h-3.5" />
              Album:
            </span>
            <button
              onClick={() => setSelectedAlbum('Semua')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full shrink-0 transition-all ${
                selectedAlbum === 'Semua'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Album
            </button>
            {existingAlbums.map((alb) => (
              <button
                key={alb}
                onClick={() => setSelectedAlbum(alb)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full shrink-0 transition-all ${
                  selectedAlbum === alb
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {alb} ({mediaList.filter((m) => m.albumName === alb).length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Media Items */}
      {filteredMedia.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-800">
              {searchQuery ? 'Tidak Ada Hasil Dokumentasi' : 'Galeri Warga Masih Bersih & Kosong'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery
                ? 'Tidak ditemukan dokumentasi yang cocok dengan kata kunci pencarian Anda.'
                : 'Galeri siap diisi foto dan video asli oleh warga Komplek Green Bussan Village.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Unggah Foto / Video Sekarang
            </button>

            {onResetDemoMedia && (
              <button
                onClick={onResetDemoMedia}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-3 rounded-2xl transition-all flex items-center gap-1.5"
                title="Muat contoh foto dokumentasi demo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Muat Contoh Foto
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedia.map((item) => {
            const actualIndex = mediaList.findIndex((m) => m.id === item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Media Thumbnail / Viewer Header */}
                <div
                  className="relative aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer"
                  onClick={() => setLightboxIndex(actualIndex)}
                >
                  {item.type === 'photo' ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full relative group/video">
                      <img
                        src={
                          item.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={item.title}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover/video:scale-110 group-hover/video:bg-rose-600 transition-all">
                          <Play className="w-7 h-7 fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Album Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                      {item.albumName}
                    </span>
                    {item.type === 'video' && (
                      <span className="bg-rose-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <Film className="w-3 h-3" />
                        Video
                      </span>
                    )}
                  </div>

                  {/* Expand Fullscreen Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(actualIndex);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/70 hover:bg-emerald-600 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow"
                    title="Buka Layar Penuh"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3
                      onClick={() => setLightboxIndex(actualIndex)}
                      className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
                    >
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[130px]">
                        <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{item.uploadedBy}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Tags */}
                      <div className="flex items-center gap-1 overflow-x-auto max-w-[170px]">
                        {item.tags?.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium truncate"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Like & Delete Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onLikeMedia(item.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                          title="Sukai foto ini"
                        >
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          <span>{item.likes || 0}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus dokumentasi "${item.title}"?`)) {
                              onDeleteMedia(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Foto / Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <MediaUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSave={onSaveMedia}
        existingAlbums={existingAlbums}
      />

      {lightboxIndex !== null && (
        <MediaLightboxModal
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          mediaList={mediaList}
          currentIndex={lightboxIndex}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
          onLike={onLikeMedia}
          onDelete={(id) => {
            onDeleteMedia(id);
            setLightboxIndex(null);
          }}
        />
      )}
    </div>
  );
};
