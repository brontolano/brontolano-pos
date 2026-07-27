export const FULL_GOOGLE_APPS_SCRIPT = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT LENGKAP - BRONTOLANO POS ENTERPRISE V3.0
 * System Integrasi Otomatis Google Sheets & Google Drive
 * ============================================================================
 * Struktur Database 5 Tab:
 * 1. Transaksi_Brontolano
 * 2. Produk_Inventori
 * 3. Pengaturan_Toko
 * 4. Pelanggan_Member
 * 5. Ringkasan_Laporan
 * 
 * Generasi PDF Otomatis Google Drive:
 * - Template Struk PDF (Nota Belanja Kasir)
 * - Template Laporan PDF (Financial & Executive Report)
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
  SHEET_REPORTS: "Ringkasan_Laporan"
};

/**
 * HELPER UNTUK MENDAPATKAN SPREADSHEET
 */
function getSpreadsheet(data) {
  var id = (data && data.spreadsheetId) ? String(data.spreadsheetId).trim() : "";
  if (id !== "") {
    try {
      return SpreadsheetApp.openById(id);
    } catch(e) {
      Logger.log("Gagal openById (" + id + "): " + e.toString());
    }
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  throw new Error("Spreadsheet tidak ditemukan! Masukkan spreadsheetId atau pastikan Apps Script terikat dengan Sheet.");
}

/**
 * 1. AUTO SETUP DATABASE SPREADSHEET & GOOGLE DRIVE
 */
function autoSetupDatabase(data) {
  var ss = getSpreadsheet(data);
  
  // 1. Tab Transaksi_Brontolano
  setupSheetTab(ss, CONFIG.SHEET_TRANSACTIONS, [
    "id_transaksi", "id_toko", "id_pelanggan", "id_kasir", "tanggal_transaksi",
    "subtotal", "diskon_transaksi", "pajak", "biaya_layanan", "total_akhir",
    "metode_pembayaran", "status_transaksi", "catatan_transaksi", "link_struk_pdf"
  ], "#1954d6");

  // 2. Tab Produk_Inventori
  setupSheetTab(ss, CONFIG.SHEET_PRODUCTS, [
    "id_produk", "barcode", "nama_produk", "id_kategori", "harga_beli",
    "harga_jual", "stok_sekarang", "stok_minimum", "satuan", "lokasi_rak",
    "url_gambar", "nama_file_gambar", "status_aktif", "tanggal_update_stok"
  ], "#0f766e");

  // 3. Tab Pengaturan_Toko
  setupSheetTab(ss, CONFIG.SHEET_SETTINGS, [
    "id_toko", "nama_toko", "slogan_toko", "alamat_toko", "nomor_telepon",
    "email_toko", "npwp_toko", "persentase_pajak_default", "mata_uang",
    "jam_operasional", "pesan_struk", "logo_toko"
  ], "#9333ea");

  // Seed default Pengaturan_Toko jika masih kosong
  var setSheet = ss.getSheetByName(CONFIG.SHEET_SETTINGS);
  if (setSheet && setSheet.getLastRow() === 1) {
    setSheet.appendRow([
      "TOKO-001", "Brontolano Cafe & Resto", "Cita Rasa Autentik Nusantara",
      "Jl. Raya Sumedang No. 88, Jawa Barat", "0812-3456-7890", "info@brontolanopos.com",
      "01.234.567.8-901.000", 11, "IDR", '{"buka":"08:00","tutup":"22:00"}',
      "Terima kasih atas kunjungan Anda! Barang yang sudah dibeli tidak dapat ditukar.",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&q=80"
    ]);
  }

  // 4. Tab Pelanggan_Member
  setupSheetTab(ss, CONFIG.SHEET_CUSTOMERS, [
    "id_pelanggan", "nama_pelanggan", "nomor_telepon", "email_pelanggan",
    "alamat_pelanggan", "tanggal_lahir", "poin_loyalitas", "tier_member",
    "tanggal_terdaftar", "total_belanja_kumulatif"
  ], "#c2410c");

  // 5. Tab Ringkasan_Laporan
  setupSheetTab(ss, CONFIG.SHEET_REPORTS, [
    "id_laporan", "periode_laporan", "tanggal_mulai", "tanggal_selesai",
    "total_transaksi", "total_pendapatan_kotor", "total_diskon_diberikan",
    "total_pendapatan_bersih", "total_hpp", "laba_kotor",
    "produk_terlaris", "metode_pembayaran_summary", "link_pdf_laporan"
  ], "#047857");

  // Setup Folder Google Drive
  var driveInfo = setupDriveFoldersAndPermissions(data);

  return {
    status: "SUCCESS",
    message: "AutoSetup Database 5 Tabs & Google Drive Berhasil Diperbarui!",
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    driveFolders: driveInfo
  };
}

/**
 * HELPER DRIVE FOLDER SETUP
 */
function setupDriveFoldersAndPermissions(data) {
  var rootFolder;
  if (data && data.driveFolderId && String(data.driveFolderId).trim() !== "") {
    try {
      rootFolder = DriveApp.getFolderById(String(data.driveFolderId).trim());
    } catch(e) {}
  }

  if (!rootFolder) {
    var rootFolders = DriveApp.getFoldersByName(CONFIG.ROOT_FOLDER_NAME);
    if (rootFolders.hasNext()) {
      rootFolder = rootFolders.next();
    } else {
      rootFolder = DriveApp.createFolder(CONFIG.ROOT_FOLDER_NAME);
    }
  }
  
  try {
    rootFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch(e) {}

  var productFolder = getOrCreateSubFolder(rootFolder, CONFIG.FOLDER_PRODUCT_IMAGES);
  var receiptFolder = getOrCreateSubFolder(rootFolder, CONFIG.FOLDER_RECEIPT_PDFS);
  var reportFolder  = getOrCreateSubFolder(rootFolder, CONFIG.FOLDER_REPORTS_PDFS);

  return {
    rootFolderId: rootFolder.getId(),
    rootFolderUrl: rootFolder.getUrl(),
    productImagesFolderId: productFolder.getId(),
    receiptPdfsFolderId: receiptFolder.getId(),
    reportPdfsFolderId: reportFolder.getId()
  };
}

function getOrCreateSubFolder(parentFolder, folderName) {
  var subFolders = parentFolder.getFoldersByName(folderName);
  var folder = subFolders.hasNext() ? subFolders.next() : parentFolder.createFolder(folderName);
  try {
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch(e) {}
  return folder;
}

function setupSheetTab(ss, sheetName, headers, headerColor) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setFontWeight("bold");
    range.setFontColor("#FFFFFF");
    range.setBackground(headerColor || "#1954d6");
    sheet.setFrozenRows(1);
    try { sheet.autoResizeColumns(1, headers.length); } catch(e) {}
  }
}

/**
 * HTTP POST ROUTER
 */
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch(err) { data = e.parameter || {}; }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var action = data.action || "saveTransaction";
    var response = {};

    if (action === "autoSetup") response = autoSetupDatabase(data);
    else if (action === "syncAll") response = syncAllToSheets(data);
    else if (action === "saveTransaction") response = saveTransactionToSheet(data);
    else if (action === "syncProducts") response = syncProductsToSheet(data);
    else if (action === "syncTransactions") response = syncTransactionsToSheet(data);
    else if (action === "syncCustomers") response = syncCustomersToSheet(data);
    else if (action === "syncSettings") response = syncSettingsToSheet(data);
    else if (action === "generateReceiptPdf") response = generateReceiptPdf(data);
    else if (action === "generateReportPdf") response = generateReportPdf(data);
    else if (action === "uploadProductImage") response = handleFileUpload(data, CONFIG.FOLDER_PRODUCT_IMAGES);
    else if (action === "uploadReceiptPdf") response = handleFileUpload(data, CONFIG.FOLDER_RECEIPT_PDFS);
    else if (action === "uploadReportPdf") response = handleFileUpload(data, CONFIG.FOLDER_REPORTS_PDFS);
    else if (action === "getAllData") response = getAllDataFromSheets(data);
    else response = { status: "ERROR", message: "Aksi tidak dikenal: " + action };

    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "ERROR", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = params.action || "getAllData";
  var response = (action === "autoSetup") ? autoSetupDatabase(params) : getAllDataFromSheets(params);
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * SINKRONISASI SEMUA DATA (syncAll)
 */
function syncAllToSheets(data) {
  var resProd = syncProductsToSheet(data);
  var resTx = syncTransactionsToSheet(data);
  var resCust = syncCustomersToSheet(data);
  var resSet = syncSettingsToSheet(data);
  return {
    status: "SUCCESS",
    message: "Semua data (Produk, Transaksi, Pelanggan, Pengaturan) berhasil disinkronkan ke Google Sheets!",
    details: {
      products: resProd,
      transactions: resTx,
      customers: resCust,
      settings: resSet
    }
  };
}

/**
 * 2. SIMPAN & SINKRON TRANSAKSI
 */
function saveTransactionToSheet(data) {
  var ss = getSpreadsheet(data);
  var sheet = ss.getSheetByName(CONFIG.SHEET_TRANSACTIONS);
  if (!sheet) { autoSetupDatabase(data); sheet = ss.getSheetByName(CONFIG.SHEET_TRANSACTIONS); }

  var txList = [];
  if (Array.isArray(data.transactions) && data.transactions.length > 0) {
    txList = data.transactions;
  } else if (data.transactions && typeof data.transactions === "object" && !Array.isArray(data.transactions)) {
    txList = [data.transactions];
  } else if (data.id || data.id_transaksi) {
    txList = [data];
  }

  if (txList.length === 0) {
    return { status: "SUCCESS", message: "Tidak ada transaksi valid untuk disimpan" };
  }

  var savedIds = [];
  txList.forEach(function(t) {
    var txId = t.id_transaksi || t.id || ("#TRX-" + Date.now().toString().slice(-6));
    var itemsJson = "";
    if (t.items) {
      try { itemsJson = typeof t.items === "string" ? t.items : JSON.stringify(t.items); } catch(e) {}
    }

    var subtotalVal = t.subtotal !== undefined ? Number(t.subtotal) : (t.total !== undefined ? Number(t.total) : 0);
    var taxVal = t.pajak !== undefined ? Number(t.pajak) : (t.tax !== undefined ? Number(t.tax) : 0);
    var grandTotalVal = t.total_akhir !== undefined ? Number(t.total_akhir) : (t.grandTotal !== undefined ? Number(t.grandTotal) : (subtotalVal + taxVal));
    var dateVal = t.tanggal_transaksi || (t.date ? (t.date + " " + (t.time || "")) : new Date().toISOString());

    sheet.appendRow([
      txId,
      t.id_toko || "TOKO-001",
      t.id_pelanggan || t.customer || "Pelanggan Umum",
      t.id_kasir || "KASIR-001",
      dateVal,
      subtotalVal,
      t.diskon_transaksi || 0,
      taxVal,
      t.biaya_layanan || 0,
      grandTotalVal,
      t.metode_pembayaran || t.paymentMethod || "Tunai",
      t.status_transaksi || t.status || "Sukses",
      itemsJson || t.catatan_transaksi || t.note || "",
      t.link_struk_pdf || t.receiptUrl || ""
    ]);
    savedIds.push(txId);
  });

  return { status: "SUCCESS", message: savedIds.length + " transaksi berhasil dicatat ke Google Sheets", ids: savedIds };
}

function syncTransactionsToSheet(data) {
  var ss = getSpreadsheet(data);
  var sheet = ss.getSheetByName(CONFIG.SHEET_TRANSACTIONS);
  if (!sheet) { autoSetupDatabase(data); sheet = ss.getSheetByName(CONFIG.SHEET_TRANSACTIONS); }

  var transactions = data.transactions || (data.id ? [data] : []);
  if (!Array.isArray(transactions) || transactions.length === 0) return { status: "SUCCESS", message: "Tidak ada transaksi untuk disinkronkan" };

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).clearContent();
  }

  var rows = transactions.map(function(t) {
    var itemsJson = "";
    if (t.items) {
      try { itemsJson = typeof t.items === "string" ? t.items : JSON.stringify(t.items); } catch(e) {}
    }
    var subtotalVal = t.subtotal !== undefined ? Number(t.subtotal) : (t.total !== undefined ? Number(t.total) : 0);
    var taxVal = t.pajak !== undefined ? Number(t.pajak) : (t.tax !== undefined ? Number(t.tax) : 0);
    var grandTotalVal = t.total_akhir !== undefined ? Number(t.total_akhir) : (t.grandTotal !== undefined ? Number(t.grandTotal) : (subtotalVal + taxVal));
    var dateVal = t.tanggal_transaksi || (t.date ? (t.date + " " + (t.time || "")) : new Date().toISOString());

    return [
      t.id_transaksi || t.id || "",
      t.id_toko || "TOKO-001",
      t.id_pelanggan || t.customer || "Pelanggan Umum",
      t.id_kasir || "KASIR-001",
      dateVal,
      subtotalVal,
      t.diskon_transaksi || 0,
      taxVal,
      t.biaya_layanan || 0,
      grandTotalVal,
      t.metode_pembayaran || t.paymentMethod || "Tunai",
      t.status_transaksi || t.status || "Sukses",
      itemsJson || t.catatan_transaksi || t.note || "",
      t.link_struk_pdf || t.receiptUrl || ""
    ];
  });

  sheet.getRange(2, 1, rows.length, 14).setValues(rows);
  return { status: "SUCCESS", message: transactions.length + " transaksi disinkronkan" };
}

