export type AgeCategory = 'Anak-anak' | 'Remaja' | 'Dewasa' | 'Bapak-bapak' | 'Ibu-ibu' | 'Umum';

export type CompetitionStatus = 'Akan Datang' | 'Berlangsung' | 'Selesai';

export interface Competition {
  id: string;
  name: string;
  category: AgeCategory;
  date: string; // e.g., "17 Agustus 2026"
  time: string; // e.g., "08:00 WIB"
  location: string; // e.g., "Lapangan Utama Green Bussan"
  pic: string; // Penanggung Jawab
  maxParticipants?: number;
  description: string;
  status: CompetitionStatus;
  prizes?: string; // e.g., "Juara 1: Rp 300.000 + Tropi"
}

export interface Participant {
  id: string;
  name: string;
  houseNo: string; // e.g., "Blok A3 No. 12"
  rt: string; // e.g., "RT 01"
  ageGroup: AgeCategory;
  competitionId: string; // ID lomba
  registeredAt: string; // ISO date or formatted
  phone?: string;
  notes?: string;
}

export interface Donor {
  id: string;
  name: string;
  houseNo: string; // e.g., "Blok B1 No. 05"
  amount: number; // Dalam Rupiah
  date: string;
  paymentMethod: 'Tunai' | 'Transfer QRIS/Bank';
  notes?: string; // e.g. "Sponsorship Tenda & Aqua"
}

export type ExpenseCategory =
  | 'Hadiah & Tropi'
  | 'Konsumsi'
  | 'Panggung & Sound'
  | 'Peralatan Lomba'
  | 'Spanduk & Dekorasi'
  | 'Kebersihan & Keamanan'
  | 'Lain-lain';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number; // Dalam Rupiah
  date: string;
  pic: string; // Nama panitia yang mengeluarkan
  receiptNote?: string;
}

export interface BracketTeam {
  id: string;
  name: string; // e.g. "Tim A (Hendra & Yudi)"
  members: string[]; // ['Hendra', 'Yudi']
  houseNos?: string[]; // ['Blok A1', 'Blok B3']
}

export interface BracketMatch {
  id: string; // e.g. "match-r1-m1"
  roundIndex: number; // 0 for Round 1 (16 besar / 8 besar), 1 for Semifinal, etc.
  roundName: string; // "Babak 16 Besar", "Perempat Final", "Semifinal", "Final", "Perebutan Juara 3"
  matchNumber: number;
  tableNumber?: number; // Meja 1, Meja 2, dst.
  team1?: BracketTeam | null;
  team2?: BracketTeam | null;
  score1?: number | string;
  score2?: number | string;
  winnerTeamId?: string | null;
  isThirdPlaceMatch?: boolean;
  nextMatchId?: string; // target match ID for the winner
  nextMatchSlot?: 1 | 2; // slot 1 (team1) or slot 2 (team2)
  loserNextMatchId?: string; // for 3rd place match if in semifinal
  loserNextMatchSlot?: 1 | 2;
  notes?: string;
}

export interface TournamentBracket {
  id: string;
  competitionId: string;
  competitionName: string;
  format: '2v2' | '1v1'; // 2 vs 2 (Gaple) or 1 vs 1
  totalRounds: number;
  createdAt: string;
  updatedAt: string;
  teams: BracketTeam[];
  matches: BracketMatch[];
  championTeamId?: string;
  runnerUpTeamId?: string;
  thirdPlaceTeamId?: string;
}

export interface AppState {
  competitions: Competition[];
  participants: Participant[];
  donors: Donor[];
  expenses: Expense[];
  brackets?: TournamentBracket[];
}
