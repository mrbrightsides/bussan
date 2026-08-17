import React from 'react';
import {
  Megaphone,
  Image as ImageIcon,
  Calendar,
  PhoneCall,
  ShoppingBag,
  Wallet,
  Flag,
} from 'lucide-react';

export type TabType =
  | 'feed'
  | 'gallery'
  | 'events'
  | 'emergency'
  | 'market'
  | 'rtCash'
  | 'archive';

interface TabNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  counts: {
    posts: number;
    media: number;
    events: number;
    contacts: number;
    market: number;
    rtCash: number;
  };
}

export const TabNav: React.FC<TabNavProps> = ({ activeTab, onChangeTab, counts }) => {
  const tabs: { id: TabType; label: string; icon: any; badge?: number; specialColor?: boolean }[] = [
    {
      id: 'feed',
      label: 'Kabar & Pengumuman',
      icon: Megaphone,
      badge: counts.posts,
    },
    {
      id: 'gallery',
      label: 'Galeri Foto & Video',
      icon: ImageIcon,
      badge: counts.media,
    },
    {
      id: 'events',
      label: 'Agenda Kegiatan',
      icon: Calendar,
      badge: counts.events,
    },
    {
      id: 'emergency',
      label: 'Kontak Darurat & Layanan',
      icon: PhoneCall,
      badge: counts.contacts,
    },
    {
      id: 'market',
      label: 'Lapak UMKM Warga',
      icon: ShoppingBag,
      badge: counts.market,
    },
    {
      id: 'rtCash',
      label: 'Kas Warga & Iuran',
      icon: Wallet,
    },
    {
      id: 'archive',
      label: 'Arsip HUT RI',
      icon: Flag,
      specialColor: true,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-[65px] z-20 shadow-xs hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-thin" aria-label="Navigasi Utama">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 focus:outline-none ${
                  isActive
                    ? tab.specialColor
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : tab.specialColor ? 'text-red-500' : 'text-slate-500'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
