export const FULL_GOOGLE_APPS_SCRIPT = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - BRONTOLANO POS ENTERPRISE V3.1
 * System Integrasi Google Sheets & Google Drive
 * ============================================================================
 * Database 5 Tab:
 *   1. Transaksi_Brontolano  2. Produk_Inventori  3. Pengaturan_Toko
 *   4. Pelanggan_Member      5. Ringkasan_Laporan
 * 
 * Fitur: Sync data, Generate PDF (Struk & Laporan), Upload Drive
 * ============================================================================
 */
var CONFIG = {
  ROOT_FOLDER_NAME: "Brontolano POS Cloud System",
  FOLDER_PRODUCT_IMAGES: "Gambar Produk",
  FOLDER_RECEIPT_PDFS: "Arsip Struk PDF",
  FOLDER_REPORTS_PDFS: "Laporan Keuangan",
  SHEET_TRANSACTIONS: "Transaksi_Brontolano",
  SHEET_PRODUCTS: "Produk_Inventori",
  SHEET_SETTINGS: "Pengaturan_Toko",
  SHEET_CUSTOMERS: "Pelanggan_Member",
  SHEET_REPORTS: "Ringkasan_Laporan",
  MAX_BATCH_ROWS: 250
};

/** ======================== HELPER ======================== */
function getSpreadsheet(d) {
  var id = (d && d.spreadsheetId) ? String(d.spreadsheetId).trim() : "";
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch(e) { Logger.log("openById gagal: " + e); }
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  throw Error("Spreadsheet tidak ditemukan. Berikan spreadsheetId atau bind ke sheet.");
}

function getOrCreateSheet_(ss, name, headers, color) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    var r = sh.getRange(1, 1, 1, headers.length);
    r.setFontWeight("bold").setFontColor("#FFF").setBackground(color || "#1954d6");
    sh.setFrozenRows(1);
    try { sh.autoResizeColumns(1, headers.length); } catch(e) {}
  }
  return sh;
}

function getOrCreateFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  var f = it.hasNext() ? it.next() : parent.createFolder(name);
  try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e) {}
  return f;
}

function parseNum_(v, fallback) { var n = Number(v); return isFinite(n) ? n : (fallback || 0); }

function safeJsonStringify_(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  try { return JSON.stringify(v); } catch(e) { return ""; }
}

function toDateStr_(v) {
  if (!v) return new Date().toISOString();
  if (v.date) return v.date + (v.time ? " " + v.time : "");
  return v;
}

function ensureLock_(timeoutMs) {
  var lock = LockService.getScriptLock();
  lock.waitLock(timeoutMs || 10000);
  return lock;
}

/** Proteksi baris header sheet */
function protectHeaders_(ss) {
  ss.getSheets().forEach(function(sh) {
    try {
      if (sh.getLastRow() < 1) return;
      var p = sh.getRange(1, 1, 1, sh.getLastColumn()).protect().setDescription("Header");
      p.removeEditors(p.getEditors());
      if (p.canDomainEdit()) p.setDomainEdit(false);
    } catch(e) {}
  });
}

/** ======================== DRIVE SETUP ======================== */
function setupDriveFoldersAndPermissions(data) {
  var rootFolder;
  if (data && data.driveFolderId && String(data.driveFolderId).trim()) {
    try { rootFolder = DriveApp.getFolderById(String(data.driveFolderId).trim()); } catch(e) {}
  }
  if (!rootFolder) {
    var it = DriveApp.getFoldersByName(CONFIG.ROOT_FOLDER_NAME);
    rootFolder = it.hasNext() ? it.next() : DriveApp.createFolder(CONFIG.ROOT_FOLDER_NAME);
  }
  try { rootFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e) {}

  return {
    rootFolderId: rootFolder.getId(),
    rootFolderUrl: rootFolder.getUrl(),
    productImagesFolderId: getOrCreateFolder_(rootFolder, CONFIG.FOLDER_PRODUCT_IMAGES).getId(),
    receiptPdfsFolderId: getOrCreateFolder_(rootFolder, CONFIG.FOLDER_RECEIPT_PDFS).getId(),
    reportPdfsFolderId: getOrCreateFolder_(rootFolder, CONFIG.FOLDER_REPORTS_PDFS).getId()
  };
}

