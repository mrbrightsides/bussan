import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Home,
  Phone,
  MessageCircle,
  Edit2,
  Trash2,
  Sparkles,
  ChevronDown,
  Camera,
  X,
  Send,
  RotateCcw,
  Check,
  Building2,
} from 'lucide-react';
import { FacilityReport, ReportCategory, ReportStatus } from '../types';
import { FacilityReportModal } from './FacilityReportModal';
import { sampleDemoFacilityReports } from '../data/initialData';
import { createWhatsAppLink } from '../utils/mediaUtils';

interface FacilityReportsSectionProps {
  reports: FacilityReport[];
  onSaveReport: (report: FacilityReport) => void;
  onDeleteReport: (id: string) => void;
  onClearAllReports?: () => void;
  onResetDemoReports?: () => void;
}

const CATEGORIES: (ReportCategory | 'Semua')[] = [
  'Semua',
  'Lampu Jalan & Penerangan',
  'Saluran Air & Drainase',
  'Jalan & Paving Block',
  'Kebersihan & Sampah',
  'Keamanan & Portal',
  'Taman & Balai Warga',
  'Saran & Aspirasi',
  'Lainnya',
];

const STATUSES: (ReportStatus | 'Semua')[] = [
  'Semua',
  'Menunggu Tindakan',
  'Sedang Dikerjakan',
  'Selesai',
];

