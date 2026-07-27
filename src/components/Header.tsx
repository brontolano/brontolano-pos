import React, { useState, useEffect, useRef } from "react";
import { handleImageError, DEFAULT_AVATAR } from "../utils/imageUtils";
import {
  Bell,
  Search,
  Settings,
  LogOut,
  AlertTriangle,
  ShoppingBag,
  CloudCheck,
  CheckCircle2,
  X,
  Check,
  ChevronRight,
  Sparkles,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import { Product, Transaction, StoreSettings, NavigationTab } from "../types";

interface HeaderProps {
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  isSheetsConnected?: boolean;
  storeName?: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  products?: Product[];
  transactions?: Transaction[];
  settings?: StoreSettings;
  onNavigateTab?: (tab: NavigationTab, filterLowStock?: boolean) => void;
}

export interface NotificationItem {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  message: string;
  time: string;
  category: "stok" | "transaksi" | "system";
  actionTab?: NavigationTab;
  filterLowStock?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  searchValue = "",
  onOpenSettings,
  onLogout,
  storeName = "Brontolano POS",
  userName = "Hamdan Sumedang",
  userRole = "Super Admin",
  userAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  products = [],
  transactions = [],
  settings,
  onNavigateTab
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"semua" | "stok" | "transaksi" | "system">("semua");
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("brontolano_read_notifs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("brontolano_read_notifs", JSON.stringify(readIds));
  }, [readIds]);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Format currency helper
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Build notifications dynamically
  const notifications: NotificationItem[] = [];

  // 1. Low Stock Alerts
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  lowStockProducts.forEach((p) => {
    notifications.push({
      id: `low-stock-${p.id}`,
      type: "warning",
      title: `Stok Kritis: ${p.name}`,
      message: `Sisa stok ${p.stock} unit (Batas minimum: ${p.minStock} unit). Perlu restock segera!`,
      time: "Realtime Alert",
      category: "stok",
      actionTab: "inventori",
      filterLowStock: true
    });
  });

  // 2. Recent Transactions (Top 5)
  const recentTransactions = [...transactions]
    .filter((t) => t.status === "Sukses" || t.status === "Selesai")
    .reverse()
    .slice(0, 5);

  recentTransactions.forEach((tx) => {
    notifications.push({
      id: `tx-${tx.id}`,
      type: "success",
      title: `Transaksi Selesai ${tx.id}`,
      message: `${tx.customer || "Pelanggan Umum"} • ${formatRupiah(tx.grandTotal)} (${tx.paymentMethod})`,
      time: `${tx.date} ${tx.time}`,
      category: "transaksi",
      actionTab: "transaksi"
    });
  });

  // 3. System & Google Workspace Notifications
  if (settings?.webAppUrl) {
    notifications.push({
      id: "sys-script-active",
      type: "info",
      title: "Google Apps Script Live Sync",
      message: "Web App URL aktif & terhubung otomatis dengan Google Sheets & Drive.",
      time: "System Status",
      category: "system",
      actionTab: "pengaturan"
    });
  }

  if (settings?.spreadsheetId) {
    notifications.push({
      id: "sys-sheets-connected",
      type: "info",
      title: "Spreadsheet Google Active",
      message: `Tab "${settings.sheetName || "Transaksi_Brontolano"}" siap menampung data penjualan.`,
      time: "Workspace Info",
      category: "system",
      actionTab: "pengaturan"
    });
  }

  // Unread count
  const unreadNotifications = notifications.filter((n) => !readIds.includes(n.id));
  const unreadCount = unreadNotifications.length;

  // Filtered list
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "semua") return true;
    return n.category === activeFilter;
  });

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(Array.from(new Set([...readIds, ...allIds])));
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!readIds.includes(item.id)) {
      setReadIds([...readIds, item.id]);
    }
    if (item.actionTab && onNavigateTab) {
      onNavigateTab(item.actionTab, item.filterLowStock);
    }
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2.5 sm:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & User Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="relative cursor-pointer group focus:outline-none"
            title="Kelola Profil Pengguna & Pengaturan Toko"
          >
            <img
              src={userAvatar || DEFAULT_AVATAR}
              alt={userName}
              onError={(e) => handleImageError(e, DEFAULT_AVATAR)}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1954d6]/30 group-hover:ring-[#1954d6] transition-all shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#1954d6] tracking-tight leading-tight flex items-center gap-1.5">
                {storeName}
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#1954d6] font-bold border border-blue-200 hidden sm:inline-block">
                  Enterprise POS
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="font-bold text-slate-800">{userName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{userRole}</span>
            </p>
          </div>
        </div>

        {/* Search Bar - Desktop / Tablet */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari produk, transaksi, SKU, atau nama..."
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:border-[#1954d6] transition-all"
          />
        </div>

        {/* Settings, Notifications & Actions */}
        <div className="flex items-center gap-2 relative" ref={popoverRef}>
          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-600 hover:text-[#1954d6] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Pengaturan Toko & Google Workspace"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs font-bold text-slate-700 hidden lg:inline">Pengaturan</span>
            </button>
          )}

          {/* Interactive Notifications Bell */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-xl transition-all relative cursor-pointer flex items-center justify-center ${
              isOpen
                ? "bg-[#1954d6] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            aria-label="Notifikasi System"
            title="Pemberitahuan & Peringatan Stok"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Keluar / Kunci Kasir"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs font-bold text-slate-700 hover:text-red-600 hidden lg:inline">Keluar</span>
            </button>
          )}

          {/* NOTIFICATION POPOVER DROPDOWN */}
          {isOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header Popover */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#1954d6] rounded-lg">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Notifikasi & Peringatan
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {unreadCount > 0
                        ? `${unreadCount} pesan belum dibaca`
                        : "Semua notifikasi terbaca"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                      title="Tandai semua telah dibaca"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Tandai Dibaca</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center border-b border-slate-100 bg-slate-50/80 p-1.5 text-xs font-semibold text-slate-600 overflow-x-auto gap-1">
                <button
                  onClick={() => setActiveFilter("semua")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeFilter === "semua"
                      ? "bg-white text-[#1954d6] font-bold shadow-xs border border-slate-200/60"
                      : "hover:bg-slate-100 text-slate-500"
                  }`}
                >
                  Semua ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveFilter("stok")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeFilter === "stok"
                      ? "bg-white text-amber-700 font-bold shadow-xs border border-slate-200/60"
                      : "hover:bg-slate-100 text-slate-500"
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>Stok Kritis ({notifications.filter((n) => n.category === "stok").length})</span>
                </button>
                <button
                  onClick={() => setActiveFilter("transaksi")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeFilter === "transaksi"
                      ? "bg-white text-emerald-700 font-bold shadow-xs border border-slate-200/60"
                      : "hover:bg-slate-100 text-slate-500"
                  }`}
                >
                  <ShoppingBag className="w-3 h-3 text-emerald-500" />
                  <span>Transaksi</span>
                </button>
              </div>

              {/* Notifications List Body */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">Tidak ada notifikasi di kategori ini</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Sistem berjalan dengan aman dan lancar.</p>
                  </div>
                ) : (
                  filteredNotifications.map((item) => {
                    const isRead = readIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50 relative group ${
                          !isRead ? "bg-blue-50/40" : "bg-white"
                        }`}
                      >
                        {/* Icon Badge */}
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            item.type === "warning"
                              ? "bg-amber-100 text-amber-800"
                              : item.type === "success"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-[#1954d6]"
                          }`}
                        >
                          {item.type === "warning" && <AlertTriangle className="w-4 h-4" />}
                          {item.type === "success" && <ShoppingBag className="w-4 h-4" />}
                          {item.type === "info" && <FileSpreadsheet className="w-4 h-4" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4
                              className={`text-xs font-bold line-clamp-1 ${
                                !isRead ? "text-slate-900 font-extrabold" : "text-slate-700"
                              }`}
                            >
                              {item.title}
                            </h4>
                            <span className="text-[10px] font-medium text-slate-400 shrink-0">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                          {item.actionTab && (
                            <div className="mt-1.5 flex items-center text-[11px] font-bold text-[#1954d6] group-hover:underline gap-1">
                              <span>Buka Menu {item.actionTab.toUpperCase()}</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {/* Unread Red Dot */}
                        {!isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 self-center" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] font-medium text-slate-500">
                  Brontolano POS Cloud Monitor
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setReadIds(notifications.map((n) => n.id))}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-bold hover:underline cursor-pointer"
                  >
                    Bersihkan Tanda
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
