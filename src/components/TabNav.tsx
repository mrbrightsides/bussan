import React from 'react';
import {
  LayoutDashboard,
  Trophy,
  Users,
  HeartHandshake,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

export type TabType = 'dashboard' | 'competitions' | 'participants' | 'donors' | 'expenses' | 'report';

interface TabNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  counts: {
    competitions: number;
    participants: number;
    donors: number;
    expenses: number;
  };
}

export const TabNav: React.FC<TabNavProps> = ({ activeTab, onChangeTab, counts }) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'competitions' as TabType,
      label: 'Daftar Lomba',
      icon: Trophy,
      badge: counts.competitions,
    },
    {
      id: 'participants' as TabType,
      label: 'Peserta',
      icon: Users,
      badge: counts.participants,
    },
    {
      id: 'donors' as TabType,
      label: 'Donatur & Kas Masuk',
      icon: HeartHandshake,
      badge: counts.donors,
    },
    {
      id: 'expenses' as TabType,
      label: 'Pengeluaran',
      icon: Receipt,
      badge: counts.expenses,
    },
    {
      id: 'report' as TabType,
      label: 'Laporan Keuangan',
      icon: FileSpreadsheet,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-[69px] z-20 shadow-xs hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 no-scrollbar" aria-label="Navigasi Utama">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 focus:outline-none ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-red-600 hover:bg-red-50/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
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
