import React, { useState } from 'react';
import {
  PhoneCall,
  MessageCircle,
  Plus,
  Search,
  Shield,
  Wrench,
  HeartPulse,
  Trash2,
  Users,
  MapPin,
  Clock,
  ExternalLink,
  ShieldAlert,
  Building,
  Droplets,
  Mail,
  Globe,
  Flame,
  AlertTriangle,
  X,
  Edit2,
  Package,
} from 'lucide-react';
import {
  EmergencyContact,
  EmergencyCategory,
  FacilityReport,
  RTInventoryItem,
} from '../types';
import { ContactModal } from './ContactModal';
import { FacilityReportsSection } from './FacilityReportsSection';
import { InventoryBorrowSection } from './InventoryBorrowSection';
import { AdminConfirmationModal } from './AdminConfirmationModal';
import { createWhatsAppLink } from '../utils/mediaUtils';

interface EmergencyDirectoryViewProps {
  contacts: EmergencyContact[];
  onSaveContact: (contact: EmergencyContact) => void;
  onDeleteContact: (id: string) => void;
  // Facility Reports
  facilityReports?: FacilityReport[];
  onSaveFacilityReport?: (report: FacilityReport) => void;
  onDeleteFacilityReport?: (id: string) => void;
  onClearAllFacilityReports?: () => void;
  onResetDemoFacilityReports?: () => void;
  // Inventory Items
  inventoryItems?: RTInventoryItem[];
  onSaveInventoryItem?: (item: RTInventoryItem) => void;
  onDeleteInventoryItem?: (id: string) => void;
  onResetDemoInventory?: () => void;
}

const CATEGORIES: (EmergencyCategory | 'Semua')[] = [
  'Semua',
  'Pengurus Kompleks',
  'Pemerintahan & Kelurahan',
  'Keamanan & Darurat',
  'Kesehatan & Medis',
  'Layanan Publik & PDAM',
  'Teknisi & Perbaikan',
  'Kebersihan & Lingkungan',
];

