import React from "react";
import { Product, Transaction, NavigationTab } from "../types";
import { Banknote, Receipt, AlertTriangle, BarChart2, TrendingUp, ArrowRight, ShoppingBag, Users } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface DashboardViewProps {
  products: Product[];
  transactions: Transaction[];
  onNavigateTab: (tab: NavigationTab) => void;
  onFilterLowStock: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  transactions,
  onNavigateTab,
  onFilterLowStock
}) => {
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const totalSales = transactions
    .filter((t) => t.status === "Sukses" || t.status === "Selesai")
    .reduce((acc, curr) => acc + curr.grandTotal, 0);

  const totalTxCount = transactions.length;
  const avgTxValue = totalTxCount > 0 && totalSales > 0 ? Math.round(totalSales / totalTxCount) : 0;

  const totalSoldUnits = transactions
    .filter((t) => t.status === "Sukses" || t.status === "Selesai")
    .reduce((acc, curr) => acc + curr.items.reduce((sum, item) => sum + item.qty, 0), 0);

  const uniqueCustomersCount = new Set(
    transactions.map((t) => t.customer).filter((c) => c && c.trim() !== "" && c !== "Pelanggan Umum")
  ).size;

  // Chart Data for 7 Days Sales Trend dynamically calculated
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const chartData = days.map((day, idx) => {
    let salesForDay = 0;
    transactions.forEach((tx) => {
      if (tx.status === "Sukses" || tx.status === "Selesai") {
        const txDate = tx.date ? new Date(tx.date) : new Date();
        const dayIdx = (txDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        if (!isNaN(txDate.getTime()) && dayIdx === idx) {
          salesForDay += tx.grandTotal;
        }
      }
    });
    return { day, sales: salesForDay };
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Performa Toko</h2>
        <p className="text-sm text-slate-500 font-medium">
          Ringkasan aktivitas hari ini, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Penjualan */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TOTAL PENJUALAN</span>
            <div className="p-2 bg-blue-50 text-[#1954d6] rounded-xl">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-[#1954d6] tracking-tight">{formatRupiah(totalSales)}</h3>
            {totalSales > 0 ? (
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Realtime
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                Belum ada
              </span>
            )}
          </div>
        </div>

        {/* Transaksi */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TRANSAKSI</span>
            <div className="p-2 bg-blue-50 text-[#1954d6] rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{totalTxCount}</h3>
            <span className="text-xs text-slate-500 font-medium">
              {totalTxCount > 0 ? `${totalSoldUnits} item terjual` : "0 struk"}
            </span>
          </div>
        </div>

        {/* Stok Rendah Alert */}
        <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs relative transition-colors ${
          lowStockCount > 0 
            ? "bg-red-50/70 border-red-200" 
            : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              lowStockCount > 0 ? "text-red-800" : "text-slate-500"
            }`}>STOK RENDAH</span>
            <AlertTriangle className={`w-5 h-5 ${
              lowStockCount > 0 ? "text-red-600" : "text-slate-400"
            }`} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-2xl font-bold tracking-tight ${
                lowStockCount > 0 ? "text-red-900" : "text-slate-900"
              }`}>
                {lowStockCount} Produk
              </h3>
              <p className={`text-xs font-medium mt-0.5 ${
                lowStockCount > 0 ? "text-red-700" : "text-slate-500"
              }`}>
                {lowStockCount > 0 ? "Perlu restok segera" : "Stok aman terkendali"}
              </p>
            </div>
            {lowStockCount > 0 && (
              <button
                onClick={() => {
                  onFilterLowStock();
                  onNavigateTab("inventori");
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                DETAIL
              </button>
            )}
          </div>
        </div>

        {/* Avg. Transaksi */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AVG. TRANSAKSI</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <BarChart2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{formatRupiah(avgTxValue)}</h3>
            <span className="text-xs text-slate-500 font-medium">
              {totalTxCount > 0 ? "Rata-rata per struk" : "Belum ada transaksi"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Sales Trend Chart & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Tren Penjualan (7 Hari)</h3>
              <p className="text-xs text-slate-500">Data omzet harian minggu ini</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-[#1954d6] rounded-xs"></span>
              <span className="text-xs text-slate-600 font-medium">Sukses</span>
            </div>
          </div>

          <div className="h-64 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v: number) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value) || 0), "Penjualan"]}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="sales" fill="#1954d6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Additional Sub Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-[#1954d6] rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">PRODUK TERJUAL</p>
                <p className="text-lg font-bold text-slate-900">{totalSoldUnits.toLocaleString()} Unit</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">PELANGGAN AKTIF</p>
                <p className="text-lg font-bold text-slate-900">{uniqueCustomersCount} Pelanggan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions List (1 column) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Transaksi Terakhir</h3>
              <button
                onClick={() => onNavigateTab("transaksi")}
                className="text-xs font-bold text-[#1954d6] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  Belum ada riwayat transaksi
                </div>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 text-[#1954d6] rounded-xl flex items-center justify-center font-bold text-xs">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{tx.id}</p>
                      <p className="text-xs text-slate-500">{tx.time} • {tx.items.length} Item</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1954d6]">{formatRupiah(tx.grandTotal)}</p>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        tx.status === "Sukses" || tx.status === "Selesai"
                          ? "bg-blue-100 text-blue-800"
                          : tx.status === "Tertunda" || tx.status === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-4 italic">Terakhir diperbarui: Just now</p>
        </div>
      </div>
    </div>
  );
};