/** ======================== AUTO SETUP ======================== */
function autoSetupDatabase(data) {
  var ss = getSpreadsheet(data);
  getOrCreateSheet_(ss, CONFIG.SHEET_TRANSACTIONS, [
    "id_transaksi","id_toko","id_pelanggan","id_kasir","tanggal_transaksi",
    "subtotal","diskon_transaksi","pajak","biaya_layanan","total_akhir",
    "metode_pembayaran","status_transaksi","catatan_transaksi","link_struk_pdf"
  ], "#1954d6");
  getOrCreateSheet_(ss, CONFIG.SHEET_PRODUCTS, [
    "id_produk","barcode","nama_produk","id_kategori","harga_beli",
    "harga_jual","stok_sekarang","stok_minimum","satuan","lokasi_rak",
    "url_gambar","nama_file_gambar","status_aktif","tanggal_update_stok"
  ], "#0f766e");
  getOrCreateSheet_(ss, CONFIG.SHEET_SETTINGS, [
    "id_toko","nama_toko","slogan_toko","alamat_toko","nomor_telepon",
    "email_toko","npwp_toko","persentase_pajak_default","mata_uang",
    "jam_operasional","pesan_struk","logo_toko"
  ], "#9333ea");
  var setSh = ss.getSheetByName(CONFIG.SHEET_SETTINGS);
  if (setSh && setSh.getLastRow() === 1) {
    setSh.appendRow(["TOKO-001","Brontolano Cafe & Resto","Cita Rasa Autentik Nusantara",
      "Jl. Raya Sumedang No. 88, Jawa Barat","0812-3456-7890","info@brontolanopos.com",
      "01.234.567.8-901.000",11,"IDR",'{"buka":"08:00","tutup":"22:00"}',
      "Terima kasih. Barang yang sudah dibeli tidak dapat ditukar.",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&q=80"]);
  }
  getOrCreateSheet_(ss, CONFIG.SHEET_CUSTOMERS, [
    "id_pelanggan","nama_pelanggan","nomor_telepon","email_pelanggan",
    "alamat_pelanggan","tanggal_lahir","poin_loyalitas","tier_member",
    "tanggal_terdaftar","total_belanja_kumulatif"
  ], "#c2410c");
  getOrCreateSheet_(ss, CONFIG.SHEET_REPORTS, [
    "id_laporan","periode_laporan","tanggal_mulai","tanggal_selesai",
    "total_transaksi","total_pendapatan_kotor","total_diskon_diberikan",
    "total_pendapatan_bersih","total_hpp","laba_kotor",
    "produk_terlaris","metode_pembayaran_summary","link_pdf_laporan"
  ], "#047857");

  protectHeaders_(ss);
  var driveInfo = setupDriveFoldersAndPermissions(data);
  return {
    status: "SUCCESS",
    message: "Setup 5 tabs & Drive berhasil",
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    driveFolders: driveInfo
  };
}

/** ======================== ROUTER ======================== */
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch(x) { data = e.parameter || {}; }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    var action = data.action || "saveTransaction";
    var fnMap = {
      autoSetup: autoSetupDatabase, syncAll: syncAllToSheets,
      saveTransaction: saveTransactionToSheet, syncProducts: syncProductsToSheet,
      syncTransactions: syncTransactionsToSheet, syncCustomers: syncCustomersToSheet,
      syncSettings: syncSettingsToSheet,
      generateReceiptPdf: generateReceiptPdf, generateReportPdf: generateReportPdf,
      uploadProductImage: function(d) { return handleFileUpload(d, CONFIG.FOLDER_PRODUCT_IMAGES); },
      uploadReceiptPdf: function(d) { return handleFileUpload(d, CONFIG.FOLDER_RECEIPT_PDFS); },
      uploadReportPdf: function(d) { return handleFileUpload(d, CONFIG.FOLDER_REPORTS_PDFS); },
      getAllData: getAllDataFromSheets
    };
    var fn = fnMap[action];
    var resp = fn ? fn(data) : { status: "ERROR", message: "Aksi tidak dikenal: " + action };
    return ContentService.createTextOutput(JSON.stringify(resp)).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status:"ERROR",message:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var r = (p.action === "autoSetup") ? autoSetupDatabase(p) : getAllDataFromSheets(p);
  return ContentService.createTextOutput(JSON.stringify(r)).setMimeType(ContentService.MimeType.JSON);
}

/** ======================== SYNC ALL ======================== */
function syncAllToSheets(data) {
  var lock = ensureLock_(15000);
  try {
    return {
      status: "SUCCESS",
      message: "Semua data berhasil disinkronkan!",
      details: {
        products: syncProductsToSheet(data),
        transactions: syncTransactionsToSheet(data),
        customers: syncCustomersToSheet(data),
        settings: syncSettingsToSheet(data)
      }
    };
  } finally { lock.releaseLock(); }
}

/** ======================== TRANSAKSI ======================== */
function buildTransactionRow_(t) {
  return [
    t.id_transaksi || t.id || "",
    t.id_toko || "TOKO-001",
    t.id_pelanggan || t.customer || "Pelanggan Umum",
    t.id_kasir || "KASIR-001",
    toDateStr_(t),
    parseNum_(t.subtotal, parseNum_(t.total, 0)),
    parseNum_(t.diskon_transaksi, 0),
    parseNum_(t.pajak, parseNum_(t.tax, 0)),
    parseNum_(t.biaya_layanan, 0),
    parseNum_(t.total_akhir, parseNum_(t.grandTotal, parseNum_(t.subtotal, 0) + parseNum_(t.pajak, 0))),
    t.metode_pembayaran || t.paymentMethod || "Tunai",
    t.status_transaksi || t.status || "Sukses",
    safeJsonStringify_(t.items) || t.catatan_transaksi || t.note || "",
    t.link_struk_pdf || t.receiptUrl || ""
  ];
}

function getTransactionSheet_(data) {
  var ss = getSpreadsheet(data);
  var sh = ss.getSheetByName(CONFIG.SHEET_TRANSACTIONS);
  if (!sh) { autoSetupDatabase(data); sh = ss.getSheetByName(CONFIG.SHEET_TRANSACTIONS); }
  return { ss: ss, sheet: sh };
}

function saveTransactionToSheet(data) {
  var result = getTransactionSheet_(data);
  var rows = extractDataArray_(data, "transactions", ["id","id_transaksi"]);
  if (rows.length === 0) return {status:"SUCCESS",message:"Tidak ada transaksi",ids:[]};

  var saved = [];
  rows.forEach(function(t) {
    result.sheet.appendRow(buildTransactionRow_(t));
    saved.push(t.id_transaksi || t.id || ("#TRX-"+Date.now().toString().slice(-6)));
  });
  return {status:"SUCCESS",message:saved.length+" transaksi dicatat",ids:saved};
}

function syncTransactionsToSheet(data) {
  var result = getTransactionSheet_(data);
  var rows = extractDataArray_(data, "transactions", ["id","id_transaksi"]);
  if (rows.length === 0) return {status:"SUCCESS",message:"Tidak ada transaksi"};
  return writeBatch_(result.sheet, rows, buildTransactionRow_, 14);
}

/** ======================== PRODUK ======================== */
function buildProductRow_(p) {
  return [
    p.id_produk || p.id || "",
    p.barcode || p.sku || "",
    p.nama_produk || p.name || "",
    p.id_kategori || p.category || "",
    parseNum_(p.harga_beli, parseNum_(p.costPrice, 0)),
    parseNum_(p.harga_jual, parseNum_(p.price, 0)),
    parseNum_(p.stok_sekarang, parseNum_(p.stock, 0)),
    parseNum_(p.stok_minimum, parseNum_(p.minStock, 0)),
    p.satuan || p.unit || "Pcs",
    p.lokasi_rak || p.rackLocation || "Rak A",
    p.url_gambar || p.image || "",
    p.nama_file_gambar || (p.id ? p.id+".jpg" : ""),
    true,
    new Date().toISOString()
  ];
}

function getProductSheet_(data) {
  var ss = getSpreadsheet(data);
  var sh = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
  if (!sh) { autoSetupDatabase(data); sh = ss.getSheetByName(CONFIG.SHEET_PRODUCTS); }
  return { ss: ss, sheet: sh };
}

function syncProductsToSheet(data) {
  var result = getProductSheet_(data);
  var rows = extractDataArray_(data, "products", ["id","id_produk"]);
  if (rows.length === 0) return {status:"SUCCESS",message:"Tidak ada produk"};
  return writeBatch_(result.sheet, rows, buildProductRow_, 14);
}

/** ======================== PELANGGAN ======================== */
function buildCustomerRow_(c) {
  return [
    c.id_pelanggan || c.id || "",
    c.nama_pelanggan || c.name || "",
    c.nomor_telepon || c.phone || "",
    c.email_pelanggan || c.email || "",
    c.alamat_pelanggan || c.address || "",
    c.tanggal_lahir || c.birthDate || "",
    parseNum_(c.poin_loyalitas, parseNum_(c.points, 0)),
    c.tier_member || c.memberTier || "Bronze",
    c.tanggal_terdaftar || c.lastVisit || c.createdAt || new Date().toISOString().split("T")[0],
    parseNum_(c.total_belanja_kumulatif, parseNum_(c.totalSpent, 0))
  ];
}

function getCustomerSheet_(data) {
  var ss = getSpreadsheet(data);
  var sh = ss.getSheetByName(CONFIG.SHEET_CUSTOMERS);
  if (!sh) { autoSetupDatabase(data); sh = ss.getSheetByName(CONFIG.SHEET_CUSTOMERS); }
  return { ss: ss, sheet: sh };
}

function syncCustomersToSheet(data) {
  var result = getCustomerSheet_(data);
  var rows = extractDataArray_(data, "customers", ["id","id_pelanggan"]);
  if (rows.length === 0) return {status:"SUCCESS",message:"Tidak ada pelanggan"};
  return writeBatch_(result.sheet, rows, buildCustomerRow_, 10);
}

/** ======================== PENGATURAN ======================== */
function syncSettingsToSheet(data) {
  var ss = getSpreadsheet(data);
  var sh = ss.getSheetByName(CONFIG.SHEET_SETTINGS);
  if (!sh) { autoSetupDatabase(data); sh = ss.getSheetByName(CONFIG.SHEET_SETTINGS); }
  var s = data.settings || data || {};
  if (!s.storeName && !s.nama_toko && !s.storeAddress && !s.alamat_toko && !s.logoUrl) {
    return {status:"SUCCESS",message:"Tidak ada pengaturan baru"};
  }
  if (sh.getLastRow() > 1) sh.getRange(2,1,sh.getLastRow()-1,12).clearContent();
  sh.getRange(2,1,1,12).setValues([[
    s.storeId || "TOKO-001",
    s.storeName || s.nama_toko || "Brontolano Cafe & Resto",
    s.storeTagline || s.slogan || "Enterprise POS",
    s.storeAddress || s.address || s.alamat_toko || "",
    s.storePhone || s.phone || s.nomor_telepon || "",
    s.email || "info@brontolanopos.com",
    s.npwp || "",
    parseNum_(s.taxRate, 11),
    s.currency || "IDR",
    safeJsonStringify_(s.operatingHours) || '{"buka":"08:00","tutup":"22:00"}',
    s.receiptFooter || "Terima kasih atas kunjungan Anda!",
    s.logoUrl || s.logo_toko || ""
  ]]);
  return {status:"SUCCESS",message:"Pengaturan toko disinkronkan"};
}

/** ======================== UTILITIES ======================== */
function extractDataArray_(data, key, altKeys) {
  if (data[key] && Array.isArray(data[key]) && data[key].length > 0) return data[key];
  for (var i = 0; i < altKeys.length; i++) {
    if (data[altKeys[i]]) return [data];
  }
  return [];
}

function writeBatch_(sheet, items, rowBuilder, colCount) {
  var total = items.length;
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    // Clear data rows (keep header)
    if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, colCount).clearContent();

    var BATCH = CONFIG.MAX_BATCH_ROWS;
    for (var start = 0; start < total; start += BATCH) {
      var batch = items.slice(start, start + BATCH);
      var rows = batch.map(rowBuilder);
      sheet.getRange(2 + start, 1, rows.length, colCount).setValues(rows);
    }
    return {status:"SUCCESS",message:total+" data disinkronkan"};
  } catch(e) {
    return {status:"ERROR",message:"Gagal sinkron: "+e.toString()};
  } finally {
    lock.releaseLock();
  }
}