/**
 * 3. SINKRON PRODUK
 */
function syncProductsToSheet(data) {
  var ss = getSpreadsheet(data);
  var sheet = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
  if (!sheet) { autoSetupDatabase(data); sheet = ss.getSheetByName(CONFIG.SHEET_PRODUCTS); }

  var products = data.products || (data.id ? [data] : []);
  if (!Array.isArray(products) || products.length === 0) return { status: "SUCCESS", message: "Tidak ada produk untuk disinkronkan" };

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).clearContent();
  }

  var rows = products.map(function(p) {
    var costPriceVal = p.harga_beli !== undefined ? Number(p.harga_beli) : (p.costPrice !== undefined ? Number(p.costPrice) : 0);
    var priceVal = p.harga_jual !== undefined ? Number(p.harga_jual) : (p.price !== undefined ? Number(p.price) : 0);
    var stockVal = p.stok_sekarang !== undefined ? Number(p.stok_sekarang) : (p.stock !== undefined ? Number(p.stock) : 0);
    var minStockVal = p.stok_minimum !== undefined ? Number(p.stok_minimum) : (p.minStock !== undefined ? Number(p.minStock) : 0);

    return [
      p.id_produk || p.id || "",
      p.barcode || p.sku || "",
      p.nama_produk || p.name || "",
      p.id_kategori || p.category || "",
      costPriceVal,
      priceVal,
      stockVal,
      minStockVal,
      p.satuan || p.unit || "Pcs",
      p.lokasi_rak || p.rackLocation || "Rak A",
      p.url_gambar || p.image || "",
      p.nama_file_gambar || (p.id ? p.id + ".jpg" : ""),
      true,
      new Date().toISOString()
    ];
  });

  sheet.getRange(2, 1, rows.length, 14).setValues(rows);
  return { status: "SUCCESS", message: products.length + " produk disinkronkan" };
}

