import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Calendar,
  User,
  Home,
  Phone,
  MessageCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { RTInventoryItem, InventoryBorrowRecord } from '../types';
import { createWhatsAppLink } from '../utils/mediaUtils';
import { SecurityCaptcha } from './SecurityCaptcha';

interface BorrowItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RTInventoryItem | null;
  onConfirmBorrow: (itemId: string, record: InventoryBorrowRecord) => void;
}

export const BorrowItemModal: React.FC<BorrowItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirmBorrow,
}) => {
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerHouse, setBorrowerHouse] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [borrowDate, setBorrowDate] = useState('');
  const [returnEstimate, setReturnEstimate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const todayStr = `${now.getDate()} ${
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

      // Default return date is 2 days later
      const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const returnStr = `${twoDaysLater.getDate()} ${
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
        ][twoDaysLater.getMonth()]
      } ${twoDaysLater.getFullYear()}`;

      setBorrowerName('');
      setBorrowerHouse('');
      setBorrowerPhone('');
      setQuantity(1);
      setBorrowDate(todayStr);
      setReturnEstimate(returnStr);
      setPurpose('');
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const maxAvailable = item.availableQuantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim() || !borrowerHouse.trim() || !purpose.trim()) {
      alert('Mohon lengkapi nama peminjam, blok rumah, dan keperluan peminjaman.');
      return;
    }

    if (!isCaptchaVerified) {
      alert('Mohon selesaikan verifikasi anti-spam / hitungan captcha terlebih dahulu.');
      return;
    }

    if (quantity <= 0 || quantity > maxAvailable) {
      alert(`Jumlah pinjam tidak valid (maksimal ${maxAvailable} ${item.unit}).`);
      return;
    }

    const record: InventoryBorrowRecord = {
      id: `borrow-${Date.now()}`,
      borrowerName: borrowerName.trim(),
      borrowerHouse: borrowerHouse.trim(),
      borrowerPhone: borrowerPhone.trim() || '08xxxxxxxx',
      quantity,
      borrowDate,
      returnEstimate,
      purpose: purpose.trim(),
      status: 'Aktif Dipinjam',
    };

    onConfirmBorrow(item.id, record);

    // Optional WhatsApp confirmation trigger to PIC
    if (item.picPhone) {
      const waMsg = `*PENGAJUAN PINJAM INVENTARIS GREEN BUSSAN*\n\n` +
        `📦 *Barang*: ${item.name}\n` +
        `🔢 *Jumlah*: ${quantity} ${item.unit}\n` +
        `👤 *Peminjam*: ${borrowerName} (${borrowerHouse})\n` +
        `📞 *No HP/WA*: ${borrowerPhone}\n` +
        `🗓️ *Tgl Pinjam*: ${borrowDate}\n` +
        `⏳ *Est. Kembali*: ${returnEstimate}\n` +
        `🎯 *Keperluan*: ${purpose}\n\n` +
        `Mohon konfirmasi kesiapan barang ya Pak/Bu Penanggung Jawab. Terima kasih! 🙏`;

      const waLink = createWhatsAppLink(item.picPhone, waMsg);
      const openWA = window.confirm(
        'Pengajuan peminjaman berhasil disimpan! Apakah Anda ingin langsung mengirimkan konfirmasi via WhatsApp ke Penanggung Jawab barang?'
      );
      if (openWA) {
        window.open(waLink, '_blank');
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="borrow-item-modal"
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Package className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Form Peminjaman Inventaris</h3>
              <p className="text-emerald-100 text-xs">
                Barang milik bersama Green Bussan Village
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

        {/* Item Overview Card */}
        <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              {item.category}
            </span>
            <h4 className="text-sm font-black text-slate-800">{item.name}</h4>
            <p className="text-xs text-slate-600">
              Lokasi: <span className="font-semibold text-slate-700">{item.storageLocation}</span>
            </p>
          </div>
          <div className="text-right shrink-0 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-medium block">Tersedia</span>
            <span className="text-sm font-black text-emerald-700">
              {maxAvailable} {item.unit}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Identitas Peminjam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Nama Peminjam <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pak Wahyu"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-slate-400" />
                Blok / No. Rumah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Blok B1 No. 04"
                value={borrowerHouse}
                onChange={(e) => setBorrowerHouse(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                No. WhatsApp
              </label>
              <input
                type="text"
                placeholder="Contoh: 081399887766"
                value={borrowerPhone}
                onChange={(e) => setBorrowerPhone(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Jumlah Pinjam (Max: {maxAvailable} {item.unit}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={maxAvailable}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(maxAvailable, parseInt(e.target.value) || 1)))}
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Tanggal Pinjam & Estimasi Kembali */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Pinjam
              </label>
              <input
                type="text"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Estimasi Pengembalian
              </label>
              <input
                type="text"
                value={returnEstimate}
                onChange={(e) => setReturnEstimate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Keperluan Acara */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Keperluan / Acara <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Syukuran aqiqah / Arisan warga / Pemasangan kanopi"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Ketentuan Pemakaian */}
          {item.terms && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Ketentuan Pemakaian:</span>
                <p className="text-amber-800">{item.terms}</p>
              </div>
            </div>
          )}

          {/* Info PIC */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Penanggung Jawab (PIC)
              </span>
              <span className="font-bold text-slate-800">{item.picName}</span>
            </div>
            {item.picPhone && (
              <span className="font-mono text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                +{item.picPhone}
              </span>
            )}
          </div>

          {/* Anti-Spam Security Layer */}
          <SecurityCaptcha
            colorScheme="teal"
            onVerify={setIsCaptchaVerified}
          />

          {/* Buttons */}
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
              disabled={!isCaptchaVerified}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Ajukan Peminjaman
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
