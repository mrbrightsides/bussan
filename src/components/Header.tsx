import React from 'react';
import { Flag, Plus, Download, RotateCcw, Building2, Cloud } from 'lucide-react';

interface HeaderProps {
  onOpenQuickAdd: () => void;
  onOpenReport: () => void;
  onResetData: () => void;
  totalIncome: number;
  totalExpense: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickAdd,
  onOpenReport,
  onResetData,
  totalIncome,
  totalExpense,
}) => {
  const balance = totalIncome - totalExpense;

  return (
    <header className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white shadow-md sticky top-0 z-30 border-b-2 border-red-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand & Complex Name */}
          <div className="flex items-center gap-3">
            {/* Merah Putih Flag Badge */}
            <div className="w-11 h-11 rounded-xl bg-white p-0.5 shadow-md flex flex-col overflow-hidden shrink-0 transform -rotate-2">
              <div className="h-1/2 bg-red-600 w-full" />
              <div className="h-1/2 bg-white w-full border-t border-slate-100" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] tracking-wider uppercase border border-white/30 flex items-center gap-1">
                  <Flag className="w-3 h-3 fill-white" /> HUT RI KE-81
                </span>
                <span className="text-xs text-red-100 font-medium hidden sm:inline-flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Green Bussan Village
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 font-semibold text-[10px] border border-emerald-400/40 flex items-center gap-1" title="Tersimpan otomatis & real-time di Cloud Firestore">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <Cloud className="w-3 h-3" /> Firestore Active
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight">
                Panitia Kemerdekaan 17 Agustus
              </h1>
            </div>
          </div>

          {/* Quick Financial Bar & Action Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Mini Cash Balance Pill */}
            <div className="hidden lg:flex items-center gap-3 bg-red-900/40 backdrop-blur-xs border border-white/20 px-3.5 py-1.5 rounded-xl text-xs">
              <div>
                <span className="text-red-200 block text-[10px]">Saldo Kas Panitia</span>
                <span className={`font-extrabold ${balance >= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                  Rp {balance.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onOpenReport}
                className="px-3 py-2 bg-white text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 focus:outline-none"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Laporan</span>
              </button>

              <button
                onClick={onOpenQuickAdd}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-red-950 rounded-xl text-xs font-extrabold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 border border-yellow-200 focus:outline-none"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Cepat</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
