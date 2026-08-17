import React, { useState, useRef, useEffect } from 'react';
import { X, ShoppingBag, Save, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { MarketplaceItem, MarketplaceCategory } from '../types';
import { compressImageFile } from '../utils/mediaUtils';

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MarketplaceItem) => void;
  itemToEdit?: MarketplaceItem | null;
}

const CATEGORIES: MarketplaceCategory[] = [
  'Kuliner & Makanan',
  'Kebutuhan Harian & Gas/Galon',
  'Jasa & Laundry',
  'Fashion & Kerajinan',
  'Lainnya',
];

export const MarketplaceModal: React.FC<MarketplaceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory>('Kuliner & Makanan');
  const [sellerName, setSellerName] = useState('');
  const [sellerHouse, setSellerHouse] = useState('');
  const [price, setPrice] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setTitle(itemToEdit.title || '');
        setCategory(itemToEdit.category || 'Kuliner & Makanan');
        setSellerName(itemToEdit.sellerName || '');
        setSellerHouse(itemToEdit.sellerHouse || '');
        setPrice(itemToEdit.price || '');
        setWhatsapp(itemToEdit.whatsapp || '');
        setDescription(itemToEdit.description || '');
        setIsAvailable(itemToEdit.isAvailable ?? true);
        setImagePreview(itemToEdit.imageUrl || null);
      } else {
        setTitle('');
        setCategory('Kuliner & Makanan');
        setSellerName('');
        setSellerHouse('');
        setPrice('');
        setWhatsapp('');
        setDescription('');
        setIsAvailable(true);
        setImagePreview(null);
      }
      setCompressionInfo(null);
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setCompressionInfo(null);
    const originalKb = Math.round(file.size / 1024);

    try {
      const compressedDataUrl = await compressImageFile(file, 800, 800, 0.82);
      setImagePreview(compressedDataUrl);
      const compressedKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
      setCompressionInfo(`Foto dioptimalkan: ${originalKb} KB ➔ ${compressedKb} KB`);
    } catch (err) {
      console.error(err);
      alert('Gagal mengompres gambar produk.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sellerName.trim() || !whatsapp.trim()) {
      alert('Mohon lengkapi nama produk, nama penjual, dan nomor WhatsApp.');
      return;
    }

    const newItem: MarketplaceItem = {
      id: itemToEdit?.id || `market-${Date.now()}`,
      title: title.trim(),
      category,
      sellerName: sellerName.trim(),
      sellerHouse: sellerHouse.trim() || 'Green Bussan Village',
      price: price.trim() || 'Hubungi Penjual',
      whatsapp: whatsapp.trim(),
      imageUrl: imagePreview || undefined,
      description: description.trim(),
      isAvailable,
      rating: itemToEdit?.rating || 5,
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div
      id="marketplace-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 relative my-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {itemToEdit ? 'Edit Lapak Jualan Warga' : 'Buka Lapak / Pasang Jualan Warga'}
              </h2>
              <p className="text-xs text-slate-500">
                Promosikan usaha rumahan, makanan, atau jasa warga Green Bussan
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
                Kategori Usaha <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MarketplaceCategory)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-semibold"
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
                Kisaran Harga / Tarif
              </label>
              <input
                type="text"
                placeholder="Contoh: Rp 15.000 / porsi / Rp 6.000 / galon"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Produk / Usaha Jasa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pempek Palembang Mama Salsa / Depot Galon Sehat"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Photo upload with auto compression */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Foto Produk / Usaha (Auto-Compress)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 rounded-xl p-3.5 text-center cursor-pointer transition-all flex items-center justify-between"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800">
                    {imagePreview ? 'Foto terpilih (Klik untuk ganti)' : 'Pilih Foto dari Galeri / Kamera'}
                  </p>
                  <p className="text-[11px] text-slate-500">Foto akan otomatis dioptimalkan</p>
                </div>
              </div>

              {imagePreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                  }}
                  className="text-xs text-red-500 hover:underline px-2"
                >
                  Hapus
                </button>
              )}
            </div>

            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-32 rounded-lg object-contain border border-amber-200"
                />
              </div>
            )}

            {compressionInfo && (
              <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {compressionInfo}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Penjual / Pemilik Usaha <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bu Rini / Mas Joko"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Blok Rumah di Green Bussan
              </label>
              <input
                type="text"
                placeholder="Contoh: Blok B2 No. 08"
                value={sellerHouse}
                onChange={(e) => setSellerHouse(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor WhatsApp Pesanan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="0812-3456-7890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deskripsi Menu / Layanan & Ketentuan Antar
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan detail jualan, rasa, porsi, free ongkir ke rumah warga, jam buka, dll..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
              disabled={isCompressing}
              className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Tayangkan di Lapak Warga
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
