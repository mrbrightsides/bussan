import React, { useState, useEffect } from 'react';
import { X, Wallet, Save, TrendingUp, TrendingDown } from 'lucide-react';
import { RTCashItem } from '../types';

interface RTCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: RTCashItem) => void;
  itemToEdit?: RTCashItem | null;
}

export const RTCashModal: React.FC<RTCashModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
}) => {
  const [type, setType] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Iuran Bulanan Warga');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [recordedBy, setRecordedBy] = useState('Bendahara RT 01');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setType(itemToEdit.type || 'Pemasukan');
        setTitle(itemToEdit.title || '');
        setCategory(itemToEdit.category || 'Iuran Bulanan Warga');
        setAmount(itemToEdit.amount ? String(itemToEdit.amount) : '');
        setDate(itemToEdit.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
        setRecordedBy(itemToEdit.recordedBy || 'Bendahara RT 01');
        setNotes(itemToEdit.notes || '');
      } else {
        setType('Pemasukan');
        setTitle('');
        setCategory('Iuran Bulanan Warga');
        setAmount('');
        setDate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
        setRecordedBy('Bendahara RT 01');
        setNotes('');
      }
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(String(amount || '').replace(/\D/g, ''), 10);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('Mohon isi judul dan nominal kas yang valid.');
      return;
    }

    const newItem: RTCashItem = {
      id: itemToEdit?.id || `cash-${Date.now()}`,
      type,
      title: title.trim(),
      category: category.trim(),
      amount: numAmount,
      date: date.trim(),
      recordedBy: recordedBy.trim() || 'Bendahara RT',
      notes: notes.trim() || undefined,
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div
      id="rt-cash-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative my-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {itemToEdit ? 'Edit Catatan Kas Warga' : 'Catat Kas Masuk / Keluar Warga'}
              </h2>
              <p className="text-xs text-slate-500">
                Pencatatan buku kas operasional lingkungan warga Green Bussan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setType('Pemasukan');
                if (category === 'Listrik & Pompa Air') setCategory('Iuran Bulanan Warga');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'Pemasukan'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Kas Masuk (Pemasukan)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('Pengeluaran');
                if (category === 'Iuran Bulanan Warga') setCategory('Operasional & Pemeliharaan');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'Pengeluaran'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Kas Keluar (Pengeluaran)
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kategori Kas <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-semibold"
            >
              {type === 'Pemasukan' ? (
                <>
                  <option value="Iuran Bulanan Warga">Iuran Bulanan Warga (Kebersihan & Keamanan)</option>
                  <option value="Kas Sampah & Kebersihan">Kas Sampah & Kebersihan</option>
                  <option value="Sumbangan / Donasi Warga">Sumbangan / Donasi Warga</option>
                  <option value="Dana Sosial">Dana Kas Sosial</option>
                  <option value="Lain-lain">Pemasukan Lain-lain</option>
                </>
              ) : (
                <>
                  <option value="Operasional Pos Security & Fasilitas Umum">Operasional Pos Security & Fasilitas Umum</option>
                  <option value="Gaji Petugas (Security)">Gaji Petugas (Security)</option>
                  <option value="Perawatan & Perbaikan Taman">Perawatan & Perbaikan Taman</option>
                  <option value="Operasional & Pemeliharaan">Operasional & Pemeliharaan Lingkungan</option>
                  <option value="Honor Satpam & Petugas Kebersihan">Honor Satpam & Petugas Kebersihan</option>
                  <option value="Listrik Lampu Jalan & Pompa Air">Listrik Lampu Jalan & Fasilitas</option>
                  <option value="Sosial & Santunan">Sosial & Santunan Warga</option>
                  <option value="Perbaikan Sarana & Prasarana">Perbaikan Sarana & Prasarana</option>
                  <option value="Lain-lain">Pengeluaran Lain-lain</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan Transaksi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pembayaran Iuran Warga Blok A & B / Penggantian Lampu Jalan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nominal (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 1500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Transaksi
              </label>
              <input
                type="text"
                placeholder="Contoh: 20 Agustus 2026"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pencatat / Penanggung Jawab Kas
            </label>
            <input
              type="text"
              placeholder="Contoh: Bendahara RT 01"
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              placeholder="Nomor kuitansi, bukti transfer, atau catatan pelengkap..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 ${
                type === 'Pemasukan'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Save className="w-4 h-4" />
              Simpan ke Buku Kas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
