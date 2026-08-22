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

// === KOMUNITAS & PORTAL WARGA GREEN BUSSAN VILLAGE ===

export type PostCategory =
  | 'Berita Warga'
  | 'Liputan 17an & Kegiatan'
  | 'Pengumuman'
  | 'Pengumuman RT'
  | 'Kerja Bakti'
  | 'Iuran & Kas'
  | 'Keamanan & Ronda'
  | 'Sosial & Warga'
  | 'Kesehatan & Posyandu'
  | 'Umum';

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  authorName: string;
  authorRole: string; // e.g. "Ketua RT 01", "Seksi Keamanan", "Warga Blok B"
  date: string; // formatted date
  createdAt: string; // ISO string
  isPinned?: boolean;
  images?: string[]; // base64 or URL
  videoUrl?: string; // youtube / reels url
  likes?: number;
  likedByIp?: string[];
  tags?: string[];
}

export type EventCategory =
  | 'Kerja Bakti'
  | 'Gotong Royong'
  | 'Rapat RT'
  | 'Rapat Warga'
  | 'Rapat Warga & Arisan'
  | 'Senam & Olahraga'
  | 'Olahraga & Senam'
  | 'Pengajian / Arisan'
  | 'Pengajian & Keagamaan'
  | 'Posyandu'
  | 'Posyandu & Balita'
  | 'Sosial & Perayaan'
  | 'Peringatan Nasional';

export type EventStatus = 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai';

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string; // e.g. "24 Agustus 2026"
  time: string; // e.g. "07:30 - 10:00 WIB"
  location: string; // e.g. "Lapangan Utama & Saluran Blok A-C"
  pic?: string; // e.g. "Pak Akhmad Khudri (Ketua RT)"
  organizer?: string;
  status: EventStatus;
  attendeesCount?: number;
  imageUrl?: string;
}

export type MediaType = 'photo' | 'video';

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  albumName: string; // e.g. "Semarak HUT RI Ke-81", "Kerja Bakti Minggu Pagi", "Senam Sehat & Posyandu"
  type: MediaType;
  url: string; // Base64 data or image url or youtube url
  thumbnailUrl?: string;
  date: string;
  uploadedBy: string; // e.g. "Pak Khudri (RT 01)"
  likes?: number;
  tags?: string[];
}

export type EmergencyCategory =
  | 'Keamanan & Darurat'
  | 'Pengurus Kompleks'
  | 'Pengurus RT/RW'
  | 'Pemerintahan & Kelurahan'
  | 'Kesehatan & Medis'
  | 'Layanan Publik & PDAM'
  | 'Teknisi & Perbaikan'
  | 'Kesehatan & Bidan'
  | 'Kebersihan & Lingkungan';

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  category: EmergencyCategory;
  phone: string; // e.g. "0812-3456-7890"
  whatsapp?: string; // e.g. "6281234567890"
  email?: string;
  website?: string;
  availableHours: string; // e.g. "24 Jam", "07:00 - 21:00 WIB"
  address?: string;
  description: string;
  icon?: string;
}

// === KOTAK ASPIRASI & LAPORAN FASILITAS WARGA ===
export type ReportCategory =
  | 'Lampu Jalan & Penerangan'
  | 'Saluran Air & Drainase'
  | 'Jalan & Paving Block'
  | 'Kebersihan & Sampah'
  | 'Keamanan & Portal'
  | 'Taman & Balai Warga'
  | 'Saran & Aspirasi'
  | 'Lainnya';

export type ReportStatus = 'Menunggu Tindakan' | 'Sedang Dikerjakan' | 'Selesai' | 'Ditolak';

export interface FacilityReport {
  id: string;
  title: string;
  category: ReportCategory;
  description: string;
  location: string; // e.g. "Depan Blok B4", "Dekat Gapura Masuk"
  reporterName: string;
  reporterHouse: string; // e.g. "Blok A2 No. 8"
  reporterPhone?: string;
  status: ReportStatus;
  urgency: 'Biasa' | 'Penting' | 'Darurat';
  imageUrl?: string;
  createdAt: string; // ISO string
  date: string;
  adminResponse?: string;
  resolvedAt?: string;
}

