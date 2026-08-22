import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  MapPin,
  User,
  Home,
  Phone,
  Camera,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { FacilityReport, ReportCategory, ReportStatus } from '../types';
import { compressImage } from '../utils/mediaUtils';
import { SecurityCaptcha } from './SecurityCaptcha';

interface FacilityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: FacilityReport) => void;
  reportToEdit?: FacilityReport | null;
}

const CATEGORIES: ReportCategory[] = [
  'Lampu Jalan & Penerangan',
  'Saluran Air & Drainase',
  'Jalan & Paving Block',
  'Kebersihan & Sampah',
  'Keamanan & Portal',
  'Taman & Balai Warga',
  'Saran & Aspirasi',
  'Lainnya',
];

export const FacilityReportModal: React.FC<FacilityReportModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reportToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Lampu Jalan & Penerangan');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterHouse, setReporterHouse] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [urgency, setUrgency] = useState<'Biasa' | 'Penting' | 'Darurat'>('Biasa');
  const [status, setStatus] = useState<ReportStatus>('Menunggu Tindakan');
  const [adminResponse, setAdminResponse] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  useEffect(() => {
    if (reportToEdit) {
      setTitle(reportToEdit.title || '');
      setCategory(reportToEdit.category || 'Lampu Jalan & Penerangan');
      setDescription(reportToEdit.description || '');
      setLocation(reportToEdit.location || '');
      setReporterName(reportToEdit.reporterName || '');
      setReporterHouse(reportToEdit.reporterHouse || '');
      setReporterPhone(reportToEdit.reporterPhone || '');
      setUrgency(reportToEdit.urgency || 'Biasa');
      setStatus(reportToEdit.status || 'Menunggu Tindakan');
      setAdminResponse(reportToEdit.adminResponse || '');
      setImageUrl(reportToEdit.imageUrl || '');
    } else {
      setTitle('');
      setCategory('Lampu Jalan & Penerangan');
      setDescription('');
      setLocation('');
      setReporterName('');
      setReporterHouse('');
      setReporterPhone('');
      setUrgency('Biasa');
      setStatus('Menunggu Tindakan');
      setAdminResponse('');
      setImageUrl('');
    }
  }, [reportToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressedBase64 = await compressImage(file, 1000, 0.8);
      setImageUrl(compressedBase64);
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('Gagal memproses gambar. Pastikan format gambar valid.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !reporterName.trim()) {
      alert('Mohon lengkapi judul laporan, rincian masalah, dan nama pelapor.');
      return;
    }

    if (!isCaptchaVerified && !reportToEdit) {
      alert('Mohon selesaikan verifikasi anti-spam / hitungan captcha terlebih dahulu.');
      return;
    }

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

    const report: FacilityReport = {
      id: reportToEdit?.id || `rep-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim() || 'Lingkungan Komplek Green Bussan',
      reporterName: reporterName.trim(),
      reporterHouse: reporterHouse.trim() || 'Warga Green Bussan',
      reporterPhone: reporterPhone.trim(),
      urgency,
      status,
      adminResponse: adminResponse.trim() || undefined,
      imageUrl: imageUrl || undefined,
      createdAt: reportToEdit?.createdAt || now.toISOString(),
      date: reportToEdit?.date || formattedDate,
      resolvedAt:
        status === 'Selesai'
          ? reportToEdit?.resolvedAt || formattedDate
          : undefined,
    };

    onSave(report);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="facility-report-modal"
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-2xl backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {reportToEdit ? 'Edit Laporan Fasilitas' : 'Lapor Fasilitas / Aspirasi Warga'}
              </h3>
              <p className="text-rose-100 text-xs">
                Sampaikan kendala lingkungan agar cepat ditindaklanjuti pengurus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Judul Laporan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Masalah / Fasilitas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Lampu jalan tiang No. 4 depan Blok B3 padam"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Kategori & Tingkat Urgensi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kategori Masalah <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tingkat Urgensi <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Biasa', 'Penting', 'Darurat'] as const).map((urg) => (
                  <button
                    key={urg}
                    type="button"
                    onClick={() => setUrgency(urg)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      urgency === urg
                        ? urg === 'Darurat'
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : urg === 'Penting'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {urg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lokasi Tepat di Komplek */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Lokasi Spesifik Kejadian / Fasilitas
            </label>
            <input
              type="text"
              placeholder="Contoh: Depan rumah Blok B3 No. 5 / Taman samping pos satpam"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Identitas Pelapor */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Informasi Pelapor (Warga)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Warga <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pak Hendra"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Home className="w-3 h-3 text-slate-400" />
                  Blok & No Rumah
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Blok B3"
                  value={reporterHouse}
                  onChange={(e) => setReporterHouse(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  No. WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 081234567890"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Rincian Deskripsi Masalah */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Deskripsi Masalah / Solusi yang Diharapkan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ceritakan kronologi atau detail kerusakan fasilitas secara jelas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Lampiran Foto */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              Foto Bukti Kerusakan / Lokasi (Opsional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/40 rounded-xl p-3 text-center cursor-pointer transition-colors flex items-center justify-center gap-2">
                <Camera className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">
                  {isCompressing
                    ? 'Mengompres foto...'
                    : imageUrl
                    ? 'Ganti Foto'
                    : 'Ambil / Pilih Foto dari Galeri'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isCompressing}
                />
              </label>

              {imageUrl && (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status & Respon Pengurus (Saat Edit atau Pengurus Update) */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Status Penanganan Laporan
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  'Menunggu Tindakan',
                  'Sedang Dikerjakan',
                  'Selesai',
                  'Ditolak',
                ] as ReportStatus[]
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    status === st
                      ? st === 'Selesai'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : st === 'Sedang Dikerjakan'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : st === 'Ditolak'
                        ? 'bg-slate-600 text-white border-slate-600'
                        : 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Catatan / Respon Tindak Lanjut Pengurus
              </label>
              <input
                type="text"
                placeholder="Contoh: Sudah dijadwalkan teknisi hari ini pukul 16:00 / Masuk agenda gotong royong"
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Anti-Spam Security Layer */}
          {!reportToEdit && (
            <SecurityCaptcha
              colorScheme="rose"
              onVerify={setIsCaptchaVerified}
            />
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isCompressing || (!isCaptchaVerified && !reportToEdit)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {reportToEdit ? 'Simpan Perubahan' : 'Kirim Laporan Warga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
