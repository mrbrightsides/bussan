import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Users,
  HeartHandshake,
  Receipt,
  FileText,
  Sparkles,
  GitBranch,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { AppState, Competition, Participant, Donor, Expense, TournamentBracket, CompetitionStatus } from '../types';
import { DashboardView } from './DashboardView';
import { CompetitionsView } from './CompetitionsView';
import { TournamentBracketView } from './TournamentBracketView';
import { ParticipantsView } from './ParticipantsView';
import { DonorsView } from './DonorsView';
import { ExpensesView } from './ExpensesView';
import { FinancialReportView } from './FinancialReportView';

interface AugustArchiveViewProps {
  state: AppState;
  onSaveCompetition: (comp: Competition) => void;
  onDeleteCompetition: (id: string) => void;
  onUpdateCompStatus: (id: string, status: CompetitionStatus) => void;
  onSaveParticipant: (part: Participant) => void;
  onDeleteParticipant: (id: string) => void;
  onSaveDonor: (donor: Donor) => void;
  onDeleteDonor: (id: string) => void;
  onSaveExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onSaveBracket: (bracket: TournamentBracket) => void;
  onDeleteBracket: (bracketId: string) => void;
  onResetData: () => void;
  onOpenQuickAdd: (action: 'participant' | 'donor' | 'expense' | 'competition') => void;
  onEditCompetitionModal: (comp: Competition) => void;
  onAddCompetitionModal: () => void;
  onEditParticipantModal: (part: Participant) => void;
  onAddParticipantModal: () => void;
  onEditDonorModal: (donor: Donor) => void;
  onAddDonorModal: () => void;
  onEditExpenseModal: (expense: Expense) => void;
  onAddExpenseModal: () => void;
}

export type ArchiveSubTab =
  | 'dashboard'
  | 'competitions'
  | 'brackets'
  | 'participants'
  | 'donors'
  | 'expenses'
  | 'report';

export const AugustArchiveView: React.FC<AugustArchiveViewProps> = ({
  state,
  onSaveCompetition,
  onDeleteCompetition,
  onUpdateCompStatus,
  onSaveParticipant,
  onDeleteParticipant,
  onSaveDonor,
  onDeleteDonor,
  onSaveExpense,
  onDeleteExpense,
  onSaveBracket,
  onDeleteBracket,
  onResetData,
  onOpenQuickAdd,
  onEditCompetitionModal,
  onAddCompetitionModal,
  onEditParticipantModal,
  onAddParticipantModal,
  onEditDonorModal,
  onAddDonorModal,
  onEditExpenseModal,
  onAddExpenseModal,
}) => {
  const [subTab, setSubTab] = useState<ArchiveSubTab>('dashboard');
  const [selectedCompFilter, setSelectedCompFilter] = useState<string>('All');

  const handleViewCompParticipants = (comp: Competition) => {
    setSelectedCompFilter(comp.id);
    setSubTab('participants');
  };

  const navItems: { id: ArchiveSubTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'dashboard', label: 'Ringkasan HUT RI', icon: <Trophy className="w-4 h-4" /> },
    {
      id: 'competitions',
      label: 'Daftar Lomba',
      icon: <Award className="w-4 h-4" />,
      count: state.competitions.length,
    },
    {
      id: 'brackets',
      label: 'Bagan Turnamen',
      icon: <GitBranch className="w-4 h-4" />,
      count: (state.brackets || []).length,
    },
    {
      id: 'participants',
      label: 'Data Peserta',
      icon: <Users className="w-4 h-4" />,
      count: state.participants.length,
    },
    {
      id: 'donors',
      label: 'Donatur Kas',
      icon: <HeartHandshake className="w-4 h-4" />,
      count: state.donors.length,
    },
    {
      id: 'expenses',
      label: 'Pengeluaran',
      icon: <Receipt className="w-4 h-4" />,
      count: state.expenses.length,
    },
    { id: 'report', label: 'Laporan Kas & Cetak', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Archive Header Banner */}
      <div className="bg-gradient-to-r from-red-800 via-rose-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-red-700/80 border border-red-500/30 text-red-100 text-xs font-semibold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Dokumen & Rekam Jejak Panitia
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Arsip Semarak HUT RI Ke-81
            </h1>
            <p className="text-red-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
              Arsip lengkap rekap 37 cabang lomba, bagan turnamen 16 besar gaple, 42 peserta warga, 28 donatur dermawan, pengeluaran hadiah, dan laporan keuangan resmi 17 Agustus 2026.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => setSubTab('report')}
              className="bg-white text-red-800 hover:bg-red-50 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-red-600" />
              Buka Laporan Keuangan HUT RI
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm overflow-x-auto scrollbar-thin">
        <div className="flex items-center space-x-1 min-w-max">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                subTab === item.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    subTab === item.id ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* View Content */}
      <div className="animate-in fade-in duration-150">
        {subTab === 'dashboard' && (
          <DashboardView
            state={state}
            onNavigate={(tab) => {
              if (
                tab === 'competitions' ||
                tab === 'brackets' ||
                tab === 'participants' ||
                tab === 'donors' ||
                tab === 'expenses' ||
                tab === 'report'
              ) {
                setSubTab(tab as ArchiveSubTab);
              }
            }}
            onQuickAdd={onOpenQuickAdd}
          />
        )}

        {subTab === 'competitions' && (
          <CompetitionsView
            competitions={state.competitions}
            participants={state.participants}
            onAddCompetition={onAddCompetitionModal}
            onEditCompetition={onEditCompetitionModal}
            onDeleteCompetition={onDeleteCompetition}
            onUpdateStatus={onUpdateCompStatus}
            onViewParticipants={handleViewCompParticipants}
            onViewBracket={() => setSubTab('brackets')}
          />
        )}

        {subTab === 'brackets' && (
          <TournamentBracketView
            competitions={state.competitions}
            participants={state.participants}
            brackets={state.brackets || []}
            onSaveBracket={onSaveBracket}
            onDeleteBracket={onDeleteBracket}
            onAddParticipant={onSaveParticipant}
          />
        )}

        {subTab === 'participants' && (
          <ParticipantsView
            participants={state.participants}
            competitions={state.competitions}
            selectedCompFilter={selectedCompFilter}
            onAddParticipant={onAddParticipantModal}
            onEditParticipant={onEditParticipantModal}
            onDeleteParticipant={onDeleteParticipant}
          />
        )}

        {subTab === 'donors' && (
          <DonorsView
            donors={state.donors}
            onAddDonor={onAddDonorModal}
            onEditDonor={onEditDonorModal}
            onDeleteDonor={onDeleteDonor}
          />
        )}

        {subTab === 'expenses' && (
          <ExpensesView
            expenses={state.expenses}
            onAddExpense={onAddExpenseModal}
            onEditExpense={onEditExpenseModal}
            onDeleteExpense={onDeleteExpense}
          />
        )}

        {subTab === 'report' && (
          <FinancialReportView
            state={state}
            onImportState={() => {}}
            onResetData={onResetData}
          />
        )}
      </div>
    </div>
  );
};
