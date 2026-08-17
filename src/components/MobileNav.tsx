import React from 'react';
import { TabType } from './TabNav';
import {
  Megaphone,
  Image as ImageIcon,
  Calendar,
  PhoneCall,
  ShoppingBag,
  Wallet,
  Flag,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'feed', label: 'Kabar', icon: Megaphone },
    { id: 'gallery', label: 'Galeri', icon: ImageIcon },
    { id: 'events', label: 'Agenda', icon: Calendar },
    { id: 'emergency', label: 'Darurat', icon: PhoneCall },
    { id: 'market', label: 'Lapak', icon: ShoppingBag },
    { id: 'rtCash', label: 'Kas Warga', icon: Wallet },
    { id: 'archive', label: 'HUT RI', icon: Flag },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-1 px-1 z-40 md:hidden shadow-xl">
      <div className="grid grid-cols-7 gap-0.5 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isArchive = tab.id === 'archive';

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all focus:outline-none ${
                isActive
                  ? isArchive
                    ? 'text-red-600 font-extrabold bg-red-50'
                    : 'text-emerald-700 font-extrabold bg-emerald-50'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? isArchive
                      ? 'text-red-600 stroke-[2.5]'
                      : 'text-emerald-700 stroke-[2.5]'
                    : 'text-slate-500'
                }`}
              />
              <span className="text-[10px] leading-none mt-1 truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
