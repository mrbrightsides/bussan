import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Edit2,
  Trash2,
  Gift,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  Swords,
} from 'lucide-react';
import { Competition, Participant, AgeCategory, CompetitionStatus } from '../types';

interface CompetitionsViewProps {
  competitions: Competition[];
  participants: Participant[];
  onAddCompetition: () => void;
  onEditCompetition: (comp: Competition) => void;
  onDeleteCompetition: (id: string) => void;
  onUpdateStatus: (id: string, status: CompetitionStatus) => void;
  onViewParticipants: (comp: Competition) => void;
  onViewBracket?: (comp: Competition) => void;
}

export const CompetitionsView: React.FC<CompetitionsViewProps> = ({
  competitions,
  participants,
  onAddCompetition,
  onEditCompetition,
  onDeleteCompetition,
  onUpdateStatus,
  onViewParticipants,
  onViewBracket,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const filtered = competitions.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.pic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || comp.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || comp.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-red-600" /> Jadwal & Cabang Perlombaan
          </h2>
          <p className="text-xs text-slate-500">
            Kelola jadwal, lokasi, PIC, dan pendaftar lomba 17an
          </p>
        </div>

        <button
          onClick={onAddCompetition}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 focus:outline-none"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Lomba Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama lomba, lokasi, PIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-slate-700"
          >
            <option value="All">Semua Kategori Umur</option>
            <option value="Anak-anak">Anak-anak</option>
            <option value="Remaja">Remaja</option>
            <option value="Dewasa">Dewasa</option>
            <option value="Bapak-bapak">Bapak-bapak</option>
            <option value="Ibu-ibu">Ibu-ibu</option>
            <option value="Umum">Umum</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-slate-700"
          >
            <option value="All">Semua Status Pelaksanaan</option>
            <option value="Akan Datang">Akan Datang</option>
            <option value="Berlangsung">Berlangsung</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Competitions Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 text-sm">Tidak ada perlombaan ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Coba ganti kata kunci atau tambah lomba baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((comp) => {
            const registeredCount = participants.filter((p) => p.competitionId === comp.id).length;

            return (
              <div
                key={comp.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-800">
                      {comp.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <select
                        value={comp.status}
                        onChange={(e) => onUpdateStatus(comp.id, e.target.value as CompetitionStatus)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold outline-none cursor-pointer ${
                          comp.status === 'Berlangsung'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : comp.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}
                      >
                        <option value="Akan Datang">Akan Datang</option>
                        <option value="Berlangsung">Berlangsung</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">{comp.name}</h3>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                    {comp.description || 'Lomba Kemerdekaan Green Bussan Village.'}
                  </p>

                  {/* Prizes */}
                  {comp.prizes && (
                    <div className="p-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl text-xs text-amber-900 mb-3 flex items-start gap-2">
                      <Gift className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-[11px]">{comp.prizes}</span>
                    </div>
                  )}

                  {/* Info Metadata */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {comp.date} - {comp.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{comp.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>PIC: {comp.pic}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 flex-1">
                    <button
                      onClick={() => onViewParticipants(comp)}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{registeredCount} Peserta</span>
                    </button>

                    {onViewBracket && (
                      <button
                        onClick={() => onViewBracket(comp)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                          comp.name.toLowerCase().includes('gaple')
                            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-2xs font-extrabold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="Bagan & Pengacakan Turnamen"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Bagan</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditCompetition(comp)}
                      title="Edit Lomba"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCompetition(comp.id)}
                      title="Hapus Lomba"
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
