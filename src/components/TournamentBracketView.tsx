import React, { useState } from 'react';
import {
  Trophy,
  Shuffle,
  Users,
  Award,
  Crown,
  Medal,
  ChevronRight,
  Printer,
  Share2,
  CheckCircle,
  Plus,
  RotateCcw,
  Sparkles,
  Swords,
  TableProperties,
  Layers,
  HelpCircle,
  Clock,
  MapPin,
  Check,
  Edit3,
} from 'lucide-react';
import {
  Competition,
  Participant,
  TournamentBracket,
  BracketMatch,
  BracketTeam,
} from '../types';
import {
  generateKnockoutBracket,
  updateMatchResult,
} from '../utils/bracketGenerator';

interface TournamentBracketViewProps {
  competitions: Competition[];
  participants: Participant[];
  brackets: TournamentBracket[];
  onSaveBracket: (bracket: TournamentBracket) => void;
  onDeleteBracket: (bracketId: string) => void;
  onAddParticipant: (participant: Participant) => void;
}

export const TournamentBracketView: React.FC<TournamentBracketViewProps> = ({
  competitions,
  participants,
  brackets,
  onSaveBracket,
  onDeleteBracket,
  onAddParticipant,
}) => {
  // Find default competition: preference to Lomba Gaple or first competition
  const defaultComp =
    competitions.find((c) => c.name.toLowerCase().includes('gaple')) ||
    competitions[0];

  const [selectedCompId, setSelectedCompId] = useState<string>(
    defaultComp?.id || ''
  );
  const [format, setFormat] = useState<'2v2' | '1v1'>('2v2');
  const [viewMode, setViewMode] = useState<'bracket' | 'list'>('bracket');

  // Quick Add Participant modal state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantHouse, setNewParticipantHouse] = useState('');

  // Match score edit modal
  const [editingMatch, setEditingMatch] = useState<BracketMatch | null>(null);
  const [score1Input, setScore1Input] = useState('');
  const [score2Input, setScore2Input] = useState('');
  const [matchNotesInput, setMatchNotesInput] = useState('');

  // Toast / copy feedback
  const [copiedNotification, setCopiedNotification] = useState(false);

  const currentComp = competitions.find((c) => c.id === selectedCompId);
  const currentParticipants = participants.filter(
    (p) => p.competitionId === selectedCompId
  );

  // Find existing bracket for this competition
  const currentBracket = brackets.find(
    (b) => b.competitionId === selectedCompId
  );

  // Handle Generating / Re-shuffling Bracket
  const handleGenerateBracket = () => {
    if (!currentComp) return;

    if (currentParticipants.length < 2) {
      alert(
        'Minimal butuh 2 peserta terdaftar untuk membuat bagan pertandingan!'
      );
      return;
    }

    if (format === '2v2' && currentParticipants.length < 4) {
      if (
        !window.confirm(
          `Peserta saat ini ada ${currentParticipants.length} orang (untuk 2 vs 2 disarankan kelipatan 4 atau minimal 4 orang). Tetap lanjutkan?`
        )
      ) {
        return;
      }
    }

    if (currentBracket) {
      if (
        !window.confirm(
          'Bagan untuk lomba ini sudah ada. Apakah Anda yakin ingin MENGACAK ULANG pasangan & bagan baru? Hasil skor saat ini akan direset.'
        )
      ) {
        return;
      }
    }

    const newBracket = generateKnockoutBracket(
      currentComp,
      currentParticipants,
      format
    );
    onSaveBracket(newBracket);
  };

  // Handle Quick Winner Selection
  const handleSelectWinner = (match: BracketMatch, winnerTeamId: string) => {
    if (!currentBracket) return;
    const isClearing = match.winnerTeamId === winnerTeamId;
    const newWinnerId = isClearing ? null : winnerTeamId;

    const updated = updateMatchResult(
      currentBracket,
      match.id,
      newWinnerId,
      match.score1,
      match.score2,
      match.notes
    );
    onSaveBracket(updated);
  };

  // Handle Save Detailed Match Score
  const handleSaveMatchScore = () => {
    if (!currentBracket || !editingMatch) return;

    let winnerId = editingMatch.winnerTeamId;
    const s1 = parseInt(score1Input, 10);
    const s2 = parseInt(score2Input, 10);

    if (!isNaN(s1) && !isNaN(s2)) {
      if (s1 > s2 && editingMatch.team1) winnerId = editingMatch.team1.id;
      else if (s2 > s1 && editingMatch.team2) winnerId = editingMatch.team2.id;
    }

    const updated = updateMatchResult(
      currentBracket,
      editingMatch.id,
      winnerId,
      score1Input,
      score2Input,
      matchNotesInput
    );
    onSaveBracket(updated);
    setEditingMatch(null);
  };

  // Handle Quick Add Participant directly on this view
  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim() || !selectedCompId || !currentComp) return;

    const newPart: Participant = {
      id: `part-${Date.now()}`,
      name: newParticipantName.trim(),
      houseNo: newParticipantHouse.trim() || '-',
      rt: 'RT 01',
      ageGroup: currentComp.category,
      competitionId: selectedCompId,
      registeredAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };

    onAddParticipant(newPart);
    setNewParticipantName('');
    setNewParticipantHouse('');
    setShowQuickAdd(false);
  };

  // Handle Copy to WhatsApp
  const handleCopyWhatsApp = () => {
    if (!currentBracket || !currentComp) return;

    let text = `🏆 *BAGAN TURNAMEN ${currentComp.name.toUpperCase()}*\n`;
    text += `Komplek Perumahan Green Bussan Village\n`;
    text += `Format: ${currentBracket.format === '2v2' ? '2 vs 2 (Ganda/Berpasangan)' : '1 vs 1 (Tunggal)'}\n`;
    text += `Total Tim: ${currentBracket.teams.length} Tim (${currentParticipants.length} Peserta)\n\n`;

    if (currentBracket.championTeamId) {
      const champion = currentBracket.teams.find(
        (t) => t.id === currentBracket.championTeamId
      );
      const runnerUp = currentBracket.teams.find(
        (t) => t.id === currentBracket.runnerUpTeamId
      );
      const third = currentBracket.teams.find(
        (t) => t.id === currentBracket.thirdPlaceTeamId
      );

      text += `🎖️ *HASIL AKHIR JUARA:*\n`;
      if (champion) text += `🥇 *JUARA 1:* ${champion.name}\n`;
      if (runnerUp) text += `🥈 *JUARA 2:* ${runnerUp.name}\n`;
      if (third) text += `🥉 *JUARA 3:* ${third.name}\n\n`;
    }

    text += `📋 *SUSUNAN PERTANDINGAN:*\n`;

    // Group matches by round
    for (let r = 0; r < currentBracket.totalRounds; r++) {
      const roundMatches = currentBracket.matches.filter(
        (m) => m.roundIndex === r && !m.isThirdPlaceMatch
      );
      if (roundMatches.length > 0) {
        text += `\n*${roundMatches[0].roundName.toUpperCase()}:*\n`;
        roundMatches.forEach((m, idx) => {
          const t1 = m.team1 ? m.team1.name : 'TBD';
          const t2 = m.team2 ? m.team2.name : 'TBD';
          const score = m.score1 || m.score2 ? ` [${m.score1 || 0} - ${m.score2 || 0}]` : '';
          const winner = m.winnerTeamId
            ? ` 👉 Pemenang: *${m.team1?.id === m.winnerTeamId ? m.team1.name : m.team2?.name}*`
            : '';
          text += `${idx + 1}. ${t1} VS ${t2}${score}${winner}\n`;
        });
      }
    }

    const thirdMatch = currentBracket.matches.find((m) => m.isThirdPlaceMatch);
    if (thirdMatch && (thirdMatch.team1 || thirdMatch.team2)) {
      text += `\n*PEREBUTAN JUARA 3:*\n`;
      const t1 = thirdMatch.team1 ? thirdMatch.team1.name : 'TBD';
      const t2 = thirdMatch.team2 ? thirdMatch.team2.name : 'TBD';
      const winner = thirdMatch.winnerTeamId
        ? ` 👉 Pemenang: *${thirdMatch.team1?.id === thirdMatch.winnerTeamId ? thirdMatch.team1.name : thirdMatch.team2?.name}*`
        : '';
      text += `1. ${t1} VS ${t2}${winner}\n`;
    }

    text += `\n_Diperbarui secara real-time melalui Panitia 17an Green Bussan_`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Find Champion info if available
  const championTeam = currentBracket?.teams.find(
    (t) => t.id === currentBracket.championTeamId
  );
  const runnerUpTeam = currentBracket?.teams.find(
    (t) => t.id === currentBracket.runnerUpTeamId
  );
  const thirdPlaceTeam = currentBracket?.teams.find(
    (t) => t.id === currentBracket.thirdPlaceTeamId
  );

  return (
    <div className="space-y-5 pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-700">
                Sistem Gugur (Knockout)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800">
                Acak Pasangan 2 vs 2 & Bagan
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Swords className="w-6 h-6 text-red-600" /> Bagan Pertandingan & Turnamen
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pengocokan otomatis pasangan ganda/tunggal, bagan gugur, dan live skor pertandingan.
            </p>
          </div>

          {/* Select Competition & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-red-600 shrink-0" />
              <select
                value={selectedCompId}
                onChange={(e) => setSelectedCompId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer max-w-[200px] truncate"
              >
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-1 flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFormat('2v2')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  format === '2v2'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format Ganda: 2 orang per tim (Cocok untuk Gaple/Remi/Bulu Tangkis Ganda)"
              >
                2 vs 2 (Ganda)
              </button>
              <button
                type="button"
                onClick={() => setFormat('1v1')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  format === '1v1'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format Tunggal: 1 orang per tim"
              >
                1 vs 1 (Tunggal)
              </button>
            </div>
          </div>
        </div>

        {/* Competition Summary Bar */}
        {currentComp && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-slate-600">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-red-600" />
                {currentParticipants.length} Peserta Terdaftar
              </span>
              <span className="text-slate-300">•</span>
              <span>
                {format === '2v2'
                  ? `Est. ${Math.ceil(currentParticipants.length / 2)} Tim Pasangan`
                  : `${currentParticipants.length} Tim Tunggal`}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                Lokasi: {currentComp.location}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuickAdd(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Peserta On-The-Spot
              </button>

              <button
                onClick={handleGenerateBracket}
                className="px-4 py-1.5 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Shuffle className="w-4 h-4" />
                <span>{currentBracket ? 'Acak Ulang Pasangan & Bagan' : 'Acak Pasangan & Susun Bagan'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Podium Champion Showcase if Champion Exists */}
      {championTeam && (
        <div className="bg-linear-to-r from-amber-500 via-orange-500 to-red-600 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/30 border-2 border-amber-300 flex items-center justify-center shrink-0 shadow-lg">
                <Crown className="w-10 h-10 text-amber-200 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-black text-xs uppercase tracking-wider">
                    Turnamen Selesai
                  </span>
                  <span className="text-amber-200 text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Selamat Kepada Pemenang!
                  </span>
                </div>
                <h3 className="text-2xl font-black mt-1 leading-tight text-white drop-shadow-sm">
                  {championTeam.name}
                </h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  Anggota: {championTeam.members.join(' & ')} ({championTeam.houseNos?.join(', ') || ''})
                </p>
              </div>
            </div>

            {/* Podium Rank Cards */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-center">
              {/* Runner Up */}
              {runnerUpTeam && (
                <div className="bg-white/15 backdrop-blur-xs border border-white/20 px-3 py-2 rounded-2xl text-center min-w-[110px]">
                  <div className="text-lg">🥈</div>
                  <div className="text-[10px] font-black uppercase text-amber-200">Juara 2</div>
                  <div className="text-xs font-bold truncate max-w-[120px]">{runnerUpTeam.name}</div>
                </div>
              )}

              {/* Champion */}
              <div className="bg-white/25 backdrop-blur-md border-2 border-amber-300 px-4 py-2.5 rounded-2xl text-center min-w-[130px] shadow-lg">
                <div className="text-2xl">🥇</div>
                <div className="text-xs font-black uppercase text-amber-200">JUARA 1</div>
                <div className="text-xs font-extrabold truncate max-w-[140px]">{championTeam.name}</div>
              </div>

              {/* 3rd Place */}
              {thirdPlaceTeam && (
                <div className="bg-white/15 backdrop-blur-xs border border-white/20 px-3 py-2 rounded-2xl text-center min-w-[110px]">
                  <div className="text-lg">🥉</div>
                  <div className="text-[10px] font-black uppercase text-amber-200">Juara 3</div>
                  <div className="text-xs font-bold truncate max-w-[120px]">{thirdPlaceTeam.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Bracket Content or Empty State */}
      {!currentBracket ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <Shuffle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Bagan {currentComp?.name || 'Lomba'} Belum Dibuat
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Klik tombol di bawah untuk mengacak pasangan dan menyusun bagan sistem gugur otomatis berdasarkan {currentParticipants.length} peserta yang sudah terdaftar.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleGenerateBracket}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-extrabold shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              <span>Acak Pasangan & Buat Bagan Sekarang</span>
            </button>
            <button
              onClick={() => setShowQuickAdd(true)}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Peserta Dahulu
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sub Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setViewMode('bracket')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'bracket'
                    ? 'bg-white text-red-600 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Bagan Pohon (Tree)</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-red-600 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>Daftar Meja & Babak</span>
              </button>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyWhatsApp}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                title="Salin bagan pertandingan dalam format WhatsApp"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Salin Info WA</span>
                  </>
                )}
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cetak Bagan</span>
              </button>

              <button
                onClick={handleGenerateBracket}
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-200"
                title="Acak Ulang Bagan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Instructions banner */}
          <div className="bg-amber-50/70 border border-amber-200/70 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Petunjuk Panitia:</strong> Cukup <strong>klik pada nama tim</strong> yang menang di kotak pertandingan untuk meloloskannya otomatis ke babak berikutnya!
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 shrink-0 hidden md:inline">
              ⚡ Real-time Firestore Active
            </span>
          </div>

          {/* View 1: Interactive Visual Bracket Tree */}
          {viewMode === 'bracket' && (
            <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl shadow-xl overflow-x-auto border border-slate-800">
              <div className="min-w-[760px] pb-4">
                {/* Round Headers */}
                <div
                  className="grid gap-6 mb-6"
                  style={{
                    gridTemplateColumns: `repeat(${currentBracket.totalRounds}, minmax(240px, 1fr))`,
                  }}
                >
                  {Array.from({ length: currentBracket.totalRounds }).map(
                    (_, rIdx) => {
                      const roundMatches = currentBracket.matches.filter(
                        (m) => m.roundIndex === rIdx && !m.isThirdPlaceMatch
                      );
                      const roundName =
                        roundMatches[0]?.roundName || `Ronde ${rIdx + 1}`;
                      const isFinal = rIdx === currentBracket.totalRounds - 1;

                      return (
                        <div
                          key={rIdx}
                          className={`p-3 rounded-2xl text-center border ${
                            isFinal
                              ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                              : 'bg-slate-800/80 border-slate-700/80 text-slate-200'
                          }`}
                        >
                          <div className="text-[11px] font-extrabold uppercase tracking-wider">
                            {roundName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {roundMatches.length} Pertandingan
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Bracket Columns */}
                <div
                  className="grid gap-6 items-stretch"
                  style={{
                    gridTemplateColumns: `repeat(${currentBracket.totalRounds}, minmax(240px, 1fr))`,
                  }}
                >
                  {Array.from({ length: currentBracket.totalRounds }).map(
                    (_, rIdx) => {
                      const roundMatches = currentBracket.matches.filter(
                        (m) => m.roundIndex === rIdx && !m.isThirdPlaceMatch
                      );

                      return (
                        <div
                          key={rIdx}
                          className="flex flex-col justify-around gap-6 py-2"
                        >
                          {roundMatches.map((match, mIdx) => {
                            const isCompleted = !!match.winnerTeamId;

                            return (
                              <div
                                key={match.id}
                                className={`rounded-2xl border transition-all relative ${
                                  isCompleted
                                    ? 'bg-slate-800 border-slate-700 shadow-md'
                                    : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-500'
                                }`}
                              >
                                {/* Match Header Bar */}
                                <div className="px-3 py-1.5 border-b border-slate-700/70 flex items-center justify-between text-[10px] text-slate-400 font-semibold bg-slate-800/90 rounded-t-2xl">
                                  <span>
                                    {match.tableNumber
                                      ? `Meja ${match.tableNumber}`
                                      : `Match #${mIdx + 1}`}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    {match.notes && (
                                      <span className="text-amber-400 text-[9px] truncate max-w-[90px]">
                                        {match.notes}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => {
                                        setEditingMatch(match);
                                        setScore1Input(String(match.score1 || ''));
                                        setScore2Input(String(match.score2 || ''));
                                        setMatchNotesInput(match.notes || '');
                                      }}
                                      title="Edit Skor & Catatan Match"
                                      className="p-1 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Team 1 Slot */}
                                <div
                                  onClick={() =>
                                    match.team1 &&
                                    handleSelectWinner(match, match.team1.id)
                                  }
                                  className={`p-3 cursor-pointer transition-all flex items-center justify-between gap-2 ${
                                    match.winnerTeamId === match.team1?.id
                                      ? 'bg-emerald-950/80 text-emerald-300 font-bold border-l-4 border-emerald-400'
                                      : match.team1
                                      ? 'hover:bg-slate-700/60 text-slate-200'
                                      : 'text-slate-500 italic'
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-extrabold truncate flex items-center gap-1.5">
                                      {match.winnerTeamId === match.team1?.id && (
                                        <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      )}
                                      <span>
                                        {match.team1
                                          ? match.team1.name
                                          : 'Menunggu Pemenang...'}
                                      </span>
                                    </div>
                                    {match.team1 && (
                                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                        {match.team1.houseNos?.join(' • ')}
                                      </div>
                                    )}
                                  </div>

                                  {/* Score / Winner Button */}
                                  <div className="shrink-0 flex items-center gap-1">
                                    {match.score1 !== undefined &&
                                      match.score1 !== '' && (
                                        <span className="px-1.5 py-0.5 bg-slate-900 rounded text-xs font-mono font-bold text-amber-300">
                                          {match.score1}
                                        </span>
                                      )}
                                    {match.winnerTeamId === match.team1?.id && (
                                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    )}
                                  </div>
                                </div>

                                {/* VS Divider */}
                                <div className="border-t border-slate-700/60 relative">
                                  <span className="absolute left-1/2 -top-2 -translate-x-1/2 px-2 py-0.2 bg-slate-900 text-slate-400 text-[9px] font-black rounded-full uppercase border border-slate-700">
                                    VS
                                  </span>
                                </div>

                                {/* Team 2 Slot */}
                                <div
                                  onClick={() =>
                                    match.team2 &&
                                    handleSelectWinner(match, match.team2.id)
                                  }
                                  className={`p-3 cursor-pointer transition-all flex items-center justify-between gap-2 rounded-b-2xl ${
                                    match.winnerTeamId === match.team2?.id
                                      ? 'bg-emerald-950/80 text-emerald-300 font-bold border-l-4 border-emerald-400'
                                      : match.team2
                                      ? 'hover:bg-slate-700/60 text-slate-200'
                                      : 'text-slate-500 italic'
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-extrabold truncate flex items-center gap-1.5">
                                      {match.winnerTeamId === match.team2?.id && (
                                        <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      )}
                                      <span>
                                        {match.team2
                                          ? match.team2.name
                                          : 'Menunggu Pemenang...'}
                                      </span>
                                    </div>
                                    {match.team2 && (
                                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                        {match.team2.houseNos?.join(' • ')}
                                      </div>
                                    )}
                                  </div>

                                  {/* Score / Winner Button */}
                                  <div className="shrink-0 flex items-center gap-1">
                                    {match.score2 !== undefined &&
                                      match.score2 !== '' && (
                                        <span className="px-1.5 py-0.5 bg-slate-900 rounded text-xs font-mono font-bold text-amber-300">
                                          {match.score2}
                                        </span>
                                      )}
                                    {match.winnerTeamId === match.team2?.id && (
                                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                  )}
                </div>

                {/* 3rd Place Match Section */}
                {(() => {
                  const thirdMatch = currentBracket.matches.find(
                    (m) => m.isThirdPlaceMatch
                  );
                  if (!thirdMatch) return null;

                  return (
                    <div className="mt-8 pt-6 border-t border-slate-800 max-w-md mx-auto">
                      <div className="text-center mb-3">
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                          <Medal className="w-3.5 h-3.5" /> Perebutan Juara 3 (3rd Place Match)
                        </span>
                      </div>

                      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                        {/* Team 1 */}
                        <div
                          onClick={() =>
                            thirdMatch.team1 &&
                            handleSelectWinner(thirdMatch, thirdMatch.team1.id)
                          }
                          className={`p-3 cursor-pointer flex items-center justify-between ${
                            thirdMatch.winnerTeamId === thirdMatch.team1?.id
                              ? 'bg-amber-950/80 text-amber-300 font-bold border-l-4 border-amber-400'
                              : 'text-slate-200 hover:bg-slate-700/60'
                          }`}
                        >
                          <span className="text-xs font-bold truncate">
                            {thirdMatch.team1?.name || 'Kalah Semifinal 1'}
                          </span>
                          {thirdMatch.winnerTeamId === thirdMatch.team1?.id && (
                            <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1">
                              🥉 Juara 3
                            </span>
                          )}
                        </div>

                        <div className="border-t border-slate-700 text-center py-0.5 bg-slate-900 text-[9px] text-slate-400 font-bold">
                          VS
                        </div>

                        {/* Team 2 */}
                        <div
                          onClick={() =>
                            thirdMatch.team2 &&
                            handleSelectWinner(thirdMatch, thirdMatch.team2.id)
                          }
                          className={`p-3 cursor-pointer flex items-center justify-between ${
                            thirdMatch.winnerTeamId === thirdMatch.team2?.id
                              ? 'bg-amber-950/80 text-amber-300 font-bold border-l-4 border-amber-400'
                              : 'text-slate-200 hover:bg-slate-700/60'
                          }`}
                        >
                          <span className="text-xs font-bold truncate">
                            {thirdMatch.team2?.name || 'Kalah Semifinal 2'}
                          </span>
                          {thirdMatch.winnerTeamId === thirdMatch.team2?.id && (
                            <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1">
                              🥉 Juara 3
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* View 2: List / Table View of all Matches */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                {currentBracket.matches.map((match, idx) => {
                  const winner = match.winnerTeamId
                    ? match.team1?.id === match.winnerTeamId
                      ? match.team1
                      : match.team2
                    : null;

                  return (
                    <div
                      key={match.id}
                      className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 font-black text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-800">
                              {match.roundName}
                            </span>
                            {match.tableNumber && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                                Meja {match.tableNumber}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-2">
                            <span
                              className={
                                match.winnerTeamId === match.team1?.id
                                  ? 'text-emerald-700 font-extrabold'
                                  : ''
                              }
                            >
                              {match.team1?.name || 'TBD'}
                            </span>
                            <span className="text-xs font-black text-slate-400">
                              VS
                            </span>
                            <span
                              className={
                                match.winnerTeamId === match.team2?.id
                                  ? 'text-emerald-700 font-extrabold'
                                  : ''
                              }
                            >
                              {match.team2?.name || 'TBD'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Match Status & Action */}
                      <div className="flex items-center gap-3 self-end md:self-auto">
                        {winner ? (
                          <div className="text-right">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Pemenang:{' '}
                              {winner.name}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                            Belum Selesai
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setEditingMatch(match);
                            setScore1Input(String(match.score1 || ''));
                            setScore2Input(String(match.score2 || ''));
                            setMatchNotesInput(match.notes || '');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Set Skor
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Registered Teams Roster */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" /> Daftar {currentBracket.teams.length} Pasangan / Tim yang Terbentuk
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {currentBracket.teams.map((team, idx) => (
                <div
                  key={team.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 block truncate">
                      {team.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {team.houseNos?.join(' • ') || '-'}
                    </span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick Add Participant */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-600" /> Tambah Peserta Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Tambahkan warga yang mendaftar langsung untuk cabang lomba{' '}
              <strong>{currentComp?.name}</strong>.
            </p>

            <form onSubmit={handleQuickAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Warga / Peserta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pak Joko"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Rumah / Blok
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Blok A2 No. 08"
                  value={newParticipantHouse}
                  onChange={(e) => setNewParticipantHouse(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm"
                >
                  Simpan & Daftarkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Match Score & Notes */}
      {editingMatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-red-600" /> Detail Pertandingan
              </h3>
              <button
                type="button"
                onClick={() => setEditingMatch(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {editingMatch.roundName} - Masukkan skor akhir dan catatan pertandingan (misal: Balak 6, Gaple Seri).
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                    {editingMatch.team1?.name || 'Tim 1'}
                  </label>
                  <input
                    type="number"
                    placeholder="Skor Tim 1"
                    value={score1Input}
                    onChange={(e) => setScore1Input(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-center text-sm font-mono font-bold focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                    {editingMatch.team2?.name || 'Tim 2'}
                  </label>
                  <input
                    type="number"
                    placeholder="Skor Tim 2"
                    value={score2Input}
                    onChange={(e) => setScore2Input(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-center text-sm font-mono font-bold focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Menang Balak 6 / Rubber Set"
                  value={matchNotesInput}
                  onChange={(e) => setMatchNotesInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveMatchScore}
                  className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm"
                >
                  Simpan Skor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
