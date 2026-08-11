import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Expense, ExpenseCategory } from '../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  expenseToEdit?: Expense | null;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Hadiah & Tropi',
  'Konsumsi',
  'Panggung & Sound',
  'Peralatan Lomba',
  'Spanduk & Dekorasi',
  'Kebersihan & Keamanan',
  'Lain-lain',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  expenseToEdit,
}) => {
  const [formData, setFormData] = useState<Partial<Expense>>({
    title: '',
    category: 'Hadiah & Tropi',
    amount: 50000,
    date: new Date().toISOString().slice(0, 10),
    pic: '',
    receiptNote: '',
  });

  useEffect(() => {
    if (expenseToEdit) {
      setFormData(expenseToEdit);
    } else {
      setFormData({
        title: '',
        category: 'Hadiah & Tropi',
        amount: 50000,
        date: new Date().toISOString().slice(0, 10),
        pic: '',
        receiptNote: '',
      });
    }
  }, [expenseToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.amount) return;

    const exp: Expense = {
      id: expenseToEdit?.id || `exp-${Date.now()}`,
      title: formData.title.trim(),
      category: (formData.category as ExpenseCategory) || 'Hadiah & Tropi',
      amount: Number(formData.amount) || 0,
      date: formData.date || new Date().toISOString().slice(0, 10),
      pic: formData.pic || 'Panitia 17an',
      receiptNote: formData.receiptNote || '',
    };

    onSave(exp);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? 'Edit Data Pengeluaran' : 'Pencatatan Pengeluaran / Kas Keluar'}
      subtitle="Catat pengeluaran belanja panitia secara transparan"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Keterangan Pengeluaran <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Beli Kerupuk & Tali Tambang / DP Sewa Panggung"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kategori Pengeluaran</label>
            <select
              value={formData.category || 'Hadiah & Tropi'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nominal Pengeluaran (Rp) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              required
              min={1000}
              step={1000}
              placeholder="50000"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-semibold text-rose-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tanggal Pengeluaran</label>
            <input
              type="date"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Penanggung Jawab / Pemohon</label>
            <input
              type="text"
              placeholder="Contoh: Pak Wawan (Perlengkapan)"
              value={formData.pic || ''}
              onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">No. Nota / Bukti Transaksi (Opsional)</label>
          <input
            type="text"
            placeholder="Contoh: Kwitansi Toko Merdeka No. 082 / Nota Pasar"
            value={formData.receiptNote || ''}
            onChange={(e) => setFormData({ ...formData, receiptNote: e.target.value })}
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
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            Simpan Pengeluaran
          </button>
        </div>
      </form>
    </Modal>
  );
};
