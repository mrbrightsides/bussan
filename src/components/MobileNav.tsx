import React from 'react';
import { TabType } from './TabNav';
import {
  LayoutDashboard,
  Trophy,
  Users,
  HeartHandshake,
  Receipt,
  FileSpreadsheet,
  Swords,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Beranda', icon: LayoutDashboard },
    { id: 'competitions' as TabType, label: 'Lomba', icon: Trophy },
    { id: 'brackets' as TabType, label: 'Bagan', icon: Swords },
    { id: 'participants' as TabType, label: 'Peserta', icon: Users },
    { id: 'donors' as TabType, label: 'Donasi', icon: HeartHandshake },
    { id: 'expenses' as TabType, label: 'Kas Keluar', icon: Receipt },
    { id: 'report' as TabType, label: 'Laporan', icon: FileSpreadsheet },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-1 px-1.5 z-40 md:hidden shadow-lg">
      <div className="grid grid-cols-7 gap-0.5 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all focus:outline-none ${
                isActive
                  ? 'text-red-600 font-extrabold bg-red-50'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-red-600 stroke-[2.5]' : 'text-slate-500'}`} />
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
