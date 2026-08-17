import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import {
  AppState,
  CommunityPost,
  CommunityEvent,
  MediaItem,
  EmergencyContact,
  MarketplaceItem,
  RTCashItem,
  Competition,
  Participant,
  Donor,
  Expense,
  CompetitionStatus,
  TournamentBracket,
} from './types';
import { loadAppState, saveAppState, resetAppState } from './utils/storage';
import { sampleDemoPosts, sampleDemoMedia, sampleDemoMarketplace, sampleDemoEvents, initialAppData } from './data/initialData';
import { subscribeToAppState, saveAppStateToFirestore } from './firebase';
import { Header } from './components/Header';
import { TabNav, TabType } from './components/TabNav';
import { MobileNav } from './components/MobileNav';

// Community Views
import { CommunityFeedView } from './components/CommunityFeedView';
import { MediaGalleryView } from './components/MediaGalleryView';
import { EventsView } from './components/EventsView';
import { EmergencyDirectoryView } from './components/EmergencyDirectoryView';
import { MarketplaceView } from './components/MarketplaceView';
import { RTCashView } from './components/RTCashView';
import { AugustArchiveView } from './components/AugustArchiveView';

// Modals for 17an
import { CompetitionModal } from './components/CompetitionModal';
import { ParticipantModal } from './components/ParticipantModal';
import { DonorModal } from './components/DonorModal';
import { ExpenseModal } from './components/ExpenseModal';
import { QuickAddModal } from './components/QuickAddModal';
import { PostModal } from './components/PostModal';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<TabType>('feed');

  // Fast Action Post Modal
  const [isHeaderPostOpen, setIsHeaderPostOpen] = useState(false);

  // 17an Modals
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

  // ==================== COMMUNITY POSTS HANDLERS ====================
  const handleSavePost = (post: CommunityPost) => {
    updateAndSaveState((prev) => {
      const posts = prev.posts || [];
      const exists = posts.some((p) => p.id === post.id);
      const updated = exists ? posts.map((p) => (p.id === post.id ? post : p)) : [post, ...posts];
      return { ...prev, posts: updated };
    });
  };

  const handleDeletePost = (id: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      posts: (prev.posts || []).filter((p) => p.id !== id),
    }));
  };

  const handleLikePost = (id: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      posts: (prev.posts || []).map((p) => (p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p)),
    }));
  };

  const handleClearAllPosts = () => {
    updateAndSaveState((prev) => ({
      ...prev,
      posts: [],
    }));
  };

  const handleResetDemoPosts = () => {
    updateAndSaveState((prev) => ({
      ...prev,
      posts: sampleDemoPosts,
    }));
  };

  // ==================== MEDIA GALLERY HANDLERS ====================
  const handleSaveMedia = (item: MediaItem) => {
    updateAndSaveState((prev) => {
      const list = prev.mediaGallery || [];
      const exists = list.some((m) => m.id === item.id);
      const updated = exists ? list.map((m) => (m.id === item.id ? item : m)) : [item, ...list];
      return { ...prev, mediaGallery: updated };
    });
  };

  const handleDeleteMedia = (id: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      mediaGallery: (prev.mediaGallery || []).filter((m) => m.id !== id),
    }));
  };

  const handleClearAllMedia = () => {
    updateAndSaveState((prev) => ({
      ...prev,
      mediaGallery: [],
    }));
  };

  const handleResetDemoMedia = () => {
    updateAndSaveState((prev) => ({
      ...prev,
      mediaGallery: sampleDemoMedia,
    }));
  };

  const handleLikeMedia = (id: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      mediaGallery: (prev.mediaGallery || []).map((m) =>
        m.id === id ? { ...m, likes: (m.likes || 0) + 1 } : m
      ),
    }));
  };

  // ==================== COMMUNITY EVENTS HANDLERS ====================
  const handleSaveEvent = (event: CommunityEvent) => {
    updateAndSaveState((prev) => {
      const list = prev.events || [];
      const exists = list.some((e) => e.id === event.id);
      const updated = exists ? list.map((e) => (e.id === event.id ? event : e)) : [event, ...list];
      return { ...prev, events: updated };
    });
  };

  const handleDeleteEvent = (id: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      events: (prev.events || []).filter((e) => e.id !== id),
    }));
  };

  const handleClearAllEvents = () => {
    updateAndSaveState((prev) => ({
      ...prev,
      events: [],
    }));
  };

  const handleResetDemoEvents = () => {
    updateAndSaveState((prev) => ({
      ...prev,
      events: sampleDemoEvents,
    }));
  };

  // ==================== EMERGENCY CONTACTS HANDLERS ====================
  const handleSaveContact = (contact: EmergencyContact) => {
    updateAndSaveState((prev) => {
      const list = prev.emergencyContacts || [];
      const exists = list.some((c) => c.id === contact.id);
      const updated = exists ? list.map((c) => (c.id === contact.id ? contact : c)) : [contact, ...list];
      return { ...prev, emergencyContacts: updated };
    });
  };

  const handleDeleteContact = (id: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      emergencyContacts: (prev.emergencyContacts || []).filter((c) => c.id !== id),
    }));
  };

  // ==================== MARKETPLACE HANDLERS ====================
  const handleSaveMarketplaceItem = (item: MarketplaceItem) => {
    updateAndSaveState((prev) => {
      const list = prev.marketplace || [];
      const exists = list.some((m) => m.id === item.id);
      const updated = exists ? list.map((m) => (m.id === item.id ? item : m)) : [item, ...list];
      return { ...prev, marketplace: updated };
    });
  };

  const handleDeleteMarketplaceItem = (id: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      marketplace: (prev.marketplace || []).filter((m) => m.id !== id),
    }));
  };

  const handleClearAllMarketplace = () => {
    updateAndSaveState((prev) => ({
      ...prev,
      marketplace: [],
    }));
  };

  const handleResetDemoMarketplace = () => {
    updateAndSaveState((prev) => ({
      ...prev,
      marketplace: sampleDemoMarketplace,
    }));
  };

  // ==================== RT CASH HANDLERS ====================
  const handleSaveRTCashItem = (item: RTCashItem) => {
    updateAndSaveState((prev) => {
      const list = prev.rtCash || [];
      const exists = list.some((c) => c.id === item.id);
      const updated = exists ? list.map((c) => (c.id === item.id ? item : c)) : [item, ...list];
      return { ...prev, rtCash: updated };
    });
  };

  const handleDeleteRTCashItem = (id: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      rtCash: (prev.rtCash || []).filter((c) => c.id !== id),
    }));
  };

  const handleResetRTCashToOfficial = () => {
    updateAndSaveState((prev) => ({
      ...prev,
      rtCash: initialAppData.rtCash || [],
      monthlyFees: initialAppData.monthlyFees || [],
    }));
  };

  // ==================== 17AN HUT RI HANDLERS ====================
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
    updateAndSaveState((prev) => ({
      ...prev,
      competitions: prev.competitions.filter((c) => c.id !== id),
    }));
  };

  const handleUpdateCompStatus = (id: string, status: CompetitionStatus) => {
    updateAndSaveState((prev) => ({
      ...prev,
      competitions: prev.competitions.map((c) => (c.id === id ? { ...c, status } : c)),
    }));
  };

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

  const handleSaveBracket = (bracket: TournamentBracket) => {
    updateAndSaveState((prev) => {
      const existingBrackets = prev.brackets || [];
      const index = existingBrackets.findIndex(
        (b) => b.id === bracket.id || b.competitionId === bracket.competitionId
      );
      let newBrackets: TournamentBracket[];
      if (index >= 0) {
        newBrackets = existingBrackets.map((b, i) => (i === index ? bracket : b));
      } else {
        newBrackets = [bracket, ...existingBrackets];
      }
      return { ...prev, brackets: newBrackets };
    });
  };

  const handleDeleteBracket = (bracketId: string) => {
    if (window.confirm('Hapus bagan turnamen ini?')) {
      updateAndSaveState((prev) => ({
        ...prev,
        brackets: (prev.brackets || []).filter((b) => b.id !== bracketId),
      }));
    }
  };

  const handleResetData = () => {
    if (window.confirm('Kembalikan data ke contoh awal Green Bussan Village? Semua data tambahan saat ini akan direset.')) {
      const defaultData = resetAppState();
      updateAndSaveState(() => defaultData);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased selection:bg-emerald-600 selection:text-white flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <Header
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenEmergency={() => setActiveTab('emergency')}
          onOpenPost={() => setIsHeaderPostOpen(true)}
        />

        {/* Desktop / Tablet Tab Navigation */}
        <TabNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          counts={{
            posts: (appState.posts || []).length,
            media: (appState.mediaGallery || []).length,
            events: (appState.events || []).length,
            contacts: (appState.emergencyContacts || []).length,
            market: (appState.marketplace || []).length,
            rtCash: (appState.rtCash || []).length,
          }}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
          {activeTab === 'feed' && (
            <CommunityFeedView
              posts={appState.posts || []}
              events={appState.events || []}
              emergencyContacts={appState.emergencyContacts || []}
              rtCash={appState.rtCash || []}
              onSavePost={handleSavePost}
              onDeletePost={handleDeletePost}
              onLikePost={handleLikePost}
              onClearAllPosts={handleClearAllPosts}
              onResetDemoPosts={handleResetDemoPosts}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'gallery' && (
            <MediaGalleryView
              mediaList={appState.mediaGallery || []}
              onSaveMedia={handleSaveMedia}
              onDeleteMedia={handleDeleteMedia}
              onLikeMedia={handleLikeMedia}
              onClearAllMedia={handleClearAllMedia}
              onResetDemoMedia={handleResetDemoMedia}
            />
          )}

          {activeTab === 'events' && (
            <EventsView
              events={appState.events || []}
              onSaveEvent={handleSaveEvent}
              onDeleteEvent={handleDeleteEvent}
              onClearAllEvents={handleClearAllEvents}
              onResetDemoEvents={handleResetDemoEvents}
            />
          )}

          {activeTab === 'emergency' && (
            <EmergencyDirectoryView
              contacts={appState.emergencyContacts || []}
              onSaveContact={handleSaveContact}
              onDeleteContact={handleDeleteContact}
            />
          )}

          {activeTab === 'market' && (
            <MarketplaceView
              items={appState.marketplace || []}
              onSaveItem={handleSaveMarketplaceItem}
              onDeleteItem={handleDeleteMarketplaceItem}
              onClearAllItems={handleClearAllMarketplace}
              onResetDemoItems={handleResetDemoMarketplace}
            />
          )}

          {activeTab === 'rtCash' && (
            <RTCashView
              rtCash={appState.rtCash || []}
              monthlyFees={appState.monthlyFees}
              onSaveCashItem={handleSaveRTCashItem}
              onDeleteCashItem={handleDeleteRTCashItem}
              onResetOfficialRTCash={handleResetRTCashToOfficial}
            />
          )}

          {activeTab === 'archive' && (
            <AugustArchiveView
              state={appState}
              onSaveCompetition={handleSaveCompetition}
              onDeleteCompetition={handleDeleteCompetition}
              onUpdateCompStatus={handleUpdateCompStatus}
              onSaveParticipant={handleSaveParticipant}
              onDeleteParticipant={handleDeleteParticipant}
              onSaveDonor={handleSaveDonor}
              onDeleteDonor={handleDeleteDonor}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
              onSaveBracket={handleSaveBracket}
              onDeleteBracket={handleDeleteBracket}
              onResetData={handleResetData}
              onOpenQuickAdd={handleSelectQuickAction}
              onEditCompetitionModal={(c) => {
                setCompToEdit(c);
                setIsCompModalOpen(true);
              }}
              onAddCompetitionModal={() => {
                setCompToEdit(null);
                setIsCompModalOpen(true);
              }}
              onEditParticipantModal={(p) => {
                setPartToEdit(p);
                setIsPartModalOpen(true);
              }}
              onAddParticipantModal={() => {
                setPartToEdit(null);
                setDefaultCompForPart('');
                setIsPartModalOpen(true);
              }}
              onEditDonorModal={(d) => {
                setDonorToEdit(d);
                setIsDonorModalOpen(true);
              }}
              onAddDonorModal={() => {
                setDonorToEdit(null);
                setIsDonorModalOpen(true);
              }}
              onEditExpenseModal={(e) => {
                setExpenseToEdit(e);
                setIsExpenseModalOpen(true);
              }}
              onAddExpenseModal={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 text-center space-y-1.5 mb-14 md:mb-0 print:hidden">
        <p className="font-semibold text-slate-300">
          Portal Informasi & Komunikasi Warga Green Bussan Village
        </p>
        <p className="text-[11px] text-slate-500">
          RT 22 · Kelurahan Sukamaju, Sako · Palembang, Sumatera Selatan
        </p>
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline-block animate-pulse" /> by <span className="text-slate-200 font-semibold">Khudri (Blok D3)</span>
        </p>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Header Quick Post Modal */}
      <PostModal
        isOpen={isHeaderPostOpen}
        onClose={() => setIsHeaderPostOpen(false)}
        onSave={handleSavePost}
      />

      {/* 17an Quick Action Modal */}
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
