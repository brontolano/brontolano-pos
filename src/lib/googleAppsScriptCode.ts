export const FULL_GOOGLE_APPS_SCRIPT = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT LENGKAP - BRONTOLANO POS ENTERPRISE
 * Integrasi Otomatis Google Sheets & Google Drive (Akses File & Izin Upload)
 * ============================================================================
 * Fitur:
 * 1. autoSetupDatabase() : Membuat 4 Tab Sheet & 3 Folder Google Drive Otomatis
 *    serta mengatur izin akses folder publik (ANYONE_WITH_LINK).
 * 2. uploadProductImage  : Upload gambar produk (Base64) ke Drive -> Hasilkan URL Publik.
 * 3. uploadReceiptPdf    : Upload PDF/Struk transaksi ke Drive -> Hasilkan Link Drive.
 * 4. uploadReportPdf     : Upload PDF Laporan Keuangan ke Drive.
 * 5. saveTransaction     : Simpan data transaksi, potong stok produk otomatis di Sheet.
 * 6. syncProducts        : Sinkronisasi seluruh inventori produk.
 * 7. syncReport          : Simpan rekapitulasi laporan harian/bulanan.
 * 8. saveSettings        : Simpan profil toko ke Google Sheets.
 * 9. getAllData          : Ambil seluruh data dari Google Sheets kembali ke Aplikasi POS.
 * ============================================================================
 */

// NAMA FOLDER & TAB SHEET GLOBAL
var CONFIG = {
  ROOT_FOLDER_NAME: "Brontolano POS Cloud System",
  FOLDER_PRODUCT_IMAGES: "Gambar Produk",
  FOLDER_RECEIPT_PDFS: "Arsip Struk PDF",
  FOLDER_REPORTS_PDFS: "Laporan Keuangan",
  
  SHEET_PRODUCTS: "Produk",
  SHEET_TRANSACTIONS: "Transaksi",
  SHEET_REPORTS: "Ringkasan Laporan",
  SHEET_SETTINGS: "Pengaturan Toko"
};

/**
 * JALANKAN FUNGSI INI PERTAMA KALI DI GOOGLE APPS SCRIPT
 * Mempersiapkan semua Sheet & Folder Drive beserta Izin Akses Publik
 */
function autoSetupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. SETUP TABS SPREADSHEET
  setupSheetTab(ss, CONFIG.SHEET_PRODUCTS, [
    "ID Produk", "SKU", "Nama Produk", "Kategori", "Harga Jual", "Harga Pokok", "Stok", "Stok Min", "URL Gambar", "Status Stok", "Tanggal Update"
  ]);
  
  setupSheetTab(ss, CONFIG.SHEET_TRANSACTIONS, [
    "ID Transaksi", "Tanggal", "Jam", "Pelanggan", "Items JSON", "Subtotal", "Pajak", "Total Bayar", "Metode Pembayaran", "Catatan", "Link Struk Drive", "Status"
  ]);
  
  setupSheetTab(ss, CONFIG.SHEET_REPORTS, [
    "Tanggal Laporan", "Total Transaksi", "Total Omset", "Total Pajak", "Tunai", "QRIS", "Kartu", "Transfer", "Top Produk", "Link PDF Laporan"
  ]);
  
  setupSheetTab(ss, CONFIG.SHEET_SETTINGS, [
    "Parameter", "Nilai", "Keterangan"
  ]);

  // 2. SETUP GOOGLE DRIVE FOLDERS & PERMISSIONS
  var driveInfo = setupDriveFoldersAndPermissions();

  var result = {
    status: "SUCCESS",
    message: "Auto Setup Database & Google Drive Berhasil Diperbarui!",
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    driveFolders: driveInfo
  };
  
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * MENGATUR IZIN FOLDER GOOGLE DRIVE SUPAYA BISA UPLOAD & DILIHAT TANPA AKSES DITOLAK
 */
