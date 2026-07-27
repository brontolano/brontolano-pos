import React, { useEffect } from "react";
import { Transaction, StoreSettings } from "../types";
import { CheckCircle2, Printer, HardDrive, FileSpreadsheet, PlusCircle, X } from "lucide-react";
import confetti from "canvas-confetti";

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSaveToDrive: (tx: Transaction) => void;
  onSyncToSheets: () => void;
  settings?: StoreSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  onClose,
  onSaveToDrive,
  onSyncToSheets,
  settings
}) => {
  useEffect(() => {
    if (transaction) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [transaction]);

  if (!transaction) return null;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  const storeName = settings?.storeName || "BRONTOLANO POS";
  const storeAddress = settings?.storeAddress || "Jl. Sudirman No. 88, Jakarta Pusat";
  const storePhone = settings?.storePhone || "(021) 555-0199";
  const cashierName = settings?.cashierName || "Admin";
  const receiptFooter = settings?.receiptFooter || "--- Terima Kasih Atas Kunjungan Anda ---";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-slate-100 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pembayaran Berhasil!</h3>
          <p className="text-xs text-slate-500 font-mono">Invoice ID: {transaction.id}</p>
        </div>

        {/* Receipt Paper Card Preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs font-mono text-slate-800 shadow-inner">
          <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
            <h4 className="font-sans font-bold text-base text-slate-900 uppercase">{storeName}</h4>
            <p className="text-[11px] text-slate-500">{storeAddress}</p>
            <p className="text-[11px] text-slate-500">Telp: {storePhone} • Kasir: {cashierName}</p>
            <p className="text-[10px] text-slate-400 mt-1">{transaction.date} {transaction.time}</p>
          </div>

          {/* Items */}
          <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
            {transaction.items.map((it, idx) => (
              <div key={`${it.name}-${idx}`} className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-900">{it.name}</p>
                  <p className="text-[11px] text-slate-500">{it.qty} x {formatRupiah(it.price)}</p>
                </div>
                <span className="font-bold text-slate-900">{formatRupiah(it.price * it.qty)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatRupiah(transaction.total)}</span>
            </div>
            {transaction.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>PPN</span>
                <span>{formatRupiah(transaction.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-sans font-black text-slate-900 text-sm pt-2 border-t border-slate-300">
              <span>TOTAL</span>
              <span className="text-[#1954d6]">{formatRupiah(transaction.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>Metode Pembayaran</span>
              <span className="font-bold text-emerald-600 uppercase">{transaction.paymentMethod}</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-300 whitespace-pre-line">
            {receiptFooter}
          </div>
        </div>

        {/* Google Workspace & Print Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Cetak Struk</span>
          </button>

          <button
            onClick={() => onSaveToDrive(transaction)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-blue-200"
          >
            <HardDrive className="w-4 h-4 text-blue-600" />
            <span>Simpan Google Drive</span>
          </button>
        </div>

        <button
          onClick={onSyncToSheets}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-colors border border-emerald-200 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Sinkronkan ke Google Sheets Database</span>
        </button>

        {/* Primary New Transaction Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#1954d6] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Transaksi Baru</span>
        </button>
      </div>
    </div>
  );
};
