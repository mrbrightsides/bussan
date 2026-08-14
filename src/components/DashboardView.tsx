import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Trophy,
  HeartHandshake,
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  UserPlus,
  PlusCircle,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  Swords,
  Shuffle,
} from 'lucide-react';
import { AppState, AgeCategory } from '../types';
import { formatRupiah } from '../utils/formatters';

interface DashboardViewProps {
  state: AppState;
  onNavigate: (tab: any) => void;
  onQuickAdd: (action: 'participant' | 'donor' | 'expense' | 'competition') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ state, onNavigate, onQuickAdd }) => {
  const totalIncome = state.donors.reduce((sum, d) => sum + d.amount, 0);
  const totalExpense = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;
  const spentPercent = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0;

  // Age breakdown
  const ageCategories: AgeCategory[] = ['Anak-anak', 'Remaja', 'Dewasa', 'Bapak-bapak', 'Ibu-ibu', 'Umum'];
  const ageCounts = ageCategories.map((cat) => {
    const count = state.participants.filter((p) => p.ageGroup === cat).length;
    return { category: cat, count };
  });

  // Most popular competition
  const competitionParticipantMap = state.competitions.map((comp) => {
    const count = state.participants.filter((p) => p.competitionId === comp.id).length;
    return { ...comp, participantCount: count };
  });
  const sortedComps = [...competitionParticipantMap].sort((a, b) => b.participantCount - a.participantCount);
  const topComp = sortedComps[0];

  // Expenses breakdown by category
  const expenseCategoryMap: { [cat: string]: number } = {};
  state.expenses.forEach((e) => {
    expenseCategoryMap[e.category] = (expenseCategoryMap[e.category] || 0) + e.amount;
  });
  const expenseCategories = Object.keys(expenseCategoryMap).map((cat) => ({
    category: cat,
    amount: expenseCategoryMap[cat],
    percent: totalExpense > 0 ? Math.round((expenseCategoryMap[cat] / totalExpense) * 100) : 0,
  }));

  const gapleComp = state.competitions.find((c) => c.name.toLowerCase().includes('gaple'));
  const gapleParticipantsCount = gapleComp
    ? state.participants.filter((p) => p.competitionId === gapleComp.id).length
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Welcome Green Bussan Village */}
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-rose-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white mb-2 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Pusat Kendali Panitia HUT RI 81
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Satu Aplikasi Monitor Lomba & Arus Kas Transparan
            </h2>
            <p className="text-red-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Selamat datang Panitia Komplek Green Bussan Village! Pantau statistik peserta, pendaftaran lomba, donatur warga, dan sisa kas secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <button
              onClick={() => onQuickAdd('participant')}
              className="px-3.5 py-2 bg-white text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all focus:outline-none"
            >
              <UserPlus className="w-4 h-4 text-red-600" />
              <span>Daftar Peserta</span>
            </button>
            <button
              onClick={() => onQuickAdd('donor')}
              className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-red-950 rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all focus:outline-none"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Donasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Card: Turnamen Bagan Gaple & Sistem Gugur */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
            <Swords className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-yellow-200 text-[10px] font-black uppercase">
                Fitur Baru
              </span>
              <span className="text-xs font-bold text-amber-100">
                Lomba Gaple ({gapleParticipantsCount} Peserta Siap)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black mt-0.5 text-white">
              Bagan Turnamen & Pengocokan Pasangan 2 vs 2
            </h3>
            <p className="text-xs text-amber-100">
              Acak pasangan ganda domino/gaple, buat bagan sistem gugur otomatis, dan catat skor live pertandingan.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('brackets')}
          className="px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 rounded-xl text-xs font-black shadow-sm flex items-center gap-2 transition-all shrink-0 active:scale-95"
        >
          <Shuffle className="w-4 h-4 text-amber-600" />
          <span>Buka Bagan Turnamen</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Donasi & Kas</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900">
            {formatRupiah(totalIncome)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <HeartHandshake className="w-3 h-3" /> {state.donors.length} Donatur terdaftar
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Pengeluaran</span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900">
            {formatRupiah(totalExpense)}
          </div>
          <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
            <Receipt className="w-3 h-3" /> {state.expenses.length} Transaksi belanja
          </p>
        </div>

        {/* Saldo Kas */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Saldo Sisa Kas</span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-lg sm:text-2xl font-black ${balance >= 0 ? 'text-blue-700' : 'text-amber-600'}`}>
            {formatRupiah(balance)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Sisa anggaran aktif panitia
          </p>
        </div>

        {/* Total Participants */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Peserta Lomba</span>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900">
            {state.participants.length} <span className="text-xs font-medium text-slate-500">Pendaftar</span>
          </div>
          <p className="text-[11px] text-purple-700 font-semibold mt-1 flex items-center gap-1">
            <Trophy className="w-3 h-3" /> {state.competitions.length} Cabang perlombaan
          </p>
        </div>
      </div>

      {/* Cash Flow Progress Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <Wallet className="w-4 h-4 text-red-600" /> Transparansi Penggunaan Anggaran Kas
            </h3>
            <p className="text-xs text-slate-500">
              Rasio total belanja terhadap pemasukan donasi warga
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-700">
              {spentPercent}% Terpakai ({formatRupiah(totalExpense)} / {formatRupiah(totalIncome)})
            </span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spentPercent > 90
                ? 'bg-amber-500'
                : spentPercent > 70
                ? 'bg-red-600'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${spentPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
          <span>0% (Belum Belanja)</span>
          <span className="font-semibold text-slate-700">Sisa Kas: {formatRupiah(balance)}</span>
          <span>100% (Batas Maksimal Pemasukan)</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Age Category Distribution Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" /> Partisipasi Peserta per Kategori Umur
                </h3>
                <p className="text-xs text-slate-500">Jumlah pendaftar dari Anak-anak hingga Bapak/Ibu</p>
              </div>
              <button
                onClick={() => onNavigate('participants')}
                className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
              >
                Lihat Detail <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {ageCounts.map((item) => {
                const maxCount = Math.max(...ageCounts.map((a) => a.count), 1);
                const percent = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.category}</span>
                      <span className="text-slate-900 font-bold">{item.count} orang</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-rose-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {topComp && (
            <div className="mt-5 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-red-600 text-white rounded-lg shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-red-900 block">Lomba Terfavorit Paling Ramai:</span>
                <span className="font-semibold text-slate-800">
                  {topComp.name} ({topComp.participantCount} pendaftar)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-rose-600" /> Alokasi Pengeluaran per Kategori
                </h3>
                <p className="text-xs text-slate-500">Rincian penggunaan dana belanja panitia</p>
              </div>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
              >
                Lihat Detail <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {expenseCategories.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada pengeluaran dicatat.
              </div>
            ) : (
              <div className="space-y-3">
                {expenseCategories.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.category}</span>
                      <span className="text-slate-900 font-bold">
                        {formatRupiah(item.amount)} ({item.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-slate-700 to-slate-900 h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Total belanja saat ini:</span>
            <span className="font-extrabold text-slate-900">{formatRupiah(totalExpense)}</span>
          </div>
        </div>
      </div>

      {/* Upcoming / Active Competitions Card List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-600" /> Agenda Lomba Kemerdekaan Green Bussan
            </h3>
            <p className="text-xs text-slate-500">Daftar cabang lomba dan jadwal pelaksanaan</p>
          </div>
          <button
            onClick={() => onNavigate('competitions')}
            className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
          >
            Kelola Lomba <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {state.competitions.map((comp) => {
            const count = state.participants.filter((p) => p.competitionId === comp.id).length;
            return (
              <div
                key={comp.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-red-300 bg-slate-50/50 hover:bg-white transition-all shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                      {comp.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        comp.status === 'Berlangsung'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : comp.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{comp.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{comp.description}</p>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-200/60 pt-2.5 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {comp.date} - {comp.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{comp.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1 text-slate-500">
                      <User className="w-3 h-3" /> PIC: {comp.pic}
                    </span>
                    <span className="font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                      {count} Peserta
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