/**
 * 6. GENERASI STRUK PDF (NOTA KASIR)
 */
function generateReceiptPdf(data) {
  var driveInfo = setupDriveFoldersAndPermissions(data);
  var rootFolder = DriveApp.getFolderById(driveInfo.rootFolderId);
  var receiptFolder = getOrCreateFolder_(rootFolder, CONFIG.FOLDER_RECEIPT_PDFS);

  var nama_toko = data.nama_toko || data.storeName || "Brontolano Cafe & Resto";
  var alamat_toko = data.alamat_toko || data.address || "Jl. Raya Sumedang No. 88, Jawa Barat";
  var nomor_telepon = data.nomor_telepon || data.phone || "0812-3456-7890";
  var id_transaksi = data.id_transaksi || data.id || "#TRX-0000";
  var tanggal_waktu = data.tanggal_waktu || new Date().toLocaleString("id-ID");
  var nama_kasir = data.nama_kasir || "Kasir Utama";
  var nama_pelanggan = data.nama_pelanggan || data.customer || "Pelanggan Umum";
  var items = data.items || [];
  var subtotal = parseNum_(data.subtotal, parseNum_(data.total, 0));
  var diskon_total = parseNum_(data.diskon_total, parseNum_(data.diskon_transaksi, 0));
  var pajak_ppn = parseNum_(data.pajak_ppn, parseNum_(data.pajak, parseNum_(data.tax, 0)));
  var biaya_layanan = parseNum_(data.biaya_layanan, 0);
  var grand_total = parseNum_(data.grand_total, parseNum_(data.grandTotal, subtotal + pajak_ppn));
  var metode_pembayaran = data.metode_pembayaran || data.paymentMethod || "Tunai";
  var jumlah_bayar = parseNum_(data.jumlah_bayar_tunai, grand_total);
  var poin_didapat = parseNum_(data.poin_didapat, Math.floor(grand_total / 10000));
  var total_poin = parseNum_(data.total_poin_terkini, poin_didapat + 50);
  var pesan_struk = data.pesan_struk || "Terima kasih atas kunjungan Anda di Brontolano POS!";

  var itemRows = items.map(function(item) {
    var n = item.nama_produk || item.name || "Produk";
    var q = parseInt(item.qty, 10) || 1;
    var h = parseNum_(item.harga_satuan, parseNum_(item.price, 0));
    var s = parseNum_(item.subtotal_item, q * h);
    return '<tr><td>' + n + '</td><td style="text-align:center;">' + q + '</td><td style="text-align:right;">Rp ' + h.toLocaleString("id-ID") + '</td><td style="text-align:right;">Rp ' + s.toLocaleString("id-ID") + '</td></tr>';
  }).join("");

  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>'+
    'body{font-family:sans-serif;padding:20px;font-size:12px;color:#1e293b}'+
    '.hdr{text-align:center;border-bottom:2px dashed #cbd5e1;padding-bottom:12px;margin-bottom:12px}'+
    '.ttl{font-size:18px;font-weight:bold;color:#0f172a}'+
    'table{width:100%;border-collapse:collapse}'+
    'td,th{padding:4px 0}'+
    '.itms th{border-bottom:1px solid #94a3b8;font-size:11px;text-transform:uppercase}'+
    '.itms td{padding:6px 0;border-bottom:1px dashed #e2e8f0}'+
    '.gt{font-weight:bold;font-size:15px;color:#1954d6;border-top:2px solid #0f172a;border-bottom:2px solid #0f172a}'+
    '.ftr{text-align:center;margin-top:25px;padding-top:15px;border-top:2px dashed #cbd5e1;color:#64748b;font-size:11px}'+
    '</style></head><body>'+
    '<div class="hdr"><div class="ttl">'+nama_toko+'</div><div>'+alamat_toko+' | Telp: '+nomor_telepon+'</div></div>'+
    '<table><tr><td><strong>No Struk:</strong> '+id_transaksi+'</td><td style="text-align:right;"><strong>Tanggal:</strong> '+tanggal_waktu+'</td></tr>'+
    '<tr><td><strong>Kasir:</strong> '+nama_kasir+'</td><td style="text-align:right;"><strong>Pelanggan:</strong> '+nama_pelanggan+'</td></tr></table>'+
    '<table class="itms"><thead><tr><th>Produk</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Harga</th><th style="text-align:right;">Total</th></tr></thead><tbody>'+itemRows+'</tbody></table>'+
    '<table><tr><td>Subtotal</td><td style="text-align:right;">Rp '+subtotal.toLocaleString("id-ID")+'</td></tr>'+
    '<tr><td>Diskon</td><td style="text-align:right;">- Rp '+diskon_total.toLocaleString("id-ID")+'</td></tr>'+
    '<tr><td>Pajak PPN</td><td style="text-align:right;">Rp '+pajak_ppn.toLocaleString("id-ID")+'</td></tr>'+
    '<tr><td>Biaya Layanan</td><td style="text-align:right;">Rp '+biaya_layanan.toLocaleString("id-ID")+'</td></tr>'+
    '<tr class="gt"><td style="padding:8px 0;">GRAND TOTAL</td><td style="text-align:right;padding:8px 0;">Rp '+grand_total.toLocaleString("id-ID")+'</td></tr>'+
    '<tr><td>Bayar</td><td style="text-align:right;">'+metode_pembayaran+' Rp '+jumlah_bayar.toLocaleString("id-ID")+'</td></tr>'+
    '<tr><td>Kembalian</td><td style="text-align:right;">Rp '+Math.max(0,jumlah_bayar-grand_total).toLocaleString("id-ID")+'</td></tr>'+
    '<tr><td>Poin</td><td style="text-align:right;">+'+poin_didapat+' (Total: '+total_poin+')</td></tr></table>'+
    '<div class="ftr"><div>'+pesan_struk+'</div><div style="margin-top:5px;">Powered by Brontolano POS Enterprise</div></div>'+
    '</body></html>';

  var blob = Utilities.newBlob(html, "text/html", "Struk_"+id_transaksi.replace("#","")+".html").getAs("application/pdf");
  var file = receiptFolder.createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e) {}

  return {status:"SUCCESS",message:"Struk PDF berhasil dibuat",receiptPdfUrl:"https://lh3.googleusercontent.com/d/"+file.getId(),fileId:file.getId()};
}

