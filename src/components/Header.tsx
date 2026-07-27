import React from "react";
import { Bell, Search, FileSpreadsheet, HardDrive, CheckCircle2, Settings, LogOut } from "lucide-react";

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
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  searchValue = "",
  onOpenSettings,
  onLogout,
  isSheetsConnected = true,
  storeName = "Brontolano POS",
  userName = "Hamdan Sumedang",
  userRole = "Pemilik Toko (Owner)",
  userAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & User Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="relative cursor-pointer group focus:outline-none"
            title="Kelola Profil Pengguna"
          >
            <img
              src={userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1954d6]/30 group-hover:ring-[#1954d6] transition-all shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#1954d6] tracking-tight leading-tight">
                {storeName} <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-[#1954d6] font-semibold border border-blue-200 hidden sm:inline-block">Enterprise</span>
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
            placeholder="Cari produk, transaksi, atau SKU..."
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:border-[#1954d6] transition-all"
          />
        </div>

        {/* Settings & Notifications */}
        <div className="flex items-center gap-2">
          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-600 hover:text-[#1954d6] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Pengaturan Toko & Google Workspace"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">Pengaturan</span>
            </button>
          )}

          {/* Notifications Bell */}
          <button
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Keluar / Kunci Aplikasi (Logout)"
            >
              <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-600" />
              <span className="text-xs font-bold text-slate-700 hover:text-red-600 hidden lg:inline">Keluar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
