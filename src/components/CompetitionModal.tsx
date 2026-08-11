import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Competition, AgeCategory, CompetitionStatus } from '../types';

interface CompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (competition: Competition) => void;
  competitionToEdit?: Competition | null;
}

const AGE_CATEGORIES: AgeCategory[] = ['Anak-anak', 'Remaja', 'Dewasa', 'Bapak-bapak', 'Ibu-ibu', 'Umum'];
const STATUSES: CompetitionStatus[] = ['Akan Datang', 'Berlangsung', 'Selesai'];

export const CompetitionModal: React.FC<CompetitionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  competitionToEdit,
}) => {
  const [formData, setFormData] = useState<Partial<Competition>>({
    name: '',
    category: 'Anak-anak',
    date: '17 Agustus 2026',
    time: '09:00 WIB',
    location: 'Lapangan Green Bussan',
    pic: '',
    maxParticipants: 20,
    description: '',
    status: 'Akan Datang',
    prizes: '',
  });

  useEffect(() => {
    if (competitionToEdit) {
      setFormData(competitionToEdit);
    } else {
      setFormData({
        name: '',
        category: 'Anak-anak',
        date: '17 Agustus 2026',
        time: '09:00 WIB',
        location: 'Lapangan Utama Green Bussan',
        pic: '',
        maxParticipants: 20,
        description: '',
        status: 'Akan Datang',
        prizes: '',
      });
    }
  }, [competitionToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const comp: Competition = {
      id: competitionToEdit?.id || `comp-${Date.now()}`,
      name: formData.name.trim(),
      category: (formData.category as AgeCategory) || 'Anak-anak',
      date: formData.date || '17 Agustus 2026',
      time: formData.time || '09:00 WIB',
      location: formData.location || 'Lapangan Green Bussan',
      pic: formData.pic || 'Panitia 17an',
      maxParticipants: formData.maxParticipants ? Number(formData.maxParticipants) : undefined,
      description: formData.description || '',
      status: (formData.status as CompetitionStatus) || 'Akan Datang',
      prizes: formData.prizes || '',
    };

    onSave(comp);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={competitionToEdit ? 'Edit Data Perlombaan' : 'Tambah Perlombaan Baru'}
      subtitle="Atur jadwal, kategori, dan penanggung jawab perlombaan"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Nama Perlombaan <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Balap Karung Helm, Tarik Tambang"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kategori Umur</label>
            <select
              value={formData.category || 'Anak-anak'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as AgeCategory })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            >
              {AGE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status Lomba</label>
            <select
              value={formData.status || 'Akan Datang'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CompetitionStatus })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tanggal Pelaksanaan</label>
            <input
              type="text"
              placeholder="17 Agustus 2026"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jam Pelaksanaan</label>
            <input
              type="text"
              placeholder="08:30 WIB"
              value={formData.time || ''}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lokasi Lomba</label>
            <input
              type="text"
              placeholder="Lapangan Utama / Jalan Blok B"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Penanggung Jawab (PIC)</label>
            <input
              type="text"
              placeholder="Contoh: Bu Rahma (A2/04)"
              value={formData.pic || ''}
              onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Hadiah & Apresiasi</label>
          <input
            type="text"
            placeholder="Contoh: Juara 1: Rp 300rb + Tropi, Juara 2: Rp 200rb"
            value={formData.prizes || ''}
            onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Keterangan / Aturan Lomba</label>
          <textarea
            rows={2}
            placeholder="Aturan singkat atau catat perlengkapan yang perlu dibawa..."
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
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
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            Simpan Lomba
          </button>
        </div>
      </form>
    </Modal>
  );
};