/**
 * 7. GENERASI LAPORAN PDF
 */
function generateReportPdf(data) {
  var driveInfo = setupDriveFoldersAndPermissions(data);
  var rootFolder = DriveApp.getFolderById(driveInfo.rootFolderId);
  var reportFolder = getOrCreateFolder_(rootFolder, CONFIG.FOLDER_REPORTS_PDFS);

  var judul = data.judul_laporan || "LAPORAN PERFORMA KEUANGAN TOKO";
  var toko = data.nama_toko || data.storeName || "Brontolano Cafe & Resto";
  var tgl = data.periode_tanggal_cetak || new Date().toLocaleDateString("id-ID");
  var oleh = data.dibuat_oleh || "Hamdan Sumedang (Super Admin)";
  var omset = parseNum_(data.summary_total_omset, 0);
  var trxCount = parseNum_(data.summary_total_transaksi, 0);
  var labaNet = parseNum_(data.summary_net_profit, Math.round(omset * 0.45));
  var avgCart = trxCount > 0 ? Math.round(omset / trxCount) : 0;
  var tabel = data.tabel_laporan || [{tanggal:tgl,jumlah_trx:trxCount,omset_kotor:omset,hpp:Math.round(omset*0.4),laba:labaNet}];

  var rekap = tabel.map(function(r) {
    return '<tr><td>'+(r.tanggal||"-")+'</td><td style="text-align:center;">'+parseNum_(r.jumlah_trx,0)+'</td>'+
      '<td style="text-align:right;">Rp '+parseNum_(r.omset_kotor,0).toLocaleString("id-ID")+'</td>'+
      '<td style="text-align:right;">Rp '+parseNum_(r.hpp,0).toLocaleString("id-ID")+'</td>'+
      '<td style="text-align:right;font-weight:bold;color:#047857;">Rp '+parseNum_(r.laba,0).toLocaleString("id-ID")+'</td></tr>';
  }).join("");

  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>'+
    'body{font-family:sans-serif;padding:25px;font-size:12px;color:#0f172a}'+
    '.hdr{border-bottom:3px solid #1954d6;padding-bottom:12px;margin-bottom:20px}'+
    '.ttl{font-size:20px;font-weight:bold;color:#1954d6}'+
    '.kpi{background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;text-align:center}'+
    '.kpi-v{font-size:16px;font-weight:bold;color:#0f172a;margin-top:4px}'+
    'table{width:100%;border-collapse:collapse;margin-bottom:20px}'+
    'th{background:#1954d6;color:white;padding:8px;text-align:left;font-size:11px}'+
    'td{padding:8px;border-bottom:1px solid #e2e8f0}'+
    '</style></head><body>'+
    '<div class="hdr"><div class="ttl">'+judul+'</div><div style="font-size:14px;font-weight:bold;">'+toko+'</div><div>Cetak: '+tgl+' | '+oleh+'</div></div>'+
    '<table style="margin-bottom:20px;"><tr>'+
    '<td class="kpi"><div style="color:#64748b;font-size:10px;">TOTAL OMSET</div><div class="kpi-v">Rp '+omset.toLocaleString("id-ID")+'</div></td>'+
    '<td class="kpi"><div style="color:#64748b;font-size:10px;">TRANSAKSI</div><div class="kpi-v">'+trxCount+' TRX</div></td>'+
    '<td class="kpi"><div style="color:#64748b;font-size:10px;">NET PROFIT</div><div class="kpi-v" style="color:#047857;">Rp '+labaNet.toLocaleString("id-ID")+'</div></td>'+
    '<td class="kpi"><div style="color:#64748b;font-size:10px;">AVG KERANJANG</div><div class="kpi-v">Rp '+avgCart.toLocaleString("id-ID")+'</div></td>'+
    '</tr></table>'+
    '<h4 style="color:#1954d6;margin-bottom:8px;">Rekapitulasi</h4>'+
    '<table><thead><tr><th>Tanggal</th><th style="text-align:center;">TRX</th><th style="text-align:right;">Omset</th><th style="text-align:right;">HPP</th><th style="text-align:right;">Laba</th></tr></thead><tbody>'+rekap+'</tbody></table>'+
    '<table style="margin-top:40px;"><tr><td style="border:none;width:60%;"></td>'+
    '<td style="border:none;text-align:center;"><div>Sumedang, '+tgl+'</div><div style="margin-top:60px;font-weight:bold;text-decoration:underline;">'+oleh+'</div><div style="color:#64748b;font-size:11px;">Super Admin</div></td></tr></table>'+
    '</body></html>';

  var blob = Utilities.newBlob(html,"text/html","Laporan_"+Date.now()+".html").getAs("application/pdf");
  var file = reportFolder.createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e) {}

  return {status:"SUCCESS",message:"Laporan PDF berhasil dibuat",reportPdfUrl:"https://lh3.googleusercontent.com/d/"+file.getId(),fileId:file.getId()};
}

