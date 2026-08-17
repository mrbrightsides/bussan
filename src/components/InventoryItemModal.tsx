import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  MapPin,
  User,
  Phone,
  Camera,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { RTInventoryItem, InventoryCategory } from '../types';
import { compressImage } from '../utils/mediaUtils';

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: RTInventoryItem) => void;
  itemToEdit?: RTInventoryItem | null;
}

const CATEGORIES: InventoryCategory[] = [
  'Tenda & Terpal',
  'Kursi & Meja',
  'Sound System & Pengeras Suara',
  'Alat Kebersihan & Mesin Rumput',
  'Peralatan Masak & Dapur Warga',
  'Perkakas & Pertukangan',
  'Lainnya',
];

export const InventoryItemModal: React.FC<InventoryItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('Tenda & Terpal');
  const [totalQuantity, setTotalQuantity] = useState(1);
  const [availableQuantity, setAvailableQuantity] = useState(1);
  const [unit, setUnit] = useState('Unit');
  const [condition, setCondition] = useState<'Sangat Baik' | 'Baik' | 'Perlu Perbaikan'>('Baik');
  const [storageLocation, setStorageLocation] = useState('');
  const [picName, setPicName] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || '');
      setCategory(itemToEdit.category || 'Tenda & Terpal');
      setTotalQuantity(itemToEdit.totalQuantity || 1);
      setAvailableQuantity(itemToEdit.availableQuantity ?? itemToEdit.totalQuantity ?? 1);
      setUnit(itemToEdit.unit || 'Unit');
      setCondition(itemToEdit.condition || 'Baik');
      setStorageLocation(itemToEdit.storageLocation || '');
      setPicName(itemToEdit.picName || '');
      setPicPhone(itemToEdit.picPhone || '');
      setImageUrl(itemToEdit.imageUrl || '');
      setDescription(itemToEdit.description || '');
      setTerms(itemToEdit.terms || '');
    } else {
      setName('');
      setCategory('Tenda & Terpal');
      setTotalQuantity(1);
      setAvailableQuantity(1);
      setUnit('Unit');
      setCondition('Baik');
      setStorageLocation('Gudang Balai Warga RT 01');
      setPicName('Pak Sulaiman (Ketua RT)');
      setPicPhone('6281367613695');
      setImageUrl('');
      setDescription('');
      setTerms('Wajib dikembalikan dalam keadaan bersih & rapi.');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, 800, 0.8);
      setImageUrl(compressed);
    } catch (err) {
      console.error('Failed to compress image:', err);
      alert('Gagal memproses gambar. Pastikan format gambar valid.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !storageLocation.trim() || !picName.trim()) {
      alert('Mohon lengkapi nama barang, lokasi simpan, dan nama penanggung jawab.');
      return;
    }

    const item: RTInventoryItem = {
      id: itemToEdit?.id || `inv-${Date.now()}`,
      name: name.trim(),
      category,
      totalQuantity: Number(totalQuantity) || 1,
      availableQuantity: Math.min(Number(availableQuantity), Number(totalQuantity)),
      unit: unit.trim() || 'Unit',
      condition,
      storageLocation: storageLocation.trim(),
      picName: picName.trim(),
      picPhone: picPhone.trim() || undefined,
      imageUrl: imageUrl || undefined,
      description: description.trim() || undefined,
      terms: terms.trim() || undefined,
      borrowHistory: itemToEdit?.borrowHistory || [],
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="inventory-item-modal"
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Package className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {itemToEdit ? 'Edit Barang Inventaris' : 'Tambah Barang Inventaris RT'}
              </h3>
              <p className="text-emerald-100 text-xs">
                Katalog sarana prasarana milik bersama RT 01
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Barang / Sarana <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Tenda Terpal Acara (4x6 Meter)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kondisi Barang
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              >
                <option value="Sangat Baik">Sangat Baik</option>
                <option value="Baik">Baik</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Stok
              </label>
              <input
                type="number"
                min={1}
                value={totalQuantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setTotalQuantity(val);
                  if (availableQuantity > val) setAvailableQuantity(val);
                }}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Stok Tersedia
              </label>
              <input
                type="number"
                min={0}
                max={totalQuantity}
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(parseInt(e.target.value) || 0)}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Satuan
              </label>
              <input
                type="text"
                placeholder="Unit/Set/Pcs"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Lokasi Penyimpanan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Gudang Balai Warga RT 01 / Pos Satpam"
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Penanggung Jawab (PIC) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pak Sulaiman (Ketua RT)"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                No. WhatsApp PIC
              </label>
              <input
                type="text"
                placeholder="Contoh: 6281367613695"
                value={picPhone}
                onChange={(e) => setPicPhone(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Deskripsi & Spesifikasi Singkat
            </label>
            <textarea
              rows={2}
              placeholder="Deskripsikan barang, kelengkapan aksesoris, atau fungsinya..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Ketentuan / Syarat Peminjaman Warga
            </label>
            <input
              type="text"
              placeholder="Contoh: Wajib konfirmasi H-2 ke Pak RT, dikembalikan bersih & utuh"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Foto Barang */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              Foto Barang (Opsional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/40 rounded-xl p-3 text-center cursor-pointer transition-colors flex items-center justify-center gap-2">
                <Camera className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">
                  {isCompressing
                    ? 'Mengompres foto...'
                    : imageUrl
                    ? 'Ganti Foto'
                    : 'Pilih Foto Barang'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isCompressing}
                />
              </label>

              {imageUrl && (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isCompressing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {itemToEdit ? 'Simpan Perubahan' : 'Simpan Barang Inventaris'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