// === KATALOG & PEMINJAMAN INVENTARIS RT ===
export type InventoryCategory =
  | 'Tenda & Terpal'
  | 'Kursi & Meja'
  | 'Sound System, Kabel, & Lampu'
  | 'Sound System & Pengeras Suara'
  | 'Alat Kebersihan & Mesin Rumput'
  | 'Peralatan Masak & Dapur Warga'
  | 'Perkakas & Pertukangan'
  | 'Lainnya';

export type InventoryStatus = 'Tersedia' | 'Sedang Dipinjam' | 'Perbaikan / Rusak';

export interface InventoryBorrowRecord {
  id: string;
  borrowerName: string;
  borrowerHouse: string;
  borrowerPhone: string;
  quantity: number;
  borrowDate: string;
  returnEstimate: string;
  actualReturnDate?: string;
  purpose: string;
  status: 'Aktif Dipinjam' | 'Sudah Dikembalikan';
}

export interface RTInventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  totalQuantity: number;
  availableQuantity: number;
  unit: string; // e.g. "Unit", "Set", "Pcs", "Buah"
  condition: 'Sangat Baik' | 'Baik' | 'Perlu Perbaikan';
  storageLocation: string; // e.g. "Gudang Balai Warga RT 01", "Rumah Pak RT (A1)"
  picName: string; // e.g. "Pak Akhmad Khudri (Ketua RT)"
  picPhone?: string;
  imageUrl?: string;
  description?: string;
  terms?: string;
  borrowHistory?: InventoryBorrowRecord[];
}

export type MarketplaceCategory =
  | 'Kuliner & Makanan'
  | 'Kebutuhan Harian & Gas/Galon'
  | 'Jasa & Laundry'
  | 'Fashion & Kerajinan'
  | 'Lainnya';

export interface MarketplaceItem {
  id: string;
  title: string;
  category: MarketplaceCategory;
  sellerName: string;
  sellerHouse: string; // e.g. "Blok A3 No. 12"
  price: string; // e.g. "Rp 15.000 / porsi", "Rp 6.000 / galon"
  whatsapp: string; // e.g. "6281234567890"
  imageUrl?: string;
  description: string;
  isAvailable: boolean;
  rating?: number;
}

export type RTCashType = 'Pemasukan' | 'Pengeluaran';

export type RTCashCategory =
  | 'Operasional Pos Security & Fasilitas Umum'
  | 'Gaji Petugas (Security)'
  | 'Perawatan & Perbaikan Taman'
  | 'Iuran Warga'
  | 'Iuran Bulanan Warga'
  | 'Operasional Satpam'
  | 'Kebersihan & Sampah'
  | 'Kas Sampah & Kebersihan'
  | 'Lampu & Fasilitas'
  | 'Santunan & Sosial'
  | 'Dana Sosial'
  | 'Sumbangan / Donasi Warga'
  | 'Operasional & Pemeliharaan'
  | 'Honor Satpam & Petugas Kebersihan'
  | 'Listrik Lampu Jalan & Pompa Air'
  | 'Sosial & Santunan'
  | 'Perbaikan Sarana & Prasarana'
  | 'Lain-lain';

export interface RTCashItem {
  id: string;
  type: RTCashType;
  title: string;
  category: RTCashCategory;
  amount: number;
  date: string;
  pic?: string;
  recordedBy?: string;
  notes?: string;
}

export interface MonthlyFeeRecord {
  no: number;
  blockHouse: string; // e.g. "A1", "B6", "C5-6", "R6"
  monthlyFee: number; // e.g. 100000
  payments: {
    jan?: number;
    feb?: number;
    mar?: number;
    apr?: number;
    may?: number;
    jun?: number;
    jul?: number;
  };
  totalPaid: number;
  arrears: number; // tunggakan
  notes?: string; // e.g. "Start April", "Kosong Sejak Februari", "Kantor Developer tidak pernah bayar"
}

export interface AppState {
  // Community Portal Modules
  posts?: CommunityPost[];
  events?: CommunityEvent[];
  mediaGallery?: MediaItem[];
  emergencyContacts?: EmergencyContact[];
  facilityReports?: FacilityReport[];
  inventoryItems?: RTInventoryItem[];
  marketplace?: MarketplaceItem[];
  rtCash?: RTCashItem[];
  monthlyFees?: MonthlyFeeRecord[];

  // 17 Agustus Event & Competition Archives
  competitions: Competition[];
  participants: Participant[];
  donors: Donor[];
  expenses: Expense[];
  brackets?: TournamentBracket[];
}