/**
 * 4. SINKRON PELANGGAN
 */
function syncCustomersToSheet(data) {
  var ss = getSpreadsheet(data);
  var sheet = ss.getSheetByName(CONFIG.SHEET_CUSTOMERS);
  if (!sheet) { autoSetupDatabase(data); sheet = ss.getSheetByName(CONFIG.SHEET_CUSTOMERS); }

  var customers = data.customers || (data.id ? [data] : []);
  if (!Array.isArray(customers) || customers.length === 0) return { status: "SUCCESS", message: "Tidak ada pelanggan untuk disinkronkan" };

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).clearContent();
  }

  var rows = customers.map(function(c) {
    var pts = c.poin_loyalitas !== undefined ? Number(c.poin_loyalitas) : (c.points !== undefined ? Number(c.points) : 0);
    var spent = c.total_belanja_kumulatif !== undefined ? Number(c.total_belanja_kumulatif) : (c.totalSpent !== undefined ? Number(c.totalSpent) : 0);

    return [
      c.id_pelanggan || c.id || "",
      c.nama_pelanggan || c.name || "",
      c.nomor_telepon || c.phone || "",
      c.email_pelanggan || c.email || "",
      c.alamat_pelanggan || c.address || "",
      c.tanggal_lahir || c.birthDate || "",
      pts,
      c.tier_member || c.memberTier || "Bronze",
      c.tanggal_terdaftar || c.lastVisit || c.createdAt || new Date().toISOString().split("T")[0],
      spent
    ];
  });

  sheet.getRange(2, 1, rows.length, 10).setValues(rows);
  return { status: "SUCCESS", message: customers.length + " pelanggan disinkronkan" };
}

