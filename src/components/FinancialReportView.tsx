import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Upload,
  Building2,
  TrendingUp,
  TrendingDown,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { AppState } from '../types';
import { formatRupiah, exportFinancialReportCSV } from '../utils/formatters';

interface FinancialReportViewProps {
  state: AppState;
  onImportState: (newState: AppState) => void;
  onResetData: () => void;
}

export const FinancialReportView: React.FC<FinancialReportViewProps> = ({
  state,
  onImportState,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const totalIncome = state.donors.reduce((sum, d) => sum + d.amount, 0);
  const totalExpense = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  // Generate & Download PDF using html2canvas + jsPDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Laporan_Keuangan_HUT_RI_81_GreenBussan_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Gagal membuat PDF:', error);
      alert('Gagal mengunduh PDF secara langsung. Membuka mode cetak alternatif...');
      openPrintWindow();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Print Window Fallback (for iframe constraints)
  const openPrintWindow = () => {
    if (!reportRef.current) {
      try {
        window.print();
      } catch (e) {
        alert('Proses cetak diblokir oleh browser.');
      }
      return;
    }

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Laporan Keuangan HUT RI 81 Green Bussan Village</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body { padding: 0; margin: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body class="p-8 bg-white text-slate-900">
            <div class="no-print mb-4 p-3 bg-slate-100 rounded-xl flex justify-between items-center border border-slate-200">
              <span class="text-xs text-slate-600 font-semibold">Pratinjau Cetak Laporan Keuangan</span>
              <button onclick="window.print()" class="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Cetak Halaman Ini</button>
            </div>
            ${reportRef.current.innerHTML}
            <script>
              setTimeout(() => {
                window.print();
              }, 600);
            </script>
          </body>
        </html>
      `);
      printWin.document.close();
    } else {
      try {
        window.print();
      } catch (e) {
        alert('Fitur print diblokir iframe. Silakan gunakan tombol Unduh PDF.');
      }
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    exportFinancialReportCSV(state.donors, state.expenses, totalIncome, totalExpense, balance);
  };

  // JSON Export / Backup
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Backup_Data_17an_GreenBussan_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // JSON Import / Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.competitions && parsed.participants && parsed.donors && parsed.expenses) {
            onImportState(parsed);
            alert('Data berhasil diimpor!');
          } else {
            alert('Format file JSON tidak valid.');
          }
        } catch (err) {
          alert('Gagal membaca file JSON.');
        }
      };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Action Bar (Hidden when printing) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-red-600" /> Rekapitulasi & Laporan Keuangan Real-Time
          </h2>
          <p className="text-xs text-slate-500">
            Laporan keuangan resmi Panitia HUT RI ke-81 Green Bussan Village
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct PDF Download Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 focus:outline-none cursor-pointer"
            title="Unduh laporan dalam format PDF"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses PDF...</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>Cetak / Unduh PDF</span>
              </>
            )}
          </button>

          {/* New Tab / Browser Print Button */}
          <button
            onClick={openPrintWindow}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 focus:outline-none cursor-pointer"
            title="Buka tampilan cetak di jendela baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Print Tab Baru</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 focus:outline-none cursor-pointer"
            title="Unduh format spreadsheet Excel/CSV"
          >
            <Download className="w-4 h-4" />
            <span>Unduh CSV</span>
          </button>

          {/* Backup JSON Button */}
          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 focus:outline-none cursor-pointer"
            title="Backup Data JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 focus:outline-none cursor-pointer"
            title="Restore Data JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore</span>
          </button>
        </div>
      </div>

      {/* Official Report Container (Styled for screen & print) */}
      <div
        ref={reportRef}
        className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-md max-w-4xl mx-auto space-y-8 text-slate-900 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none"
      >
        {/* Printable Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Building2 className="w-6 h-6 text-red-600" />
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900">
              PANITIA PERINGATAN HUT RI KE-81
            </h1>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-red-700">
            KOMPLEK PERUMAHAN GREEN BUSSAN VILLAGE
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Jl. Lebak Murni, Sako, Palembang | Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-base font-black underline uppercase text-slate-900">
            LAPORAN REKAPITULASI KEUANGAN TRANSPARAN
          </h3>
          <p className="text-xs text-slate-600 italic mt-0.5">
            Pertanggungjawaban Pemasukan Donasi & Pengeluaran Kegiatan 17 Agustus 2026
          </p>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Pemasukan</span>
            <span className="text-base sm:text-xl font-black text-emerald-700">
              {formatRupiah(totalIncome)}
            </span>
          </div>

          <div className="text-center border-x border-slate-200 px-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Pengeluaran</span>
            <span className="text-base sm:text-xl font-black text-rose-700">
              {formatRupiah(totalExpense)}
            </span>
          </div>

          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Saldo Sisa Kas</span>
            <span className={`text-base sm:text-xl font-black ${balance >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
              {formatRupiah(balance)}
            </span>
          </div>
        </div>

        {/* Section 1: Income / Donors */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 print:hidden" /> A. RINCIAN PEMASUKAN & DONASI WARGA
          </h4>

          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
              <tr>
                <th className="p-2 border-r border-slate-200 w-10 text-center">No</th>
                <th className="p-2 border-r border-slate-200">Nama Donatur</th>
                <th className="p-2 border-r border-slate-200">Blok / Rumah</th>
                <th className="p-2 border-r border-slate-200">Tanggal</th>
                <th className="p-2 border-r border-slate-200 text-right">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {state.donors.map((d, idx) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="p-2 border-r border-slate-200 text-center">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-200 font-semibold">{d.name}</td>
                  <td className="p-2 border-r border-slate-200">{d.houseNo}</td>
                  <td className="p-2 border-r border-slate-200">{d.date}</td>
                  <td className="p-2 border-r border-slate-200 text-right font-bold text-emerald-700">
                    {formatRupiah(d.amount)}
                  </td>
                </tr>
              ))}
              <tr className="bg-emerald-50 font-black text-slate-900">
                <td colSpan={4} className="p-2 border-r border-slate-200 text-right uppercase">
                  TOTAL PEMASUKAN:
                </td>
                <td className="p-2 text-right text-emerald-800">{formatRupiah(totalIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Expenses */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-600 print:hidden" /> B. RINCIAN PENGELUARAN & BELANJA PANITIA
          </h4>

          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
              <tr>
                <th className="p-2 border-r border-slate-200 w-10 text-center">No</th>
                <th className="p-2 border-r border-slate-200">Keterangan Belanja</th>
                <th className="p-2 border-r border-slate-200">Kategori</th>
                <th className="p-2 border-r border-slate-200">PIC</th>
                <th className="p-2 border-r border-slate-200 text-right">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {state.expenses.map((e, idx) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="p-2 border-r border-slate-200 text-center">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-200 font-semibold">{e.title}</td>
                  <td className="p-2 border-r border-slate-200">{e.category}</td>
                  <td className="p-2 border-r border-slate-200">{e.pic}</td>
                  <td className="p-2 border-r border-slate-200 text-right font-bold text-rose-700">
                    {formatRupiah(e.amount)}
                  </td>
                </tr>
              ))}
              <tr className="bg-rose-50 font-black text-slate-900">
                <td colSpan={4} className="p-2 border-r border-slate-200 text-right uppercase">
                  TOTAL PENGELUARAN:
                </td>
                <td className="p-2 text-right text-rose-800">{formatRupiah(totalExpense)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Final Balance Box */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between text-sm font-bold print:bg-slate-100 print:text-slate-900 print:border print:border-slate-900">
          <span>SISA KAS PANITIA KEMERDEKAAN:</span>
          <span className="text-lg font-black">{formatRupiah(balance)}</span>
        </div>

        {/* Official Signatures for Printing */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-800">
          <div className="space-y-12">
            <p>Mengetahui,<br /><strong>Ketua Panitia HUT RI 81</strong></p>
            <div>
              <p className="font-bold underline">( Akhmad Khudri )</p>
              <p className="text-[10px] text-slate-500">Green Bussan Village</p>
            </div>
          </div>

          <div className="space-y-12">
            <p>Disusun Oleh,<br /><strong>Pengawas Kegiatan</strong></p>
            <div>
              <p className="font-bold underline">( Tri Sulistyo )</p>
              <p className="text-[10px] text-slate-500">Green Bussan Village</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
