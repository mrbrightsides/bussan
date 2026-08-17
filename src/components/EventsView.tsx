import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Search,
  Share2,
  CheckCircle2,
  Sparkles,
  CalendarCheck,
  BellRing,
  Trash2,
  HelpCircle,
  RotateCcw,
  Users,
} from 'lucide-react';
import { CommunityEvent, EventCategory } from '../types';
import { EventModal } from './EventModal';

interface EventsViewProps {
  events: CommunityEvent[];
  onSaveEvent: (event: CommunityEvent) => void;
  onDeleteEvent: (id: string) => void;
  onClearAllEvents?: () => void;
  onResetDemoEvents?: () => void;
}

const CATEGORIES: (EventCategory | 'Semua')[] = [
  'Semua',
  'Gotong Royong',
  'Olahraga & Senam',
  'Pengajian & Keagamaan',
  'Posyandu & Balita',
  'Rapat Warga',
  'Peringatan Nasional',
];

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onSaveEvent,
  onDeleteEvent,
  onClearAllEvents,
  onResetDemoEvents,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'Semua'>('Semua');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CommunityEvent | null>(null);

  const filteredEvents = events.filter((evt) => {
    const matchCat = selectedCategory === 'Semua' || evt.category === selectedCategory;
    const matchStatus = statusFilter === 'all' || evt.status === statusFilter;
    const matchSearch =
      !searchQuery.trim() ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.organizer && evt.organizer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.pic && evt.pic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const handleClearAll = () => {
    if (
      window.confirm(
        'Kosongkan semua jadwal agenda kegiatan agar pengurus RT dan warga bisa mulai mengisi jadwal agenda asli komplek Green Bussan?'
      )
    ) {
      if (onClearAllEvents) {
        onClearAllEvents();
      } else {
        events.forEach((evt) => onDeleteEvent(evt.id));
      }
    }
  };

  const handleShareWhatsApp = (evt: CommunityEvent) => {
    const picName = evt.organizer || evt.pic || 'Pengurus RT';
    const text = `*AGENDA KEGIATAN WARGA GREEN BUSSAN*\n\n📌 *${evt.title}*\n📂 Kategori: ${evt.category}\n🗓️ Hari/Tgl: ${evt.date}\n⏰ Waktu: ${evt.time}\n📍 Lokasi: ${evt.location}\n👤 PIC / Kontak: ${picName}\n\n📝 Keterangan:\n${evt.description}\n\n_Mari bersama-sama hadir dan berpartisipasi memajukan lingkungan kita!_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getStatusBadge = (status: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai') => {
    switch (status) {
      case 'Sedang Berlangsung':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Sedang Berlangsung
          </span>
        );
      case 'Akan Datang':
        return (
          <span className="bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
            Akan Datang
          </span>
        );
      case 'Selesai':
        return (
          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
            Selesai
          </span>
        );
    }
  };

  const upcomingCount = events.filter((e) => e.status === 'Akan Datang').length;
  const ongoingCount = events.filter((e) => e.status === 'Sedang Berlangsung').length;
  const completedCount = events.filter((e) => e.status === 'Selesai').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-teal-700/80 border border-teal-500/30 text-teal-200 text-xs font-semibold px-3 py-1 rounded-full">
              <CalendarCheck className="w-3.5 h-3.5" />
              Kalender & Agenda Lingkungan RT 22
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Agenda Kegiatan Warga
            </h1>
            <p className="text-teal-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
              Jadwal lengkap kerja bakti massal, rapat bulanan RT, senam sehat bersama, pengajian rutin, dan posyandu balita & lansia di Green Bussan Village.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setEventToEdit(null);
                setIsModalOpen(true);
              }}
              className="bg-teal-300 hover:bg-teal-200 text-teal-950 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-teal-900" />
              Tambah Agenda Baru
            </button>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
              title="Petunjuk cara pengurus & warga membuat agenda kegiatan"
            >
              <HelpCircle className="w-4 h-4 text-teal-300" />
              {showGuide ? 'Tutup Panduan' : 'Cara Buat Agenda'}
            </button>

            {events.length > 0 && (
              <button
                onClick={handleClearAll}
                className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white font-semibold text-xs px-3.5 py-3 rounded-2xl border border-rose-800/60 transition-all flex items-center gap-1.5"
                title="Kosongkan semua jadwal agenda untuk diisi kegiatan asli warga"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Kosongkan Agenda</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Counter */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t border-white/10 max-w-lg">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-teal-200 font-semibold uppercase">Total Agenda</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{events.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-teal-200 font-semibold uppercase">Akan Datang</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{upcomingCount + ongoingCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-teal-200 font-semibold uppercase">Selesai</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Panduan & Tutorial Banner (Expandable / Visible when empty) */}
      {(showGuide || events.length === 0) && (
        <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100/50 border border-teal-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Panduan Pengurus & Warga: Cara Membuat Agenda Kegiatan
                </h2>
                <p className="text-xs text-slate-600">
                  Semua kegiatan gotong royong, posyandu, pengajian, senam, dan rapat warga dapat dijadwalkan dan disebar langsung ke grup WhatsApp komplek.
                </p>
              </div>
            </div>

            {events.length > 0 && (
              <button
                onClick={() => setShowGuide(false)}
                className="text-xs font-semibold text-teal-800 hover:text-teal-950 bg-teal-200/60 hover:bg-teal-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                Sembunyikan
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            {/* Step 1 */}
            <div className="bg-white p-4 rounded-2xl border border-teal-200/80 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span className="font-bold text-xs text-slate-800">Kategori & Nama Acara</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih kategori yang sesuai (Gotong Royong, Posyandu & Balita, Senam Pagi, Pengajian, Rapat Warga, dll) serta tulis judul acara yang jelas.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-4 rounded-2xl border border-teal-200/80 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span className="font-bold text-xs text-slate-800">Hari, Tanggal & Jam</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tentukan hari pelaksanaan dan estimasi jam mulai sampai selesai (contoh: <em>Minggu, 24 Agustus 2026 pukul 07.30 - 10.30 WIB</em>).
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-4 rounded-2xl border border-teal-200/80 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span className="font-bold text-xs text-slate-800">Lokasi & PIC Kontak</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cantumkan titik kumpul di komplek (Lapangan Utama, Balai Warga, Gazebo Blok B) dan nama penanggung jawab / koordinator kegiatan.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-4 rounded-2xl border border-teal-200/80 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <span className="font-bold text-xs text-slate-800">Sebar ke WhatsApp</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tekan tombol <strong>"Sebar ke Grup WA"</strong> pada kartu kegiatan. Sistem otomatis menyusun format undangan rapi untuk disebar ke grup chat warga.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 border-t border-teal-200/80">
            <div className="flex items-center gap-2 text-teal-950 font-medium">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Dengan kalender bersama, seluruh warga tidak ketinggalan jadwal kerja bakti, posyandu, dan rapat komplek.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEventToEdit(null);
                  setIsModalOpen(true);
                }}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Mulai Buat Jadwal Sekarang
              </button>

              {onResetDemoEvents && events.length === 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Muat contoh jadwal agenda kegiatan warga untuk demo tampilan?')) {
                      onResetDemoEvents();
                    }
                  }}
                  className="bg-teal-100 hover:bg-teal-200 text-teal-900 font-semibold text-xs px-3 py-2 rounded-xl transition-all border border-teal-300 inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-teal-700" />
                  Muat Contoh Agenda
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kegiatan, lokasi, atau PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({events.length})
            </button>
            <button
              onClick={() => setStatusFilter('Akan Datang')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all ${
                statusFilter === 'Akan Datang'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Akan Datang ({upcomingCount})
            </button>
            {ongoingCount > 0 && (
              <button
                onClick={() => setStatusFilter('Sedang Berlangsung')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all ${
                  statusFilter === 'Sedang Berlangsung'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Berlangsung ({ongoingCount})
              </button>
            )}
            <button
              onClick={() => setStatusFilter('Selesai')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all ${
                statusFilter === 'Selesai'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selesai ({completedCount})
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid / Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-inner">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-800">
              {searchQuery ? 'Tidak Ditemukan Jadwal Kegiatan' : 'Agenda Kegiatan Masih Bersih & Kosong'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? 'Coba ubah kata kunci pencarian atau pilih filter status "Semua".'
                : 'Belum ada agenda kegiatan yang dijadwalkan. Pengurus RT dan warga dapat menambahkan jadwal kegiatan baru kapan saja.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => {
                setEventToEdit(null);
                setIsModalOpen(true);
              }}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Jadwalkan Agenda Pertama
            </button>

            {onResetDemoEvents && (
              <button
                onClick={() => {
                  if (window.confirm('Muat contoh agenda kegiatan warga untuk referensi?')) {
                    onResetDemoEvents();
                  }
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-3 rounded-2xl transition-all border border-slate-200 inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                Muat Contoh Agenda
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((evt) => {
            const picName = evt.organizer || evt.pic || 'Pengurus RT';

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200">
                      {evt.category}
                    </span>
                    {getStatusBadge(evt.status)}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">{evt.title}</h3>
                    {evt.description && (
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  {/* Event Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate font-semibold text-slate-700">{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{evt.time || 'Waktu Menyesuaikan'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                      <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">PIC: {picName}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleShareWhatsApp(evt)}
                    className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:shadow"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Sebar ke Grup WA
                  </button>

                  <div className="flex items-center space-x-1 text-xs">
                    <button
                      onClick={() => {
                        setEventToEdit(evt);
                        setIsModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus jadwal kegiatan "${evt.title}"?`)) {
                          onDeleteEvent(evt.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEventToEdit(null);
        }}
        onSave={onSaveEvent}
        eventToEdit={eventToEdit}
      />
    </div>
  );
};
