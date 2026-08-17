import React, { useState, useEffect } from 'react';
import { X, Save, ShieldAlert, Mail, Globe, Eraser } from 'lucide-react';
import { EmergencyContact, EmergencyCategory } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: EmergencyContact) => void;
  contactToEdit?: EmergencyContact | null;
}

const CATEGORIES: EmergencyCategory[] = [
  'Pengurus RT/RW',
  'Pemerintahan & Kelurahan',
  'Keamanan & Darurat',
  'Kesehatan & Medis',
  'Layanan Publik & PDAM',
  'Teknisi & Perbaikan',
  'Kebersihan & Lingkungan',
];

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contactToEdit,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<EmergencyCategory>('Pengurus RT/RW');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [availableHours, setAvailableHours] = useState('24 Jam');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  // Reset form whenever modal opens or contactToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (contactToEdit) {
        setName(contactToEdit.name || '');
        setRole(contactToEdit.role || '');
        setCategory(contactToEdit.category || 'Pengurus RT/RW');
        setPhone(contactToEdit.phone || '');
        setWhatsapp(contactToEdit.whatsapp || '');
        setEmail(contactToEdit.email || '');
        setWebsite(contactToEdit.website || '');
        setAvailableHours(contactToEdit.availableHours || '24 Jam');
        setAddress(contactToEdit.address || '');
        setDescription(contactToEdit.description || '');
      } else {
        // Mode Tambah Kontak Baru: Kosongkan seluruh input
        setName('');
        setRole('');
        setCategory('Pengurus RT/RW');
        setPhone('');
        setWhatsapp('');
        setEmail('');
        setWebsite('');
        setAvailableHours('24 Jam');
        setAddress('');
        setDescription('');
      }
    }
  }, [isOpen, contactToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Mohon isi nama kontak dan nomor telepon.');
      return;
    }

    const newContact: EmergencyContact = {
      id: contactToEdit?.id || `contact-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Layanan Lingkungan',
      category,
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      availableHours: availableHours.trim() || '24 Jam',
      address: address.trim() || undefined,
      description: description.trim(),
    };

    onSave(newContact);
    onClose();
  };

  return (
    <div
      id="contact-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative my-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {contactToEdit ? 'Edit Kontak Layanan' : 'Tambah Kontak / Layanan Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Direktori nomor telepon resmi kelurahan, instansi & pengurus warga
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kategori Layanan <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EmergencyCategory)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-semibold"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Kontak / Instansi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kantor Lurah Sako / Pak Sulaiman (Ketua RT)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Peran / Instansi Resmi
              </label>
              <input
                type="text"
                placeholder="Contoh: Pemerintah Kelurahan / Dinas Pemadam"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jam Siaga / Operasional
              </label>
              <input
                type="text"
                placeholder="Contoh: 24 Jam / 08:00 - 16:00 WIB"
                value={availableHours}
                onChange={(e) => setAvailableHours(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="0711-352271 / 110 / +62..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor WhatsApp (Opsional)
              </label>
              <input
                type="text"
                placeholder="081367613695"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                Email Resmi (Opsional)
              </label>
              <input
                type="email"
                placeholder="kel-sako@palembang.go.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400" />
                Website Resmi (Opsional)
              </label>
              <input
                type="text"
                placeholder="https://kec-sako.palembang.go.id"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat / Lokasi Kantor (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Jl. Musi Raya Barat, Kel. Sako"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Keterangan Layanan
              </label>
              {description && (
                <button
                  type="button"
                  onClick={() => setDescription('')}
                  className="text-[10px] text-slate-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Eraser className="w-3 h-3" />
                  Kosongkan Keterangan
                </button>
              )}
            </div>
            <textarea
              rows={2}
              placeholder="Jelaskan jenis bantuan, administrasi, atau layanan yang dilayani..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {contactToEdit ? 'Simpan Perubahan' : 'Simpan Kontak'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
