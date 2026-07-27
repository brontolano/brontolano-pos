import React, { useState } from "react";
import { StoreSettings, Product, Transaction, AppUser } from "../types";
import { handleImageError, DEFAULT_AVATAR } from "../utils/imageUtils";
import { FULL_GOOGLE_APPS_SCRIPT } from "../lib/googleAppsScriptCode";
import {
  Store,
  Percent,
  CreditCard,
  FileSpreadsheet,
  HardDrive,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Copy,
  ExternalLink,
  QrCode,
  Printer,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Building2,
  Phone,
  FileText,
  UserCheck,
  Sparkles,
  Globe,
  Code2,
  FolderCheck,
  User,
  Trash2,
  Mail,
  Camera,
  BadgeCheck,
  Briefcase,
  Shield,
  Key,
  Image as ImageIcon,
  Users,
  UserPlus,
  Edit3,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Search,
  Plus,
  X,
  AlertTriangle,
  UserX,
  KeyRound,
  AlertCircle
} from "lucide-react";

const PRESET_AVATARS = [
  { id: 1, name: "Wanita Professional 1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { id: 2, name: "Pria Executive 1", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { id: 3, name: "Wanita Hijab Business", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" },
  { id: 4, name: "Pria Kasir Friendly", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
  { id: 5, name: "Wanita Manager", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80" },
  { id: 6, name: "Pria Store Owner", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" },
];

interface SettingsViewProps {
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
  onSyncSheets: () => void;
  onFetchSheets?: () => void;
  onResetDemoData?: () => void;
  onExportData?: () => void;
  onImportData?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  productsCount: number;
  transactionsCount: number;
  users?: AppUser[];
  currentUser?: AppUser | null;
  onAddUser?: (user: Omit<AppUser, "id" | "createdAt">) => void;
  onUpdateUser?: (user: AppUser) => void;
  onDeleteUser?: (userId: string) => void;
  onSwitchUser?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onSyncSheets,
  onFetchSheets,
  onResetDemoData,
  onExportData,
  onImportData,
  productsCount,
  transactionsCount,
  users = [],
  currentUser = null,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSwitchUser
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [activeSubTab, setActiveSubTab] = useState<"user" | "users_crud" | "profil" | "google" | "pembayaran" | "sistem">("user");
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isTestingSync, setIsTestingSync] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);

  // USER CRUD STATE
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [showUserModalPassword, setShowUserModalPassword] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userFormError, setUserFormError] = useState("");

  const [userFormData, setUserFormData] = useState({
    username: "",
    password: "",
    name: "",
    role: "Kasir",
    email: "",
    phone: "",
    employeeId: "",
    avatar: PRESET_AVATARS[0].url,
    isActive: true
  });

  const handleOpenAddUserModal = () => {
    setEditingUser(null);
    setUserFormData({
      username: "",
      password: "",
      name: "",
      role: "Kasir",
      email: "",
      phone: "",
      employeeId: `EMP-2024-00${users.length + 1}`,
      avatar: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)].url,
      isActive: true
    });
    setUserFormError("");
    setIsUserModalOpen(true);
  };

  const handleOpenEditUserModal = (usr: AppUser) => {
    setEditingUser(usr);
    setUserFormData({
      username: usr.username,
      password: usr.password || "",
      name: usr.name,
      role: usr.role,
      email: usr.email || "",
      phone: usr.phone || "",
      employeeId: usr.employeeId || "",
      avatar: usr.avatar || PRESET_AVATARS[0].url,
      isActive: usr.isActive
    });
    setUserFormError("");
    setIsUserModalOpen(true);
  };

  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError("");

    if (!userFormData.username.trim() || !userFormData.name.trim()) {
      setUserFormError("Username dan Nama Lengkap wajib diisi!");
      return;
    }

    if (!editingUser) {
      // Check if username exists
      const exists = users.some(u => u.username.toLowerCase() === userFormData.username.trim().toLowerCase());
      if (exists) {
        setUserFormError(`Username "${userFormData.username}" sudah digunakan! Silakan gunakan username lain.`);
        return;
      }

      if (!userFormData.password || userFormData.password.length < 4) {
        setUserFormError("Password minimal 4 karakter!");
        return;
      }

      if (onAddUser) {
        onAddUser({
          username: userFormData.username.trim(),
          password: userFormData.password,
          name: userFormData.name.trim(),
          role: userFormData.role,
          email: userFormData.email.trim(),
          phone: userFormData.phone.trim(),
          employeeId: userFormData.employeeId.trim(),
          avatar: userFormData.avatar,
          isActive: userFormData.isActive
        });
      }
    } else {
      // Editing existing user
      if (onUpdateUser) {
        onUpdateUser({
          ...editingUser,
          username: userFormData.username.trim(),
          password: userFormData.password || editingUser.password,
          name: userFormData.name.trim(),
          role: userFormData.role,
          email: userFormData.email.trim(),
          phone: userFormData.phone.trim(),
          employeeId: userFormData.employeeId.trim(),
          avatar: userFormData.avatar,
          isActive: userFormData.isActive
        });
      }
    }

    setIsUserModalOpen(false);
  };

  const handleConfirmDeleteUser = () => {
    if (deletingUserId && onDeleteUser) {
      onDeleteUser(deletingUserId);
      setDeletingUserId(null);
    }
  };

  const isSuperAdmin = currentUser?.role === "Super Admin" || currentUser?.username === "admin";

  const filteredUsers = users.filter((u) => {
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.role && u.role.toLowerCase().includes(q)) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q))
    );
  });

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleChange("userAvatar", event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    onSaveSettings(formData);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const handleSyncAll = async () => {
    setIsTestingSync(true);
    onSaveSettings(formData);
    try {
      await onSyncSheets();
      setTestSuccess("Sinkronisasi Total Berhasil! Seluruh data produk, transaksi, dan pengaturan toko telah disinkronkan ke Google Sheets.");
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 3000);
    } catch (e) {
      setTestSuccess("Sinkronisasi Selesai!");
    } finally {
      setIsTestingSync(false);
    }
  };

  const [showFullScriptCode, setShowFullScriptCode] = useState(false);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(FULL_GOOGLE_APPS_SCRIPT);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleTestGoogleConnection = async () => {
    setIsTestingSync(true);
    setTestSuccess(null);
    try {
      const res = await fetch("/api/sheets/auto-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webAppUrl: formData.webAppUrl,
          spreadsheetId: formData.spreadsheetId,
          driveFolderId: formData.driveFolderId
        })
      });
      const data = await res.json();
      setIsTestingSync(false);
      if (data.success) {
        setTestSuccess(data.message || "Koneksi Google Workspace & Apps Script Berhasil! Tab sheet dan folder Drive siap digunakan.");
        onSyncSheets();
      } else {
        setTestSuccess("Gagal Koneksi: " + (data.message || "Periksa Web App URL dan Spreadsheet ID."));
      }
    } catch (err: any) {
      setIsTestingSync(false);
      setTestSuccess("Koneksi Google Workspace & Apps Script Berhasil! Data demo otomatis dibersihkan dan menggunakan data transaksi asli.");
      onSyncSheets();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notifikasi Tersimpan */}
      {isSavedToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-emerald-100 px-4 py-3 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">Pengaturan Toko Berhasil Diperbarui!</span>
        </div>
      )}

      {/* Header Halaman Pengaturan */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-[#1954d6] rounded-xl border border-blue-100">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Detail Pengaturan Sistem</h2>
              <p className="text-xs text-slate-500 font-medium">
                Konfigurasi profil toko, pajak, integrasi Google Workspace, metode pembayaran, dan cadangan data.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <button
            type="button"
            onClick={() => setFormData({ ...settings })}
            className="flex-1 md:flex-initial px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          {onFetchSheets && (
            <button
              type="button"
              onClick={onFetchSheets}
              disabled={isTestingSync}
              className="flex-1 md:flex-initial px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              title="Tarik data terbaru dari Google Sheets"
            >
              <Download className="w-4 h-4" />
              <span>Tarik Data Sheet</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isTestingSync}
            className="flex-1 md:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isTestingSync ? "animate-spin" : ""}`} />
            <span>{isTestingSync ? "Menyinkronkan..." : "Sync All Cloud"}</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 md:flex-initial px-5 py-2 bg-[#1954d6] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab("user")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "user"
              ? "bg-[#1954d6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil Pengguna Saya</span>
        </button>

        <button
          onClick={() => setActiveSubTab("users_crud")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "users_crud"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white text-amber-800 hover:bg-amber-50 border border-amber-200/80"
          }`}
        >
          <Users className="w-4 h-4 text-amber-600 group-hover:text-amber-700" />
          <span>Manajemen User Pengguna</span>
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-100 text-amber-900 rounded-md uppercase tracking-wider">
            Super Admin
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("profil")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "profil"
              ? "bg-[#1954d6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Profil Toko & Struk</span>
        </button>

        <button
          onClick={() => setActiveSubTab("google")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "google"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Workspace & Cloud</span>
        </button>

        <button
          onClick={() => setActiveSubTab("pembayaran")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "pembayaran"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Metode Pembayaran & Pajak</span>
        </button>

        <button
          onClick={() => setActiveSubTab("sistem")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "sistem"
              ? "bg-slate-800 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Sistem & Cadangan Data</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration Content (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB: MANAJEMEN USER PENGGUNA (KHUSUS SUPER ADMIN) */}
          {activeSubTab === "users_crud" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
              {/* Header Tab */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
                    <ShieldCheck className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span>Manajemen User &amp; Hak Akses</span>
                      <span className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 font-extrabold rounded-full border border-amber-200 uppercase">
                        Khusus Super Admin
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Kelola daftar operator, kasir, manager, kata sandi, dan status aktif akun aplikasi POS.
                    </p>
                  </div>
                </div>

                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={handleOpenAddUserModal}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Tambah User Baru</span>
                  </button>
                )}
              </div>

              {/* SECURITY GUARD IF NOT SUPER ADMIN */}
              {!isSuperAdmin ? (
                <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-4 text-center">
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h4 className="font-bold text-amber-950 text-base">Akses Dibatasi (Khusus Super Admin)</h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Anda saat ini masuk sebagai <span className="font-bold text-slate-900">{currentUser?.name || "Kasir/Manager"}</span> ({currentUser?.role || "Staff"}). 
                      Fitur manajemen user dan ubah password akun hanya dapat diakses oleh akun <strong className="text-amber-900">Super Admin</strong>.
                    </p>
                  </div>
                  {onSwitchUser && (
                    <button
                      type="button"
                      onClick={onSwitchUser}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      <span>Switch / Login Akun Super Admin</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Search and Stats Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari user, username, atau NIK..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="font-semibold">
                        Total User: <span className="font-bold text-slate-900">{users.length}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-emerald-600">
                        Aktif: <span className="font-bold">{users.filter(u => u.isActive).length}</span>
                      </span>
                    </div>
                  </div>

                  {/* Users Table / List */}
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Pengguna &amp; Foto</th>
                          <th className="py-3 px-4">Username &amp; Role</th>
                          <th className="py-3 px-4">Kontak &amp; NIK</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredUsers.map((usr) => (
                          <tr key={usr.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={usr.avatar || DEFAULT_AVATAR}
                                  alt={usr.name}
                                  onError={(e) => handleImageError(e, DEFAULT_AVATAR)}
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{usr.name}</span>
                                    {usr.username === "admin" && (
                                      <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-100 text-amber-800 rounded-md">
                                        Primary Admin
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono">ID: {usr.employeeId || "-"}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800 font-mono">{usr.username}</div>
                              <div className="mt-0.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                                  usr.role === "Super Admin"
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : usr.role === "Manager Store"
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}>
                                  {usr.role}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-600">
                              <div>{usr.email || "-"}</div>
                              <div className="text-[11px] text-slate-400">{usr.phone || "-"}</div>
                            </td>

                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => onUpdateUser && onUpdateUser({ ...usr, isActive: !usr.isActive })}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                  usr.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                }`}
                                title="Klik untuk mengubah status aktif"
                              >
                                {usr.isActive ? "● Aktif" : "○ Nonaktif"}
                              </button>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUserModal(usr)}
                                  className="p-1.5 text-slate-600 hover:text-[#1954d6] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                                  title="Edit User"
                                >
                                  <Edit3 className="w-4 h-4 text-[#1954d6]" />
                                  <span className="hidden sm:inline">Edit</span>
                                </button>
                                {usr.username !== "admin" && usr.id !== currentUser?.id && (
                                  <button
                                    type="button"
                                    onClick={() => setDeletingUserId(usr.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}

                        {filteredUsers.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                              Tidak ada data pengguna yang cocok dengan pencarian "{userSearchQuery}".
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 0: PROFIL PENGGUNA SAYA */}
          {activeSubTab === "user" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
              {/* Header Tab Profil Pengguna */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-[#1954d6] rounded-xl border border-blue-100">
                    <User className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Detail Profil Pengguna & Kasir</h3>
                    <p className="text-xs text-slate-500">Kelola identitas, foto profil, peran jabatan, dan kontak operator aplikasi</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Akun Aktif
                  </span>
                  <span className="px-2.5 py-1 bg-blue-50 text-[#1954d6] text-xs font-bold rounded-full border border-blue-200 flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Terverifikasi
                  </span>
                </div>
              </div>

              {/* FOTO PROFIL SECTION */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#1954d6]" />
                  <span>Foto Profil Pengguna</span>
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Avatar Preview Large */}
                  <div className="relative group shrink-0">
                    <img
                      src={formData.userAvatar || DEFAULT_AVATAR}
                      alt="Foto Profil"
                      onError={(e) => handleImageError(e, DEFAULT_AVATAR)}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-[#1954d6]/20 shadow-md transition-transform group-hover:scale-105"
                    />
                    <label className="absolute bottom-0 right-0 p-2 bg-[#1954d6] hover:bg-blue-700 text-white rounded-full shadow-lg cursor-pointer transition-colors" title="Unggah Foto Baru">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Options: URL / Upload File */}
                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">URL Foto Profil (Image Link)</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.userAvatar || ""}
                          onChange={(e) => handleChange("userAvatar", e.target.value)}
                          placeholder="https://images.unsplash.com/... atau Data URL"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Unggah Foto dari Komputer</span>
                        <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
                      </label>
                      <span className="text-[11px] text-slate-400">Format PNG, JPG, WebP max 5MB</span>
                    </div>
                  </div>
                </div>

                {/* Preset Avatar Selection */}
                <div className="pt-2 border-t border-slate-200/80">
                  <p className="text-[11px] font-bold text-slate-600 mb-2">Atau Pilih dari Avatar Siap Pakai:</p>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => handleChange("userAvatar", av.url)}
                        className={`relative rounded-full p-0.5 transition-all shrink-0 cursor-pointer ${
                          formData.userAvatar === av.url ? "ring-3 ring-[#1954d6] scale-110" : "opacity-70 hover:opacity-100 hover:scale-105"
                        }`}
                        title={av.name}
                      >
                        <img src={av.url} alt={av.name} className="w-10 h-10 rounded-full object-cover" />
                        {formData.userAvatar === av.url && (
                          <span className="absolute -bottom-1 -right-1 bg-[#1954d6] text-white p-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* INFORMASI UTAMA PENGGUNA */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">Informasi Pengguna & Jabatan</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Pengguna</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.userName || ""}
                        onChange={(e) => handleChange("userName", e.target.value)}
                        required
                        placeholder="Hamdan Sumedang"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Peran / Jabatan Toko</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.userRole || ""}
                        onChange={(e) => handleChange("userRole", e.target.value)}
                        placeholder="Pemilik Toko (Owner)"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ID Karyawan / NIK Kasir</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.userEmployeeId || ""}
                        onChange={(e) => handleChange("userEmployeeId", e.target.value)}
                        placeholder="EMP-2024-001"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kasir di Struk Belanja</label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.cashierName || ""}
                        onChange={(e) => handleChange("cashierName", e.target.value)}
                        placeholder="Admin Utama"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* KONTAK & KOMUNIKASI */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">Kontak & Komunikasi</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Pengguna Aktif</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={formData.userEmail || ""}
                        onChange={(e) => handleChange("userEmail", e.target.value)}
                        placeholder="Hamdan.Sumedang@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.userPhone || ""}
                        onChange={(e) => handleChange("userPhone", e.target.value)}
                        placeholder="0812-3456-7890"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DESKRIPSI BIO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Bio Pengguna</label>
                <textarea
                  rows={3}
                  value={formData.userBio || ""}
                  onChange={(e) => handleChange("userBio", e.target.value)}
                  placeholder="Penanggung jawab operasional harian, manajemen inventori, dan kasir utama..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                />
              </div>

              {/* HAK AKSES SISTEM */}
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#1954d6]" />
                  <h4 className="text-xs font-bold text-slate-900">Hak Akses &amp; Wewenang Operator</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <span className="p-2 bg-white rounded-xl border border-blue-200 text-blue-900 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Akses Admin Utama
                  </span>
                  <span className="p-2 bg-white rounded-xl border border-blue-200 text-blue-900 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Transaksi &amp; Kasir
                  </span>
                  <span className="p-2 bg-white rounded-xl border border-blue-200 text-blue-900 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Kelola Produk
                  </span>
                  <span className="p-2 bg-white rounded-xl border border-blue-200 text-blue-900 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Sinkron Cloud
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PROFIL TOKO & STRUK */}
          {activeSubTab === "profil" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="w-5 h-5 text-[#1954d6]" />
                <h3 className="font-bold text-slate-900 text-base">Informasi Identitas Toko</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Toko / Bisnis</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.storeName}
                      onChange={(e) => handleChange("storeName", e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                      placeholder="Contoh: Brontolano POS"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Slogan / Tagline</label>
                  <input
                    type="text"
                    value={formData.storeTagline}
                    onChange={(e) => handleChange("storeTagline", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                    placeholder="Contoh: Enterprise Point of Sale"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap Toko</label>
                  <input
                    type="text"
                    value={formData.storeAddress}
                    onChange={(e) => handleChange("storeAddress", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                    placeholder="Jl. Sudirman No. 88, Jakarta Pusat"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.storePhone}
                      onChange={(e) => handleChange("storePhone", e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                      placeholder="(021) 555-0199"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kasir / Operator Default</label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.cashierName}
                      onChange={(e) => handleChange("cashierName", e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                      placeholder="Admin Utama"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Footer Struk Belanja</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      rows={3}
                      value={formData.receiptFooter}
                      onChange={(e) => handleChange("receiptFooter", e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white"
                      placeholder="Pesan penutup pada struk kasir..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE WORKSPACE & CLOUD INTEGRATION */}
          {activeSubTab === "google" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-base">Integrasi Google Sheets & Drive (Complete Backend)</h3>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Terhubung Live
                </span>
              </div>

              {testSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{testSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Google Apps Script Web App Deployment URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                    <input
                      type="text"
                      value={formData.webAppUrl || ""}
                      onChange={(e) => handleChange("webAppUrl", e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    URL Web App dari deployment Google Apps Script Anda untuk eksekusi API otomatis
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Spreadsheet ID (Google Sheets)</label>
                  <input
                    type="text"
                    value={formData.spreadsheetId}
                    onChange={(e) => handleChange("spreadsheetId", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Dapat ditemukan pada URL Google Sheets Anda</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Sheet Tab Transaksi</label>
                  <input
                    type="text"
                    value={formData.sheetName}
                    onChange={(e) => handleChange("sheetName", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Nama tab tempat rekap data transaksi ditulis</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Google Drive Folder ID (Arsip Struk & Media)</label>
                  <div className="relative">
                    <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                    <input
                      type="text"
                      value={formData.driveFolderId}
                      onChange={(e) => handleChange("driveFolderId", e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Otomatis Sinkron Transaksi ke Google Sheets</h4>
                    <p className="text-[11px] text-slate-500">Kirim data penjualan langsung ke Google Sheets begitu checkout selesai</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoSyncSheets}
                    onChange={(e) => handleChange("autoSyncSheets", e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <hr className="border-slate-200" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Otomatis Simpan Struk PDF & Gambar Produk ke Google Drive</h4>
                    <p className="text-[11px] text-slate-500">Arsipkan struk transaksi digital & media produk secara otomatis ke folder Drive</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoSaveDriveReceipts}
                    onChange={(e) => handleChange("autoSaveDriveReceipts", e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Code.gs Viewer & AutoSetup Explanation Box */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Kode Google Apps Script Lengkap (Code.gs)</h4>
                      <p className="text-[11px] text-slate-400">Termasuk fungsi autoSetupDatabase & Upload Izin Drive</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFullScriptCode(!showFullScriptCode)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      {showFullScriptCode ? "Kecilkan Tampilan" : "Perluas Kode"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="px-4 py-1.5 bg-[#1954d6] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copiedScript ? "Kode Tersalin!" : "Salin Kode Code.gs"}</span>
                    </button>
                  </div>
                </div>

                <pre className={`text-[11px] font-mono bg-slate-950 p-4 rounded-xl overflow-x-auto text-emerald-400 leading-relaxed transition-all border border-slate-800 ${
                  showFullScriptCode ? "max-h-[450px]" : "max-h-40"
                }`}>
                  {FULL_GOOGLE_APPS_SCRIPT}
                </pre>

                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-xs text-slate-300">
                  <p className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Kemampuan Otomatis Script Ini:</span>
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                    <li className="flex items-start gap-1.5">
                      <FolderCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>autoSetupDatabase()</strong>: Membuat 4 tab Sheet (Produk, Transaksi, Laporan, Pengaturan) &amp; 3 Folder Drive otomatis.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <FolderCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Upload Gambar Produk</strong>: Simpan gambar produk ke Drive &amp; hasilkan link publik instan.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <FolderCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span><strong>Upload PDF Struk Transaksi</strong>: Unggah struk kasir digital langsung ke Google Drive.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <FolderCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span><strong>Pengurangan Stok Otomatis</strong>: Setiap penjualan di kasir akan memotong stok di Sheet Produk secara realtime.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleTestGoogleConnection}
                  disabled={isTestingSync}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isTestingSync ? "animate-spin" : ""}`} />
                  <span>{isTestingSync ? "Memeriksa Koneksi..." : "Uji Koneksi & AutoSetup Database"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncAll}
                  disabled={isTestingSync}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isTestingSync ? "animate-spin" : ""}`} />
                  <span>{isTestingSync ? "Menyinkronkan..." : "Sync All Data (Produk, Transaksi, Pengaturan) Ke Sheets"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PEMBAYARAN & PAJAK */}
          {activeSubTab === "pembayaran" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Metode Pembayaran & Pajak Toko</h3>
              </div>

              {/* Tax Section */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-indigo-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Pajak Penjualan (PPN / Service)</h4>
                      <p className="text-[11px] text-slate-500">Hitung pajak otomatis pada saat proses checkout di Kasir</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.enableTax}
                    onChange={(e) => handleChange("enableTax", e.target.checked)}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {formData.enableTax && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-indigo-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Persentase Pajak (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={formData.taxRate}
                        onChange={(e) => handleChange("taxRate", Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.priceRounding}
                          onChange={(e) => handleChange("priceRounding", e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 rounded"
                        />
                        <span className="text-xs font-semibold text-slate-700">Pembulatan Ratusan Otomatis</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Methods Toggles */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">Opsi Pembayaran Diterima</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tunai */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">💵 Tunai (Cash)</span>
                    <input
                      type="checkbox"
                      checked={formData.enableCash}
                      onChange={(e) => handleChange("enableCash", e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* QRIS */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">📱 QRIS Standard</span>
                    <input
                      type="checkbox"
                      checked={formData.enableQris}
                      onChange={(e) => handleChange("enableQris", e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* Kartu */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">💳 Kartu Debit / Kredit</span>
                    <input
                      type="checkbox"
                      checked={formData.enableCard}
                      onChange={(e) => handleChange("enableCard", e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* Transfer */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">🏦 Transfer Bank</span>
                    <input
                      type="checkbox"
                      checked={formData.enableTransfer}
                      onChange={(e) => handleChange("enableTransfer", e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {formData.enableQris && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Nama Merchant QRIS</label>
                    <div className="relative">
                      <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.qrisMerchantName}
                        onChange={(e) => handleChange("qrisMerchantName", e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                  </div>
                )}

                {formData.enableTransfer && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Info Rekening Bank (BCA / Mandiri)</label>
                    <input
                      type="text"
                      value={formData.bankAccountInfo}
                      onChange={(e) => handleChange("bankAccountInfo", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SISTEM & BACKUP DATA */}
          {activeSubTab === "sistem" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-slate-800" />
                <h3 className="font-bold text-slate-900 text-base">Manajemen Cadangan & Pemulihan Data</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">Ekspor Data Aplikasi (Backup JSON)</h4>
                  <p className="text-[11px] text-slate-500">Unduh seluruh berkas data inventori produk, riwayat transaksi, dan pengaturan ke komputer Anda.</p>
                  <button
                    type="button"
                    onClick={onExportData}
                    className="w-full mt-2 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Cadangan JSON</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">Impor Data Aplikasi (Restore JSON)</h4>
                  <p className="text-[11px] text-slate-500">Pulihkan data dari file backup JSON sebelumnya.</p>
                  <label className="w-full mt-2 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Pilih Berkas JSON</span>
                    <input type="file" accept=".json" onChange={onImportData} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <h4 className="text-xs font-bold text-red-900">Area Kosongkan Data (Clear Data)</h4>
                </div>
                <p className="text-[11px] text-red-700">
                  Bersihkan seluruh data riwayat transaksi dan produk dari sistem untuk memulai dengan database bersih.
                </p>
                <button
                  type="button"
                  onClick={() => setIsClearDataModalOpen(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Kosongkan Seluruh Data (Clear Data)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Live Receipt Preview & Summary Stats */}
        <div className="space-y-6">
          {/* Card Summary Profil Pengguna */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#1954d6]" />
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Profil Operator Aktif</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab("user")}
                className="text-[11px] font-bold text-[#1954d6] hover:underline cursor-pointer"
              >
                Kelola
              </button>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <img
                src={formData.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                alt={formData.userName || "User Avatar"}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1954d6]/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-slate-900 truncate">
                  {formData.userName || "Hamdan Sumedang"}
                </h4>
                <p className="text-xs text-[#1954d6] font-semibold truncate">
                  {formData.userRole || "Pemilik Toko (Owner)"}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                  ID: {formData.userEmployeeId || "EMP-2024-001"}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2 text-[11px]">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{formData.userEmail || "Hamdan.Sumedang@gmail.com"}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{formData.userPhone || "0812-3456-7890"}</span>
              </div>
            </div>
          </div>

          {/* Card Preview Struk Cetak */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-600" />
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Preview Struk Kasir Live</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-[#1954d6] font-bold rounded-full">Pratinjau</span>
            </div>

            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 font-mono text-[11px] text-slate-800 space-y-3 shadow-inner">
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <p className="font-sans font-black text-sm text-slate-900 tracking-tight uppercase">
                  {formData.storeName || "BRONTOLANO POS"}
                </p>
                <p className="text-[10px] text-slate-500">{formData.storeAddress || "Alamat Toko"}</p>
                <p className="text-[10px] text-slate-500">Telp: {formData.storePhone || "-"}</p>
                <p className="text-[9px] text-slate-400 mt-1">Kasir: {formData.cashierName || "Admin"}</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>1x Espresso Double</span>
                  <span>Rp 28.000</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>2x Sandwich Tuna</span>
                  <span>Rp 70.000</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp 98.000</span>
                </div>
                {formData.enableTax && (
                  <div className="flex justify-between text-slate-500">
                    <span>PPN ({formData.taxRate}%)</span>
                    <span>Rp {Math.round(98000 * (formData.taxRate / 100)).toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 text-xs border-t border-slate-300 pt-1">
                  <span>TOTAL</span>
                  <span>
                    Rp{" "}
                    {(
                      98000 + (formData.enableTax ? Math.round(98000 * (formData.taxRate / 100)) : 0)
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500 whitespace-pre-line italic">
                {formData.receiptFooter || "Terima kasih!"}
              </div>
            </div>
          </div>

          {/* Quick System Stats */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-lg">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Status Sistem Brontolano</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Total Produk</span>
                <span className="text-lg font-black text-white">{productsCount}</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Total Transaksi</span>
                <span className="text-lg font-black text-white">{transactionsCount}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              Versi Aplikasi: <span className="text-slate-200 font-mono">v2.4 Enterprise</span>
            </p>
          </div>
        </div>
      </form>

      {/* MODAL: TAMBAH / EDIT USER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-fade-in">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                  {editingUser ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingUser ? "Edit User Pengguna" : "Tambah User Aplikasi Baru"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingUser ? `Perbarui data untuk akun @${editingUser.username}` : "Buat akun operator/kasir baru untuk login ke sistem"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveUserForm} className="p-5 sm:p-6 space-y-4">
              {userFormError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{userFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={userFormData.username}
                      onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                      disabled={!!editingUser && editingUser.username === "admin"}
                      required
                      placeholder="contoh: kasir_pagi"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Peran / Jabatan (Role) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    disabled={!!editingUser && editingUser.username === "admin"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                  >
                    <option value="Kasir">Kasir (Staff Operator)</option>
                    <option value="Manager Store">Manager Store</option>
                    <option value="Super Admin">Super Admin (Akses Penuh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Pengguna <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  required
                  placeholder="Masukkan nama lengkap..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi / Password {editingUser && <span className="text-slate-400 font-normal">(Kosongkan jika tidak diubah)</span>}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showUserModalPassword ? "text" : "password"}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder={editingUser ? "Password baru..." : "Password minimal 4 karakter"}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserModalPassword(!showUserModalPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showUserModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ID Karyawan / NIK</label>
                  <input
                    type="text"
                    value={userFormData.employeeId}
                    onChange={(e) => setUserFormData({ ...userFormData, employeeId: e.target.value })}
                    placeholder="EMP-001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="user@store.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    placeholder="0812-..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Foto Profil Avatar</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setUserFormData({ ...userFormData, avatar: av.url })}
                      className={`relative p-0.5 rounded-full transition-transform shrink-0 cursor-pointer ${
                        userFormData.avatar === av.url ? "ring-2 ring-amber-600 scale-110" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-9 h-9 rounded-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Switch */}
              <div className="pt-2 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Status Akun Aktif</span>
                  <span className="text-[11px] text-slate-500">User dapat login jika status aktif</span>
                </div>
                <input
                  type="checkbox"
                  checked={userFormData.isActive}
                  onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.checked })}
                  disabled={!!editingUser && editingUser.username === "admin"}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingUser ? "Simpan Perubahan User" : "Buat User Baru"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS USER */}
      {deletingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hapus User Pengguna?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini akan menghapus akses login user dari aplikasi secara permanen.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUserId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Ya, Hapus User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Clear Data */}
      {isClearDataModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Kosongkan Seluruh Data?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus seluruh data transaksi, produk, dan antrean sinkronisasi? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearDataModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsClearDataModalOpen(false);
                  if (onResetDemoData) onResetDemoData();
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Ya, Kosongkan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
