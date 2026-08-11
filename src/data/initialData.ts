import { AppState, Competition, Donor, Expense } from '../types';

const generateCompetitions = (): Competition[] => {
  const comps: Competition[] = [];
  let idCount = 1;

  const ageGroups = [
    { label: '3-5 Tahun', category: 'Anak-anak' as const },
    { label: '6-9 Tahun', category: 'Anak-anak' as const },
    { label: '10-12 Tahun', category: 'Anak-anak' as const },
    { label: 'Remaja', category: 'Remaja' as const },
  ];

  const kidsRemajaPrize = 'Hadiah menarik keperluan sekolah';
  const adultPrize = 'Voucher belanja menarik';

  const defaultProps = {
    date: '16 Agustus 2026',
    time: '08:00 WIB - Selesai',
    location: 'Depan Taman',
    pic: '-',
    maxParticipants: 30,
    status: 'Akan Datang' as const,
  };

  // 1. Makan Kerupuk (Putra & Putri)
  ageGroups.forEach((group) => {
    comps.push({
      id: `comp-${idCount++}`,
      name: `Makan Kerupuk Putra (${group.label})`,
      category: group.category,
      description: `Lomba makan kerupuk untuk putra kategori ${group.label}.`,
      prizes: kidsRemajaPrize,
      ...defaultProps,
    });
    comps.push({
      id: `comp-${idCount++}`,
      name: `Makan Kerupuk Putri (${group.label})`,
      category: group.category,
      description: `Lomba makan kerupuk untuk putri kategori ${group.label}.`,
      prizes: kidsRemajaPrize,
      ...defaultProps,
    });
  });

  // 2. Memasukkan Paku Dalam Botol (Putra & Putri)
  ageGroups.forEach((group) => {
    comps.push({
      id: `comp-${idCount++}`,
      name: `Memasukkan Paku Dalam Botol Putra (${group.label})`,
      category: group.category,
      description: `Lomba ketangkasan memasukkan paku ke dalam botol untuk putra kategori ${group.label}.`,
      prizes: kidsRemajaPrize,
      ...defaultProps,
    });
    comps.push({
      id: `comp-${idCount++}`,
      name: `Memasukkan Paku Dalam Botol Putri (${group.label})`,
      category: group.category,
      description: `Lomba ketangkasan memasukkan paku ke dalam botol untuk putri kategori ${group.label}.`,
      prizes: kidsRemajaPrize,
      ...defaultProps,
    });
  });

  // 3. Memindahkan Bendera (Putra & Putri)
  ageGroups.forEach((group) => {
    comps.push({
      id: `comp-${idCount++}`,
      name: `Memindahkan Bendera Putra (${group.label})`,
      category: group.category,
      description: `Lomba adu kecepatan memindahkan bendera Merah Putih untuk putra kategori ${group.label}.`,
      prizes: kidsRemajaPrize,
      ...defaultProps,
    });
    comps.push({
      id: `comp-${idCount++}`,
      name: `Memindahkan Bendera Putri (${group.label})`,
      category: group.category,
      description: `Lomba adu kecepatan memindahkan bendera Merah Putih untuk putri kategori ${group.label}.`,
      prizes: kidsRemajaPrize,
      ...defaultProps,
    });
  });

  // 4. Balap Kelereng (Putra & Putri)
  ageGroups.forEach((group) => {
    comps.push({
      id: `comp-${idCount++}`,
      name: `Balap Kelereng Putra (${group.label})`,
      category: group.category,
      description: `Lomba keseimbangan membawa kelereng dengan sendok untuk putra kategori ${group.label}.`,
      prizes: kidsRemajaPrize,
      ...defaultProps,
    });
    comps.push({
      id: `comp-${idCount++}`,
      name: `Balap Kelereng Putri (${group.label})`,
      category: group.category,
      description: `Lomba keseimbangan membawa kelereng dengan sendok untuk putri kategori ${group.label}.`,
      prizes: kidsRemajaPrize,
      ...defaultProps,
    });
  });

  // 5. Mewarnai dan Menggambar
  comps.push({
    id: `comp-${idCount++}`,
    name: 'Lomba Mewarnai dan Menggambar Tema Kemerdekaan',
    category: 'Anak-anak',
    description: 'Lomba kreativitas mewarnai dan menggambar bertema kemerdekaan Indonesia.',
    prizes: kidsRemajaPrize,
    ...defaultProps,
  });

  // 6. Ibu-ibu
  comps.push({
    id: `comp-${idCount++}`,
    name: 'Estafet Memindahkan Tepung',
    category: 'Ibu-ibu',
    description: 'Lomba estafet kekompakan tim ibu-ibu memindahkan tepung lewat atas kepala.',
    prizes: adultPrize,
    ...defaultProps,
  });
  comps.push({
    id: `comp-${idCount++}`,
    name: 'Lomba Hias Wajah Suami',
    category: 'Ibu-ibu',
    description: 'Lomba merias wajah suami dengan mata tertutup bagi ibu-ibu.',
    prizes: adultPrize,
    ...defaultProps,
  });

  // 7. Bapak-bapak
  comps.push({
    id: `comp-${idCount++}`,
    name: 'Lomba Gaple',
    category: 'Bapak-bapak',
    description: 'Turnamen gaple / domino antar bapak-bapak Komplek Green Bussan Village.',
    prizes: adultPrize,
    ...defaultProps,
  });
  comps.push({
    id: `comp-${idCount++}`,
    name: 'Main Bola Pakai Daster',
    category: 'Bapak-bapak',
    description: 'Pertandingan sepak bola kocak antar bapak-bapak menggunakan daster.',
    prizes: adultPrize,
    ...defaultProps,
  });

  return comps;
};

