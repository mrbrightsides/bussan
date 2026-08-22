import React, { useEffect, useState } from 'react';
import {
  X,
  Store,
  MapPin,
  User,
  MessageCircle,
  Share2,
  Edit2,
  Trash2,
  Tag,
  CheckCircle2,
  Maximize2,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { MarketplaceItem } from '../types';
import { createWhatsAppLink } from '../utils/mediaUtils';

interface MarketplaceDetailModalProps {
  item: MarketplaceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: MarketplaceItem) => void;
  onDelete: (item: MarketplaceItem) => void;
}

export const MarketplaceDetailModal: React.FC<MarketplaceDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isImageExpanded) {
          setIsImageExpanded(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isImageExpanded, onClose]);

  if (!isOpen || !item) return null;

  const waOrderMsg = `Halo ${item.sellerName}, saya warga Green Bussan Village. Saya membaca lapak "${item.title}" di Portal Warga dan ingin berkonsultasi / memesan. Apakah masih tersedia?`;

  const handleShareWhatsApp = () => {
    const shareText = `*LAPAK WARGA GREEN BUSSAN VILLAGE*\n\n🏪 *${item.title}*\n📂 Kategori: ${item.category}\n💰 Harga / Tarif: *${item.price}*\n👤 Penjual: ${item.sellerName} (${item.sellerHouse})\n\n📝 *Deskripsi / Menu:*\n${item.description}\n\n📲 *Pesan / Tanya:* https://wa.me/${item.whatsapp.replace(/[^0-9]/g, '')}\n\n_Dukung usaha tetangga komplek kita!_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleCopyLink = () => {
    const shareText = `*LAPAK WARGA GREEN BUSSAN*\n\n*${item.title}* (${item.price})\nPenjual: ${item.sellerName} - ${item.sellerHouse}\nKontak WA: https://wa.me/${item.whatsapp.replace(/[^0-9]/g, '')}\n\n${item.description}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-amber-100/80 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-amber-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-amber-200">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-amber-200 font-bold">
                Detail Lapak & Usaha Warga
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                {item.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShareWhatsApp}
              title="Bagikan ke WhatsApp"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Main Image Section */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner group">
            {item.imageUrl ? (
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full max-h-[380px] object-contain bg-slate-900/5 mx-auto"
                />
                <button
                  onClick={() => setIsImageExpanded(true)}
                  className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl backdrop-blur-sm flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  title="Perbesar Foto"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Perbesar Foto</span>
                </button>
              </div>
            ) : (
              <div className="py-14 flex flex-col items-center justify-center text-slate-400 bg-gradient-to-b from-amber-50/70 to-orange-50/40">
                <Store className="w-16 h-16 text-amber-300 mb-2" />
                <span className="text-sm font-bold text-amber-900">Usaha & Lapak Warga</span>
                <span className="text-xs text-slate-500">Green Bussan Village</span>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
              <span className="bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                {item.category}
              </span>
              <span className="bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Lapak Aktif
              </span>
            </div>
          </div>

          {/* Pricing & Key Summary Bar */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                Harga / Tarif Layanan
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">
                {item.price}
              </div>
            </div>

            {/* Seller Details Card */}
            <div className="flex items-center gap-3 bg-white/90 border border-amber-200/80 rounded-xl px-4 py-2.5 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                <User className="w-5 h-5 text-amber-700" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900 text-sm">{item.sellerName}</div>
                <div className="text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{item.sellerHouse}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Description Section */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span>Rincian & Deskripsi Lengkap</span>
            </h4>
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal selection:bg-amber-200 shadow-inner">
              {item.description}
            </div>
          </div>

          {/* Order Action Buttons */}
          <div className="pt-2 space-y-3">
            <a
              href={createWhatsAppLink(item.whatsapp, waOrderMsg)}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Hubungi / Pesan via WhatsApp</span>
              <ExternalLink className="w-4 h-4 opacity-80" />
            </a>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Share ke Grup WA</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin Info</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onEdit(item);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-amber-200 cursor-pointer"
                  title="Edit Lapak"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Edit Lapak</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onDelete(item);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-rose-200 cursor-pointer"
                  title="Hapus Lapak"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Zoom */}
      {isImageExpanded && item.imageUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsImageExpanded(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={item.imageUrl}
              alt={item.title}
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setIsImageExpanded(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2.5 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white text-xs p-3 rounded-xl backdrop-blur-sm text-center">
              {item.title} • {item.price}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
