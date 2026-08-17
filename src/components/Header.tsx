import React from 'react';
import { Building2, Plus, Cloud, ShieldCheck, Home, PhoneCall, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenQuickAdd: () => void;
  onOpenEmergency: () => void;
  onOpenPost: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickAdd,
  onOpenEmergency,
  onOpenPost,
}) => {
  return (
    <header className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white shadow-md sticky top-0 z-30 border-b border-emerald-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Brand & Complex Identity */}
          <div className="flex items-center gap-3">
            {/* Community Emplem */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-md flex items-center justify-center text-white shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 font-bold text-[10px] tracking-wider uppercase border border-emerald-400/30 flex items-center gap-1">
                  <Home className="w-3 h-3" /> RT 22
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 font-semibold text-[10px] border border-emerald-400/40 flex items-center gap-1" title="Tersimpan otomatis & real-time di Cloud Firestore">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <Cloud className="w-3 h-3" /> Online Real-Time
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight mt-0.5">
                Portal Warga Green Bussan Village
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
            <button
              onClick={onOpenEmergency}
              className="px-3 py-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 focus:outline-none"
              title="Kontak Darurat Satpam & Pengurus"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Darurat / Satpam</span>
            </button>

            <button
              onClick={onOpenPost}
              className="px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-xl text-xs font-extrabold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 border border-emerald-300 focus:outline-none"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Kabar Warga</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

