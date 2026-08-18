import React, { useState } from 'react';
import {
  Megaphone,
  Pin,
  Calendar,
  User,
  Heart,
  Share2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  PhoneCall,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Tag,
  Trash2,
  HelpCircle,
  Newspaper,
  BookOpen,
  Camera,
  RotateCcw,
} from 'lucide-react';
import { CommunityPost, CommunityEvent, EmergencyContact, PostCategory, RTCashItem } from '../types';
import { PostModal } from './PostModal';
import { AdminConfirmationModal } from './AdminConfirmationModal';
import { createWhatsAppLink, formatRupiah } from '../utils/mediaUtils';
import { INITIAL_RT_CASH_BALANCE } from '../data/initialData';

interface CommunityFeedViewProps {
  posts: CommunityPost[];
  events: CommunityEvent[];
  emergencyContacts: EmergencyContact[];
  rtCash: RTCashItem[];
  onSavePost: (post: CommunityPost) => void;
  onDeletePost: (id: string) => void;
  onLikePost: (id: string) => void;
  onClearAllPosts?: () => void;
  onResetDemoPosts?: () => void;
  onNavigateTab: (tab: any) => void;
}

const CATEGORIES: { label: string; value: PostCategory | 'Semua' }[] = [
  { label: 'Semua Kabar & Berita', value: 'Semua' },
  { label: '📰 Berita Warga', value: 'Berita Warga' },
  { label: '🏆 Liputan 17an & Kegiatan', value: 'Liputan 17an & Kegiatan' },
  { label: '📢 Pengumuman RT', value: 'Pengumuman RT' },
  { label: '🌿 Kerja Bakti', value: 'Kerja Bakti' },
  { label: '💰 Iuran & Kas', value: 'Iuran & Kas' },
  { label: '🛡️ Keamanan & Ronda', value: 'Keamanan & Ronda' },
  { label: '👶 Kesehatan & Posyandu', value: 'Kesehatan & Posyandu' },
  { label: '🤝 Sosial & Warga', value: 'Sosial & Warga' },
];

