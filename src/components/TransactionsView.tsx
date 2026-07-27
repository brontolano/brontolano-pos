import React, { useState } from "react";
import { Transaction } from "../types";
import { Search, Filter, FileSpreadsheet, Download, Receipt, CheckCircle2, Clock, XCircle, Eye } from "lucide-react";

interface TransactionsViewProps {
  transactions: Transaction[];
  onViewReceipt: (tx: Transaction) => void;
  onSyncToSheets: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onViewReceipt,
  onSyncToSheets
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [dateFilter, setDateFilter] = useState("Hari Ini");

  const filteredTxs = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.customer && tx.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.items.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus =
      statusFilter === "Semua Status" || tx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const successfulTxs = transactions.filter((t) => t.status === "Sukses" || t.status === "Selesai");
  const totalOmzet = successfulTxs.reduce((acc, t) => acc + t.grandTotal, 0);
  const totalItemsSold = successfulTxs.reduce((acc, t) => acc + t.items.reduce((s, i) => s + i.qty, 0), 0);
  const uniqueCustomersCount = new Set(
    transactions.map((t) => t.customer).filter((c) => c && c.trim() !== "" && c !== "Pelanggan Umum")
  ).size;
  const avgCartValue = transactions.length > 0 && totalOmzet > 0 ? Math.round(totalOmzet / transactions.length) : 0;
  const avgItemsPerTx = transactions.length > 0 ? (totalItemsSold / transactions.length).toFixed(1) : "0";
  const successRateStr = transactions.length > 0 
    ? `${((successfulTxs.length / transactions.length) * 100).toFixed(0)}% Sukses` 
    : "Belum ada";

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleExportCSV = () => {
    const headers = ["ID Transaksi", "Tanggal", "Waktu", "Pelanggan", "Total", "Metode Pembayaran", "Status"];
    const rows = filteredTxs.map((t) => [
      t.id,
      t.date,
      t.time,
      t.customer || "Guest",
      t.grandTotal,
      t.paymentMethod,
      t.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Transaksi_ProPOS_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat & Daftar Transaksi</h2>
          <p className="text-sm text-slate-500 font-medium">
            Arsip lengkap seluruh penjualan, penerimaan uang, dan status transaksi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSyncToSheets}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Sync Google Sheets</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-700" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top 4 Stat Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">TOTAL TRANSAKSI</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{transactions.length} Struk</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">{successRateStr}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">TOTAL OMZET</p>
          <h3 className="text-2xl font-bold text-[#1954d6] mt-1">{formatRupiah(totalOmzet)}</h3>
          <p className="text-xs text-slate-500 mt-1">{transactions.length > 0 ? "Grosir & Eceran" : "Belum ada omzet"}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">PELANGGAN AKTIF</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{uniqueCustomersCount} Orang</h3>
          <p className="text-xs text-slate-500 mt-1">{uniqueCustomersCount > 0 ? "Pelanggan Terdaftar" : "Belum ada pelanggan"}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">AVG. KERANJANG</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(avgCartValue)}</h3>
          <p className="text-xs text-slate-500 mt-1">{transactions.length > 0 ? `${avgItemsPerTx} Item / Transaksi` : "Belum ada data"}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari ID TRX, Nama Pelanggan, atau Produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30"
          />
        </div>

        {/* Date & Status Selectors */}
        <div className="flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="Hari Ini">Hari Ini</option>
            <option value="7 Hari Terakhir">7 Hari Terakhir</option>
            <option value="30 Hari Terakhir">30 Hari Terakhir</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Sukses">Sukses</option>
            <option value="Tertunda">Tertunda</option>
            <option value="Batal">Batal</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">ID Transaksi</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Ringkasan Item</th>
                <th className="py-3.5 px-4">Metode</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs italic">
                    Belum ada riwayat transaksi
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1954d6]">{tx.id}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    <div>{tx.date}</div>
                    <div className="text-slate-400">{tx.time}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{tx.customer || "Guest"}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                    {tx.items.map((i) => `${i.name} (${i.qty})`).join(", ")}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatRupiah(tx.grandTotal)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        tx.status === "Sukses" || tx.status === "Selesai"
                          ? "bg-blue-100 text-blue-800"
                          : tx.status === "Tertunda" || tx.status === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tx.status === "Sukses" && <CheckCircle2 className="w-3 h-3" />}
                      {tx.status === "Tertunda" && <Clock className="w-3 h-3" />}
                      {tx.status === "Batal" && <XCircle className="w-3 h-3" />}
                      <span>{tx.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onViewReceipt(tx)}
                      className="p-1.5 text-slate-600 hover:text-[#1954d6] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Lihat Struk"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
