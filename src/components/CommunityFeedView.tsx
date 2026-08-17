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
} from 'lucide-react';
import { CommunityPost, CommunityEvent, EmergencyContact, PostCategory, RTCashItem } from '../types';
import { PostModal } from './PostModal';
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
  onNavigateTab: (tab: any) => void;
}

const CATEGORIES: { label: string; value: PostCategory | 'Semua' }[] = [
  { label: 'Semua Kabar', value: 'Semua' },
  { label: 'Pengumuman RT', value: 'Pengumuman RT' },
  { label: 'Kerja Bakti', value: 'Kerja Bakti' },
  { label: 'Iuran & Kas', value: 'Iuran & Kas' },
  { label: 'Keamanan & Ronda', value: 'Keamanan & Ronda' },
  { label: 'Kesehatan & Posyandu', value: 'Kesehatan & Posyandu' },
  { label: 'Sosial & Warga', value: 'Sosial & Warga' },
];

export const CommunityFeedView: React.FC<CommunityFeedViewProps> = ({
  posts,
  events,
  emergencyContacts,
  rtCash,
  onSavePost,
  onDeletePost,
  onLikePost,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<CommunityPost | null>(null);
  const [activeImageZoom, setActiveImageZoom] = useState<string | null>(null);

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
    const text = `*${post.title}*\n_${post.authorName} (${post.authorRole}) - ${post.date}_\n\n${post.content}\n\n📌 Sumber: Portal Warga Green Bussan Village`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getCategoryBadgeClass = (category: PostCategory) => {
    switch (category) {
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
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Selamat Datang di Portal Warga
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Komplek Green Bussan Village
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl leading-relaxed">
              Pusat informasi resmi lingkungan, transparansi kas iuran RT, agenda kegiatan bersama, galeri foto & video, serta bursa UMKM warga komplek.
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
              Buat Pengumuman Baru
            </button>
            <button
              onClick={() => onNavigateTab('emergency')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-300" />
              Kontak Penting
            </button>
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
                placeholder="Cari pengumuman, kerja bakti, atau informasi RT..."
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all ${
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
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
              <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Belum Ada Pengumuman</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'Tidak ada pengumuman yang sesuai dengan kata kunci pencarian.'
                  : 'Belum ada kabar di kategori ini. Buat pengumuman baru untuk mengabari warga!'}
              </p>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Buat Pengumuman Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
                    post.isPinned
                      ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-slate-200/90'
                  }`}
                >
                  {/* Pin Banner if Pinned */}
                  {post.isPinned && (
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-2">
                      <Pin className="w-3.5 h-3.5 fill-white" />
                      <span>Pengumuman Penting Pengurus RT 01 Green Bussan</span>
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    {/* Header: Author & Category Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-200">
                          {post.authorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
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
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getCategoryBadgeClass(
                          post.category
                        )}`}
                      >
                        {post.category}
                      </span>
                    </div>

                    {/* Post Title & Content */}
                    <div>
                      <h3 className="font-bold text-base text-slate-900 mb-2 leading-snug">
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
                        className="rounded-xl overflow-hidden border border-slate-200 cursor-pointer max-h-80 bg-slate-950 relative group"
                      >
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          className="w-full h-full object-cover max-h-80 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
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
                            className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md"
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
                          className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors font-semibold"
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
                          className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors font-semibold"
                          title="Bagikan ke WhatsApp Warga"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Bagikan WA</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setPostToEdit(post);
                            setIsPostModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-emerald-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors text-[11px] font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeletePost(post.id)}
                          className="text-slate-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors text-[11px] font-medium"
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
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
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
                  className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-200 transition-all"
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
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all space-y-1"
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
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
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
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{contact.name}</h4>
                    <p className="text-[11px] text-slate-500">{contact.availableHours}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2 rounded-lg bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-700 transition-colors"
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
                      className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
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
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-5 border border-emerald-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider">
                  Transparansi Lingkungan
                </p>
                <h3 className="font-bold text-base text-white">Kas Keuangan Warga</h3>
              </div>
              <button
                onClick={() => onNavigateTab('rtCash')}
                className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-2.5 py-1 rounded-lg transition-colors"
              >
                Detail Kas & Iuran
              </button>
            </div>

            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-xs text-slate-300">Saldo Kas Aktif:</span>
              <p className="text-xl font-black text-emerald-300 tracking-tight mt-0.5">
                {formatRupiah(activeBalance)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400">Total Masuk</span>
                <p className="font-bold text-emerald-400 mt-0.5">{formatRupiah(totalIncome)}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
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
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
