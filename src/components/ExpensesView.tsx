import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  User,
  FileText,
  Edit2,
  Trash2,
  TrendingDown,
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../types';
import { formatRupiah } from '../utils/formatters';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filtered = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.pic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.receiptNote?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Hero Financial Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-800 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-rose-100 font-bold uppercase tracking-wider block">
            Pengeluaran & Belanja Panitia
          </span>
          <div className="text-2xl sm:text-3xl font-black mt-0.5">{formatRupiah(totalExpense)}</div>
          <p className="text-xs text-rose-100 mt-1">
            Terpakai untuk {expenses.length} item kebutuhan panggung, perlengkapan, hadiah, dan konsumsi.
          </p>
        </div>

        <button
          onClick={onAddExpense}
          className="px-4 py-2.5 bg-white text-rose-800 hover:bg-rose-50 text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0 focus:outline-none"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Catat Pengeluaran Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari keterangan pengeluaran, PIC, atau nota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-slate-700"
          >
            <option value="All">Semua Kategori Belanja</option>
            <option value="Hadiah & Tropi">Hadiah & Tropi</option>
            <option value="Konsumsi">Konsumsi</option>
            <option value="Panggung & Sound">Panggung & Sound</option>
            <option value="Peralatan Lomba">Peralatan Lomba</option>
            <option value="Spanduk & Dekorasi">Spanduk & Dekorasi</option>
            <option value="Kebersihan & Keamanan">Kebersihan & Keamanan</option>
            <option value="Lain-lain">Lain-lain</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 text-sm">Tidak ada pengeluaran ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau catat pengeluaran baru.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Keterangan Belanja</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Penanggung Jawab (PIC)</th>
                  <th className="py-3 px-4">Tanggal & Bukti / Nota</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{e.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-rose-700 text-sm">
                      {formatRupiah(e.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{e.pic}</td>
                    <td className="py-3 px-4 text-slate-500">
                      <div>{e.date}</div>
                      {e.receiptNote && (
                        <div className="text-[10px] text-slate-400 italic flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" /> {e.receiptNote}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditExpense(e)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Pengeluaran"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(e.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Pengeluaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