function setupDriveFoldersAndPermissions() {
  var rootFolder;
  var rootFolders = DriveApp.getFoldersByName(CONFIG.ROOT_FOLDER_NAME);
  if (rootFolders.hasNext()) {
    rootFolder = rootFolders.next();
  } else {
    rootFolder = DriveApp.createFolder(CONFIG.ROOT_FOLDER_NAME);
  }
  
  // Berikan izin akses siapapun yang memiliki link dapat melihat file (Public View)
  try {
    rootFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch(e) {
    Logger.log("Warning sharing permission: " + e.toString());
  }

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
  var folder;
  if (subFolders.hasNext()) {
    folder = subFolders.next();
  } else {
    folder = parentFolder.createFolder(folderName);
  }
  try {
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch(e) {}
  return folder;
}

function setupSheetTab(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
    sheet.setFrozenRows(1);
  }
}

/**
 * HANDLER UNTUK HTTP POST WEB APP
 */
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    var action = data.action || (e.parameter ? e.parameter.action : "saveTransaction");
    var response = {};

    if (action === "autoSetup") {
      response = autoSetupDatabase();
    } else if (action === "uploadProductImage" || action === "uploadFile") {
      response = handleFileUpload(data, CONFIG.FOLDER_PRODUCT_IMAGES);
    } else if (action === "uploadReceiptPdf") {
      response = handleFileUpload(data, CONFIG.FOLDER_RECEIPT_PDFS);
    } else if (action === "uploadReportPdf") {
      response = handleFileUpload(data, CONFIG.FOLDER_REPORTS_PDFS);
    } else if (action === "saveTransaction") {
      response = saveTransactionToSheet(data);
    } else if (action === "syncProducts") {
      response = syncProductsToSheet(data);
    } else if (action === "syncReport") {
      response = syncReportToSheet(data);
    } else if (action === "saveSettings") {
      response = saveSettingsToSheet(data);
    } else if (action === "getAllData") {
      response = getAllDataFromSheets();
    } else {
      response = { status: "ERROR", message: "Aksi tidak dikenali: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ERROR",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * HANDLER UNTUK HTTP GET WEB APP
 */
function doGet(e) {
  var action = e.parameter ? e.parameter.action : "getAllData";
  var response = {};

  if (action === "autoSetup") {
    response = autoSetupDatabase();
  } else if (action === "getAllData") {
    response = getAllDataFromSheets();
  } else {
    response = {
      status: "SUCCESS",
      app: "Brontolano POS Cloud Web App API",
      time: new Date().toISOString()
    };
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * FUNGSI MENGUNGGAH FILE BASE64 KE GOOGLE DRIVE METODE PUBLIK
 */
function handleFileUpload(data, targetFolderName) {
  if (!data.fileBase64) {
    return { status: "ERROR", message: "fileBase64 wajib diisi" };
  }

  var foldersInfo = setupDriveFoldersAndPermissions();
  var rootFolder = DriveApp.getFolderById(foldersInfo.rootFolderId);
  var targetFolder = getOrCreateSubFolder(rootFolder, targetFolderName);

  var fileName = data.fileName || ("Upload_" + new Date().getTime());
  var mimeType = data.mimeType || "image/png";

  // Decode base64
  var base64Clean = data.fileBase64.replace(/^data:.*?;base64,/, "");
  var blob = Utilities.newBlob(Utilities.base64Decode(base64Clean), mimeType, fileName);

  var file = targetFolder.createFile(blob);
  
  // Set Public Permissions
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch(e) {}

  var fileId = file.getId();
  var directUrl = "https://lh3.googleusercontent.com/d/" + fileId; // Direct viewable URL
  var driveViewUrl = file.getUrl();

  return {
    status: "SUCCESS",
    fileId: fileId,
    fileUrl: directUrl,
    driveViewUrl: driveViewUrl,
    fileName: fileName
  };
}

/**
 * SIMPAN TRANSAKSI & DUKUNG PENGURANGAN STOK OTOMATIS DI SHEET
 */
function saveTransactionToSheet(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var txSheet = ss.getSheetByName(CONFIG.SHEET_TRANSACTIONS);
  if (!txSheet) {
    autoSetupDatabase();
    txSheet = ss.getSheetByName(CONFIG.SHEET_TRANSACTIONS);
  }

  txSheet.appendRow([
    data.id || "",
    data.date || new Date().toLocaleDateString("id-ID"),
    data.time || new Date().toLocaleTimeString("id-ID"),
    data.customer || "Umum/Pelanggan",
    JSON.stringify(data.items || []),
    data.total || 0,
    data.tax || 0,
    data.grandTotal || 0,
    data.paymentMethod || "Tunai",
    data.note || "",
    data.receiptUrl || "",
    data.status || "Sukses"
  ]);

  // POTONG STOK DI TAB PRODUK OTOMATIS
  if (data.items && Array.isArray(data.items)) {
    var productSheet = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
    if (productSheet && productSheet.getLastRow() > 1) {
      var prodValues = productSheet.getRange(2, 1, productSheet.getLastRow() - 1, 10).getValues();
      
      data.items.forEach(function(item) {
        for (var i = 0; i < prodValues.length; i++) {
          var rowName = prodValues[i][2]; // Nama Produk
          var rowSku = prodValues[i][1];  // SKU
          if (rowName === item.name || rowSku === item.sku) {
            var currentStock = Number(prodValues[i][6]) || 0;
            var newStock = Math.max(0, currentStock - (item.qty || 1));
            productSheet.getRange(i + 2, 7).setValue(newStock); // Update Kolom Stok
            break;
          }
        }
      });
    }
  }

  return { status: "SUCCESS", message: "Transaksi berhasil dicatat ke Google Sheets & stok diperbarui" };
}

/**
 * SINKRONISASI INVENTORI PRODUK
 */
function syncProductsToSheet(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
  if (!sheet) {
    autoSetupDatabase();
    sheet = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
  }

  var products = data.products || [];
  if (products.length === 0) return { status: "SUCCESS", message: "Tidak ada produk diunggah" };

  // Clear existing product data except header
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 11).clearContent();
  }

  var rows = products.map(function(p) {
    return [
      p.id || "",
      p.sku || "",
      p.name || "",
      p.category || "",
      p.price || 0,
      p.costPrice || 0,
      p.stock || 0,
      p.minStock || 0,
      p.image || "",
      p.stock <= p.minStock ? "Kritis" : "Aman",
      new Date().toISOString()
    ];
  });

  sheet.getRange(2, 1, rows.length, 11).setValues(rows);

  return { status: "SUCCESS", message: products.length + " produk berhasil disinkronkan" };
}

/**
 * SIMPAN REKAP LAPORAN
 */
function syncReportToSheet(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_REPORTS);
  if (!sheet) {
    autoSetupDatabase();
    sheet = ss.getSheetByName(CONFIG.SHEET_REPORTS);
  }

  sheet.appendRow([
    data.date || new Date().toISOString(),
    data.totalTransactions || 0,
    data.totalOmset || 0,
    data.totalTax || 0,
    data.cashAmount || 0,
    data.qrisAmount || 0,
    data.cardAmount || 0,
    data.transferAmount || 0,
    data.topProducts || "",
    data.reportPdfUrl || ""
  ]);

  return { status: "SUCCESS", message: "Laporan berhasil dicatat ke Google Sheets" };
}

/**
 * SIMPAN PENGATURAN TOKO
 */
function saveSettingsToSheet(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_SETTINGS);
  if (!sheet) {
    autoSetupDatabase();
    sheet = ss.getSheetByName(CONFIG.SHEET_SETTINGS);
  }

  var settings = data.settings || {};
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  }

  var rows = [];
  for (var key in settings) {
    rows.push([key, String(settings[key]), "Pengaturan Toko"]);
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 3).setValues(rows);
  }

  return { status: "SUCCESS", message: "Pengaturan toko disimpan" };
}

