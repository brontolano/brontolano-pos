import React from "react";
import { NavigationTab } from "../types";
import { LayoutGrid, Package, Calculator, Receipt, BarChart3 } from "lucide-react";

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  cartCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  cartCount = 0
}) => {
  const tabs = [
    { id: "dashboard" as NavigationTab, label: "Dashboard", icon: LayoutGrid },
    { id: "inventori" as NavigationTab, label: "Inventori", icon: Package },
    { id: "kasir" as NavigationTab, label: "Kasir", icon: Calculator, isPrimary: true },
    { id: "transaksi" as NavigationTab, label: "Transaksi", icon: Receipt },
    { id: "laporan" as NavigationTab, label: "Laporan", icon: BarChart3 }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-3 py-1.5">
      <div className="flex items-center justify-around relative max-w-xl md:max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isPrimary) {
            return (
              <div key={tab.id} className="relative -top-5 md:-top-6">
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-white transition-all active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-[#1954d6] text-white ring-4 ring-blue-100 scale-105"
                      : "bg-[#1954d6] text-white hover:bg-blue-700 hover:scale-105"
                  }`}
                >
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider mt-0.5">Kasir</span>
                </button>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white text-[11px] md:text-xs font-black rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col md:flex-row items-center justify-center py-1.5 px-3 md:px-4 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "text-[#1954d6] bg-blue-50/80 font-bold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-[#1954d6]" : "text-slate-500"}`} />
              <span className="text-[11px] md:text-xs md:ml-1.5 mt-0.5 md:mt-0">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
