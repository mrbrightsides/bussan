import React, { useState } from 'react';
import { Modal } from './Modal';
import { UserPlus, HeartHandshake, Receipt, Trophy } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'participant' | 'donor' | 'expense' | 'competition') => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Data Cepat"
      subtitle="Pilih jenis data yang ingin ditambahkan panitia"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
        <button
          onClick={() => {
            onSelectAction('participant');
            onClose();
          }}
          className="flex items-center gap-3 p-4 rounded-xl border-2 border-red-100 hover:border-red-500 bg-red-50/50 hover:bg-red-50 text-left transition-all group focus:outline-none"
        >
          <div className="p-3 bg-red-600 text-white rounded-lg shadow-sm group-hover:scale-105 transition-transform">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">Daftarkan Peserta</h4>
            <p className="text-xs text-slate-500 mt-0.5">Tambah peserta baru ke cabang lomba</p>
          </div>
        </button>

        <button
          onClick={() => {
            onSelectAction('donor');
            onClose();
          }}
          className="flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-100 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all group focus:outline-none"
        >
          <div className="p-3 bg-emerald-600 text-white rounded-lg shadow-sm group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">Catat Donatur / Kas</h4>
            <p className="text-xs text-slate-500 mt-0.5">Tambah donasi / iuran warga baru</p>
          </div>
        </button>

        <button
          onClick={() => {
            onSelectAction('expense');
            onClose();
          }}
          className="flex items-center gap-3 p-4 rounded-xl border-2 border-rose-100 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50 text-left transition-all group group focus:outline-none"
        >
          <div className="p-3 bg-rose-600 text-white rounded-lg shadow-sm group-hover:scale-105 transition-transform">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">Catat Pengeluaran</h4>
            <p className="text-xs text-slate-500 mt-0.5">Catat belanja perlengkapan & hadiah</p>
          </div>
        </button>

        <button
          onClick={() => {
            onSelectAction('competition');
            onClose();
          }}
          className="flex items-center gap-3 p-4 rounded-xl border-2 border-amber-100 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 text-left transition-all group focus:outline-none"
        >
          <div className="p-3 bg-amber-600 text-white rounded-lg shadow-sm group-hover:scale-105 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">Buat Cabang Lomba</h4>
            <p className="text-xs text-slate-500 mt-0.5">Tambah lomba baru & jadwal</p>
          </div>
        </button>
      </div>
    </Modal>
  );
};
