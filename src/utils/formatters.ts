/**
 * Utility functions for formatting currency, dates, and export tools
 */

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndonesian(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFinancialReportCSV(
  donors: any[],
  expenses: any[],
  totalIncome: number,
  totalExpense: number,
  balance: number
) {
  let csv = 'LAPORAN KEUANGAN HUT RI KE-81 KOMPLEK GREEN BUSSAN VILLAGE\n';
  csv += `Tanggal Cetak,${new Date().toLocaleDateString('id-ID')}\n\n`;

  csv += '--- RINGKASAN ARUS KAS ---\n';
  csv += `Total Pemasukan (Donasi/Sponsor),Rp ${totalIncome}\n`;
  csv += `Total Pengeluaran,Rp ${totalExpense}\n`;
  csv += `Sisa Kas / Saldo Akhir,Rp ${balance}\n\n`;

  csv += '--- DETAIL PEMASUKAN / DONATUR ---\n';
  csv += 'No,Nama Donatur,Blok/Rumah,Jumlah (Rp),Tanggal,Metode,Catatan\n';
  donors.forEach((d, idx) => {
    csv += `${idx + 1},"${d.name}","${d.houseNo}",${d.amount},"${d.date}","${d.paymentMethod}","${d.notes || '-'}"\n`;
  });

  csv += '\n--- DETAIL PENGELUARAN ---\n';
  csv += 'No,Keterangan Pengeluaran,Kategori,Jumlah (Rp),Tanggal,Penanggung Jawab,Catatan\n';
  expenses.forEach((e, idx) => {
    csv += `${idx + 1},"${e.title}","${e.category}",${e.amount},"${e.date}","${e.pic}","${e.receiptNote || '-'}"\n`;
  });

  downloadCSV(`Laporan_Keuangan_17an_GreenBussan_${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
