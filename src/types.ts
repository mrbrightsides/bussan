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

export interface AppState {
  competitions: Competition[];
  participants: Participant[];
  donors: Donor[];
  expenses: Expense[];
}