/**
 * 5. SINKRON PENGATURAN TOKO
 */
function syncSettingsToSheet(data) {
  var ss = getSpreadsheet(data);
  var sheet = ss.getSheetByName(CONFIG.SHEET_SETTINGS);
  if (!sheet) { autoSetupDatabase(data); sheet = ss.getSheetByName(CONFIG.SHEET_SETTINGS); }

  var s = data.settings || data || {};
  if (!s.storeName && !s.nama_toko && !s.storeAddress && !s.alamat_toko) return { status: "SUCCESS", message: "Tidak ada pengaturan baru" };

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).clearContent();
  }

  sheet.getRange(2, 1, 1, 12).setValues([[
    s.storeId || "TOKO-001",
    s.storeName || s.nama_toko || "Brontolano Cafe & Resto",
    s.storeTagline || s.slogan || "Enterprise POS",
    s.storeAddress || s.address || s.alamat_toko || "",
    s.storePhone || s.phone || s.nomor_telepon || "",
    s.email || "info@brontolanopos.com",
    s.npwp || "",
    s.taxRate !== undefined ? Number(s.taxRate) : 11,
    s.currency || "IDR",
    JSON.stringify(s.operatingHours || { buka: "08:00", tutup: "22:00" }),
    s.receiptFooter || "Terima kasih atas kunjungan Anda!",
    s.logoUrl || s.logo_toko || ""
  ]]);

  return { status: "SUCCESS", message: "Pengaturan toko disinkronkan" };
}

