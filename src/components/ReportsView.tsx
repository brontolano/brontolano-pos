import React, { useState } from "react";
import { Product, Transaction } from "../types";
import { TrendingUp, Printer, Download, FileSpreadsheet, Award, DollarSign, PieChart as PieIcon, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface ReportsViewProps {
  products: Product[];
  transactions: Transaction[];
  onSyncToSheets: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  transactions,
  onSyncToSheets
}) => {
  const [period, setPeriod] = useState<"Harian" | "Mingguan" | "Bulanan">("Bulanan");

  const totalRevenue = transactions
    .filter((t) => t.status === "Sukses" || t.status === "Selesai")
    .reduce((acc, t) => acc + t.grandTotal, 0);

  const grossProfit = Math.round(totalRevenue * 0.6);
  const netProfit = Math.round(totalRevenue * 0.45);

  const chartData = [
    { name: "Minggu 1", revenue: Math.round(totalRevenue * 0.2), profit: Math.round(netProfit * 0.2) },
    { name: "Minggu 2", revenue: Math.round(totalRevenue * 0.25), profit: Math.round(netProfit * 0.25) },
    { name: "Minggu 3", revenue: Math.round(totalRevenue * 0.25), profit: Math.round(netProfit * 0.25) },
    { name: "Minggu 4", revenue: Math.round(totalRevenue * 0.3), profit: Math.round(netProfit * 0.3) }
  ];

  const itemMap: Record<string, { name: string; category: string; sold: number; total: number }> = {};
  transactions
    .filter((t) => t.status === "Sukses" || t.status === "Selesai")
    .forEach((tx) => {
      tx.items.forEach((item) => {
        const prodMatch = products.find((p) => p.name === item.name);
        const cat = prodMatch ? prodMatch.category : "Umum";
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, category: cat, sold: 0, total: 0 };
        }
        itemMap[item.name].sold += item.qty;
        itemMap[item.name].total += item.price * item.qty;
      });
    });

  const topSelling = Object.values(itemMap)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan & Analisa Bisnis</h2>
          <p className="text-sm text-slate-500 font-medium">
            Laporan keuangan, marjin keuntungan, dan performa produk terlaris
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSyncToSheets}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Laporan Google Sheets</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(["Harian", "Mingguan", "Bulanan"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === p
                ? "bg-[#1954d6] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Laporan {p}
          </button>
        ))}
      </div>

      {/* Top 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">TOTAL OMZET</p>
          <h3 className="text-2xl font-bold text-[#1954d6] mt-1">{formatRupiah(totalRevenue)}</h3>
          <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
            <TrendingUp className="w-3 h-3 mr-1" /> +18.4% MoM
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">LABA KOTOR</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatRupiah(grossProfit)}</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">Margin Kotor: 60.6%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">LABA BERSIH</p>
          <h3 className="text-2xl font-bold text-indigo-600 mt-1">{formatRupiah(netProfit)}</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">Setelah Biaya Ops.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">PRODUK TERJUAL</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">1,240 Unit</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">Rata-rata 41 Unit/hari</p>
        </div>
      </div>

      {/* Charts & Top Products Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Grafik Performa Keuangan</h3>
              <p className="text-xs text-slate-500">Perbandingan Omzet vs Laba Bersih</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1954d6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1954d6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip formatter={(value: number) => [formatRupiah(value)]} />
                <Area type="monotone" dataKey="revenue" name="Omzet" stroke="#1954d6" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" name="Laba" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Produk Terlaris</span>
            </h3>
          </div>
          <div className="space-y-3">
            {topSelling.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Belum ada data penjualan produk asli</p>
            ) : (
              topSelling.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1954d6] font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</p>
                      <span className="text-[10px] text-slate-400">{item.sold} Terjual</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#1954d6]">{formatRupiah(item.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
