import React, { useState } from "react";
import { FileSpreadsheet, HardDrive, Code2, CheckCircle2, Copy, Check, ExternalLink, RefreshCw, X, FolderCheck, ShieldCheck, Sparkles } from "lucide-react";
import { FULL_GOOGLE_APPS_SCRIPT } from "../lib/googleAppsScriptCode";

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSheets: () => void;
  onFetchSheets?: () => void;
  onSaveDrive: () => void;
  isSyncing: boolean;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSyncSheets,
  onFetchSheets,
  onSaveDrive,
  isSyncing
}) => {
  const [spreadsheetId, setSpreadsheetId] = useState("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms");
  const [driveFolderId, setDriveFolderId] = useState("1FolderBrontolanoPOSReceiptsEnterprise2024");
  const [copiedCode, setCopiedCode] = useState(false);
  const [showFullCode, setShowFullCode] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FULL_GOOGLE_APPS_SCRIPT);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative border border-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-1">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <HardDrive className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Integrasi Google Sheets & Google Drive</h3>
              <p className="text-xs text-slate-500 font-medium">Platform Sinkronisasi Transaksi, Stok & Apps Script</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Google Sheets Database */}
        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-emerald-950 text-sm">Google Sheets Database</span>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-bold rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Terhubung
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onFetchSheets && (
                <button
                  onClick={onFetchSheets}
                  disabled={isSyncing}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 border border-emerald-300"
                  title="Tarik & impor data terbaru dari Google Sheets"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>Tarik Data</span>
                </button>
              )}
              <button
                onClick={onSyncSheets}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Menyinkronkan..." : "Sinkronkan Kirim"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-emerald-900">Spreadsheet ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white text-xs font-mono text-slate-800 rounded-xl border border-emerald-300 focus:outline-none"
              />
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-xl border border-emerald-300 flex items-center gap-1"
              >
                <span>Buka Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Section 2: Google Drive Receipt Storage */}
        <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-950 text-sm">Google Drive Folder Struk</span>
              <span className="px-2 py-0.5 bg-blue-200 text-blue-900 text-[10px] font-bold rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-700" /> Terhubung
              </span>
            </div>
            <button
              onClick={onSaveDrive}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1954d6] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Simpan Struk ke Drive</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-blue-900">Folder ID Google Drive</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={driveFolderId}
                onChange={(e) => setDriveFolderId(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white text-xs font-mono text-slate-800 rounded-xl border border-blue-300 focus:outline-none"
              />
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl border border-blue-300 flex items-center gap-1"
              >
                <span>Buka Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Section 3: Google Apps Script Webhook Code */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-3 border border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-400" />
              <div>
                <span className="font-bold text-sm text-white block">Kode Google Apps Script Lengkap (Code.gs)</span>
                <span className="text-[10px] text-slate-400">Termasuk autoSetupDatabase, Upload Gambar, Struk & Laporan</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFullCode(!showFullCode)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
              >
                {showFullCode ? "Kecilkan Tampilan" : "Perluas Kode"}
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#1954d6] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-emerald-300">Kode Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Seluruh Code.gs</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <pre className={`text-[11px] font-mono bg-slate-950 p-3 rounded-xl overflow-x-auto text-emerald-400 leading-relaxed transition-all ${
            showFullCode ? "max-h-[380px]" : "max-h-36"
          }`}>
            {FULL_GOOGLE_APPS_SCRIPT}
          </pre>

          {/* Step by step guide */}
          <div className="p-3 bg-slate-850/80 rounded-xl border border-slate-800 space-y-2 text-[11px] text-slate-300">
            <p className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Langkah-langkah Memasang Google Apps Script:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Buka Google Sheets Anda &gt; Pilih menu <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Hapus semua kode lama, lalu <strong>Paste (Tempel)</strong> seluruh kode di atas ke file <code>Code.gs</code>.</li>
              <li>Pilih fungsi <code>autoSetupDatabase</code> dari menu dropdown atas, lalu klik tombol <strong>Run (Jalankan)</strong> untuk otomatis membuat 4 Tab Sheet &amp; 3 Folder Drive.</li>
              <li>Klik <strong>Deploy</strong> &gt; <strong>New Deployment</strong> &gt; Pilih jenis <strong>Web App</strong> &gt; Set <i>Execute as: Me</i> &amp; <i>Who has access: Anyone</i> (Siapa saja).</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1954d6] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Selesai & Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
