import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  MessageCircle,
  MapPin,
  Sparkles,
  Store,
  Trash2,
  HelpCircle,
  Upload,
  Smartphone,
  CheckCircle2,
  DollarSign,
  Package,
  Info,
  RotateCcw,
} from 'lucide-react';
import { MarketplaceItem, MarketplaceCategory } from '../types';
import { MarketplaceModal } from './MarketplaceModal';
import { AdminConfirmationModal } from './AdminConfirmationModal';
import { createWhatsAppLink } from '../utils/mediaUtils';

interface MarketplaceViewProps {
  items: MarketplaceItem[];
  onSaveItem: (item: MarketplaceItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAllItems?: () => void;
  onResetDemoItems?: () => void;
}

const CATEGORIES: (MarketplaceCategory | 'Semua')[] = [
  'Semua',
  'Kuliner & Makanan',
  'Kebutuhan Harian & Gas/Galon',
  'Jasa & Laundry',
  'Fashion & Kerajinan',
  'Lainnya',
];

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onClearAllItems,
  onResetDemoItems,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MarketplaceItem | null>(null);

  // Security confirmation state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    confirmButtonText?: string;
    isBulkAction?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const filteredItems = items.filter((item) => {
    const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerHouse.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Kosongkan Semua Lapak UMKM',
      message:
        'Tindakan ini memerlukan persetujuan pengurus. Semua produk dan lapak jualan warga akan dihapus permanen dari server database.',
      confirmButtonText: 'Kosongkan Sekarang',
      isBulkAction: true,
      onConfirm: () => {
        if (onClearAllItems) {
          onClearAllItems();
        } else {
          items.forEach((item) => onDeleteItem(item.id));
        }
      },
    });
  };

  const handleRequestDelete = (item: MarketplaceItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Lapak UMKM',
      message: 'Apakah Anda yakin ingin menghapus produk/jasa ini dari direktori UMKM warga?',
      itemName: item.title,
      confirmButtonText: 'Ya, Hapus',
      isBulkAction: false,
      onConfirm: () => {
        onDeleteItem(item.id);
      },
    });
  };

  const foodCount = items.filter((i) => i.category === 'Kuliner & Makanan').length;
  const dailyCount = items.filter((i) => i.category === 'Kebutuhan Harian & Gas/Galon').length;
  const serviceCount = items.filter((i) => i.category === 'Jasa & Laundry').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-600/80 border border-amber-400/30 text-amber-100 text-xs font-semibold px-3 py-1 rounded-full">
              <Store className="w-3.5 h-3.5 text-amber-200" />
              Lapak UMKM & Usaha Warga Green Bussan
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Lapak & Usaha Rumahan Warga
            </h1>
            <p className="text-amber-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
              Dukung perekonomian sesama tetangga! Pesan makanan siap antar ke depan pintu rumah, isi ulang galon/gas LPG, laundry, dan jasa terpercaya langsung dari warga komplek.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setItemToEdit(null);
                setIsModalOpen(true);
              }}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-900" />
              Buka Lapak / Pasang Jualan
            </button>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
              title="Petunjuk cara warga mendaftarkan jualan & usaha rumahan"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              {showGuide ? 'Tutup Panduan' : 'Cara Jualan'}
            </button>

            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white font-semibold text-xs px-3.5 py-3 rounded-2xl border border-rose-800/60 transition-all flex items-center gap-1.5"
                title="Kosongkan semua lapak jualan untuk diisi produk asli warga"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Kosongkan Lapak</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Counter */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t border-white/10 max-w-lg">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-amber-200 font-semibold uppercase">Total Lapak</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{items.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-amber-200 font-semibold uppercase">Kuliner & Snack</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{foodCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-amber-200 font-semibold uppercase">Gas, Galon & Jasa</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{dailyCount + serviceCount}</p>
          </div>
        </div>
      </div>

      {/* Panduan & Tutorial Banner (Expandable / Visible when empty) */}
      {(showGuide || items.length === 0) && (
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Panduan Warga: Cara Membuka Lapak & Jualan di Portal Warga
                </h2>
                <p className="text-xs text-slate-600">
                  Semua warga Green Bussan Village dapat mempromosikan produk makanan, barang kebutuhan, maupun jasa secara gratis tanpa potongan.
                </p>
              </div>
            </div>

            {items.length > 0 && (
              <button
                onClick={() => setShowGuide(false)}
                className="text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-200/60 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                Sembunyikan
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            {/* Step 1 */}
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span className="font-bold text-xs text-slate-800">Foto & Judul Usaha</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Siapkan foto produk (makanan, kemasan, atau poster jasa) langsung dari kamera HP Anda. Sistem akan mengompres foto secara otomatis agar hemat kuota.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span className="font-bold text-xs text-slate-800">Nama & Alamat Rumah</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tuliskan nama Anda dan nomor blok rumah (misal: <em>Ibu Salsa - Blok B2 No. 08</em>) agar tetangga mudah mengenali lokasi pengantaran / pengambilan.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span className="font-bold text-xs text-slate-800">Nomor WhatsApp Aktif</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Masukkan no WhatsApp (contoh: <code>08127890xxxx</code>). Tombol <strong>"Pesan via WhatsApp"</strong> akan otomatis menghubungkan pembeli ke chat Anda.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <span className="font-bold text-xs text-slate-800">Kategori & Harga Jelas</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih kategori yang sesuai (Kuliner, Gas/Galon, Laundry, Jasa, dll) serta cantumkan harga atau paket agar warga langsung tertarik memesan.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 border-t border-amber-200/80">
            <div className="flex items-center gap-2 text-amber-900 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Dukung tetangga sendiri, ekonomi komplek semakin mandiri dan silaturahmi semakin erat.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setItemToEdit(null);
                  setIsModalOpen(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Mulai Buka Lapak Sekarang
              </button>

              {onResetDemoItems && items.length === 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Muat contoh lapak UMKM warga untuk demo tampilan?')) {
                      onResetDemoItems();
                    }
                  }}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs px-3 py-2 rounded-xl transition-all border border-amber-300 inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  Muat Contoh Lapak
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari makanan, galon, laundry, atau penjual..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-800">
              {searchQuery ? 'Tidak Ditemukan Hasil Pencarian' : 'Lapak Warga Masih Bersih & Kosong'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? 'Coba ganti kata kunci pencarian atau pilih kategori "Semua".'
                : 'Punya usaha rumahan, jualan makanan, air galon, laundry, atau jasa di Green Bussan Village? Yuk pasang lapak Anda sekarang secara gratis!'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => {
                setItemToEdit(null);
                setIsModalOpen(true);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Buka Lapak Pertama Sekarang
            </button>

            {onResetDemoItems && (
              <button
                onClick={() => {
                  if (window.confirm('Muat contoh lapak jualan warga untuk referensi?')) {
                    onResetDemoItems();
                  }
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-3 rounded-2xl transition-all border border-slate-200 inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                Muat Contoh Lapak
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const waOrderMsg = `Halo ${item.sellerName}, saya warga Green Bussan Village. Saya tertarik ingin memesan "${item.title}" dari lapak warga. Apakah masih tersedia?`;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-amber-50/50">
                        <Store className="w-10 h-10 text-amber-300 mb-1" />
                        <span className="text-xs font-semibold text-amber-800">
                          Usaha Warga Komplek
                        </span>
                      </div>
                    )}

                    {/* Category & Status */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                        {item.category}
                      </span>
                    </div>

                    {/* Price Tag */}
                    <div className="absolute bottom-3 right-3 bg-amber-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg">
                      {item.price}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-amber-700 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
                        <span className="font-semibold text-slate-700">{item.sellerName}</span>
                        <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          {item.sellerHouse}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={createWhatsAppLink(item.whatsapp, waOrderMsg)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Pesan via WhatsApp
                    </a>

                    <button
                      onClick={() => {
                        setItemToEdit(item);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-xs font-medium"
                      title="Edit Lapak"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRequestDelete(item)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors text-xs font-medium"
                      title="Hapus Lapak"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MarketplaceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={onSaveItem}
        itemToEdit={itemToEdit}
      />

      <AdminConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        itemName={confirmDialog.itemName}
        confirmButtonText={confirmDialog.confirmButtonText}
        isBulkAction={confirmDialog.isBulkAction}
      />
    </div>
  );
};
