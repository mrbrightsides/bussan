import React, { useState, useEffect } from 'react';
import { X, Calendar, Save, MapPin, User, Clock } from 'lucide-react';
import { CommunityEvent, EventCategory } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CommunityEvent) => void;
  eventToEdit?: CommunityEvent | null;
}

const CATEGORIES: EventCategory[] = [
  'Gotong Royong',
  'Pengajian & Keagamaan',
  'Olahraga & Senam',
  'Posyandu & Balita',
  'Rapat Warga',
  'Peringatan Nasional',
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  eventToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Gotong Royong');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('07:30 - Selesai');
  const [location, setLocation] = useState('Lapangan Utama Green Bussan');
  const [organizer, setOrganizer] = useState('Seksi Kegiatan Warga');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Akan Datang' | 'Sedang Berlangsung' | 'Selesai'>('Akan Datang');

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        setTitle(eventToEdit.title || '');
        setCategory(eventToEdit.category || 'Gotong Royong');
        setDate(eventToEdit.date || '');
        setTime(eventToEdit.time || '07:30 - Selesai');
        setLocation(eventToEdit.location || 'Lapangan Utama Green Bussan');
        setOrganizer(eventToEdit.organizer || 'Seksi Kegiatan Warga');
        setDescription(eventToEdit.description || '');
        setStatus(eventToEdit.status || 'Akan Datang');
      } else {
        setTitle('');
        setCategory('Gotong Royong');
        setDate('');
        setTime('07:30 - Selesai');
        setLocation('Lapangan Utama Green Bussan');
        setOrganizer('Seksi Kegiatan Warga');
        setDescription('');
        setStatus('Akan Datang');
      }
    }
  }, [isOpen, eventToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim() || !location.trim()) {
      alert('Mohon lengkapi judul, tanggal, dan lokasi kegiatan.');
      return;
    }

    const newEvent: CommunityEvent = {
      id: eventToEdit?.id || `event-${Date.now()}`,
      title: title.trim(),
      category,
      date: date.trim(),
      time: time.trim(),
      location: location.trim(),
      organizer: organizer.trim(),
      description: description.trim(),
      status,
    };

    onSave(newEvent);
    onClose();
  };

  return (
    <div
      id="event-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative my-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {eventToEdit ? 'Edit Agenda Warga' : 'Tambah Agenda Kegiatan Warga'}
              </h2>
              <p className="text-xs text-slate-500">
                Jadwal gotong royong, rapat, senam sehat, dan agenda komplek
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Kegiatan <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-semibold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Kegiatan</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai')
                }
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-semibold"
              >
                <option value="Akan Datang">Akan Datang</option>
                <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama / Judul Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kerja Bakti Massal & Pengecatan Gapura"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hari & Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Minggu, 23 Agustus 2026"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Waktu Pelaksanaan
              </label>
              <input
                type="text"
                placeholder="Contoh: 07:00 - 10:30 WIB"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lokasi di Komplek <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Lapangan Utama / Gazebo RT"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Penanggung Jawab (PIC)
              </label>
              <input
                type="text"
                placeholder="Contoh: Pak Agus / Sie Lingkungan"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detail Acara & Perlengkapan yang Perlu Dibawa
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan detail agenda, apa yang perlu dipersiapkan warga (misal: cangkul, sapu, pakaian olahraga)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Agenda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