const initialDonors: Donor[] = [
  {
    id: 'donor-1',
    name: 'Yudi',
    houseNo: '-',
    amount: 200000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-2',
    name: 'Defri',
    houseNo: '-',
    amount: 100000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-3',
    name: 'Antonius (Tyo)',
    houseNo: '-',
    amount: 200000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-4',
    name: 'Putra',
    houseNo: '-',
    amount: 200000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-5',
    name: 'Syarifa',
    houseNo: 'Blok B5',
    amount: 150000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-6',
    name: 'Tyo',
    houseNo: '-',
    amount: 10000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-7',
    name: 'Jeri',
    houseNo: '-',
    amount: 200000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-8',
    name: 'Juna',
    houseNo: '-',
    amount: 50000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-9',
    name: 'Eliza',
    houseNo: '-',
    amount: 50000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-10',
    name: 'Rizal',
    houseNo: '-',
    amount: 100000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-11',
    name: 'Liem',
    houseNo: '-',
    amount: 100000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-12',
    name: 'Angga (Tyo)',
    houseNo: '-',
    amount: 500000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-13',
    name: 'Antonius (Tyo)',
    houseNo: '-',
    amount: 250000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-14',
    name: 'Hendra',
    houseNo: '-',
    amount: 500000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-15',
    name: 'Fahri',
    houseNo: '-',
    amount: 200000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-16',
    name: 'Jefri',
    houseNo: '-',
    amount: 100000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-17',
    name: 'Sapdian',
    houseNo: '-',
    amount: 100000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-18',
    name: 'Hamba Allah (Imam)',
    houseNo: '-',
    amount: 150000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-19',
    name: 'Pandu',
    houseNo: '-',
    amount: 150000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-20',
    name: 'Johan',
    houseNo: '-',
    amount: 30000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
  {
    id: 'donor-21',
    name: 'Theofilus',
    houseNo: 'Blok B13',
    amount: 100000,
    date: '10 Agustus 2026',
    paymentMethod: 'Transfer QRIS/Bank',
  },
];

const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    title: 'Hadiah alat tulis',
    category: 'Hadiah & Tropi',
    amount: 452500,
    date: '10 Agustus 2026',
    pic: '-',
  },
  {
    id: 'exp-2',
    title: 'Hadiah tempat makan dan minum anak',
    category: 'Hadiah & Tropi',
    amount: 650000,
    date: '10 Agustus 2026',
    pic: '-',
  },
  {
    id: 'exp-3',
    title: 'Bendera dan umbul-umbul',
    category: 'Spanduk & Dekorasi',
    amount: 80000,
    date: '10 Agustus 2026',
    pic: '-',
  },
  {
    id: 'exp-4',
    title: 'Sewa Tenda 2 unit',
    category: 'Peralatan Lomba',
    amount: 500000,
    date: '10 Agustus 2026',
    pic: '-',
  },
  {
    id: 'exp-5',
    title: 'Sewa Kursi 30 unit',
    category: 'Peralatan Lomba',
    amount: 90000,
    date: '10 Agustus 2026',
    pic: '-',
  },
  {
    id: 'exp-6',
    title: 'Air mineral cup 2 dus (Rencana Pembelian)',
    category: 'Konsumsi',
    amount: 0,
    date: '10 Agustus 2026',
    pic: '-',
    receiptNote: '2 dus air mineral cup (akan dibeli)',
  },
  {
    id: 'exp-7',
    title: 'Hadiah voucher belanja bapak & ibu (Rencana Pembelian)',
    category: 'Hadiah & Tropi',
    amount: 0,
    date: '10 Agustus 2026',
    pic: '-',
    receiptNote: 'Voucher belanja bapak & ibu (akan dibeli)',
  },
];

export const initialAppData: AppState = {
  competitions: generateCompetitions(),
  participants: [],
  donors: initialDonors,
  expenses: initialExpenses,
};
