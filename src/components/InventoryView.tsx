import React, { useState } from "react";
import { Product } from "../types";
import { Plus, Search, Filter, AlertTriangle, Package, CheckCircle2, LayoutGrid, List, Edit, Trash2 } from "lucide-react";

import { handleImageError } from "../utils/imageUtils";

interface InventoryViewProps {
  products: Product[];
  categories: string[];
  onAddProductClick: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  initialLowStockFilter?: boolean;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  categories,
  onAddProductClick,
  onEditProduct,
  onDeleteProduct,
  initialLowStockFilter = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [onlyLowStock, setOnlyLowStock] = useState(initialLowStockFilter);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filtered Products Logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua Kategori" || p.category === selectedCategory;
    const matchesLowStock = !onlyLowStock || p.stock <= p.minStock;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const totalItemsCount = products.length;
  const totalInventoryValue = products.reduce(
    (acc, p) => acc + p.price * p.stock,
    0
  );
  const criticalStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const activeCategoriesCount = categories.filter((c) => c !== "Semua Kategori").length || new Set(products.map((p) => p.category)).size;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Stok & Inventori</h2>
          <p className="text-sm text-slate-500 font-medium">
            Kelola katalog produk, pantau persediaan, dan harga jual toko
          </p>
        </div>
        <button
          onClick={onAddProductClick}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1954d6] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Barang Baru</span>
        </button>
      </div>

      {/* Top 4 Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Produk */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">TOTAL PRODUK</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalItemsCount.toLocaleString()} Item</h3>
          <p className="text-xs text-slate-500 mt-1">
            {totalItemsCount > 0 ? `${activeCategoriesCount} Kategori Terorganisir` : "Belum ada produk"}
          </p>
        </div>

        {/* Nilai Inventori */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">NILAI INVENTORI</p>
          <h3 className="text-2xl font-bold text-[#1954d6] mt-1">{formatRupiah(totalInventoryValue)}</h3>
          <p className="text-xs text-slate-500 mt-1">Berdasarkan HPP/Harga Jual</p>
        </div>

        {/* Stok Kritis */}
        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 shadow-xs">
          <p className="text-xs font-bold text-red-800 uppercase tracking-wider">STOK KRITIS</p>
          <h3 className="text-2xl font-bold text-red-900 mt-1">
            {criticalStockCount} Produk
          </h3>
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className="text-xs text-red-700 font-bold underline mt-1 block cursor-pointer"
          >
            {onlyLowStock ? "Tampilkan Semua" : "Filter Stok Kritis"}
          </button>
        </div>

        {/* Kategori */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">KATEGORI</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {products.length > 0 ? new Set(products.map((p) => p.category)).size : 0} Group
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {products.length > 0 ? "Terorganisir baik" : "Belum ada kategori"}
          </p>
        </div>
      </div>

      {/* Action Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama barang atau SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:border-[#1954d6]"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400 w-4 h-4 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 bg-slate-50 text-sm font-medium text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Low Stock Toggle Button */}
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              onlyLowStock
                ? "bg-red-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Stok Kritis</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 ml-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-slate-600 transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-white shadow-xs text-[#1954d6]" : ""
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-slate-600 transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-white shadow-xs text-[#1954d6]" : ""
              }`}
              title="Tampilan Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table / Grid Content */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Produk</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Sisa Stok</th>
                  <th className="py-3.5 px-4 text-right">Harga Jual</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  const stockPercent = Math.min(100, Math.round((p.stock / (p.minStock * 3 || 30)) * 100));

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            onError={handleImageError}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <span className="text-xs text-slate-400">Min. {p.minStock} Unit</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-600">{p.sku}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 w-48">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className={`font-bold ${isLow ? "text-red-600" : "text-emerald-700"}`}>
                              {p.stock} Unit
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {isLow ? "KRITIS" : "AMAN"}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isLow ? "bg-red-500" : "bg-emerald-500"}`}
                              style={{ width: `${Math.max(10, stockPercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 text-slate-600 hover:text-[#1954d6] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const isLow = p.stock <= p.minStock;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <img src={p.image} alt={p.name} onError={handleImageError} className="w-full h-full object-cover" />
                    <span
                      className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${
                        isLow ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                      }`}
                    >
                      {isLow ? "STOK KRITIS" : "STOK AMAN"}
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {p.category} • {p.sku}
                    </span>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                    <p className="text-lg font-bold text-[#1954d6]">{formatRupiah(p.price)}</p>
                    <p className="text-xs text-slate-500 font-medium">Stok Tersedia: {p.stock} Unit</p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => onEditProduct(p)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-[#1954d6] text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteProduct(p.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
