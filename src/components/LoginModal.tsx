import React, { useState } from "react";
import { AppUser } from "../types";
import { Lock, User, Eye, EyeOff, KeyRound, AlertCircle, ArrowRight, Store } from "lucide-react";

interface LoginModalProps {
  users: AppUser[];
  onLogin: (user: AppUser) => void;
  storeName?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users,
  onLogin,
  storeName = "Brontolano POS Enterprise"
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const foundUser = users.find(
        (u) => u.username.toLowerCase() === cleanUsername && u.password === password
      );

      if (!foundUser) {
        setErrorMessage("Username atau password salah! Silakan periksa kembali.");
        setIsSubmitting(false);
        return;
      }

      if (!foundUser.isActive) {
        setErrorMessage("Akun ini telah dinonaktifkan oleh Super Admin!");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onLogin(foundUser);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-fade-in">
        {/* Header Branding */}
        <div className="bg-gradient-to-br from-[#1954d6] via-blue-600 to-indigo-700 p-6 sm:p-8 text-white relative">
          <div className="absolute top-4 right-4 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-amber-300 border border-white/20 flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-300" />
            <span>Sistem Terkunci</span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white leading-tight">
                {storeName}
              </h2>
              <p className="text-xs text-blue-100 font-medium">Point of Sale & Inventory Cloud</p>
            </div>
          </div>

          <p className="text-xs text-blue-100/90 leading-relaxed mt-2">
            Silakan masukan username dan kata sandi Anda untuk mengakses sistem kasir.
          </p>
        </div>

        {/* Login Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Username Pengguna
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white focus:border-[#1954d6] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Kata Sandi / Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:bg-white focus:border-[#1954d6] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#1954d6] hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memeriksa Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk Aplikasi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