export const FacilityReportsSection: React.FC<FacilityReportsSectionProps> = ({
  reports,
  onSaveReport,
  onDeleteReport,
  onClearAllReports,
  onResetDemoReports,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'Semua'>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState<FacilityReport | null>(null);
  const [reportToDelete, setReportToDelete] = useState<FacilityReport | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Quick inline status update modal/popover
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>('Sedang Dikerjakan');
  const [newResponse, setNewResponse] = useState('');

  const filteredReports = reports.filter((r) => {
    if (!r) return false;
    const matchCat = selectedCategory === 'Semua' || r.category === selectedCategory;
    const matchStat = selectedStatus === 'Semua' || r.status === selectedStatus;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchCat && matchStat;

    const matchSearch =
      (r.title || '').toLowerCase().includes(query) ||
      (r.description || '').toLowerCase().includes(query) ||
      (r.location || '').toLowerCase().includes(query) ||
      (r.reporterName || '').toLowerCase().includes(query) ||
      (r.reporterHouse || '').toLowerCase().includes(query) ||
      (r.adminResponse && r.adminResponse.toLowerCase().includes(query));

    return matchCat && matchStat && matchSearch;
  });

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Selesai':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Selesai',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'Sedang Dikerjakan':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500',
          label: 'Sedang Dikerjakan',
          icon: <Clock className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />,
        };
      case 'Ditolak':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
          label: 'Ditolak',
          icon: <X className="w-3.5 h-3.5 text-slate-500" />,
        };
      default:
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Menunggu Tindakan',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
        };
    }
  };

  const getUrgencyBadge = (urgency: 'Biasa' | 'Penting' | 'Darurat') => {
    switch (urgency) {
      case 'Darurat':
        return 'bg-red-100 text-red-700 border-red-200 animate-pulse';
      case 'Penting':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleOpenStatusUpdate = (report: FacilityReport) => {
    setStatusUpdatingId(report.id);
    setNewStatus(report.status);
    setNewResponse(report.adminResponse || '');
  };

  const handleSaveStatusUpdate = (report: FacilityReport) => {
    const now = new Date();
    const formattedDate = `${now.getDate()} ${
      [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ][now.getMonth()]
    } ${now.getFullYear()}`;

    const updated: FacilityReport = {
      ...report,
      status: newStatus,
      adminResponse: newResponse.trim() || undefined,
      resolvedAt: newStatus === 'Selesai' ? formattedDate : report.resolvedAt,
    };

    onSaveReport(updated);
    setStatusUpdatingId(null);
  };

  const handleShareToWhatsApp = (report: FacilityReport) => {
    const text =
      `*📢 LAPORAN FASILITAS WARGA GREEN BUSSAN VILLAGE*\n\n` +
      `📌 *Judul*: ${report.title}\n` +
      `🏷️ *Kategori*: ${report.category}\n` +
      `⚡ *Urgensi*: ${report.urgency}\n` +
      `📍 *Lokasi*: ${report.location}\n` +
      `👤 *Pelapor*: ${report.reporterName} (${report.reporterHouse})\n` +
      `🗓️ *Tanggal*: ${report.date}\n` +
      `🔄 *Status*: ${report.status}\n\n` +
      `📝 *Rincian Masalah*:\n${report.description}\n\n` +
      (report.adminResponse ? `💬 *Tanggapan Pengurus*:\n${report.adminResponse}\n\n` : '') +
      `_Tercatat di Portal Warga Green Bussan Village: https://bussan.elpeef.com/_`;

    const url = createWhatsAppLink('6281367613695', text);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Sub Header / Action Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-rose-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              Kotak Aspirasi & Layanan Terpadu Lingkungan
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Laporan Fasilitas Rusak & Aspirasi Warga
            </h2>
            <p className="text-amber-100/80 text-xs sm:text-sm max-w-xl leading-relaxed">
              Lapor lampu jalan mati, parit mampet, pohon tumbang, perbaikan jalan, atau sampaikan saran perbaikan fasilitas komplek secara transparan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setReportToEdit(null);
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Laporan Baru
            </button>
          </div>
        </div>

        {/* Quick Summary Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-slate-300 block text-[10px] uppercase font-bold">Total Laporan</span>
            <span className="text-lg font-black text-white">{reports.length}</span>
          </div>
          <div className="bg-amber-950/40 rounded-xl p-2.5 border border-amber-500/20">
            <span className="text-amber-300 block text-[10px] uppercase font-bold">Menunggu</span>
            <span className="text-lg font-black text-amber-200">
              {reports.filter((r) => r.status === 'Menunggu Tindakan').length}
            </span>
          </div>
          <div className="bg-indigo-950/40 rounded-xl p-2.5 border border-indigo-500/20">
            <span className="text-indigo-300 block text-[10px] uppercase font-bold">Dikerjakan</span>
            <span className="text-lg font-black text-indigo-200">
              {reports.filter((r) => r.status === 'Sedang Dikerjakan').length}
            </span>
          </div>
          <div className="bg-emerald-950/40 rounded-xl p-2.5 border border-emerald-500/20">
            <span className="text-emerald-300 block text-[10px] uppercase font-bold">Selesai</span>
            <span className="text-lg font-black text-emerald-200">
              {reports.filter((r) => r.status === 'Selesai').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari laporan, lokasi, pelapor, blok..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Status:
            </span>
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Kategori:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-black text-slate-800">
              {searchQuery || selectedCategory !== 'Semua' || selectedStatus !== 'Semua'
                ? 'Tidak ada laporan yang sesuai filter'
                : 'Belum ada laporan fasilitas warga'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Warga dan pengurus RT dapat menambahkan laporan kendala lingkungan, kerusakan lampu, atau aspirasi fasilitas umum di sini.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setReportToEdit(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
            >
              + Buat Laporan Warga
            </button>
            {onResetDemoReports && (
              <button
                onClick={onResetDemoReports}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Muat Contoh Laporan
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReports.map((report) => {
            const statBadge = getStatusBadge(report.status);
            const isEditingStatus = statusUpdatingId === report.id;

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {report.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getUrgencyBadge(
                            report.urgency
                          )}`}
                        >
                          Urgensi: {report.urgency}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-800 leading-snug">
                        {report.title}
                      </h3>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border shadow-sm ${statBadge.bg}`}
                      >
                        {statBadge.icon}
                        {statBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3.5">
                    {/* Location & Reporter */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-2 rounded-xl">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate font-medium">{report.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-2 rounded-xl">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate font-medium">
                          {report.reporterName}{' '}
                          <span className="text-slate-400 font-normal">
                            ({report.reporterHouse})
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      {report.description}
                    </p>

                    {/* Image Attachment */}
                    {report.imageUrl && (
                      <div className="relative">
                        <img
                          src={report.imageUrl}
                          alt={report.title}
                          onClick={() => setPreviewImage(report.imageUrl || null)}
                          className="w-full h-44 sm:h-52 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-95 transition-opacity"
                        />
                        <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          Klik untuk perbesar foto
                        </span>
                      </div>
                    )}

                    {/* Admin Response Box */}
                    {report.adminResponse && (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between text-emerald-800 font-bold text-[11px] uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Tanggapan / Solusi Pengurus RT
                          </span>
                          {report.resolvedAt && (
                            <span className="text-slate-400 font-normal capitalize">
                              {report.resolvedAt}
                            </span>
                          )}
                        </div>
                        <p className="text-emerald-950 font-medium leading-relaxed">
                          {report.adminResponse}
                        </p>
                      </div>
                    )}

                    {/* Inline Status Update Box */}
                    {isEditingStatus && (
                      <div className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 space-y-3 animate-in fade-in duration-100">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Update Status & Tindak Lanjut</span>
                          <button
                            onClick={() => setStatusUpdatingId(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          {(
                            ['Menunggu Tindakan', 'Sedang Dikerjakan', 'Selesai'] as ReportStatus[]
                          ).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setNewStatus(st)}
                              className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                                newStatus === st
                                  ? st === 'Selesai'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : st === 'Sedang Dikerjakan'
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-white text-slate-600 border-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Catatan / respon pengurus (cth: Sudah dibelikan bohlam baru / Akan dikeruk minggu pagi)"
                            value={newResponse}
                            onChange={(e) => setNewResponse(e.target.value)}
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setStatusUpdatingId(null)}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-lg font-semibold"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveStatusUpdate(report)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm"
                          >
                            Simpan Update
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3.5 sm:px-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Dilaporkan: {report.date}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Share to WhatsApp */}
                    <button
                      onClick={() => handleShareToWhatsApp(report)}
                      title="Teruskan ke WhatsApp Pengurus"
                      className="p-2 text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200 rounded-xl font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Teruskan WA</span>
                    </button>

                    {/* Quick Update Status Button */}
                    <button
                      onClick={() => handleOpenStatusUpdate(report)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-amber-600" />
                      <span className="text-[11px]">Respon RT</span>
                    </button>

                    {/* Edit Modal */}
                    <button
                      onClick={() => {
                        setReportToEdit(report);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-500 hover:bg-slate-200 rounded-xl cursor-pointer"
                      title="Edit Laporan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setReportToDelete(report)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                      title="Hapus Laporan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-800">Hapus Laporan Fasilitas?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Laporan &quot;{reportToDelete.title}&quot; akan dihapus secara permanen dari portal.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setReportToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteReport(reportToDelete.id);
                  setReportToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-md cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex items-center justify-center">
            <img
              src={previewImage}
              alt="Bukti Foto"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-900 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <FacilityReportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setReportToEdit(null);
        }}
        onSave={onSaveReport}
        reportToEdit={reportToEdit}
      />
    </div>
  );
};
