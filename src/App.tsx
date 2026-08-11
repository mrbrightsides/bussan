import React, { useState, useEffect } from 'react';
import { AppState, Competition, Participant, Donor, Expense, CompetitionStatus } from './types';
import { loadAppState, saveAppState, resetAppState } from './utils/storage';
import { subscribeToAppState, saveAppStateToFirestore } from './firebase';
import { Header } from './components/Header';
import { TabNav, TabType } from './components/TabNav';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { CompetitionsView } from './components/CompetitionsView';
import { ParticipantsView } from './components/ParticipantsView';
import { DonorsView } from './components/DonorsView';
import { ExpensesView } from './components/ExpensesView';
import { FinancialReportView } from './components/FinancialReportView';
import { CompetitionModal } from './components/CompetitionModal';
import { ParticipantModal } from './components/ParticipantModal';
import { DonorModal } from './components/DonorModal';
import { ExpenseModal } from './components/ExpenseModal';
import { QuickAddModal } from './components/QuickAddModal';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modal States
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compToEdit, setCompToEdit] = useState<Competition | null>(null);

  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [partToEdit, setPartToEdit] = useState<Participant | null>(null);
  const [defaultCompForPart, setDefaultCompForPart] = useState<string>('');

  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [donorToEdit, setDonorToEdit] = useState<Donor | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [selectedCompFilterForParticipants, setSelectedCompFilterForParticipants] = useState<string>('All');

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    const unsubscribe = subscribeToAppState((newState) => {
      setAppState(newState);
      saveAppState(newState);
    });
    return () => unsubscribe();
  }, []);

  // Helper to update state locally and persist to Firestore
  const updateAndSaveState = (updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      const nextState = updater(prev);
      saveAppStateToFirestore(nextState).catch((err) =>
        console.error('Failed to sync with Firestore:', err)
      );
      saveAppState(nextState);
      return nextState;
    });
  };

  // Financial Totals
  const totalIncome = appState.donors.reduce((sum, d) => sum + d.amount, 0);
  const totalExpense = appState.expenses.reduce((sum, e) => sum + e.amount, 0);

  // Handlers for Competition
  const handleSaveCompetition = (comp: Competition) => {
    updateAndSaveState((prev) => {
      const exists = prev.competitions.some((c) => c.id === comp.id);
      const updatedComps = exists
        ? prev.competitions.map((c) => (c.id === comp.id ? comp : c))
        : [comp, ...prev.competitions];
      return { ...prev, competitions: updatedComps };
    });
  };

  const handleDeleteCompetition = (id: string) => {
    if (window.confirm('Yakin ingin menghapus cabang lomba ini? Data peserta terkait mungkin tidak berasosiasi.')) {
      updateAndSaveState((prev) => ({
        ...prev,
        competitions: prev.competitions.filter((c) => c.id !== id),
      }));
    }
  };

  const handleUpdateCompStatus = (id: string, status: CompetitionStatus) => {
    updateAndSaveState((prev) => ({
      ...prev,
      competitions: prev.competitions.map((c) => (c.id === id ? { ...c, status } : c)),
    }));
  };

  // Handlers for Participant
  const handleSaveParticipant = (participant: Participant) => {
    updateAndSaveState((prev) => {
      const exists = prev.participants.some((p) => p.id === participant.id);
      const updatedParticipants = exists
        ? prev.participants.map((p) => (p.id === participant.id ? participant : p))
        : [participant, ...prev.participants];
      return { ...prev, participants: updatedParticipants };
    });
  };

  const handleDeleteParticipant = (id: string) => {
    if (window.confirm('Hapus pendaftaran peserta ini?')) {
      updateAndSaveState((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.id !== id),
      }));
    }
  };

  // Handlers for Donor
  const handleSaveDonor = (donor: Donor) => {
    updateAndSaveState((prev) => {
      const exists = prev.donors.some((d) => d.id === donor.id);
      const updatedDonors = exists
        ? prev.donors.map((d) => (d.id === donor.id ? donor : d))
        : [donor, ...prev.donors];
      return { ...prev, donors: updatedDonors };
    });
  };

  const handleDeleteDonor = (id: string) => {
    if (window.confirm('Hapus catatan donasi ini?')) {
      updateAndSaveState((prev) => ({
        ...prev,
        donors: prev.donors.filter((d) => d.id !== id),
      }));
    }
  };

  // Handlers for Expense
  const handleSaveExpense = (expense: Expense) => {
    updateAndSaveState((prev) => {
      const exists = prev.expenses.some((e) => e.id === expense.id);
      const updatedExpenses = exists
        ? prev.expenses.map((e) => (e.id === expense.id ? expense : e))
        : [expense, ...prev.expenses];
      return { ...prev, expenses: updatedExpenses };
    });
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Hapus catatan pengeluaran ini?')) {
      updateAndSaveState((prev) => ({
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== id),
      }));
    }
  };

  // Reset to default sample data
  const handleResetData = () => {
    if (window.confirm('Kembalikan data ke contoh awal Green Bussan Village? Semua data tambahan saat ini akan direset.')) {
      const defaultData = resetAppState();
      updateAndSaveState(() => defaultData);
    }
  };

  // Quick Action Handler
  const handleSelectQuickAction = (action: 'participant' | 'donor' | 'expense' | 'competition') => {
    if (action === 'participant') {
      setPartToEdit(null);
      setDefaultCompForPart(appState.competitions[0]?.id || '');
      setIsPartModalOpen(true);
    } else if (action === 'donor') {
      setDonorToEdit(null);
      setIsDonorModalOpen(true);
    } else if (action === 'expense') {
      setExpenseToEdit(null);
      setIsExpenseModalOpen(true);
    } else if (action === 'competition') {
      setCompToEdit(null);
      setIsCompModalOpen(true);
    }
  };

  // View participants of a specific competition
  const handleViewCompParticipants = (comp: Competition) => {
    setSelectedCompFilterForParticipants(comp.id);
    setActiveTab('participants');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased selection:bg-red-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Header */}
        <Header
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenReport={() => setActiveTab('report')}
          onResetData={handleResetData}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
        />

        {/* Desktop / Tablet Tab Navigation */}
        <TabNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          counts={{
            competitions: appState.competitions.length,
            participants: appState.participants.length,
            donors: appState.donors.length,
            expenses: appState.expenses.length,
          }}
        />

        {/* Main View Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
          {activeTab === 'dashboard' && (
            <DashboardView
              state={appState}
              onNavigate={setActiveTab}
              onQuickAdd={handleSelectQuickAction}
            />
          )}

          {activeTab === 'competitions' && (
            <CompetitionsView
              competitions={appState.competitions}
              participants={appState.participants}
              onAddCompetition={() => {
                setCompToEdit(null);
                setIsCompModalOpen(true);
              }}
              onEditCompetition={(comp) => {
                setCompToEdit(comp);
                setIsCompModalOpen(true);
              }}
              onDeleteCompetition={handleDeleteCompetition}
              onUpdateStatus={handleUpdateCompStatus}
              onViewParticipants={handleViewCompParticipants}
            />
          )}

          {activeTab === 'participants' && (
            <ParticipantsView
              participants={appState.participants}
              competitions={appState.competitions}
              selectedCompFilter={selectedCompFilterForParticipants}
              onAddParticipant={() => {
                setPartToEdit(null);
                setDefaultCompForPart('');
                setIsPartModalOpen(true);
              }}
              onEditParticipant={(part) => {
                setPartToEdit(part);
                setIsPartModalOpen(true);
              }}
              onDeleteParticipant={handleDeleteParticipant}
            />
          )}

          {activeTab === 'donors' && (
            <DonorsView
              donors={appState.donors}
              onAddDonor={() => {
                setDonorToEdit(null);
                setIsDonorModalOpen(true);
              }}
              onEditDonor={(donor) => {
                setDonorToEdit(donor);
                setIsDonorModalOpen(true);
              }}
              onDeleteDonor={handleDeleteDonor}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={appState.expenses}
              onAddExpense={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
              onEditExpense={(expense) => {
                setExpenseToEdit(expense);
                setIsExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'report' && (
            <FinancialReportView
              state={appState}
              onImportState={(newState) => setAppState(newState)}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Footer Branding */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 text-center space-y-1 mb-12 md:mb-0 print:hidden">
        <p className="font-semibold text-slate-300">
          Aplikasi Manajemen Panitia HUT RI ke-81 Komplek Green Bussan Village
        </p>
        <p className="text-[11px] text-slate-500">
          Dibuat khusus untuk transparansi lomba, data peserta, donasi warga, dan laporan kas real-time.
        </p>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelectAction={handleSelectQuickAction}
      />

      <CompetitionModal
        isOpen={isCompModalOpen}
        onClose={() => setIsCompModalOpen(false)}
        onSave={handleSaveCompetition}
        competitionToEdit={compToEdit}
      />

      <ParticipantModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        onSave={handleSaveParticipant}
        competitions={appState.competitions}
        participantToEdit={partToEdit}
        defaultCompetitionId={defaultCompForPart}
      />

      <DonorModal
        isOpen={isDonorModalOpen}
        onClose={() => setIsDonorModalOpen(false)}
        onSave={handleSaveDonor}
        donorToEdit={donorToEdit}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        expenseToEdit={expenseToEdit}
      />
    </div>
  );
}
