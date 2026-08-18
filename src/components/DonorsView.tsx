import React, { useState } from 'react';
import {
  HeartHandshake,
  Plus,
  Search,
  Wallet,
  Building2,
  Calendar,
  CreditCard,
  Edit2,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Donor } from '../types';
import { formatRupiah } from '../utils/formatters';
import { AdminConfirmationModal } from './AdminConfirmationModal';

interface DonorsViewProps {
  donors: Donor[];
  onAddDonor: () => void;
  onEditDonor: (donor: Donor) => void;
  onDeleteDonor: (id: string) => void;
}

export const DonorsView: React.FC<DonorsViewProps> = ({
  donors,
  onAddDonor,
  onEditDonor,
  onDeleteDonor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [donorToDelete, setDonorToDelete] = useState<Donor | null>(null);

  const totalIncome = donors.reduce((sum, d) => sum + d.amount, 0);

  const filtered = donors.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.houseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'All' || d.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Hero Financial Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-800 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider block">
            Pemasukan & Kas Donasi Warga
          </span>
          <div className="text-2xl sm:text-3xl font-black mt-0.5">{formatRupiah(totalIncome)}</div>
          <p className="text-xs text-emerald-100 mt-1">
            Terakumulasi dari {donors.length} donatur & iuran kolektif warga Green Bussan Village.
          </p>
        </div>

        <button
          onClick={onAddDonor}
          className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0 focus:outline-none"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Catat Donasi Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama donatur, blok rumah, atau catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Payment Method Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs">
          <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-slate-700"
          >
            <option value="All">Semua Metode Pembayaran</option>
            <option value="Transfer QRIS/Bank">Transfer QRIS / Rekening Bank</option>
            <option value="Tunai">Tunai / Cash</option>
          </select>
        </div>
      </div>

      {/* Donors Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 text-sm">Tidak ada donatur ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau catat donasi pertama.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Donatur / Penyumbang</th>
                  <th className="py-3 px-4">Jumlah Donasi</th>
                  <th className="py-3 px-4">Rumah / Keterangan</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Tanggal & Pesan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-black text-[11px]">
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span>{d.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700 text-sm">
                      {formatRupiah(d.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{d.houseNo}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          d.paymentMethod === 'Tunai'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {d.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <div>{d.date}</div>
                      {d.notes && <div className="text-[10px] text-slate-400 italic">{d.notes}</div>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditDonor(d)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Donatur"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDonorToDelete(d)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Donatur"
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

      {/* Safe Confirmation Modal */}
      <AdminConfirmationModal
        isOpen={Boolean(donorToDelete)}
        onClose={() => setDonorToDelete(null)}
        onConfirm={() => {
          if (donorToDelete) {
            onDeleteDonor(donorToDelete.id);
            setDonorToDelete(null);
          }
        }}
        title="Hapus Catatan Donasi"
        message="Apakah Anda yakin ingin menghapus catatan donasi warga ini?"
        itemName={donorToDelete ? `${donorToDelete.name} (${formatRupiah(donorToDelete.amount)})` : undefined}
        confirmButtonText="Ya, Hapus Donasi"
        isBulkAction={false}
      />
    </div>
  );
};