/**
 * 6. GENERASI TEMPLATE STRUK PDF (NOTA BELANJA KASIR)
 */
function generateReceiptPdf(data) {
  var driveInfo = setupDriveFoldersAndPermissions(data);
  var rootFolder = DriveApp.getFolderById(driveInfo.rootFolderId);
  var receiptFolder = getOrCreateSubFolder(rootFolder, CONFIG.FOLDER_RECEIPT_PDFS);

  var nama_toko = data.nama_toko || data.storeName || "Brontolano Cafe & Resto";
  var alamat_toko = data.alamat_toko || data.address || "Jl. Raya Sumedang No. 88, Jawa Barat";
  var nomor_telepon = data.nomor_telepon || data.phone || "0812-3456-7890";

  var id_transaksi = data.id_transaksi || data.id || "#TRX-0000";
  var tanggal_waktu = data.tanggal_waktu || new Date().toLocaleString("id-ID");
  var nama_kasir = data.nama_kasir || "Kasir Utama";
  var nama_pelanggan = data.nama_pelanggan || data.customer || "Pelanggan Umum";

  var items = data.items || [];
  var subtotal = data.subtotal || data.total || 0;
  var diskon_total = data.diskon_total || data.diskon_transaksi || 0;
  var pajak_ppn = data.pajak_ppn || data.pajak || data.tax || 0;
  var biaya_layanan = data.biaya_layanan || 0;
  var grand_total = data.grand_total || data.grandTotal || 0;

  var metode_pembayaran = data.metode_pembayaran || data.paymentMethod || "Tunai";
  var jumlah_bayar_tunai = data.jumlah_bayar_tunai || grand_total;
  var jumlah_kembalian = Math.max(0, jumlah_bayar_tunai - grand_total);
  var poin_didapat = data.poin_didapat || Math.floor(grand_total / 10000);
  var total_poin_terkini = data.total_poin_terkini || (poin_didapat + 50);
  var pesan_struk = data.pesan_struk || "Terima kasih atas kunjungan Anda di Brontolano POS!";

  var itemRowsHtml = "";
  items.forEach(function(item) {
    var itemNama = item.nama_produk || item.name || "Produk";
    var itemQty = item.qty || 1;
    var itemHarga = item.harga_satuan || item.price || 0;
    var itemSubtotal = item.subtotal_item || (itemQty * itemHarga);
    itemRowsHtml += '<tr>' +
      '<td>' + itemNama + '</td>' +
      '<td style="text-align:center;">' + itemQty + '</td>' +
      '<td style="text-align:right;">Rp ' + itemHarga.toLocaleString('id-ID') + '</td>' +
      '<td style="text-align:right;">Rp ' + itemSubtotal.toLocaleString('id-ID') + '</td>' +
      '</tr>';
  });

  var htmlContent = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
    'body { font-family: sans-serif; padding: 20px; font-size: 12px; color: #1e293b; }' +
    '.header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 12px; margin-bottom: 12px; }' +
    '.title { font-size: 18px; font-weight: bold; color: #0f172a; }' +
    '.info-table { width: 100%; margin-bottom: 15px; border-collapse: collapse; }' +
    '.info-table td { padding: 3px 0; }' +
    '.items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }' +
    '.items-table th { border-bottom: 1px solid #94a3b8; text-align: left; padding: 6px 0; font-size: 11px; text-transform: uppercase; }' +
    '.items-table td { padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }' +
    '.summary-table { width: 100%; border-collapse: collapse; margin-top: 10px; }' +
    '.summary-table td { padding: 4px 0; }' +
    '.grand-total { font-weight: bold; font-size: 15px; color: #1954d6; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; }' +
    '.footer { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 2px dashed #cbd5e1; color: #64748b; font-size: 11px; }' +
    '</style></head><body>' +
    '<div class="header">' +
    '<div class="title">' + nama_toko + '</div>' +
    '<div>' + alamat_toko + ' | Telp: ' + nomor_telepon + '</div>' +
    '</div>' +
    '<table class="info-table">' +
    '<tr><td><strong>No Struk:</strong> ' + id_transaksi + '</td><td style="text-align:right;"><strong>Tanggal:</strong> ' + tanggal_waktu + '</td></tr>' +
    '<tr><td><strong>Kasir:</strong> ' + nama_kasir + '</td><td style="text-align:right;"><strong>Pelanggan:</strong> ' + nama_pelanggan + '</td></tr>' +
    '</table>' +
    '<table class="items-table">' +
    '<thead><tr><th>Produk</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Harga</th><th style="text-align:right;">Total</th></tr></thead>' +
    '<tbody>' + itemRowsHtml + '</tbody>' +
    '</table>' +
    '<table class="summary-table">' +
    '<tr><td>Subtotal</td><td style="text-align:right;">Rp ' + subtotal.toLocaleString('id-ID') + '</td></tr>' +
    '<tr><td>Diskon Total</td><td style="text-align:right;">- Rp ' + diskon_total.toLocaleString('id-ID') + '</td></tr>' +
    '<tr><td>Pajak PPN</td><td style="text-align:right;">Rp ' + pajak_ppn.toLocaleString('id-ID') + '</td></tr>' +
    '<tr><td>Biaya Layanan</td><td style="text-align:right;">Rp ' + biaya_layanan.toLocaleString('id-ID') + '</td></tr>' +
    '<tr class="grand-total"><td style="padding: 8px 0;">GRAND TOTAL</td><td style="text-align:right; padding: 8px 0;">Rp ' + grand_total.toLocaleString('id-ID') + '</td></tr>' +
    '<tr><td>Metode Bayar</td><td style="text-align:right;">' + metode_pembayaran + '</td></tr>' +
    '<tr><td>Bayar</td><td style="text-align:right;">Rp ' + jumlah_bayar_tunai.toLocaleString('id-ID') + '</td></tr>' +
    '<tr><td>Kembalian</td><td style="text-align:right;">Rp ' + jumlah_kembalian.toLocaleString('id-ID') + '</td></tr>' +
    '<tr><td>Poin Didapat</td><td style="text-align:right;">+' + poin_didapat + ' Poin (Total: ' + total_poin_terkini + ' Poin)</td></tr>' +
    '</table>' +
    '<div class="footer">' +
    '<div>' + pesan_struk + '</div>' +
    '<div style="margin-top:5px; font-weight:bold;">Powered by Brontolano POS Enterprise</div>' +
    '</div>' +
    '</body></html>';

  var blob = Utilities.newBlob(htmlContent, "text/html", "Struk_" + id_transaksi.replace("#", "") + ".html").getAs("application/pdf");
  var file = receiptFolder.createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e) {}

  var pdfUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
  return {
    status: "SUCCESS",
    message: "Struk PDF berhasil dibuat dan disimpan di Google Drive",
    receiptPdfUrl: pdfUrl,
    fileId: file.getId()
  };
}

