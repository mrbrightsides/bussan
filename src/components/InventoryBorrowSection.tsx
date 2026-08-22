import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  User,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  History,
  RotateCcw,
  Check,
  HelpCircle,
  X,
} from 'lucide-react';
import { RTInventoryItem, InventoryCategory, InventoryBorrowRecord } from '../types';
import { InventoryItemModal } from './InventoryItemModal';
import { BorrowItemModal } from './BorrowItemModal';
import { sampleDemoInventoryItems } from '../data/initialData';
import { createWhatsAppLink } from '../utils/mediaUtils';

interface InventoryBorrowSectionProps {
  inventoryItems: RTInventoryItem[];
  onSaveInventoryItem: (item: RTInventoryItem) => void;
  onDeleteInventoryItem: (id: string) => void;
  onResetDemoInventory?: () => void;
}

const CATEGORIES: (InventoryCategory | 'Semua')[] = [
  'Semua',
  'Tenda & Terpal',
  'Kursi & Meja',
  'Sound System & Pengeras Suara',
  'Alat Kebersihan & Mesin Rumput',
  'Peralatan Masak & Dapur Warga',
  'Perkakas & Pertukangan',
  'Lainnya',
];

export const InventoryBorrowSection: React.FC<InventoryBorrowSectionProps> = ({
  inventoryItems,
  onSaveInventoryItem,
  onDeleteInventoryItem,
  onResetDemoInventory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<RTInventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<RTInventoryItem | null>(null);

  // Borrow Modal
  const [selectedItemForBorrow, setSelectedItemForBorrow] = useState<RTInventoryItem | null>(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  // History tab active filter ('catalog' | 'active_loans')
  const [viewMode, setViewMode] = useState<'catalog' | 'active_loans'>('catalog');

  const filteredItems = inventoryItems.filter((item) => {
    if (!item) return false;
    const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchCat;

    const matchSearch =
      (item.name || '').toLowerCase().includes(query) ||
      (item.storageLocation || '').toLowerCase().includes(query) ||
      (item.picName || '').toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query));

    return matchCat && matchSearch;
  });

  // Calculate active loans across all items
  const allActiveLoans: { item: RTInventoryItem; record: InventoryBorrowRecord }[] = [];
  inventoryItems.forEach((item) => {
    (item.borrowHistory || []).forEach((rec) => {
      if (rec.status === 'Aktif Dipinjam') {
        allActiveLoans.push({ item, record: rec });
      }
    });
  });

  const handleConfirmBorrow = (itemId: string, record: InventoryBorrowRecord) => {
    const item = inventoryItems.find((i) => i.id === itemId);
    if (!item) return;

    const newAvailable = Math.max(0, item.availableQuantity - record.quantity);
    const updatedHistory = [record, ...(item.borrowHistory || [])];

    const updatedItem: RTInventoryItem = {
      ...item,
      availableQuantity: newAvailable,
      borrowHistory: updatedHistory,
    };

    onSaveInventoryItem(updatedItem);
  };

  const handleReturnItem = (item: RTInventoryItem, recordId: string) => {
    const record = (item.borrowHistory || []).find((r) => r.id === recordId);
    if (!record) return;

    const now = new Date();
    const formattedDate = `${now.getDate()} ${
      [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ][now.getMonth()]
    } ${now.getFullYear()}`;

    const newAvailable = Math.min(item.totalQuantity, item.availableQuantity + record.quantity);
    const updatedHistory = (item.borrowHistory || []).map((r) =>
      r.id === recordId
        ? { ...r, status: 'Sudah Dikembalikan' as const, actualReturnDate: formattedDate }
        : r
    );

    const updatedItem: RTInventoryItem = {
      ...item,
      availableQuantity: newAvailable,
      borrowHistory: updatedHistory,
    };

    onSaveInventoryItem(updatedItem);
  };

  return (
    <div className="space-y-6">
      {/* Hero / Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold px-3 py-1 rounded-full">
              <Package className="w-3.5 h-3.5 text-teal-300" />
              Sarana & Prasarana Milik Bersama Warga Green Bussan
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Katalog Peminjaman Inventaris
            </h2>
            <p className="text-teal-100/80 text-xs sm:text-sm max-w-xl leading-relaxed">
              Fasilitas bersama seperti tenda pesta, kursi lipat, sound system/mic wireless, mesin potong rumput, terpal, dan genset siap dipinjam oleh seluruh warga Green Bussan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setItemToEdit(null);
                setIsItemModalOpen(true);
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Inventaris
            </button>
          </div>
        </div>

        {/* View Mode Tabs (Katalog vs Pinjaman Aktif) */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/10">
          <button
            onClick={() => setViewMode('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'catalog'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'bg-white/10 text-teal-100 hover:bg-white/20'
            }`}
          >
            <Package className="w-4 h-4" />
            Katalog Barang ({inventoryItems.length})
          </button>
          <button
            onClick={() => setViewMode('active_loans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'active_loans'
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'bg-white/10 text-teal-100 hover:bg-white/20'
            }`}
          >
            <History className="w-4 h-4" />
            Sedang Dipinjam ({allActiveLoans.length})
          </button>
        </div>
      </div>

      {viewMode === 'active_loans' ? (
        /* ================= ACTIVE LOANS VIEW ================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-600" />
              Daftar Barang yang Sedang Dipinjam Warga
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Total {allActiveLoans.length} peminjaman aktif
            </span>
          </div>

          {allActiveLoans.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300 space-y-3">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Semua Barang Tersedia Lengkap!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Saat ini tidak ada barang inventaris yang sedang dipinjam keluar. Semua stok aman di lokasi penyimpanan.
              </p>
              <button
                onClick={() => setViewMode('catalog')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Lihat Katalog Barang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allActiveLoans.map(({ item, record }) => (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {item.name}
                        </span>
                        <h4 className="text-sm font-black text-slate-800 mt-1">
                          Dipinjam: {record.borrowerName} ({record.borrowerHouse})
                        </h4>
                      </div>
                      <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 border border-amber-200">
                        {record.quantity} {item.unit}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Tgl Pinjam</span>
                        <span className="font-medium text-slate-700">{record.borrowDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-600 block font-semibold">
                          Estimasi Kembali
                        </span>
                        <span className="font-bold text-amber-900">{record.returnEstimate}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      Keperluan: &quot;{record.purpose}&quot;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {record.borrowerPhone && (
                      <a
                        href={createWhatsAppLink(
                          record.borrowerPhone,
                          `Halo ${record.borrowerName}, kami dari pengurus Kompleks Green Bussan Village ingin konfirmasi peminjaman ${item.name}...`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Hubungi Peminjam
                      </a>
                    )}

                    <button
                      onClick={() => handleReturnItem(item, record.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer ml-auto"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Tandai Sudah Dikembalikan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= CATALOG VIEW ================= */
        <div className="space-y-6">
          {/* Search & Filter */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari tenda, kursi, mic, mesin rumput, lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 scrollbar-thin">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl shrink-0 transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-700 text-white font-bold shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800">
                  {inventoryItems.length === 0
                    ? 'Belum Ada Daftar Inventaris'
                    : 'Tidak ada barang inventaris yang sesuai'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {inventoryItems.length === 0
                    ? 'Daftar inventaris sarana & prasarana milik bersama masih kosong. Warga atau pengurus dapat menambahkan barang inventaris baru untuk dipinjamkan bersama.'
                    : 'Silakan ubah filter kategori atau kata kunci pencarian Anda.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setItemToEdit(null);
                    setIsItemModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Inventaris Baru
                </button>
                {onResetDemoInventory && inventoryItems.length === 0 && (
                  <button
                    onClick={onResetDemoInventory}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Muat Contoh Inventaris (Demo)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => {
                const isAvailable = item.availableQuantity > 0;
                const percentAvailable = Math.round(
                  (item.availableQuantity / item.totalQuantity) * 100
                );

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Header if available */}
                      {item.imageUrl ? (
                        <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${
                                isAvailable
                                  ? 'bg-emerald-600/90 text-white'
                                  : 'bg-rose-600/90 text-white'
                              }`}
                            >
                              {isAvailable
                                ? `Tersedia: ${item.availableQuantity} ${item.unit}`
                                : 'Habis Dipinjam'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-white/80 px-2.5 py-0.5 rounded-md border border-teal-200">
                            {item.category}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isAvailable
                              ? `Tersedia: ${item.availableQuantity} ${item.unit}`
                              : 'Habis Dipinjam'}
                          </span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4 sm:p-5 space-y-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {item.category}
                          </span>
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 leading-snug">
                            {item.name}
                          </h3>
                        </div>

                        {/* Stock bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Ketersediaan Stok</span>
                            <span className="font-bold text-slate-700">
                              {item.availableQuantity} / {item.totalQuantity} {item.unit}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                percentAvailable > 50
                                  ? 'bg-emerald-500'
                                  : percentAvailable > 0
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${percentAvailable}%` }}
                            />
                          </div>
                        </div>

                        {/* Location & PIC */}
                        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              Lokasi: <span className="font-semibold text-slate-800">{item.storageLocation}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              PIC: <span className="font-semibold text-slate-800">{item.picName}</span>
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {/* Terms */}
                        {item.terms && (
                          <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="leading-tight">{item.terms}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-3.5 sm:px-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setItemToEdit(item);
                            setIsItemModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl cursor-pointer"
                          title="Edit Inventaris"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                          title="Hapus Inventaris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.picPhone && (
                          <a
                            href={createWhatsAppLink(
                              item.picPhone,
                              `Halo ${item.picName}, saya warga Green Bussan ingin menanyakan info ketersediaan barang inventaris: ${item.name}...`
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-semibold text-xs flex items-center gap-1"
                            title="Chat WhatsApp PIC"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px]">Chat PIC</span>
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setSelectedItemForBorrow(item);
                            setIsBorrowModalOpen(true);
                          }}
                          disabled={!isAvailable}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isAvailable
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Package className="w-3.5 h-3.5" />
                          Pinjam Barang
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-800">Hapus Barang Inventaris?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Barang &quot;{itemToDelete.name}&quot; akan dihapus dari katalog inventaris warga.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteInventoryItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-md cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Inventory Item Modal */}
      <InventoryItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={onSaveInventoryItem}
        itemToEdit={itemToEdit}
      />

      {/* Borrow Item Form Modal */}
      <BorrowItemModal
        isOpen={isBorrowModalOpen}
        onClose={() => {
          setIsBorrowModalOpen(false);
          setSelectedItemForBorrow(null);
        }}
        item={selectedItemForBorrow}
        onConfirmBorrow={handleConfirmBorrow}
      />
    </div>
  );
};