/**
 * 8. UPLOAD FILE (Gambar/Struk/Laporan)
 */
function handleFileUpload(data, targetFolderName) {
  if (!data.fileBase64) return {status:"ERROR",message:"fileBase64 wajib diisi"};
  var driveInfo = setupDriveFoldersAndPermissions(data);
  var rootFolder = DriveApp.getFolderById(driveInfo.rootFolderId);
  var targetFolder = getOrCreateFolder_(rootFolder, targetFolderName);

  var fileName = data.fileName || "Upload_"+new Date().getTime();
  var mimeType = data.mimeType || "image/png";
  var clean = data.fileBase64.replace(/^data:.*?;base64,/, "");
  var blob = Utilities.newBlob(Utilities.base64Decode(clean), mimeType, fileName);
  var file = targetFolder.createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e) {}

  return {status:"SUCCESS",fileId:file.getId(),fileUrl:"https://lh3.googleusercontent.com/d/"+file.getId(),driveViewUrl:file.getUrl(),fileName:fileName};
}

/**
 * 9. BACA SEMUA DATA DARI SHEET
 */
function getAllDataFromSheets(data) {
  var ss = getSpreadsheet(data);

  var pSheet = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
  var products = [];
  if (pSheet && pSheet.getLastRow() > 1) {
    var pData = pSheet.getRange(2, 1, pSheet.getLastRow() - 1, 14).getValues();
    products = pData.map(function(r) {
      var stok = parseNum_(r[6], 0);
      var minStok = parseNum_(r[7], 0);
      return {
        id:String(r[0]), sku:String(r[1]), name:String(r[2]), category:String(r[3]),
        costPrice:parseNum_(r[4],0), price:parseNum_(r[5],0),
        stock:stok, minStock:minStok, unit:String(r[8]||"Pcs"),
        rackLocation:String(r[9]||""), image:String(r[10]||""),
        status: stok <= minStok ? "Kritis" : stok <= minStok*2 ? "Menengah" : "Aman"
      };
    });
  }

  var tSheet = ss.getSheetByName(CONFIG.SHEET_TRANSACTIONS);
  var transactions = [];
  if (tSheet && tSheet.getLastRow() > 1) {
    var tData = tSheet.getRange(2, 1, tSheet.getLastRow() - 1, 14).getValues();
    transactions = tData.map(function(r) {
      var items = [];
      if (r[12]) { try { var p = JSON.parse(r[12]); if (Array.isArray(p)) items = p; } catch(e) {} }
      var d = String(r[4]||"").split(" ");
      return {
        id:String(r[0]), customer:String(r[2]), date:d[0]||"", time:d[1]||"00:00",
        subtotal:parseNum_(r[5],0), tax:parseNum_(r[7],0), grandTotal:parseNum_(r[9],0),
        paymentMethod:String(r[10]), status:String(r[11]), items:items, receiptUrl:String(r[13]||"")
      };
    });
  }

  var cSheet = ss.getSheetByName(CONFIG.SHEET_CUSTOMERS);
  var customers = [];
  if (cSheet && cSheet.getLastRow() > 1) {
    var cData = cSheet.getRange(2, 1, cSheet.getLastRow() - 1, 10).getValues();
    customers = cData.map(function(r) {
      return {
        id:String(r[0]), name:String(r[1]), phone:String(r[2]), email:String(r[3]),
        address:String(r[4]), points:parseNum_(r[6],0), memberTier:String(r[7]||"Bronze"),
        lastVisit:String(r[8]), totalSpent:parseNum_(r[9],0)
      };
    });
  }

  var sSheet = ss.getSheetByName(CONFIG.SHEET_SETTINGS);
  var settings = null;
  if (sSheet && sSheet.getLastRow() > 1) {
    var s = sSheet.getRange(2, 1, 1, 12).getValues()[0];
    try {
      var jamOp = typeof s[9] === "string" ? JSON.parse(s[9]) : s[9];
    } catch(e) { jamOp = {}; }
    settings = {
      storeId:String(s[0]), storeName:String(s[1]), slogan:String(s[2]),
      address:String(s[3]), phone:String(s[4]), email:String(s[5]),
      npwp:String(s[6]), taxRate:parseNum_(s[7],11), currency:String(s[8]||"IDR"),
      operatingHours:jamOp, receiptFooter:String(s[10]), logoUrl:String(s[11])
    };
  }

  return {status:"SUCCESS", products:products, transactions:transactions, customers:customers, settings:settings};
}
`;

export const GOOGLE_APPS_SCRIPT_CODE = FULL_GOOGLE_APPS_SCRIPT;