/**
 * 7. GENERASI TEMPLATE LAPORAN PDF (REPORT MANAGEMENT)
 */
function generateReportPdf(data) {
  var driveInfo = setupDriveFoldersAndPermissions(data);
  var rootFolder = DriveApp.getFolderById(driveInfo.rootFolderId);
  var reportFolder = getOrCreateSubFolder(rootFolder, CONFIG.FOLDER_REPORTS_PDFS);

  var judul_laporan = data.judul_laporan || "LAPORAN PERFORMA KEUANGAN TOKO";
  var nama_toko = data.nama_toko || data.storeName || "Brontolano Cafe & Resto";
  var periode_tanggal_cetak = data.periode_tanggal_cetak || new Date().toLocaleDateString("id-ID");
  var dibuat_oleh = data.dibuat_oleh || "Hamdan Sumedang (Super Admin)";

  var summary_total_omset = data.summary_total_omset || 0;
  var summary_total_transaksi = data.summary_total_transaksi || 0;
  var summary_net_profit = data.summary_net_profit || Math.round(summary_total_omset * 0.45);
  var summary_rata_rata_keranjang = summary_total_transaksi > 0 ? Math.round(summary_total_omset / summary_total_transaksi) : 0;

  var tabel_laporan = data.tabel_laporan || [
    { tanggal: new Date().toLocaleDateString("id-ID"), jumlah_trx: summary_total_transaksi, omset_kotor: summary_total_omset, hpp: Math.round(summary_total_omset * 0.4), laba: summary_net_profit }
  ];

  var rekapRowsHtml = "";
  tabel_laporan.forEach(function(row) {
    rekapRowsHtml += '<tr>' +
      '<td>' + (row.tanggal || "-") + '</td>' +
      '<td style="text-align:center;">' + (row.jumlah_trx || 0) + '</td>' +
      '<td style="text-align:right;">Rp ' + Number(row.omset_kotor || 0).toLocaleString("id-ID") + '</td>' +
      '<td style="text-align:right;">Rp ' + Number(row.hpp || 0).toLocaleString("id-ID") + '</td>' +
      '<td style="text-align:right; font-weight:bold; color:#047857;">Rp ' + Number(row.laba || 0).toLocaleString("id-ID") + '</td>' +
      '</tr>';
  });

  var htmlContent = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
    'body { font-family: sans-serif; padding: 25px; font-size: 12px; color: #0f172a; }' +
    '.header { border-bottom: 3px solid #1954d6; padding-bottom: 12px; margin-bottom: 20px; }' +
    '.title { font-size: 20px; font-weight: bold; color: #1954d6; }' +
    '.kpi-container { width: 100%; margin-bottom: 20px; }' +
    '.kpi-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; }' +
    '.kpi-value { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 4px; }' +
    'table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }' +
    'th { background: #1954d6; color: white; padding: 8px; text-align: left; font-size: 11px; }' +
    'td { padding: 8px; border-bottom: 1px solid #e2e8f0; }' +
    '.signature-table { width: 100%; margin-top: 40px; }' +
    '</style></head><body>' +
    '<div class="header">' +
    '<div class="title">' + judul_laporan + '</div>' +
    '<div style="font-size:14px; font-weight:bold; margin-top:4px;">' + nama_toko + '</div>' +
    '<div>Periode Cetak: ' + periode_tanggal_cetak + ' | Dibuat oleh: ' + dibuat_oleh + '</div>' +
    '</div>' +
    '<table style="width:100%; margin-bottom:20px;"><tr>' +
    '<td class="kpi-box"><div style="color:#64748b; font-size:10px;">TOTAL OMSET</div><div class="kpi-value">Rp ' + summary_total_omset.toLocaleString('id-ID') + '</div></td>' +
    '<td class="kpi-box"><div style="color:#64748b; font-size:10px;">TOTAL TRANSAKSI</div><div class="kpi-value">' + summary_total_transaksi + ' TRX</div></td>' +
    '<td class="kpi-box"><div style="color:#64748b; font-size:10px;">NET PROFIT</div><div class="kpi-value" style="color:#047857;">Rp ' + summary_net_profit.toLocaleString('id-ID') + '</div></td>' +
    '<td class="kpi-box"><div style="color:#64748b; font-size:10px;">AVG KERANJANG</div><div class="kpi-value">Rp ' + summary_rata_rata_keranjang.toLocaleString('id-ID') + '</div></td>' +
    '</tr></table>' +
    '<h4 style="color:#1954d6; margin-bottom:8px;">Tabel Rekapitulasi Performa</h4>' +
    '<table>' +
    '<thead><tr><th>Tanggal</th><th style="text-align:center;">Jumlah TRX</th><th style="text-align:right;">Omset Kotor</th><th style="text-align:right;">HPP</th><th style="text-align:right;">Laba Bersih</th></tr></thead>' +
    '<tbody>' + rekapRowsHtml + '</tbody>' +
    '</table>' +
    '<table class="signature-table"><tr>' +
    '<td style="border:none; width:60%;"></td>' +
    '<td style="border:none; text-align:center;">' +
    '<div>Sumedang, ' + periode_tanggal_cetak + '</div>' +
    '<div style="margin-top:60px; font-weight:bold; text-decoration:underline;">' + dibuat_oleh + '</div>' +
    '<div style="color:#64748b; font-size:11px;">Penanggung Jawab / Super Admin</div>' +
    '</td>' +
    '</tr></table>' +
    '</body></html>';

  var blob = Utilities.newBlob(htmlContent, "text/html", "Laporan_Keuangan_" + Date.now() + ".html").getAs("application/pdf");
  var file = reportFolder.createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e) {}

  var pdfUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
  return {
    status: "SUCCESS",
    message: "Laporan PDF berhasil dibuat dan disimpan di Google Drive",
    reportPdfUrl: pdfUrl,
    fileId: file.getId()
  };
}

