import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Home,
  Phone,
  Trophy,
  Tag,
  Edit2,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { Participant, Competition, AgeCategory } from '../types';
import { AdminConfirmationModal } from './AdminConfirmationModal';

interface ParticipantsViewProps {
  participants: Participant[];
  competitions: Competition[];
  onAddParticipant: () => void;
  onEditParticipant: (part: Participant) => void;
  onDeleteParticipant: (id: string) => void;
  selectedCompFilter?: string;
}

export const ParticipantsView: React.FC<ParticipantsViewProps> = ({
  participants,
  competitions,
  onAddParticipant,
  onEditParticipant,
  onDeleteParticipant,
  selectedCompFilter = 'All',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [compFilter, setCompFilter] = useState<string>(selectedCompFilter);
  const [rtFilter, setRtFilter] = useState<string>('All');
  const [ageFilter, setAgeFilter] = useState<string>('All');
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);

  const filtered = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.houseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesComp = compFilter === 'All' || p.competitionId === compFilter;
    const matchesRt = rtFilter === 'All' || p.rt === rtFilter;
    const matchesAge = ageFilter === 'All' || p.ageGroup === ageFilter;

    return matchesSearch && matchesComp && matchesRt && matchesAge;
  });

  const getCompName = (id: string) => {
    return competitions.find((c) => c.id === id)?.name || 'Lomba Tidak Ditemukan';
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" /> Pendaftaran Peserta Lomba
          </h2>
          <p className="text-xs text-slate-500">
            Total {participants.length} peserta terdaftar dari warga Green Bussan Village
          </p>
        </div>

        <button
          onClick={onAddParticipant}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 focus:outline-none"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Daftarkan Peserta Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama peserta / blok rumah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        {/* Competition Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs">
          <Trophy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={compFilter}
            onChange={(e) => setCompFilter(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-slate-700 truncate"
          >
            <option value="All">Semua Cabang Lomba</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* RT Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs">
          <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={rtFilter}
            onChange={(e) => setRtFilter(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-slate-700"
          >
            <option value="All">Semua RT</option>
            <option value="RT 01">RT 01</option>
            <option value="RT 02">RT 02</option>
            <option value="RT 03">RT 03</option>
            <option value="RT 04">RT 04</option>
          </select>
        </div>

        {/* Age Group Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-slate-700"
          >
            <option value="All">Semua Umur</option>
            <option value="Anak-anak">Anak-anak</option>
            <option value="Remaja">Remaja</option>
            <option value="Dewasa">Dewasa</option>
            <option value="Bapak-bapak">Bapak-bapak</option>
            <option value="Ibu-ibu">Ibu-ibu</option>
            <option value="Umum">Umum</option>
          </select>
        </div>
      </div>

      {/* Participant List / Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 text-sm">Tidak ada peserta sesuai filter</p>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau daftarkan peserta baru.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Peserta / Tim</th>
                  <th className="py-3 px-4">Cabang Lomba</th>
                  <th className="py-3 px-4">Rumah & RT</th>
                  <th className="py-3 px-4">Kategori Umur</th>
                  <th className="py-3 px-4">No. Kontak / Catatan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.name}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Terdaftar: {p.registeredAt}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg">
                        <Trophy className="w-3 h-3 text-red-600" />
                        {getCompName(p.competitionId)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      <div>{p.houseNo}</div>
                      <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                        {p.rt}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[11px]">
                        {p.ageGroup}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.phone && (
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" /> {p.phone}
                        </div>
                      )}
                      {p.notes && <div className="text-[10px] text-slate-400 italic">{p.notes}</div>}
                      {!p.phone && !p.notes && <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditParticipant(p)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Peserta"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setParticipantToDelete(p)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Peserta"
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
        isOpen={Boolean(participantToDelete)}
        onClose={() => setParticipantToDelete(null)}
        onConfirm={() => {
          if (participantToDelete) {
            onDeleteParticipant(participantToDelete.id);
            setParticipantToDelete(null);
          }
        }}
        title="Hapus Pendaftaran Peserta"
        message="Apakah Anda yakin ingin menghapus data pendaftaran peserta lomba ini?"
        itemName={participantToDelete ? `${participantToDelete.name} (${participantToDelete.houseNo})` : undefined}
        confirmButtonText="Ya, Hapus Peserta"
        isBulkAction={false}
      />
    </div>
  );
};