export const EmergencyDirectoryView: React.FC<EmergencyDirectoryViewProps> = ({
  contacts,
  onSaveContact,
  onDeleteContact,
  facilityReports = [],
  onSaveFacilityReport = () => {},
  onDeleteFacilityReport = () => {},
  onClearAllFacilityReports,
  onResetDemoFacilityReports,
  inventoryItems = [],
  onSaveInventoryItem = () => {},
  onDeleteInventoryItem = () => {},
  onResetDemoInventory,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'emergency' | 'facility_reports' | 'inventory'>('emergency');
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<EmergencyContact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<EmergencyContact | null>(null);

  const pendingReportsCount = facilityReports.filter(
    (r) => r.status === 'Menunggu Tindakan' || r.status === 'Sedang Dikerjakan'
  ).length;

  const filteredContacts = contacts.filter((c) => {
    if (!c) return false;
    const matchCat =
      selectedCategory === 'Semua' ||
      c.category === selectedCategory ||
      (selectedCategory === 'Kesehatan & Medis' && c.category === 'Kesehatan & Bidan');
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchCat;

    const matchSearch =
      (c.name || '').toLowerCase().includes(query) ||
      (c.role || '').toLowerCase().includes(query) ||
      (c.description || '').toLowerCase().includes(query) ||
      (c.phone || '').includes(query) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.address && c.address.toLowerCase().includes(query));
    return matchCat && matchSearch;
  });

  const getCategoryIcon = (category: EmergencyCategory) => {
    switch (category) {
      case 'Pengurus Kompleks':
        return <Users className="w-4 h-4 text-emerald-600" />;
      case 'Pemerintahan & Kelurahan':
        return <Building className="w-4 h-4 text-indigo-600" />;
      case 'Keamanan & Darurat':
        return <Shield className="w-4 h-4 text-rose-600" />;
      case 'Kesehatan & Medis':
      case 'Kesehatan & Bidan':
        return <HeartPulse className="w-4 h-4 text-blue-600" />;
      case 'Layanan Publik & PDAM':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'Teknisi & Perbaikan':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'Kebersihan & Lingkungan':
        return <Trash2 className="w-4 h-4 text-teal-600" />;
      default:
        return <PhoneCall className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryHeaderStyle = (category: EmergencyCategory) => {
    switch (category) {
      case 'Pengurus Kompleks':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'Pemerintahan & Kelurahan':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'Keamanan & Darurat':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'Kesehatan & Medis':
      case 'Kesehatan & Bidan':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'Layanan Publik & PDAM':
        return 'bg-cyan-50 border-cyan-200 text-cyan-800';
      case 'Teknisi & Perbaikan':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const handleConfirmDelete = () => {
    if (contactToDelete) {
      onDeleteContact(contactToDelete.id);
      setContactToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Sub Module Switcher Navigation */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveSubTab('emergency')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'emergency'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Kontak Darurat & Layanan</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeSubTab === 'emergency'
                ? 'bg-rose-700 text-rose-100'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {contacts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('facility_reports')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'facility_reports'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Lapor Fasilitas & Aspirasi</span>
          {pendingReportsCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeSubTab === 'facility_reports'
                  ? 'bg-amber-700 text-amber-100'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingReportsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'inventory'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Peminjaman Inventaris Kompleks</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeSubTab === 'inventory'
                ? 'bg-emerald-800 text-emerald-100'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {inventoryItems.length}
          </span>
        </button>
      </div>

      {/* Sub-view conditional render */}
      {activeSubTab === 'facility_reports' ? (
        <FacilityReportsSection
          reports={facilityReports}
          onSaveReport={onSaveFacilityReport}
          onDeleteReport={onDeleteFacilityReport}
          onClearAllReports={onClearAllFacilityReports}
          onResetDemoReports={onResetDemoFacilityReports}
        />
      ) : activeSubTab === 'inventory' ? (
        <InventoryBorrowSection
          inventoryItems={inventoryItems}
          onSaveInventoryItem={onSaveInventoryItem}
          onDeleteInventoryItem={onDeleteInventoryItem}
          onResetDemoInventory={onResetDemoInventory}
        />
      ) : (
        /* ================= EMERGENCY CONTACTS DIRECTORY VIEW ================= */
        <div className="space-y-6">
          {/* Top Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-rose-800/80 border border-rose-500/30 text-rose-200 text-xs font-semibold px-3 py-1 rounded-full">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Direktori Penting Kelurahan Sako & Green Bussan
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Kontak Darurat & Layanan Warga
                </h1>
                <p className="text-rose-100/80 text-xs sm:text-sm max-w-xl leading-relaxed">
                  Daftar nomor resmi Kantor Lurah & Camat Sako, Ketua RT 22 (Pak Sulaiman), Polisi 110, Ambulans 119, Damkar Sako, Puskesmas, dan PDAM Tirta Musi Palembang.
                </p>
              </div>

              <button
                onClick={() => {
                  setContactToEdit(null);
                  setIsModalOpen(true);
                }}
                className="self-start md:self-center bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Kontak Layanan
              </button>
            </div>

            {/* Quick Dial Top 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
              {/* 1. Ketua RT Sulaiman */}
              <div className="bg-emerald-950/70 border border-emerald-800/60 rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                    Ketua RT 22
                  </span>
                  <p className="text-sm font-black text-white">Pak Sulaiman</p>
                  <p className="text-[11px] text-emerald-200 font-mono">+62 813-6761-3695</p>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <a
                    href="tel:+6281367613695"
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow"
                  >
                    <PhoneCall className="w-3 h-3" />
                    Telp
                  </a>
                  <a
                    href={createWhatsAppLink(
                      '6281367613695',
                      'Halo Pak RT Sulaiman, saya warga Green Bussan Village ingin konsultasi...'
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow"
                  >
                    <MessageCircle className="w-3 h-3" />
                    WA
                  </a>
                </div>
              </div>

              {/* 2. Kantor Lurah Sako */}
              <div className="bg-indigo-950/70 border border-indigo-800/60 rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                    Pemerintahan
                  </span>
                  <p className="text-sm font-black text-white">Kantor Lurah Sako</p>
                  <p className="text-[11px] text-indigo-200 font-mono">0711-352271</p>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <a
                    href="tel:0711352271"
                    className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow"
                  >
                    <PhoneCall className="w-3 h-3" />
                    0711-352271
                  </a>
                </div>
              </div>

              {/* 3. Damkar Pos Sako */}
              <div className="bg-rose-950/70 border border-rose-800/60 rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-400" />
                    Damkar Pos Sako
                  </span>
                  <p className="text-sm font-black text-white">Damkar & Evakuasi</p>
                  <p className="text-[11px] text-rose-200 font-mono">0711-822532</p>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <a
                    href="tel:0711822532"
                    className="w-full py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow"
                  >
                    <PhoneCall className="w-3 h-3" />
                    0711-822532 (24 Jam)
                  </a>
                </div>
              </div>

              {/* 4. Polri 110 & Medis 119 */}
              <div className="bg-blue-950/70 border border-blue-800/60 rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">
                    Layanan Bebas Pulsa
                  </span>
                  <p className="text-sm font-black text-white">Polri 110 & Medis 119</p>
                  <p className="text-[11px] text-blue-200">Gawat Darurat Nasional</p>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <a
                    href="tel:110"
                    className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow"
                    title="Panggil Polisi 110"
                  >
                    <PhoneCall className="w-3 h-3" />
                    Polri 110
                  </a>
                  <a
                    href="tel:119"
                    className="flex-1 py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow"
                    title="Panggil Ambulans Medis 119"
                  >
                    <PhoneCall className="w-3 h-3" />
                    Medis 119
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kelurahan, damkar, satpam, dokter, PDAM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 scrollbar-thin">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-rose-600 text-white shadow-sm font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with category badge */}
                  <div
                    className={`p-4 border-b flex items-center justify-between ${getCategoryHeaderStyle(
                      contact.category
                    )}`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-white rounded-lg shadow-2xs">
                        {getCategoryIcon(contact.category)}
                      </div>
                      <span className="text-xs font-bold">{contact.category}</span>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] font-semibold opacity-80">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{contact.availableHours}</span>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {contact.name}
                      </h3>
                      <p className="text-xs font-bold text-rose-600 mt-0.5">{contact.role}</p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {contact.description}
                    </p>

                    {/* Meta information tags */}
                    <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                      {contact.address && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-[11px] line-clamp-1">{contact.address}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-[11px] text-indigo-600 hover:underline truncate"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a
                            href={contact.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-600 hover:underline truncate flex items-center gap-1"
                          >
                            <span>Kunjungi Website Resmi</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Call & WA buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <a
                      href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{contact.phone}</span>
                    </a>

                    {contact.whatsapp && (
                      <a
                        href={createWhatsAppLink(
                          contact.whatsapp,
                          `Halo ${contact.name}, saya warga Green Bussan Village ingin berkonsultasi...`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-xs">
                    <button
                      onClick={() => {
                        setContactToEdit(contact);
                        setIsModalOpen(true);
                      }}
                      className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="Edit data kontak"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setContactToDelete(contact);
                      }}
                      className="text-slate-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="Hapus kontak"
                    >
                      <Trash2 className="w-3 h-3" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Add / Edit Contact */}
          <ContactModal
            key={contactToEdit?.id || (isModalOpen ? 'modal-open-new' : 'modal-closed')}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setContactToEdit(null);
            }}
            onSave={onSaveContact}
            contactToEdit={contactToEdit}
          />

          {/* Safe Confirmation Modal */}
          <AdminConfirmationModal
            isOpen={Boolean(contactToDelete)}
            onClose={() => setContactToDelete(null)}
            onConfirm={handleConfirmDelete}
            title="Hapus Kontak Layanan"
            message="Apakah Anda yakin ingin menghapus kontak ini dari direktori warga Green Bussan?"
            itemName={contactToDelete ? `${contactToDelete.name} (${contactToDelete.role})` : undefined}
            confirmButtonText="Ya, Hapus Kontak"
            isBulkAction={false}
          />
        </div>
      )}
    </div>
  );
};
