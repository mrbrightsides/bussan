import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  ShieldCheck,
  Building,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Home,
  Table,
  Receipt,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Share2,
  Wrench,
  UserCheck,
  Paintbrush,
  RotateCcw,
  HeartHandshake,
} from 'lucide-react';
import { RTCashItem, MonthlyFeeRecord } from '../types';
import { RTCashModal } from './RTCashModal';
import { AdminConfirmationModal } from './AdminConfirmationModal';
import {
  initialMonthlyFees,
  INITIAL_RT_CASH_BALANCE,
  INITIAL_RT_CASH_DATE,
  INITIAL_RT_CASH_TITLE,
  PERIOD_2_START_BALANCE,
  PERIOD_2_START_DATE,
  PERIOD_2_END_DATE,
} from '../data/initialData';
import { formatRupiah } from '../utils/mediaUtils';

export type RTCashPeriod = 'period2' | 'period1' | 'all';

interface RTCashViewProps {
  rtCash: RTCashItem[];
  monthlyFees?: MonthlyFeeRecord[];
  onSaveCashItem: (item: RTCashItem) => void;
  onDeleteCashItem: (id: string) => void;
  onResetOfficialRTCash?: () => void;
}

export const RTCashView: React.FC<RTCashViewProps> = ({
  rtCash,
  monthlyFees = initialMonthlyFees,
  onSaveCashItem,
  onDeleteCashItem,
  onResetOfficialRTCash,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'narrative' | 'transactions' | 'matrix'>('narrative');
  const [selectedPeriod, setSelectedPeriod] = useState<RTCashPeriod>('period2');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Pemasukan' | 'Pengeluaran'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [blockFilter, setBlockFilter] = useState<string>('all');
  const [arrearsFilter, setArrearsFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<RTCashItem | null>(null);
  const [copiedNarrative, setCopiedNarrative] = useState(false);

  // Security confirmation state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    confirmButtonText?: string;
    isBulkAction?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleRequestDelete = (item: RTCashItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Catatan Transaksi Kas',
      message: 'Apakah Anda yakin ingin menghapus catatan transaksi kas ini?',
      itemName: `${item.title} (${formatRupiah(item.amount)})`,
      confirmButtonText: 'Ya, Hapus Transaksi',
      isBulkAction: false,
      onConfirm: () => {
        onDeleteCashItem(item.id);
      },
    });
  };

  const handleRequestSyncOfficial = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Sinkronisasi Data Kas Resmi',
      message:
        'Apakah Anda ingin menyinkronkan dan memuat ulang data resmi Buku Kas & Matriks Iuran Warga s/d Periode 15 Agustus - 14 September 2026 (Saldo Kas Terkini: Rp 6.902.500)?',
      confirmButtonText: 'Sinkronkan Sekarang',
      isBulkAction: false,
      onConfirm: () => {
        onResetOfficialRTCash?.();
      },
    });
  };

  // Helper to distinguish Period 2 (15 Aug - 14 Sep 2026) vs Period 1 (14 Jul - 14 Aug 2026)
  const isPeriod2Item = (item: RTCashItem) => {
    if (
      item.id.startsWith('cash-9') ||
      item.id.startsWith('cash-10') ||
      item.id.startsWith('cash-11') ||
      item.id.startsWith('cash-12') ||
      item.id.startsWith('cash-13') ||
      item.id.startsWith('cash-14') ||
      item.id.startsWith('cash-15') ||
      item.id.startsWith('cash-16')
    ) {
      return true;
    }
    if (item.date.includes('September') || item.date.includes('Sep')) return true;
    if (item.date.includes('Agustus') || item.date.includes('Aug')) {
      const match = item.date.match(/(\d+)/);
      if (match && parseInt(match[1], 10) >= 15) return true;
    }
    return false;
  };

  // Cash items belonging to the selected period
  const periodItems = rtCash.filter((item) => {
    if (selectedPeriod === 'all') return true;
    if (selectedPeriod === 'period2') return isPeriod2Item(item);
    return !isPeriod2Item(item);
  });

  const periodInitialBalance =
    selectedPeriod === 'period2' ? PERIOD_2_START_BALANCE : INITIAL_RT_CASH_BALANCE;

  const periodInitialDate =
    selectedPeriod === 'period2' ? PERIOD_2_START_DATE : INITIAL_RT_CASH_DATE;

  const periodEndDate =
    selectedPeriod === 'period1' ? '14 Agustus 2026' : PERIOD_2_END_DATE;

  const periodLabel =
    selectedPeriod === 'period2'
      ? '15 Agustus 2026 – 14 September 2026'
      : selectedPeriod === 'period1'
      ? '14 Juli 2026 – 14 Agustus 2026'
      : 'Akumulatif (14 Juli 2026 – 14 September 2026)';

  const totalIncome = periodItems
    .filter((c) => c.type === 'Pemasukan')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalExpense = periodItems
    .filter((c) => c.type === 'Pengeluaran')
    .reduce((sum, c) => sum + c.amount, 0);

  const finalBalance = periodInitialBalance + totalIncome - totalExpense;

  // Specific breakdown for Period 2 (15 Agu - 14 Sep 2026)
  const period2Items = rtCash.filter(isPeriod2Item);
  const expenseOperasionalPosPeriod2 = period2Items
    .filter(
      (c) =>
        c.type === 'Pengeluaran' &&
        (c.category.includes('Operasional') || c.category.includes('Wifi') || c.category.includes('Token'))
    )
    .reduce((sum, c) => sum + c.amount, 0); // Rp 795.000

  const expenseGajiPeriod2 = period2Items
    .filter((c) => c.type === 'Pengeluaran' && c.category.includes('Gaji'))
    .reduce((sum, c) => sum + c.amount, 0); // Rp 2.000.000

  const expenseLampuTamanPeriod2 = period2Items
    .filter(
      (c) =>
        c.type === 'Pengeluaran' &&
        (c.category.includes('Lampu') || c.title.toLowerCase().includes('lampu') || c.id.startsWith('cash-13'))
    )
    .reduce((sum, c) => sum + c.amount, 0); // Rp 2.344.500

  const expense17anPeriod2 = period2Items
    .filter((c) => c.type === 'Pengeluaran' && c.id === 'cash-9')
    .reduce((sum, c) => sum + c.amount, 0); // Rp 500.000

  // Category breakdown for Period 1 (14 Jul - 14 Agu 2026)
  const period1Items = rtCash.filter((item) => !isPeriod2Item(item));
  const expenseOperasionalPosPeriod1 = period1Items
    .filter(
      (c) =>
        c.type === 'Pengeluaran' &&
        (c.category.includes('Operasional') || c.category.includes('Listrik') || c.category.includes('Pemeliharaan'))
    )
    .reduce((sum, c) => sum + c.amount, 0); // Rp 1.169.000

  const expenseGajiPeriod1 = period1Items
    .filter((c) => c.type === 'Pengeluaran' && (c.category.includes('Gaji') || c.category.includes('Honor')))
    .reduce((sum, c) => sum + c.amount, 0); // Rp 2.000.000

  const expenseTamanPeriod1 = period1Items
    .filter((c) => c.type === 'Pengeluaran' && (c.category.includes('Taman') || c.id.startsWith('cash-7')))
    .reduce((sum, c) => sum + c.amount, 0); // Rp 538.000

  // Monthly Matrix Calculations (January to August 2026)
  const totalHouses = monthlyFees.length; // 43
  const totalCollectedAll = monthlyFees.reduce((sum, h) => sum + h.totalPaid, 0); // Rp 27.100.000
  const totalArrearsAll = monthlyFees.reduce((sum, h) => sum + h.arrears, 0); // Rp 6.700.000
  const fullyPaidCount = monthlyFees.filter((h) => h.arrears === 0).length;
  const arrearsCount = monthlyFees.filter((h) => h.arrears > 0).length;

  const monthlyTotals = {
    jan: monthlyFees.reduce((sum, h) => sum + (h.payments.jan || 0), 0),
    feb: monthlyFees.reduce((sum, h) => sum + (h.payments.feb || 0), 0),
    mar: monthlyFees.reduce((sum, h) => sum + (h.payments.mar || 0), 0),
    apr: monthlyFees.reduce((sum, h) => sum + (h.payments.apr || 0), 0),
    may: monthlyFees.reduce((sum, h) => sum + (h.payments.may || 0), 0),
    jun: monthlyFees.reduce((sum, h) => sum + (h.payments.jun || 0), 0),
    jul: monthlyFees.reduce((sum, h) => sum + (h.payments.jul || 0), 0),
    aug: monthlyFees.reduce((sum, h) => sum + (h.payments.aug || 0), 0),
  };

  const monthlyPaidHouseCounts = {
    jan: monthlyFees.filter((h) => !!h.payments.jan).length,
    feb: monthlyFees.filter((h) => !!h.payments.feb).length,
    mar: monthlyFees.filter((h) => !!h.payments.mar).length,
    apr: monthlyFees.filter((h) => !!h.payments.apr).length,
    may: monthlyFees.filter((h) => !!h.payments.may).length,
    jun: monthlyFees.filter((h) => !!h.payments.jun).length,
    jul: monthlyFees.filter((h) => !!h.payments.jul).length,
    aug: monthlyFees.filter((h) => !!h.payments.aug).length,
  };

  // Filtered Monthly Fees
  const filteredMonthlyFees = monthlyFees.filter((item) => {
    const matchBlock =
      blockFilter === 'all' ||
      item.blockHouse.toUpperCase().startsWith(blockFilter.toUpperCase());

    const matchArrears =
      arrearsFilter === 'all' ||
      (arrearsFilter === 'paid' && item.arrears === 0) ||
      (arrearsFilter === 'unpaid' && item.arrears > 0);

    const matchSearch =
      !searchQuery.trim() ||
      item.blockHouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchBlock && matchArrears && matchSearch;
  });

  // Filtered Cash Items by active period & search criteria
  const filteredCash = periodItems.filter((item) => {
    const matchType = typeFilter === 'all' || item.type === typeFilter;
    const matchSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.recordedBy && item.recordedBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchType && matchSearch;
  });

  // Get structured narrative data based on active period
  const getNarrativeData = () => {
    if (selectedPeriod === 'period2') {
      return {
        titlePeriod: 'Periode: 15 Agustus 2026 – 14 September 2026',
        subtitle: 'RT 22 • Periode: 15 Agustus 2026 – 14 September 2026',
        initLabel: 'Saldo Awal (14 Agustus 2026)',
        initDate: '14 Agustus 2026',
        initAmount: PERIOD_2_START_BALANCE,
        finalLabel: 'Saldo Akhir (14 September 2026)',
        finalDate: '14 September 2026',
        finalAmount: finalBalance,
        datePlace: 'Palembang, 14 September 2026',
        incomeDesc: `• 13 September: Rekap Iuran Masuk Warga sebesar ${formatRupiah(totalIncome)} (Cash: Rp 800.000 + Transfer: Rp 2.200.000).`,
        expenseHtml: `
          <div class="pos-box">
            <div class="pos-header">
              <span>a. Operasional Pos Security & Fasilitas Umum</span>
              <span style="color: #e11d48;">${formatRupiah(expenseOperasionalPosPeriod2)}</span>
            </div>
            <ul>
              <li><strong>19 Agustus:</strong> Pembelian Token Pos & Lampu Jalan (Rp 200.000)</li>
              <li><strong>28 Agustus:</strong> Pembelian Token Pos & Lampu Jalan (Rp 200.000)</li>
              <li><strong>01 September:</strong> Pembayaran Wifi Pos Security (Rp 195.000)</li>
              <li><strong>13 September:</strong> Pembelian Token Pos & Lampu Jalan (Rp 200.000)</li>
            </ul>
          </div>

          <div class="pos-box">
            <div class="pos-header">
              <span>b. Gaji Petugas Security</span>
              <span style="color: #e11d48;">${formatRupiah(expenseGajiPeriod2)}</span>
            </div>
            <ul>
              <li><strong>05 September:</strong> Pembayaran Gaji Security Malam periode Juli-26 (Rp 2.000.000)</li>
            </ul>
          </div>

          <div class="pos-box">
            <div class="pos-header">
              <span>c. Penambahan Lampu Taman Depan & Belakang</span>
              <span style="color: #e11d48;">${formatRupiah(expenseLampuTamanPeriod2)}</span>
            </div>
            <ul>
              <li><strong>01 September:</strong> Belanja material & jasa instalasi penerangan taman:
                <ul style="margin-top: 3px;">
                  <li>Kabel NYY Supreme (2x1,5) 50m: Rp 985.000</li>
                  <li>Stop Kontak Outdoor Broco (2 pcs): Rp 96.000</li>
                  <li>Kabel NYM (2x1,5) 25m: Rp 175.000</li>
                  <li>Lampu Hanoch 12W (4 pcs): Rp 92.000</li>
                  <li>Lampu Sorot Visalux 20W (3 pcs): Rp 126.000</li>
                  <li>Pipa PVC 0,5 inch (2 btg): Rp 50.000</li>
                  <li>Pipa Kabel Listrik (12 btg): Rp 36.000</li>
                  <li>Clamp Kabel: Rp 9.000</li>
                  <li>Fiting Lampu (3 pcs): Rp 18.000</li>
                  <li>Tie Kabel: Rp 15.000</li>
                  <li>Sambungan Kabel (5 pcs): Rp 7.500</li>
                  <li>Tap Konektor (1 pasang): Rp 35.000</li>
                  <li>Semen 1 Sak & Pasir 1 Karung: Rp 100.000</li>
                  <li>Jasa Teknisi Pemasangan: Rp 600.000</li>
                </ul>
              </li>
            </ul>
          </div>

          <div class="pos-box">
            <div class="pos-header">
              <span>d. Tambahan Dana Konsumsi Malam 17an</span>
              <span style="color: #e11d48;">${formatRupiah(expense17anPeriod2)}</span>
            </div>
            <ul>
              <li><strong>17 Agustus:</strong> Tambahan Dana Konsumsi untuk Malam 17an (Rp 500.000)</li>
            </ul>
          </div>
        `,
        textWa: `*Laporan Rekapitulasi Kas Green Bussan Village*
*(Periode: 15 Agustus 2026 – 14 September 2026)*

*1. Ringkasan Kas*
• Saldo Awal (14 Agustus 2026): ${formatRupiah(PERIOD_2_START_BALANCE)}
• Total Pemasukan (Duit Masuk): ${formatRupiah(totalIncome)}
• Total Pengeluaran (Duit Keluar): ${formatRupiah(totalExpense)}
• *Saldo Akhir (14 September 2026): ${formatRupiah(finalBalance)}*

*2. Rincian Pemasukan (Duit Masuk)*
• 13 September: Rekap Iuran Masuk Warga sebesar ${formatRupiah(totalIncome)} (Cash: Rp 800.000 + Transfer: Rp 2.200.000).

*3. Rincian Pengeluaran (Duit Keluar)*
Total pengeluaran sebesar ${formatRupiah(totalExpense)} dialokasikan untuk operasional dan fasilitas lingkungan:

*a. Operasional Pos Security & Fasilitas Umum (${formatRupiah(expenseOperasionalPosPeriod2)})*
• 19 Agustus: Pembelian Token Pos & Lampu Jalan (${formatRupiah(200000)})
• 28 Agustus: Pembelian Token Pos & Lampu Jalan (${formatRupiah(200000)})
• 01 September: Pembayaran Wifi Pos Security (${formatRupiah(195000)})
• 13 September: Pembelian Token Pos & Lampu Jalan (${formatRupiah(200000)})

*b. Gaji Petugas (${formatRupiah(expenseGajiPeriod2)})*
• 05 September: Pembayaran Gaji Security Malam periode Juli 2026 (${formatRupiah(2000000)})

*c. Penambahan Lampu Taman Depan & Belakang (${formatRupiah(expenseLampuTamanPeriod2)})*
• 01 September: Belanja Material & Jasa Pemasangan Lampu Taman:
  - Kabel NYY Supreme (2x1,5) 50m: ${formatRupiah(985000)}
  - Stop Kontak Outdoor Broco 2 pcs: ${formatRupiah(96000)}
  - Kabel NYM (2x1,5) 25m: ${formatRupiah(175000)}
  - Lampu Hanoch 12W 4 pcs: ${formatRupiah(92000)}
  - Lampu Sorot Visalux 20W 3 pcs: ${formatRupiah(126000)}
  - Pipa PVC 0,5 inch 2 btg: ${formatRupiah(50000)}
  - Pipa Kabel Listrik 12 btg: ${formatRupiah(36000)}
  - Clamp Kabel: ${formatRupiah(9000)}
  - Fiting Lampu 3 pcs: ${formatRupiah(18000)}
  - Tie Kabel: ${formatRupiah(15000)}
  - Sambungan Kabel 5 pcs: ${formatRupiah(7500)}
  - Tap Konektor 1 pasang: ${formatRupiah(35000)}
  - Semen 1 Sak & Pasir 1 Karung: ${formatRupiah(100000)}
  - Jasa Teknisi Pemasangan: ${formatRupiah(600000)}

*d. Tambahan Dana Konsumsi Malam 17an (${formatRupiah(expense17anPeriod2)})*
• 17 Agustus: Tambahan Dana Konsumsi untuk Malam 17an (${formatRupiah(500000)})

*Perhitungan Saldo Akhir:*
${formatRupiah(PERIOD_2_START_BALANCE)} (Saldo Awal) + ${formatRupiah(totalIncome)} (Pemasukan) - ${formatRupiah(totalExpense)} (Pengeluaran) = *${formatRupiah(finalBalance)}*

_Pengurus Green Bussan Village_`,
      };
    } else if (selectedPeriod === 'period1') {
      return {
        titlePeriod: 'Periode: 14 Juli 2026 – 14 Agustus 2026',
        subtitle: 'RT 22 • Periode: 14 Juli 2026 – 14 Agustus 2026',
        initLabel: 'Saldo Awal (14 Juli 2026)',
        initDate: '14 Juli 2026',
        initAmount: INITIAL_RT_CASH_BALANCE,
        finalLabel: 'Saldo Akhir (14 Agustus 2026)',
        finalDate: '14 Agustus 2026',
        finalAmount: finalBalance,
        datePlace: 'Palembang, 14 Agustus 2026',
        incomeDesc: `• 14 Agustus: Rekap Iuran Masuk Warga sebesar ${formatRupiah(totalIncome)} (pembayaran iuran 31 KK perumahan Green Bussan).`,
        expenseHtml: `
          <div class="pos-box">
            <div class="pos-header">
              <span>a. Operasional Pos Security & Fasilitas Umum</span>
              <span style="color: #e11d48;">${formatRupiah(expenseOperasionalPosPeriod1)}</span>
            </div>
            <ul>
              <li><strong>17 Juli:</strong> Pembelian Token Pos & Lampu Jalan (Rp 200.000)</li>
              <li><strong>28 Juli:</strong> Pembelian Token Pos & Lampu Jalan (Rp 200.000)</li>
              <li><strong>30 Juli:</strong> Pembayaran Wifi Pos Security (Rp 193.000)</li>
              <li><strong>31 Juli:</strong> Perbaikan MCB Pos (2 unit MCB + Jasa Pasang: Rp 176.000)</li>
              <li><strong>06 Agustus:</strong> Pembelian Token Pos & Lampu Jalan (Rp 200.000)</li>
            </ul>
          </div>

          <div class="pos-box">
            <div class="pos-header">
              <span>b. Gaji Petugas Security</span>
              <span style="color: #e11d48;">${formatRupiah(expenseGajiPeriod1)}</span>
            </div>
            <ul>
              <li><strong>05 Agustus:</strong> Pembayaran Gaji Security Malam periode Juli 2026 (Rp 2.000.000)</li>
            </ul>
          </div>

          <div class="pos-box">
            <div class="pos-header">
              <span>c. Perawatan & Perbaikan Taman</span>
              <span style="color: #e11d48;">${formatRupiah(expenseTamanPeriod1)}</span>
            </div>
            <ul>
              <li><strong>12 Agustus:</strong> Belanja material dan pengerjaan taman:
                <ul style="margin-top: 3px;">
                  <li>4 Kaleng Cat (@ Rp 84.000): Rp 336.000</li>
                  <li>2 Kaleng Thinner (@ Rp 46.000): Rp 92.000</li>
                  <li>2 Kuas Cat (@ Rp 5.000): Rp 10.000</li>
                  <li>Upah Tukang Cat: Rp 100.000</li>
                </ul>
              </li>
            </ul>
          </div>
        `,
        textWa: `*Laporan Rekapitulasi Kas Green Bussan Village*
*(Periode: 14 Juli 2026 – 14 Agustus 2026)*

*1. Ringkasan Kas*
• Saldo Awal (14 Juli 2026): ${formatRupiah(INITIAL_RT_CASH_BALANCE)}
• Total Pemasukan (Duit Masuk): ${formatRupiah(totalIncome)}
• Total Pengeluaran (Duit Keluar): ${formatRupiah(totalExpense)}
• *Saldo Akhir (14 Agustus 2026): ${formatRupiah(finalBalance)}*

*2. Rincian Pemasukan (Duit Masuk)*
• 14 Agustus: Rekap Iuran Masuk Warga sebesar ${formatRupiah(totalIncome)}.

*3. Rincian Pengeluaran (Duit Keluar)*
Total pengeluaran sebesar ${formatRupiah(totalExpense)} dialokasikan untuk operasional dan perawatan lingkungan:

*a. Operasional Pos Security & Fasilitas Umum (${formatRupiah(expenseOperasionalPosPeriod1)})*
• 17 Juli: Pembelian Token Pos & Lampu Jalan (${formatRupiah(200000)})
• 28 Juli: Pembelian Token Pos & Lampu Jalan (${formatRupiah(200000)})
• 30 Juli: Pembayaran Wifi Pos Security (${formatRupiah(193000)})
• 31 Juli: Perbaikan MCB Pos (2 unit MCB + Jasa Pasang: ${formatRupiah(176000)})
• 06 Agustus: Pembelian Token Pos & Lampu Jalan (${formatRupiah(200000)})

*b. Gaji Petugas (${formatRupiah(expenseGajiPeriod1)})*
• 05 Agustus: Pembayaran Gaji Security Malam periode Juli 2026 (${formatRupiah(2000000)})

*c. Perawatan & Perbaikan Taman (${formatRupiah(expenseTamanPeriod1)})*
• 12 Agustus: Belanja material dan pengerjaan taman:
  - 4 Kaleng Cat (@ Rp 84.000): ${formatRupiah(336000)}
  - 2 Kaleng Thinner (@ Rp 46.000): ${formatRupiah(92000)}
  - 2 Kuas Cat (@ Rp 5.000): ${formatRupiah(10000)}
  - Upah Tukang Cat: ${formatRupiah(100000)}

*Perhitungan Saldo Akhir:*
${formatRupiah(INITIAL_RT_CASH_BALANCE)} (Saldo Awal) + ${formatRupiah(totalIncome)} (Pemasukan) - ${formatRupiah(totalExpense)} (Pengeluaran) = *${formatRupiah(finalBalance)}*

_Pengurus Green Bussan Village_`,
      };
    } else {
      return {
        titlePeriod: 'Akumulatif (14 Juli 2026 – 14 September 2026)',
        subtitle: 'RT 22 • Rekap Kas Akumulatif (14 Juli – 14 September 2026)',
        initLabel: 'Saldo Awal (14 Juli 2026)',
        initDate: '14 Juli 2026',
        initAmount: INITIAL_RT_CASH_BALANCE,
        finalLabel: 'Saldo Kas Terkini (14 September 2026)',
        finalDate: '14 September 2026',
        finalAmount: finalBalance,
        datePlace: 'Palembang, 14 September 2026',
        incomeDesc: `• Total Penerimaan Iuran Warga Periode Juli (Rp 3.100.000) dan Periode Agustus (Rp 3.000.000) sebesar ${formatRupiah(totalIncome)}.`,
        expenseHtml: `
          <div class="pos-box">
            <div class="pos-header">
              <span>a. Total Operasional Pos Security & Fasilitas</span>
              <span style="color: #e11d48;">${formatRupiah(expenseOperasionalPosPeriod1 + expenseOperasionalPosPeriod2)}</span>
            </div>
            <p style="font-size: 11px; margin: 0; color: #475569;">Token listrik, wifi bulanan, dan perawatan instalasi pos security.</p>
          </div>
          <div class="pos-box">
            <div class="pos-header">
              <span>b. Total Gaji Petugas Security (2 Periode)</span>
              <span style="color: #e11d48;">${formatRupiah(expenseGajiPeriod1 + expenseGajiPeriod2)}</span>
            </div>
            <p style="font-size: 11px; margin: 0; color: #475569;">Honor security malam per bulan @ Rp 2.000.000.</p>
          </div>
          <div class="pos-box">
            <div class="pos-header">
              <span>c. Perawatan Taman & Penambahan Lampu Penerangan</span>
              <span style="color: #e11d48;">${formatRupiah(expenseTamanPeriod1 + expenseLampuTamanPeriod2)}</span>
            </div>
            <p style="font-size: 11px; margin: 0; color: #475569;">Pengecatan taman (Rp 538.000) dan instalasi 14 item lampu taman (Rp 2.344.500).</p>
          </div>
          <div class="pos-box">
            <div class="pos-header">
              <span>d. Konsumsi Perayaan 17 Agustus</span>
              <span style="color: #e11d48;">${formatRupiah(expense17anPeriod2)}</span>
            </div>
            <p style="font-size: 11px; margin: 0; color: #475569;">Tambahan konsumsi malam 17an warga.</p>
          </div>
        `,
        textWa: `*Laporan Rekapitulasi Kas Akumulatif Green Bussan Village*
*(Periode: 14 Juli 2026 – 14 September 2026)*

*1. Ringkasan Kas*
• Saldo Awal (14 Juli 2026): ${formatRupiah(INITIAL_RT_CASH_BALANCE)}
• Total Pemasukan: ${formatRupiah(totalIncome)}
• Total Pengeluaran: ${formatRupiah(totalExpense)}
• *Saldo Kas Terkini (14 September 2026): ${formatRupiah(finalBalance)}*

*Perhitungan:*
${formatRupiah(INITIAL_RT_CASH_BALANCE)} + ${formatRupiah(totalIncome)} - ${formatRupiah(totalExpense)} = *${formatRupiah(finalBalance)}*

_Pengurus Green Bussan Village_`,
      };
    }
  };

  // Copy Narrative Text for WhatsApp
  const handleCopyNarrative = () => {
    const data = getNarrativeData();
    navigator.clipboard.writeText(data.textWa);
    setCopiedNarrative(true);
    setTimeout(() => setCopiedNarrative(false), 2500);
  };

  // Print Narrative Report
  const handlePrintNarrative = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan popup browser untuk mencetak laporan.');
      return;
    }

    const data = getNarrativeData();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Rekapitulasi Kas Green Bussan Village</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1e293b; font-size: 12px; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 800; margin: 0; color: #0f766e; }
          .subtitle { font-size: 13px; color: #475569; margin-top: 4px; font-weight: 600; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 14px; font-weight: 800; color: #0f766e; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 10px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
          .summary-card { padding: 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; }
          .summary-card.final { background: #fef9c3; border-color: #eab308; }
          .card-lbl { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .card-val { font-size: 16px; font-weight: 800; margin-top: 4px; }
          .val-income { color: #059669; }
          .val-expense { color: #e11d48; }
          .val-final { color: #854d0e; }
          .pos-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 10px; }
          .pos-header { font-weight: bold; font-size: 12px; display: flex; justify-content: space-between; margin-bottom: 6px; color: #1e293b; }
          ul { margin: 0; padding-left: 18px; }
          li { margin-bottom: 4px; }
          .formula-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; text-align: center; font-weight: bold; color: #065f46; font-size: 13px; margin-top: 15px; }
          .signature-area { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; }
          .sig-box { text-align: center; width: 220px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">LAPORAN REKAPITULASI KAS GREEN BUSSAN VILLAGE</h1>
          <p class="subtitle">${data.subtitle}</p>
        </div>

        <div class="section">
          <div class="section-title">1. RINGKASAN KAS</div>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="card-lbl">${data.initLabel}</div>
              <div class="card-val">${formatRupiah(data.initAmount)}</div>
            </div>
            <div class="summary-card">
              <div class="card-lbl">Total Pemasukan</div>
              <div class="card-val val-income">${formatRupiah(totalIncome)}</div>
            </div>
            <div class="summary-card">
              <div class="card-lbl">Total Pengeluaran</div>
              <div class="card-val val-expense">${formatRupiah(totalExpense)}</div>
            </div>
            <div class="summary-card final">
              <div class="card-lbl" style="color: #854d0e;">${data.finalLabel}</div>
              <div class="card-val val-final">${formatRupiah(data.finalAmount)}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. RINCIAN PEMASUKAN (DUIT MASUK)</div>
          <div class="pos-box" style="background: #f0fdf4; border-color: #bbf7d0;">
            <p style="margin: 0; font-size: 12px; font-weight: 600; color: #166534;">
              ${data.incomeDesc}
            </p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">3. RINCIAN PENGELUARAN (DUIT KELUAR)</div>
          <p style="margin-top: 0; margin-bottom: 10px; font-size: 11px; color: #64748b;">
            Total pengeluaran sebesar <strong>${formatRupiah(totalExpense)}</strong> dialokasikan untuk operasional dan fasilitas lingkungan:
          </p>
          ${data.expenseHtml}
        </div>

        <div class="formula-box">
          Perhitungan Saldo Akhir:<br>
          ${formatRupiah(data.initAmount)} (Saldo Awal) + ${formatRupiah(totalIncome)} (Pemasukan) - ${formatRupiah(totalExpense)} (Pengeluaran) = <span style="font-size: 15px; text-decoration: underline;">${formatRupiah(data.finalAmount)}</span>
        </div>

        <div class="signature-area">
          <div class="sig-box">
            <p>Mengetahui,</p>
            <p style="font-weight: bold; margin-top: 5px;">Ketua Lingkungan Green Bussan Village</p>
            <div style="height: 45px;"></div>
            <p style="text-decoration: underline; font-weight: bold;">( Tri Sulistyo )</p>
          </div>
          <div class="sig-box">
            <p>${data.datePlace}</p>
            <p style="font-weight: bold; margin-top: 5px;">Bendahara Kas Warga</p>
            <div style="height: 45px;"></div>
            <p style="text-decoration: underline; font-weight: bold;">( Riyadi )</p>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Print Matrix Report
  const handlePrintMatrix = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan popup browser untuk mencetak laporan.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Matriks Iuran Bulanan Perumahan Green Bussan Village</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; color: #0f172a; font-size: 11px; }
          .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 18px; font-weight: bold; margin: 0; color: #0f766e; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
          .summary-card { padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
          .card-lbl { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; }
          .card-val { font-size: 14px; font-weight: bold; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 6px; text-align: center; }
          th { background: #0f766e; color: #ffffff; font-weight: bold; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .paid { color: #059669; font-weight: 600; }
          .unpaid { color: #94a3b8; }
          .arrears { color: #e11d48; font-weight: bold; }
          .total-row { background: #f1f5f9; font-weight: bold; }
          .signature-area { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; }
          .sig-box { text-align: center; width: 220px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">IURAN BULANAN PERUMAHAN GREEN BUSSAN VILLAGE</h1>
          <p class="subtitle">Rekap Matriks Pembayaran Warga Green Bussan Village Periode Januari – Agustus 2026</p>
          <p class="subtitle">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="card-lbl">Total Rumah Terdata</div>
            <div class="card-val" style="color: #0f766e;">43 Unit / KK</div>
          </div>
          <div class="summary-card">
            <div class="card-lbl">Total Iuran Terkumpul (Jan - Agu)</div>
            <div class="card-val" style="color: #059669;">${formatRupiah(totalCollectedAll)}</div>
          </div>
          <div class="summary-card">
            <div class="card-lbl">Total Tunggakan Warga</div>
            <div class="card-val" style="color: #e11d48;">${formatRupiah(totalArrearsAll)}</div>
          </div>
          <div class="summary-card">
            <div class="card-lbl">Tingkat Ketertiban Lunas</div>
            <div class="card-val" style="color: #0f766e;">${fullyPaidCount} dari 43 Rumah (Lunas)</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 25px;">No</th>
              <th style="width: 65px;">Blok/Rumah</th>
              <th style="width: 60px;">Iuran/Bln</th>
              <th>Jan-26</th>
              <th>Feb-26</th>
              <th>Mar-26</th>
              <th>Apr-26</th>
              <th>Mei-26</th>
              <th>Jun-26</th>
              <th>Jul-26</th>
              <th>Agu-26</th>
              <th style="width: 75px;">Rekap Iuran</th>
              <th style="width: 70px;">Tunggakan</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyFees
              .map(
                (row) => `
              <tr>
                <td>${row.no}</td>
                <td style="font-weight: bold;">${row.blockHouse}</td>
                <td>${formatRupiah(row.monthlyFee)}</td>
                <td class="${row.payments.jan ? 'paid' : 'unpaid'}">${row.payments.jan ? '100k' : '-'}</td>
                <td class="${row.payments.feb ? 'paid' : 'unpaid'}">${row.payments.feb ? '100k' : '-'}</td>
                <td class="${row.payments.mar ? 'paid' : 'unpaid'}">${row.payments.mar ? '100k' : '-'}</td>
                <td class="${row.payments.apr ? 'paid' : 'unpaid'}">${row.payments.apr ? '100k' : '-'}</td>
                <td class="${row.payments.may ? 'paid' : 'unpaid'}">${row.payments.may ? '100k' : '-'}</td>
                <td class="${row.payments.jun ? 'paid' : 'unpaid'}">${row.payments.jun ? '100k' : '-'}</td>
                <td class="${row.payments.jul ? 'paid' : 'unpaid'}">${row.payments.jul ? '100k' : '-'}</td>
                <td class="${row.payments.aug ? 'paid' : 'unpaid'}">${row.payments.aug ? '100k' : '-'}</td>
                <td class="text-right paid">${formatRupiah(row.totalPaid)}</td>
                <td class="text-right ${row.arrears > 0 ? 'arrears' : ''}">${row.arrears > 0 ? formatRupiah(row.arrears) : '-'}</td>
              </tr>
            `
              )
              .join('')}
            <tr class="total-row">
              <td colspan="3" class="text-right">TOTAL:</td>
              <td>${formatRupiah(monthlyTotals.jan)}</td>
              <td>${formatRupiah(monthlyTotals.feb)}</td>
              <td>${formatRupiah(monthlyTotals.mar)}</td>
              <td>${formatRupiah(monthlyTotals.apr)}</td>
              <td>${formatRupiah(monthlyTotals.may)}</td>
              <td>${formatRupiah(monthlyTotals.jun)}</td>
              <td>${formatRupiah(monthlyTotals.jul)}</td>
              <td>${formatRupiah(monthlyTotals.aug)}</td>
              <td class="text-right paid">${formatRupiah(totalCollectedAll)}</td>
              <td class="text-right arrears">${formatRupiah(totalArrearsAll)}</td>
            </tr>
          </tbody>
        </table>

        <div class="signature-area">
          <div class="sig-box">
            <p>Mengetahui,</p>
            <p style="font-weight: bold; margin-top: 5px;">Ketua Lingkungan Green Bussan Village</p>
            <div style="height: 45px;"></div>
            <p style="text-decoration: underline; font-weight: bold;">( Tri Sulistyo )</p>
          </div>
          <div class="sig-box">
            <p>Palembang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p style="font-weight: bold; margin-top: 5px;">Bendahara Kas Warga</p>
            <div style="height: 45px;"></div>
            <p style="text-decoration: underline; font-weight: bold;">( Riyadi )</p>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Print Cash Transaction Report
  const handlePrintCashReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan popup browser untuk mencetak laporan.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rekap Transaksi Kas Warga - Green Bussan Village</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; color: #1e293b; font-size: 11px; }
          .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 18px; font-weight: bold; margin: 0; color: #0f766e; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .summary-box { display: flex; gap: 12px; margin-bottom: 16px; }
          .card { flex: 1; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
          .card-title { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; }
          .card-val { font-size: 14px; font-weight: bold; margin-top: 2px; }
          .val-income { color: #059669; }
          .val-expense { color: #e11d48; }
          .val-balance { color: #0f766e; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 10px; }
          th { background: #f1f5f9; font-weight: bold; text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .debit { color: #e11d48; font-weight: 600; }
          .kredit { color: #059669; font-weight: 600; }
          .saldo { color: #0f172a; font-weight: bold; font-family: monospace; }
          .highlight-row { background: #fef08a !important; font-weight: bold; }
          .signature-area { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; }
          .sig-box { text-align: center; width: 220px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">REKAP TRANSAKSI KAS WARGA</h1>
          <p class="subtitle">Green Bussan Village • ${periodLabel}</p>
        </div>

        <div class="summary-box">
          <div class="card">
            <div class="card-title">Saldo Awal (${periodInitialDate})</div>
            <div class="card-val val-balance">${formatRupiah(periodInitialBalance)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Pengeluaran</div>
            <div class="card-val val-expense">${formatRupiah(totalExpense)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Pemasukan</div>
            <div class="card-val val-income">${formatRupiah(totalIncome)}</div>
          </div>
          <div class="card" style="background: #fef9c3; border-color: #fde047;">
            <div class="card-title" style="color: #854d0e;">SALDO KAS AKHIR</div>
            <div class="card-val" style="color: #854d0e; font-size: 15px;">${formatRupiah(finalBalance)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 80px;">Tanggal</th>
              <th>Transaksi</th>
              <th class="text-right" style="width: 120px;">Debit</th>
              <th class="text-right" style="width: 120px;">Kredit</th>
              <th class="text-right" style="width: 130px;">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <!-- Saldo Awal -->
            <tr style="background: #f8fafc; font-weight: bold;">
              <td>${periodInitialDate}</td>
              <td>${selectedPeriod === 'period2' ? 'Saldo Kas Awal Periode 2 (Rekap Periode 14 Juli - 14 Agustus 2026)' : INITIAL_RT_CASH_TITLE}</td>
              <td class="text-right">-</td>
              <td class="text-right">-</td>
              <td class="text-right saldo">${formatRupiah(periodInitialBalance)}</td>
            </tr>

            <!-- Transactions -->
            ${filteredCash
              .map(
                (item) => `
              <tr>
                <td>${item.date}</td>
                <td>
                  <strong>${item.title}</strong>
                  ${item.notes ? `<div style="font-size: 10px; color: #64748b; margin-top: 1px;">${item.notes}</div>` : ''}
                </td>
                <td class="text-right debit">${item.type === 'Pengeluaran' ? formatRupiah(item.amount) : '-'}</td>
                <td class="text-right kredit">${item.type === 'Pemasukan' ? formatRupiah(item.amount) : '-'}</td>
                <td class="text-right">-</td>
              </tr>
            `
              )
              .join('')}

            <!-- Total Row -->
            <tr style="background: #f1f5f9; font-weight: bold; border-top: 2px solid #cbd5e1;">
              <td colspan="2" class="text-right">Total:</td>
              <td class="text-right debit" style="font-size: 12px;">${formatRupiah(totalExpense)}</td>
              <td class="text-right kredit" style="font-size: 12px;">${formatRupiah(totalIncome)}</td>
              <td></td>
            </tr>

            <!-- Saldo Akhir Highlight Row -->
            <tr class="highlight-row">
              <td>${periodEndDate}</td>
              <td style="font-weight: 900; letter-spacing: 0.5px;">SALDO KAS AKHIR</td>
              <td class="text-right">-</td>
              <td class="text-right">-</td>
              <td class="text-right saldo" style="font-size: 13px; color: #0f172a;">${formatRupiah(finalBalance)}</td>
            </tr>
          </tbody>
        </table>

        <div class="signature-area">
          <div class="sig-box">
            <p>Mengetahui,</p>
            <p style="font-weight: bold; margin-top: 5px;">Ketua Lingkungan Green Bussan Village</p>
            <div style="height: 45px;"></div>
            <p style="text-decoration: underline; font-weight: bold;">( Tri Sulistyo )</p>
          </div>
          <div class="sig-box">
            <p>Palembang, ${periodEndDate}</p>
            <p style="font-weight: bold; margin-top: 5px;">Bendahara Kas Warga</p>
            <div style="height: 45px;"></div>
            <p style="text-decoration: underline; font-weight: bold;">( Riyadi )</p>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const narrativeData = getNarrativeData();

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-700/80 border border-emerald-500/30 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Transparansi Keuangan Green Bussan Village
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Buku Kas & Iuran Warga
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Laporan Rekapitulasi Kas RT 22 s/d Periode 15 Agustus – 14 September 2026 dan pencatatan iuran bulanan 43 rumah (@Rp 100.000/bulan) perumahan Green Bussan Village.
            </p>

            {/* Period Selector in Banner */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-emerald-300/90 font-medium">Pilih Periode:</span>
              <div className="inline-flex bg-black/30 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setSelectedPeriod('period2')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    selectedPeriod === 'period2'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  Periode 2 (15 Agu – 14 Sep 2026) ★ Terkini
                </button>
                <button
                  onClick={() => setSelectedPeriod('period1')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    selectedPeriod === 'period1'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  Periode 1 (14 Jul – 14 Agu 2026)
                </button>
                <button
                  onClick={() => setSelectedPeriod('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    selectedPeriod === 'all'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  Semua (Akumulatif)
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onResetOfficialRTCash && (
              <button
                onClick={handleRequestSyncOfficial}
                title="Sinkronkan ke Data Kas Resmi Warga"
                className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3 py-2.5 rounded-2xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">Sinkron Data Resmi</span>
              </button>
            )}

            {activeSubTab === 'narrative' ? (
              <>
                <button
                  onClick={handleCopyNarrative}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  {copiedNarrative ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  {copiedNarrative ? 'Tersalin ke Clipboard!' : 'Salin Format WA'}
                </button>
                <button
                  onClick={handlePrintNarrative}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  Cetak Laporan Narasi
                </button>
              </>
            ) : activeSubTab === 'transactions' ? (
              <>
                <button
                  onClick={() => {
                    setItemToEdit(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Catat Kas Masuk / Keluar
                </button>
                <button
                  onClick={handlePrintCashReport}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  Cetak Rekap Kas
                </button>
              </>
            ) : (
              <button
                onClick={handlePrintMatrix}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Matriks Iuran 43 Rumah
              </button>
            )}
          </div>
        </div>

        {/* 4 Financial Highlight Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-white/10">
          <div className="bg-emerald-950/70 border border-emerald-600/40 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">Saldo Kas Akhir</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl sm:text-2xl font-black text-white">{formatRupiah(finalBalance)}</p>
              <p className="text-[10px] text-emerald-300/80 mt-0.5">Per {periodEndDate}</p>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Saldo Awal</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl sm:text-2xl font-black text-emerald-400">{formatRupiah(periodInitialBalance)}</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Per {periodInitialDate}</p>
            </div>
          </div>

          <div className="bg-teal-950/70 border border-teal-700/40 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-teal-300 font-bold uppercase tracking-wider">Total Pemasukan</span>
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl sm:text-2xl font-black text-teal-200">{formatRupiah(totalIncome)}</p>
              <p className="text-[10px] text-teal-300/80 mt-0.5">
                {selectedPeriod === 'period2' ? 'Iuran Masuk 13-Sep' : selectedPeriod === 'period1' ? 'Iuran Masuk 14-Agu' : 'Total Penerimaan Iuran'}
              </p>
            </div>
          </div>

          <div className="bg-rose-950/70 border border-rose-800/40 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-rose-300 font-bold uppercase tracking-wider">Total Pengeluaran</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl sm:text-2xl font-black text-rose-300">{formatRupiah(totalExpense)}</p>
              <p className="text-[10px] text-rose-300/80 mt-0.5">
                {selectedPeriod === 'period2' ? 'Pos, Gaji, Lampu & 17an' : selectedPeriod === 'period1' ? 'Pos, Gaji & Cat Taman' : 'Total Pengeluaran Kas'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tab Switcher: 3 Tabs (Narasi, Rincian Transaksi, Matriks Iuran) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => {
              setActiveSubTab('narrative');
              setSearchQuery('');
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'narrative'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            Laporan Rekapitulasi Kas (Narasi Warga)
          </button>
          <button
            onClick={() => {
              setActiveSubTab('transactions');
              setSearchQuery('');
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'transactions'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
            Buku Transaksi Kas ({filteredCash.length})
          </button>
          <button
            onClick={() => {
              setActiveSubTab('matrix');
              setSearchQuery('');
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'matrix'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Matriks Iuran 43 Rumah (Jan - Agu)
          </button>
        </div>

        {activeSubTab === 'matrix' ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 px-3 py-1 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="font-semibold text-emerald-900">Tarif Iuran: Rp 100.000 / Rumah / Bulan</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs px-3 py-1 bg-slate-50 rounded-xl border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span className="font-semibold text-slate-700">{periodLabel}</span>
          </div>
        )}
      </div>

      {/* ======================= VIEW 1: NARASI LAPORAN REKAPITULASI KAS ======================= */}
      {activeSubTab === 'narrative' && (
        <div className="space-y-6">
          {/* Main Narrative Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-7">
            {/* Header Document */}
            <div className="border-b border-slate-200 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Laporan Rekapitulasi Kas Green Bussan Village
                  </h2>
                  <p className="text-sm font-semibold text-emerald-700 mt-1">
                    ({narrativeData.titlePeriod})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyNarrative}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    {copiedNarrative ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedNarrative ? 'Tersalin' : 'Salin Teks Narasi'}
                  </button>
                  <button
                    onClick={handlePrintNarrative}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak
                  </button>
                </div>
              </div>
            </div>

            {/* Poin 1: Ringkasan Kas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Ringkasan Kas
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500">{narrativeData.initLabel}</p>
                  <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">{formatRupiah(narrativeData.initAmount)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-700">Total Pemasukan (Duit Masuk)</p>
                  <p className="text-lg sm:text-xl font-black text-emerald-800 mt-1">{formatRupiah(totalIncome)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                  <p className="text-xs font-semibold text-rose-700">Total Pengeluaran (Duit Keluar)</p>
                  <p className="text-lg sm:text-xl font-black text-rose-800 mt-1">{formatRupiah(totalExpense)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs">
                  <p className="text-xs font-bold text-amber-900">{narrativeData.finalLabel}</p>
                  <p className="text-lg sm:text-xl font-black text-amber-950 mt-1">{formatRupiah(narrativeData.finalAmount)}</p>
                </div>
              </div>
            </div>

            {/* Poin 2: Rincian Pemasukan */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Rincian Pemasukan (Duit Masuk)
                </h3>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900">
                      {selectedPeriod === 'period2' ? '13 September' : selectedPeriod === 'period1' ? '14 Agustus' : 'Rekap Bulanan'}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      Rekap Iuran Masuk Warga
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-black text-emerald-800">
                    {formatRupiah(totalIncome)}
                  </p>
                  <p className="text-xs text-slate-600">
                    {selectedPeriod === 'period2' 
                      ? 'Penerimaan iuran warga per 13 September 2026: Cash sebesar Rp 800.000 + Transfer Bank sebesar Rp 2.200.000.'
                      : selectedPeriod === 'period1'
                      ? 'Penerimaan total rekapitulasi iuran bulanan 31 KK perumahan Green Bussan Village periode Juli 2026.'
                      : 'Penerimaan total akumulatif iuran warga Green Bussan Village periode Juli dan Agustus 2026.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Poin 3: Rincian Pengeluaran */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Rincian Pengeluaran (Duit Keluar)
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-rose-100 text-rose-800 rounded-full border border-rose-200">
                  Total Keluar: {formatRupiah(totalExpense)}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Total pengeluaran sebesar <strong className="text-slate-900">{formatRupiah(totalExpense)}</strong> dialokasikan untuk operasional dan fasilitas lingkungan dengan rincian:
              </p>

              {/* Dynamic Clusters of Expense based on selectedPeriod */}
              {selectedPeriod === 'period2' ? (
                <div className="space-y-4">
                  {/* Cluster A: Operasional Pos Security & Fasilitas Umum */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            a. Operasional Pos Security & Fasilitas Umum
                          </h4>
                          <p className="text-[11px] text-slate-500">Token listrik pos & lampu jalan, wifi pos security</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-rose-700 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {formatRupiah(expenseOperasionalPosPeriod2)}
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700 divide-y divide-slate-100">
                      <li className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span><strong>19 Agustus:</strong> Pembelian Token Pos & Lampu Jalan</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(200000)}</span>
                      </li>
                      <li className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span><strong>28 Agustus:</strong> Pembelian Token Pos & Lampu Jalan</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(200000)}</span>
                      </li>
                      <li className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span><strong>01 September:</strong> Pembayaran Wifi Pos Security</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(195000)}</span>
                      </li>
                      <li className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span><strong>13 September:</strong> Pembelian Token Pos & Lampu Jalan</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(200000)}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Cluster B: Gaji Petugas Security */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            b. Gaji Petugas Security
                          </h4>
                          <p className="text-[11px] text-slate-500">Honor gaji petugas keamanan malam komplek</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-rose-700 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {formatRupiah(expenseGajiPeriod2)}
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span><strong>05 September:</strong> Pembayaran Gaji Security Malam periode Juli 2026</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(2000000)}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Cluster C: Penambahan Lampu Taman Depan & Belakang */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            c. Penambahan Lampu Taman Depan & Belakang
                          </h4>
                          <p className="text-[11px] text-slate-500">Pengadaan 14 item material penerangan taman & jasa teknisi pemasangan</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-rose-700 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {formatRupiah(expenseLampuTamanPeriod2)}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        <strong>01 September:</strong> Rincian material & upah instalasi:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-700">Kabel NYY Supreme (2x1,5) 50m</span>
                          <span className="font-mono font-bold text-slate-900">{formatRupiah(985000)}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-700">Stop Kontak Outdoor Broco (2)</span>
                          <span className="font-mono font-bold text-slate-900">{formatRupiah(96000)}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-700">Kabel NYM (2x1,5) 25m</span>
                          <span className="font-mono font-bold text-slate-900">{formatRupiah(175000)}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-700">Lampu Hanoch 12W (4 pcs)</span>
                          <span className="font-mono font-bold text-slate-900">{formatRupiah(92000)}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-700">Lampu Sorot Visalux 20W (3 pcs)</span>
                          <span className="font-mono font-bold text-slate-900">{formatRupiah(126000)}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-700">Pipa PVC 0,5 inch (2 btg)</span>
                          <span className="font-mono font-bold text-slate-900">{formatRupiah(50000)}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-700">Pipa Kabel Listrik (12 btg)</span>
                          <span className="font-mono font-bold text-slate-900">{formatRupiah(36000)}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-700">Fiting Lampu & Aksesoris</span>
                          <span className="font-mono font-bold text-slate-900">{formatRupiah(84500)}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-700">Semen 1 Sak & Pasir 1 Karung</span>
                          <span className="font-mono font-bold text-slate-900">{formatRupiah(100000)}</span>
                        </div>
                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between text-xs sm:col-span-2 lg:col-span-3">
                          <span className="text-emerald-900 font-bold">Jasa Teknisi Pemasangan & Instalasi</span>
                          <span className="font-mono font-black text-emerald-900">{formatRupiah(600000)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cluster D: Tambahan Dana Konsumsi Malam 17an */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                          <HeartHandshake className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            d. Tambahan Dana Konsumsi Malam 17an
                          </h4>
                          <p className="text-[11px] text-slate-500">Dukungan kas warga untuk konsumsi syukuran malam kemerdekaan RI ke-81</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-rose-700 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {formatRupiah(expense17anPeriod2)}
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span><strong>17 Agustus:</strong> Tambahan Dana Konsumsi untuk Malam 17an</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(500000)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : selectedPeriod === 'period1' ? (
                <div className="space-y-4">
                  {/* Cluster A: Operasional Pos Security & Fasilitas Umum */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Operasional Pos Security & Fasilitas Umum
                          </h4>
                          <p className="text-[11px] text-slate-500">Listrik token, wifi pos & perbaikan instalasi MCB</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-rose-700 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {formatRupiah(expenseOperasionalPosPeriod1)}
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700 divide-y divide-slate-100">
                      <li className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span><strong>17 Juli:</strong> Pembelian Token Pos & Lampu Jalan</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(200000)}</span>
                      </li>
                      <li className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span><strong>28 Juli:</strong> Pembelian Token Pos & Lampu Jalan</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(200000)}</span>
                      </li>
                      <li className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span><strong>30 Juli:</strong> Pembayaran Wifi Pos Security</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(193000)}</span>
                      </li>
                      <li className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span><strong>31 Juli:</strong> Perbaikan MCB Pos (2 unit MCB + Jasa Pasang)</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(176000)}</span>
                      </li>
                      <li className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span><strong>06 Agustus:</strong> Pembelian Token Pos & Lampu Jalan</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(200000)}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Cluster B: Gaji Petugas */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Gaji Petugas
                          </h4>
                          <p className="text-[11px] text-slate-500">Honor gaji petugas keamanan komplek</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-rose-700 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {formatRupiah(expenseGajiPeriod1)}
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span><strong>05 Agustus:</strong> Pembayaran Gaji Security Malam periode Juli 2026</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(2000000)}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Cluster C: Perawatan & Perbaikan Taman */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Paintbrush className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Perawatan & Perbaikan Taman
                          </h4>
                          <p className="text-[11px] text-slate-500">Belanja material cat, thinner, kuas & upah pengerjaan tukang</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-rose-700 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {formatRupiah(expenseTamanPeriod1)}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        <strong>12 Agustus:</strong> Belanja material dan pengerjaan taman:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-xs text-slate-700">4 Kaleng Cat (@ Rp 84.000)</span>
                          <span className="text-xs font-mono font-bold text-slate-900">{formatRupiah(336000)}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-xs text-slate-700">2 Kaleng Thinner (@ Rp 46.000)</span>
                          <span className="text-xs font-mono font-bold text-slate-900">{formatRupiah(92000)}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-xs text-slate-700">2 Kuas Cat (@ Rp 5.000)</span>
                          <span className="text-xs font-mono font-bold text-slate-900">{formatRupiah(10000)}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-xs text-slate-700">Upah Tukang Cat</span>
                          <span className="text-xs font-mono font-bold text-slate-900">{formatRupiah(100000)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">a. Total Operasional Pos & Fasilitas (2 Periode)</p>
                      <p className="text-xs text-slate-500">Token listrik, wifi bulanan & perbaikan fasilitas</p>
                    </div>
                    <span className="font-mono font-black text-rose-700">{formatRupiah(expenseOperasionalPosPeriod1 + expenseOperasionalPosPeriod2)}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">b. Total Gaji Petugas Security (2 Bulan)</p>
                      <p className="text-xs text-slate-500">Honor gaji petugas security malam</p>
                    </div>
                    <span className="font-mono font-black text-rose-700">{formatRupiah(expenseGajiPeriod1 + expenseGajiPeriod2)}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">c. Perawatan Taman & Penerangan Lampu</p>
                      <p className="text-xs text-slate-500">Pengecatan taman (538k) & 14 item instalasi lampu taman (2.344.500)</p>
                    </div>
                    <span className="font-mono font-black text-rose-700">{formatRupiah(expenseTamanPeriod1 + expenseLampuTamanPeriod2)}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">d. Tambahan Konsumsi Malam 17an</p>
                      <p className="text-xs text-slate-500">Konsumsi perayaan HUT RI ke-81</p>
                    </div>
                    <span className="font-mono font-black text-rose-700">{formatRupiah(expense17anPeriod2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Perhitungan Saldo Akhir Equation */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border-2 border-emerald-300 rounded-2xl p-5 sm:p-6 text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Formula Perhitungan Saldo Akhir Kas
              </p>
              <div className="text-sm sm:text-base font-extrabold text-emerald-950 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 leading-relaxed">
                <span className="bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                  {formatRupiah(narrativeData.initAmount)} <span className="text-[11px] font-normal text-slate-500">({narrativeData.initLabel})</span>
                </span>
                <span className="text-emerald-700 text-lg font-black">+</span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs text-emerald-700">
                  {formatRupiah(totalIncome)} <span className="text-[11px] font-normal text-slate-500">(Pemasukan)</span>
                </span>
                <span className="text-emerald-700 text-lg font-black">-</span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs text-rose-700">
                  {formatRupiah(totalExpense)} <span className="text-[11px] font-normal text-slate-500">(Pengeluaran)</span>
                </span>
                <span className="text-emerald-700 text-lg font-black">=</span>
                <span className="bg-amber-300 text-amber-950 px-3 py-1 rounded-lg border border-amber-400 shadow-xs text-base sm:text-lg font-black">
                  {formatRupiah(narrativeData.finalAmount)}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800/80 pt-1">
                Saldo kas warga per {narrativeData.finalDate} tersimpan aman di kas operasional bendahara & rekening warga.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================= VIEW 2: MATRIKS IURAN 43 RUMAH ======================= */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-5">
          {/* Monthly Revenue Bar Cards */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Ringkasan Penerimaan Iuran Per Bulan (Januari - Agustus 2026)
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Total Masuk: {formatRupiah(totalCollectedAll)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
              {[
                { label: 'Jan-26', val: monthlyTotals.jan, count: monthlyPaidHouseCounts.jan },
                { label: 'Feb-26', val: monthlyTotals.feb, count: monthlyPaidHouseCounts.feb },
                { label: 'Mar-26', val: monthlyTotals.mar, count: monthlyPaidHouseCounts.mar },
                { label: 'Apr-26', val: monthlyTotals.apr, count: monthlyPaidHouseCounts.apr },
                { label: 'Mei-26', val: monthlyTotals.may, count: monthlyPaidHouseCounts.may },
                { label: 'Jun-26', val: monthlyTotals.jun, count: monthlyPaidHouseCounts.jun },
                { label: 'Jul-26', val: monthlyTotals.jul, count: monthlyPaidHouseCounts.jul },
                { label: 'Agu-26', val: monthlyTotals.aug, count: monthlyPaidHouseCounts.aug },
              ].map((m) => (
                <div key={m.label} className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-center">
                  <p className="text-[11px] font-bold text-slate-600">{m.label}</p>
                  <p className="text-xs sm:text-sm font-black text-emerald-700 mt-0.5">{formatRupiah(m.val)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{m.count} / 43 Rumah</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filters & Search for Matrix */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Blok / No Rumah (cth: A1, C5, R4)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Block Filter */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                {['all', 'A', 'B', 'C', 'D', 'R'].map((blk) => (
                  <button
                    key={blk}
                    onClick={() => setBlockFilter(blk)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      blockFilter === blk
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {blk === 'all' ? 'Semua Blok' : blk === 'R' ? 'Ruko' : `Blok ${blk}`}
                  </button>
                ))}
              </div>

              {/* Arrears Filter */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  onClick={() => setArrearsFilter('all')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    arrearsFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Semua ({monthlyFees.length})
                </button>
                <button
                  onClick={() => setArrearsFilter('paid')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    arrearsFilter === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Lunas ({fullyPaidCount})
                </button>
                <button
                  onClick={() => setArrearsFilter('unpaid')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    arrearsFilter === 'unpaid' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Tunggakan ({arrearsCount})
                </button>
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <span>Keterangan Status Iuran:</span>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-mono font-bold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> 100k = Lunas
                </span>
                <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-mono font-bold text-[10px] border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> - = Belum Bayar
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">Total 43 Rumah Terdaftar</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3 whitespace-nowrap">Blok / Rumah</th>
                    <th className="py-3 px-3 text-right">Iuran/Bln</th>
                    <th className="py-3 px-2 text-center">Jan-26</th>
                    <th className="py-3 px-2 text-center">Feb-26</th>
                    <th className="py-3 px-2 text-center">Mar-26</th>
                    <th className="py-3 px-2 text-center">Apr-26</th>
                    <th className="py-3 px-2 text-center">Mei-26</th>
                    <th className="py-3 px-2 text-center">Jun-26</th>
                    <th className="py-3 px-2 text-center">Jul-26</th>
                    <th className="py-3 px-2 text-center bg-emerald-950 text-emerald-300">Agu-26</th>
                    <th className="py-3 px-3 text-right">Rekap Iuran</th>
                    <th className="py-3 px-3 text-right">Tunggakan</th>
                    <th className="py-3 px-4">Keterangan</th>
                  </tr>
                  <tr className="bg-emerald-800 text-emerald-100 font-bold text-xs border-b border-emerald-700">
                    <td colSpan={3} className="py-2.5 px-3 text-right font-extrabold">
                      TOTAL PENERIMAAN:
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">{formatRupiah(monthlyTotals.jan)}</td>
                    <td className="py-2.5 px-2 text-center font-mono">{formatRupiah(monthlyTotals.feb)}</td>
                    <td className="py-2.5 px-2 text-center font-mono">{formatRupiah(monthlyTotals.mar)}</td>
                    <td className="py-2.5 px-2 text-center font-mono">{formatRupiah(monthlyTotals.apr)}</td>
                    <td className="py-2.5 px-2 text-center font-mono">{formatRupiah(monthlyTotals.may)}</td>
                    <td className="py-2.5 px-2 text-center font-mono">{formatRupiah(monthlyTotals.jun)}</td>
                    <td className="py-2.5 px-2 text-center font-mono">{formatRupiah(monthlyTotals.jul)}</td>
                    <td className="py-2.5 px-2 text-center font-mono text-emerald-200">{formatRupiah(monthlyTotals.aug)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-white">
                      {formatRupiah(totalCollectedAll)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-rose-200">
                      {formatRupiah(totalArrearsAll)}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-200 text-[11px]">43 Unit Terdaftar</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredMonthlyFees.map((row) => (
                    <tr
                      key={row.no}
                      className={`hover:bg-slate-50 transition-colors ${
                        row.arrears > 0 ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{row.no}</td>
                      <td className="py-2.5 px-3 font-extrabold text-slate-900 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 font-mono text-xs">
                          <Home className="w-3 h-3 text-emerald-600" />
                          {row.blockHouse}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {formatRupiah(row.monthlyFee)}
                      </td>

                      {/* Month Badges */}
                      {(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug'] as const).map((m) => {
                        const paid = row.payments[m];
                        return (
                          <td key={m} className={`py-2.5 px-2 text-center ${m === 'aug' ? 'bg-emerald-50/40' : ''}`}>
                            {paid ? (
                              <span className="inline-block bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]" title={`Rp ${paid.toLocaleString('id-ID')}`}>
                                100k
                              </span>
                            ) : (
                              <span className="inline-block bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-mono font-bold text-[10px]" title="Belum Bayar">
                                -
                              </span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        {row.totalPaid > 0 ? formatRupiah(row.totalPaid) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {row.arrears > 0 ? (
                          <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            {formatRupiah(row.arrears)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {row.notes ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            <Info className="w-3 h-3 text-amber-600" />
                            {row.notes}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= VIEW 3: REKAP TRANSAKSI KAS WARGA ======================= */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-5">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari transaksi, listrik, security, token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Type Segment */}
              <div className="flex rounded-xl bg-slate-100 p-1 w-full sm:w-auto">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    typeFilter === 'all'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({filteredCash.length})
                </button>
                <button
                  onClick={() => setTypeFilter('Pemasukan')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    typeFilter === 'Pemasukan'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pemasukan ({filteredCash.filter((c) => c.type === 'Pemasukan').length})
                </button>
                <button
                  onClick={() => setTypeFilter('Pengeluaran')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    typeFilter === 'Pengeluaran'
                      ? 'bg-white text-rose-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pengeluaran ({filteredCash.filter((c) => c.type === 'Pengeluaran').length})
                </button>
              </div>
            </div>
          </div>

          {/* Table of Cash Transactions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Kategori Kas</th>
                    <th className="py-3.5 px-4">Keterangan / Rincian Transaksi</th>
                    <th className="py-3.5 px-4">Pencatat</th>
                    <th className="py-3.5 px-4 text-right">Debit (Keluar)</th>
                    <th className="py-3.5 px-4 text-right">Kredit (Masuk)</th>
                    <th className="py-3.5 px-4 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Saldo Awal Row */}
                  <tr className="bg-slate-50/90 font-medium">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">•</td>
                    <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap font-bold">{periodInitialDate}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold px-2 py-0.5 rounded-full text-[11px] bg-slate-200 text-slate-800 border border-slate-300">
                        Saldo Kas Awal
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">
                        {selectedPeriod === 'period2'
                          ? 'Saldo Kas Awal Periode 2 (Sisa Kas Periode 14 Juli - 14 Agustus 2026)'
                          : selectedPeriod === 'period1'
                          ? INITIAL_RT_CASH_TITLE
                          : 'Saldo Kas Awal RT (14 Juli 2026)'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Saldo per {periodInitialDate}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">Bendahara Kas</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">-</td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-bold">{formatRupiah(periodInitialBalance)}</td>
                    <td className="py-3.5 px-4 text-center text-slate-400 text-xs">Awal</td>
                  </tr>

                  {filteredCash.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">{item.date}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                            item.type === 'Pemasukan'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{item.title}</p>
                        {item.notes && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.notes}</p>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{item.recordedBy || 'Pengurus Kas'}</td>
                      
                      {/* Debit (Expense) */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm whitespace-nowrap">
                        {item.type === 'Pengeluaran' ? (
                          <span className="text-rose-600">
                            {formatRupiah(item.amount)}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Kredit (Income) */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm whitespace-nowrap">
                        {item.type === 'Pemasukan' ? (
                          <span className="text-emerald-600">
                            {formatRupiah(item.amount)}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => {
                              setItemToEdit(item);
                              setIsModalOpen(true);
                            }}
                            className="px-2 py-1 text-slate-500 hover:text-emerald-700 text-xs font-semibold rounded hover:bg-emerald-50"
                            title="Edit Catatan"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRequestDelete(item)}
                            className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs font-semibold rounded hover:bg-rose-50"
                            title="Hapus"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <td colSpan={5} className="py-3.5 px-4 text-right text-slate-700">
                      TOTAL PENGELUARAN & PEMASUKAN:
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-rose-600 font-extrabold">
                      {formatRupiah(totalExpense)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-extrabold">
                      {formatRupiah(totalIncome)}
                    </td>
                    <td></td>
                  </tr>
                  <tr className="bg-amber-100 font-black border-t border-amber-300 text-sm">
                    <td colSpan={5} className="py-4 px-4 text-right text-amber-950 font-black">
                      SALDO KAS AKHIR ({periodEndDate.toUpperCase()}):
                    </td>
                    <td colSpan={2} className="py-4 px-4 text-right font-mono text-amber-950 text-base font-black">
                      {formatRupiah(finalBalance)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      <RTCashModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={onSaveCashItem}
        itemToEdit={itemToEdit}
      />

      <AdminConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        itemName={confirmDialog.itemName}
        confirmButtonText={confirmDialog.confirmButtonText}
        isBulkAction={confirmDialog.isBulkAction}
      />
    </div>
  );
};