export const CommunityFeedView: React.FC<CommunityFeedViewProps> = ({
  posts,
  events,
  emergencyContacts,
  rtCash,
  onSavePost,
  onDeletePost,
  onLikePost,
  onClearAllPosts,
  onResetDemoPosts,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<CommunityPost | null>(null);
  const [activeImageZoom, setActiveImageZoom] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(posts.length === 0);

  // Security confirmation state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    confirmButtonText?: string;
    isBulkAction?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Financial Kas RT calculation
  const totalIncome = rtCash.filter((c) => c.type === 'Pemasukan').reduce((s, c) => s + c.amount, 0);
  const totalExpense = rtCash.filter((c) => c.type === 'Pengeluaran').reduce((s, c) => s + c.amount, 0);
  const activeBalance = INITIAL_RT_CASH_BALANCE + totalIncome - totalExpense;

  // Filter posts
  const filteredPosts = posts
    .filter((post) => {
      const matchCat = selectedCategory === 'Semua' || post.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      // Pinned posts first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const handleShareToWhatsApp = (post: CommunityPost) => {
    const text = `📰 *${post.title}*\n✍️ _Penulis: ${post.authorName} (${post.authorRole})_\n📅 _Tanggal: ${post.date}_\n\n${post.content}\n\n📌 Sumber: Portal Warga Green Bussan Village`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Kosongkan Semua Kabar Warga',
      message:
        'Tindakan ini memerlukan persetujuan pengurus RT. Seluruh postingan, pengumuman, dan artikel kabar warga akan dihapus permanen dari server database.',
      confirmButtonText: 'Kosongkan Sekarang',
      isBulkAction: true,
      onConfirm: () => {
        onClearAllPosts?.();
      },
    });
  };

  const handleRequestDeletePost = (post: CommunityPost) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Kabar / Pengumuman',
      message: 'Apakah Anda yakin ingin menghapus postingan kabar warga ini?',
      itemName: post.title,
      confirmButtonText: 'Ya, Hapus',
      isBulkAction: false,
      onConfirm: () => {
        onDeletePost(post.id);
      },
    });
  };

  const getCategoryBadgeClass = (category: PostCategory) => {
    switch (category) {
      case 'Berita Warga':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Liputan 17an & Kegiatan':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pengumuman RT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Kerja Bakti':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Iuran & Kas':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Keamanan & Ronda':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Kesehatan & Posyandu':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-600/60 border border-emerald-400/30 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
              <Newspaper className="w-3.5 h-3.5 text-emerald-300" />
              Sesi Kabar, Berita & Liputan Warga
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Kabar & Pengumuman Warga
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl leading-relaxed">
              Ruang publikasi dan cerita warga Green Bussan Village. Tulis liputan keseruan acara (seperti hasil lomba 17an kemarin), kabar gembira warga, laporan lingkungan, atau pengumuman resmi RT secara mandiri.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setPostToEdit(null);
                setIsPostModalOpen(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Tulis Berita / Kabar Baru
            </button>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-emerald-300" />
              {showGuide ? 'Tutup Panduan' : 'Cara Tulis Berita'}
            </button>
            {posts.length > 0 && onClearAllPosts && (
              <button
                onClick={handleClearAll}
                className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 font-semibold text-xs sm:text-sm px-3.5 py-3 rounded-2xl border border-rose-400/30 backdrop-blur-sm transition-all flex items-center gap-1.5"
                title="Kosongkan Semua Berita"
              >
                <Trash2 className="w-4 h-4 text-rose-300" />
                Kosongkan
              </button>
            )}
          </div>
        </div>

        {/* Quick Top Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div
            onClick={() => onNavigateTab('events')}
            className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 cursor-pointer transition-all"
          >
            <p className="text-[11px] text-emerald-200 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" />
              Agenda Terdekat
            </p>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">
              {events.filter((e) => e.status === 'Akan Datang').length} Kegiatan Aktif
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('rtCash')}
            className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 cursor-pointer transition-all"
          >
            <p className="text-[11px] text-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Saldo Kas Warga
            </p>
            <p className="text-sm sm:text-base font-bold text-emerald-300 mt-0.5">
              {formatRupiah(activeBalance)}
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('gallery')}
            className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 cursor-pointer transition-all"
          >
            <p className="text-[11px] text-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Galeri Dokumentasi
            </p>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">Foto & Video Warga</p>
          </div>

          <div
            onClick={() => onNavigateTab('market')}
            className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 cursor-pointer transition-all"
          >
            <p className="text-[11px] text-emerald-200 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-emerald-400" />
              Lapak UMKM Warga
            </p>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">Kuliner & Jasa</p>
          </div>
        </div>
      </div>

      {/* Guide Banner for Citizen News / Liputan 17an */}
      {showGuide && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-3xl p-5 sm:p-6 border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Panduan Menulis Berita & Cerita Warga Green Bussan
                </h3>
                <p className="text-xs text-slate-600">
                  Sesi ini terpisah dari Agenda Kegiatan. Setiap warga bebas menuliskan artikel, liputan lomba, atau kabar gembira versi masing-masing.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg"
            >
              Sembunyikan
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs space-y-1">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">1</span>
              <h4 className="text-xs font-bold text-slate-800">Tentukan Judul & Kategori</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pilih kategori seperti <strong>Liputan 17an & Kegiatan</strong>, <strong>Berita Warga</strong>, atau <strong>Pengumuman RT</strong>.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs space-y-1">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">2</span>
              <h4 className="text-xs font-bold text-slate-800">Ceritakan Liputan Anda</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tuliskan kisah keseruan, pemenang lomba gaple/anak, hasil rapat warga, atau info penting lingkungan.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs space-y-1">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">3</span>
              <h4 className="text-xs font-bold text-slate-800">Lampirkan Foto Liputan</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Upload foto langsung dari galeri/kamera HP. Sistem otomatis mengompres foto agar hemat kuota warga.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs space-y-1">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">4</span>
              <h4 className="text-xs font-bold text-slate-800">Sebar ke WhatsApp</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Klik tombol "Bagikan WA" untuk langsung mengirim format berita rapi ke grup chat warga RT.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-100/80">
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Semua data berita tersinkronisasi real-time secara online untuk seluruh warga komplek.</span>
            </div>
            <div className="flex items-center gap-2">
              {onResetDemoPosts && posts.length === 0 && (
                <button
                  onClick={onResetDemoPosts}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  Muat Contoh Berita
                </button>
              )}
              <button
                onClick={() => {
                  setPostToEdit(null);
                  setIsPostModalOpen(true);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Mulai Tulis Berita Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Feed on Left + Widgets on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Feed & Posts (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari berita, liputan 17an, kerja bakti, atau pengumuman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <Newspaper className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  {searchQuery ? 'Tidak Ditemukan Berita Terkait' : 'Belum Ada Kabar & Berita Warga'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {searchQuery
                    ? 'Coba ganti kata kunci pencarian atau pilih kategori lain.'
                    : 'Tab ini telah dikosongkan agar warga dan panitia dapat menuliskan liputan kegiatan (seperti hasil 17an kemarin), kabar gembira, atau rilis pengumuman RT versi masing-masing.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setPostToEdit(null);
                    setIsPostModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow hover:shadow-md transition-all inline-flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Tulis Berita Pertama
                </button>
                {onResetDemoPosts && (
                  <button
                    onClick={onResetDemoPosts}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    Muat Contoh Berita
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
                    post.isPinned
                      ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-slate-200/90'
                  }`}
                >
                  {/* Pin Banner if Pinned */}
                  {post.isPinned && (
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-5 py-2 flex items-center gap-2">
                      <Pin className="w-3.5 h-3.5 fill-white" />
                      <span>Sematkan: Pengumuman / Berita Utama Warga Green Bussan</span>
                    </div>
                  )}

                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Header: Author & Category Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-200 shadow-xs">
                          {post.authorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-bold text-sm text-slate-900">{post.authorName}</h4>
                            <span className="text-[11px] text-slate-500">· {post.authorRole}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-emerald-600" />
                            {post.date}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 ${getCategoryBadgeClass(
                          post.category
                        )}`}
                      >
                        {post.category}
                      </span>
                    </div>

                    {/* Post Title & Content */}
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mb-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Image Attachment (if any) */}
                    {post.images && post.images.length > 0 && (
                      <div
                        onClick={() => setActiveImageZoom(post.images![0])}
                        className="rounded-2xl overflow-hidden border border-slate-200 cursor-pointer max-h-80 bg-slate-950 relative group shadow-xs"
                      >
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          className="w-full h-full object-cover max-h-80 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-xs">
                          <Camera className="w-4 h-4" />
                          Klik untuk memperbesar foto
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2.5 py-0.5 rounded-lg border border-slate-200/60"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Bar: Like, WhatsApp Share, Edit/Delete */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <button
                          onClick={() => onLikePost(post.id)}
                          className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition-colors font-semibold"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              (post.likes || 0) > 0 ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                          <span>{post.likes || 0} Suka</span>
                        </button>

                        <button
                          onClick={() => handleShareToWhatsApp(post)}
                          className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/60 transition-colors font-bold"
                          title="Bagikan ke WhatsApp Warga"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Bagikan WA</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => {
                            setPostToEdit(post);
                            setIsPostModalOpen(true);
                          }}
                          className="text-slate-500 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-[11px] font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRequestDeletePost(post)}
                          className="text-slate-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-[11px] font-semibold"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Widgets (Events, Emergency, Kas RT) */}
        <div className="space-y-5">
          {/* Widget 1: Upcoming Agenda */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Agenda Warga</h3>
                  <p className="text-[11px] text-slate-400">Jadwal kegiatan komplek terdekat</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('events')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Semua <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {events.filter((e) => e.status !== 'Selesai').length === 0 ? (
                <div
                  onClick={() => onNavigateTab('events')}
                  className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-200 transition-all"
                >
                  <p className="text-xs font-semibold text-slate-600">Belum ada agenda kegiatan</p>
                  <p className="text-[11px] text-emerald-600 font-bold mt-0.5">+ Buat Jadwal Baru</p>
                </div>
              ) : (
                events
                  .filter((e) => e.status !== 'Selesai')
                  .slice(0, 3)
                  .map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => onNavigateTab('events')}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all space-y-1"
                    >
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {evt.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{evt.title}</h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>{evt.date}</span>
                        <span className="text-emerald-700 font-semibold">{evt.time}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Widget 2: Emergency & Quick Contacts */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Kontak Cepat Siaga</h3>
                  <p className="text-[11px] text-slate-400">Hubungi langsung via telepon/WA</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('emergency')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Lihat <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {emergencyContacts.slice(0, 3).map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{contact.name}</h4>
                    <p className="text-[11px] text-slate-500">{contact.availableHours}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2 rounded-xl bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-700 transition-colors"
                      title="Panggil Telepon"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={createWhatsAppLink(
                        contact.whatsapp,
                        `Halo ${contact.name}, saya warga Green Bussan Village ingin berkonsultasi...`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      title="Chat WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Kas Warga & Transparansi Ringkas */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 border border-emerald-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider">
                  Transparansi Lingkungan
                </p>
                <h3 className="font-bold text-base text-white">Kas Keuangan Warga</h3>
              </div>
              <button
                onClick={() => onNavigateTab('rtCash')}
                className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-3 py-1 rounded-xl transition-colors"
              >
                Detail Kas & Iuran
              </button>
            </div>

            <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
              <span className="text-xs text-slate-300">Saldo Kas Aktif:</span>
              <p className="text-xl font-black text-emerald-300 tracking-tight mt-0.5">
                {formatRupiah(activeBalance)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400">Total Masuk</span>
                <p className="font-bold text-emerald-400 mt-0.5">{formatRupiah(totalIncome)}</p>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400">Pengeluaran</span>
                <p className="font-bold text-rose-300 mt-0.5">{formatRupiah(totalExpense)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setPostToEdit(null);
        }}
        onSave={onSavePost}
        postToEdit={postToEdit}
      />

      {/* Image Lightbox Preview for Feed */}
      {activeImageZoom && (
        <div
          onClick={() => setActiveImageZoom(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={activeImageZoom}
            alt="Enlarged"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Admin Security Confirmation Modal */}
      <AdminConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        itemName={confirmDialog.itemName}
        confirmButtonText={confirmDialog.confirmButtonText}
        isBulkAction={confirmDialog.isBulkAction}
      />
    </div>
  );
};
