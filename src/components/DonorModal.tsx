import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Donor } from '../types';

interface DonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (donor: Donor) => void;
  donorToEdit?: Donor | null;
}

export const DonorModal: React.FC<DonorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  donorToEdit,
}) => {
  const [formData, setFormData] = useState<Partial<Donor>>({
    name: '',
    houseNo: '',
    amount: 100000,
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Transfer QRIS/Bank',
    notes: '',
  });

  useEffect(() => {
    if (donorToEdit) {
      setFormData(donorToEdit);
    } else {
      setFormData({
        name: '',
        houseNo: '',
        amount: 100000,
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: 'Transfer QRIS/Bank',
        notes: '',
      });
    }
  }, [donorToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.amount) return;

    const donor: Donor = {
      id: donorToEdit?.id || `don-${Date.now()}`,
      name: formData.name.trim(),
      houseNo: formData.houseNo || '-',
      amount: Number(formData.amount) || 0,
      date: formData.date || new Date().toISOString().slice(0, 10),
      paymentMethod: (formData.paymentMethod as 'Tunai' | 'Transfer QRIS/Bank') || 'Transfer QRIS/Bank',
      notes: formData.notes || '',
    };

    onSave(donor);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={donorToEdit ? 'Edit Data Donatur' : 'Pencatatan Donatur / Pemasukan'}
      subtitle="Catat nama donatur, nominal sumbangan, dan metode pembayaran"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Nama Donatur / Penyumbang <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Pak Heru / Toko Sembako Berkah / Warga RT 01"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nominal Donasi (Rp) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              required
              min={1000}
              step={1000}
              placeholder="100000"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-semibold text-emerald-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Blok / Rumah / Keterangan</label>
            <input
              type="text"
              placeholder="Contoh: Blok A3 No. 12"
              value={formData.houseNo || ''}
              onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tanggal Donasi</label>
            <input
              type="date"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
            <select
              value={formData.paymentMethod || 'Transfer QRIS/Bank'}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="Transfer QRIS/Bank">Transfer QRIS / Rekening Bank</option>
              <option value="Tunai">Tunai / Cash</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan / Pesan (Opsional)</label>
          <input
            type="text"
            placeholder="Contoh: Sponsorship spanduk & bantuan 3 dus air mineral"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            Simpan Donasi
          </button>
        </div>
      </form>
    </Modal>
  );
};
