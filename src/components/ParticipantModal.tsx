import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Participant, Competition, AgeCategory } from '../types';

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (participant: Participant) => void;
  competitions: Competition[];
  participantToEdit?: Participant | null;
  defaultCompetitionId?: string;
}

const AGE_CATEGORIES: AgeCategory[] = ['Anak-anak', 'Remaja', 'Dewasa', 'Bapak-bapak', 'Ibu-ibu', 'Umum'];

export const ParticipantModal: React.FC<ParticipantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  competitions,
  participantToEdit,
  defaultCompetitionId,
}) => {
  const [formData, setFormData] = useState<Partial<Participant>>({
    name: '',
    houseNo: '',
    rt: 'RT 01',
    ageGroup: 'Anak-anak',
    competitionId: defaultCompetitionId || (competitions[0]?.id || ''),
    phone: '',
    notes: '',
  });

  useEffect(() => {
    if (participantToEdit) {
      setFormData(participantToEdit);
    } else {
      setFormData({
        name: '',
        houseNo: '',
        rt: 'RT 01',
        ageGroup: 'Anak-anak',
        competitionId: defaultCompetitionId || (competitions[0]?.id || ''),
        phone: '',
        notes: '',
      });
    }
  }, [participantToEdit, defaultCompetitionId, competitions, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const part: Participant = {
      id: participantToEdit?.id || `p-${Date.now()}`,
      name: formData.name.trim(),
      houseNo: formData.houseNo || '-',
      rt: formData.rt || 'RT 01',
      ageGroup: (formData.ageGroup as AgeCategory) || 'Anak-anak',
      competitionId: formData.competitionId || (competitions[0]?.id || ''),
      registeredAt: participantToEdit?.registeredAt || new Date().toISOString().slice(0, 10),
      phone: formData.phone || '',
      notes: formData.notes || '',
    };

    onSave(part);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={participantToEdit ? 'Edit Data Peserta' : 'Form Pendaftaran Peserta Lomba'}
      subtitle="Isi nama peserta, nomor rumah/RT, dan lomba yang diikuti"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Pilih Perlombaan <span className="text-red-600">*</span>
          </label>
          <select
            required
            value={formData.competitionId || ''}
            onChange={(e) => {
              const compId = e.target.value;
              const selectedComp = competitions.find((c) => c.id === compId);
              setFormData({
                ...formData,
                competitionId: compId,
                ageGroup: selectedComp?.category || formData.ageGroup,
              });
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-medium text-slate-800"
          >
            {competitions.length === 0 && <option value="">Belum ada lomba</option>}
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name} ({comp.category}) - {comp.date}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Nama Peserta / Nama Tim <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Ahmad Faiz / Tim Anggrek RT 02"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Blok & Nomor Rumah</label>
            <input
              type="text"
              placeholder="Contoh: Blok A2 No. 04"
              value={formData.houseNo || ''}
              onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Wilayah RT</label>
            <select
              value={formData.rt || 'RT 01'}
              onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="RT 01">RT 01</option>
              <option value="RT 02">RT 02</option>
              <option value="RT 03">RT 03</option>
              <option value="RT 04">RT 04</option>
              <option value="Luar Komplek">Luar Komplek / Tamu</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kategori Umur Peserta</label>
            <select
              value={formData.ageGroup || 'Anak-anak'}
              onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as AgeCategory })}
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
            <label className="block font-semibold text-slate-700 mb-1">No. HP / WhatsApp (Opsional)</label>
            <input
              type="text"
              placeholder="081234567890"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
          <input
            type="text"
            placeholder="Contoh: Anak dari Bu Rahma / Ukuran kaos M"
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
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            Simpan Peserta
          </button>
        </div>
      </form>
    </Modal>
  );
};