/**
 * 8. UPLOAD FILE GAMBAR & STRUK
 */
function handleFileUpload(data, targetFolderName) {
  if (!data.fileBase64) return { status: "ERROR", message: "fileBase64 wajib diisi" };
  var driveInfo = setupDriveFoldersAndPermissions(data);
  var rootFolder = DriveApp.getFolderById(driveInfo.rootFolderId);
  var targetFolder = getOrCreateSubFolder(rootFolder, targetFolderName);

  var fileName = data.fileName || ("Upload_" + new Date().getTime());
  var mimeType = data.mimeType || "image/png";
  var base64Clean = data.fileBase64.replace(/^data:.*?;base64,/, "");
  var blob = Utilities.newBlob(Utilities.base64Decode(base64Clean), mimeType, fileName);
  var file = targetFolder.createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e) {}

  var fileId = file.getId();
  return {
    status: "SUCCESS",
    fileId: fileId,
    fileUrl: "https://lh3.googleusercontent.com/d/" + fileId,
    driveViewUrl: file.getUrl(),
    fileName: fileName
  };
}

/**
 * 9. BACA SEMUA DATA DARI SHEET (PRODUK, TRANSAKSI, PELANGGAN, PENGATURAN)
 */
function getAllDataFromSheets(data) {
  var ss = getSpreadsheet(data);
  
  var pSheet = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
  var products = [];
  if (pSheet && pSheet.getLastRow() > 1) {
    var pData = pSheet.getRange(2, 1, pSheet.getLastRow() - 1, 14).getValues();
    products = pData.map(function(r) {
      var stockVal = Number(r[6]) || 0;
      var minStockVal = Number(r[7]) || 0;
      return {
        id: String(r[0]),
        sku: String(r[1]),
        name: String(r[2]),
        category: String(r[3]),
        costPrice: Number(r[4]) || 0,
        price: Number(r[5]) || 0,
        stock: stockVal,
        minStock: minStockVal,
        unit: String(r[8] || "Pcs"),
        rackLocation: String(r[9] || ""),
        image: String(r[10] || ""),
        status: stockVal <= minStockVal ? "Kritis" : stockVal <= minStockVal * 2 ? "Menengah" : "Aman"
      };
    });
  }

  var tSheet = ss.getSheetByName(CONFIG.SHEET_TRANSACTIONS);
  var transactions = [];
  if (tSheet && tSheet.getLastRow() > 1) {
    var tData = tSheet.getRange(2, 1, tSheet.getLastRow() - 1, 14).getValues();
    transactions = tData.map(function(r) {
      var items = [];
      if (r[12]) {
        try {
          var parsed = JSON.parse(r[12]);
          if (Array.isArray(parsed)) items = parsed;
        } catch(e) {}
      }
      var fullDate = String(r[4] || "");
      var dateParts = fullDate.split(" ");
      return {
        id: String(r[0]),
        customer: String(r[2]),
        date: dateParts[0] || fullDate,
        time: dateParts[1] || "00:00",
        subtotal: Number(r[5]) || 0,
        tax: Number(r[7]) || 0,
        grandTotal: Number(r[9]) || 0,
        paymentMethod: String(r[10]),
        status: String(r[11]),
        items: items,
        receiptUrl: String(r[13] || "")
      };
    });
  }

  var cSheet = ss.getSheetByName(CONFIG.SHEET_CUSTOMERS);
  var customers = [];
  if (cSheet && cSheet.getLastRow() > 1) {
    var cData = cSheet.getRange(2, 1, cSheet.getLastRow() - 1, 10).getValues();
    customers = cData.map(function(r) {
      return {
        id: String(r[0]),
        name: String(r[1]),
        phone: String(r[2]),
        email: String(r[3]),
        address: String(r[4]),
        points: Number(r[6]) || 0,
        memberTier: String(r[7] || "Bronze"),
        lastVisit: String(r[8]),
        totalSpent: Number(r[9]) || 0
      };
    });
  }

  var sSheet = ss.getSheetByName(CONFIG.SHEET_SETTINGS);
  var settings = null;
  if (sSheet && sSheet.getLastRow() > 1) {
    var sData = sSheet.getRange(2, 1, 1, 12).getValues()[0];
    settings = {
      storeId: String(sData[0]),
      storeName: String(sData[1]),
      slogan: String(sData[2]),
      address: String(sData[3]),
      phone: String(sData[4]),
      email: String(sData[5]),
      npwp: String(sData[6]),
      taxRate: Number(sData[7]) || 11,
      currency: String(sData[8] || "IDR"),
      receiptFooter: String(sData[10]),
      logoUrl: String(sData[11])
    };
  }

  return {
    status: "SUCCESS",
    products: products,
    transactions: transactions,
    customers: customers,
    settings: settings
  };
}
`;

export const GOOGLE_APPS_SCRIPT_CODE = FULL_GOOGLE_APPS_SCRIPT;