/**
 * AMBIL SELURUH DATA DARI SPREADSHEET
 */
function getAllDataFromSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var pSheet = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
  var products = [];
  if (pSheet && pSheet.getLastRow() > 1) {
    var pData = pSheet.getRange(2, 1, pSheet.getLastRow() - 1, 9).getValues();
    products = pData.map(function(r) {
      return {
        id: String(r[0]),
        sku: String(r[1]),
        name: String(r[2]),
        category: String(r[3]),
        price: Number(r[4]) || 0,
        costPrice: Number(r[5]) || 0,
        stock: Number(r[6]) || 0,
        minStock: Number(r[7]) || 0,
        image: String(r[8])
      };
    });
  }

  var tSheet = ss.getSheetByName(CONFIG.SHEET_TRANSACTIONS);
  var transactions = [];
  if (tSheet && tSheet.getLastRow() > 1) {
    var tData = tSheet.getRange(2, 1, tSheet.getLastRow() - 1, 12).getValues();
    transactions = tData.map(function(r) {
      var items = [];
      try { items = JSON.parse(r[4]); } catch(e) {}
      return {
        id: String(r[0]),
        date: String(r[1]),
        time: String(r[2]),
        customer: String(r[3]),
        items: items,
        total: Number(r[5]) || 0,
        tax: Number(r[6]) || 0,
        grandTotal: Number(r[7]) || 0,
        paymentMethod: String(r[8]),
        note: String(r[9]),
        receiptUrl: String(r[10]),
        status: String(r[11])
      };
    });
  }

  return {
    status: "SUCCESS",
    products: products,
    transactions: transactions
  };
}
`;
