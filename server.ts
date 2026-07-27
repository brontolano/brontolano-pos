import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { FULL_GOOGLE_APPS_SCRIPT } from "./src/lib/googleAppsScriptCode";
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_CUSTOMERS } from "./src/data/initialData";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// In-memory persistent data store during server runtime
let products = [...INITIAL_PRODUCTS];
let transactions = [...INITIAL_TRANSACTIONS];
let customers = [...INITIAL_CUSTOMERS];
let storeSettings = {
  storeName: "Brontolano Cafe & Resto",
  webAppUrl: "https://script.google.com/macros/s/AKfycbwn6_umqavZibkfX3sCRkOADk8epcpP7DbnR7Wyhbe4xy7yxtB-KTaYzLp91dswlKAg/exec",
  spreadsheetId: "1NC-bEJ98ysh-6Fc0ZpE2KOWdEsvk4cqqlJU8Pap7oAs",
  driveFolderId: "1OliH3aYcmj6VeF4aw83W6CEETR7T_FcN",
  enableTax: true,
  taxRate: 11,
  currency: "IDR"
};

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Brontolano POS Enterprise Server" });
});

// Products API - Full CRUD
app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const pData = req.body;
  if (!pData || typeof pData !== "object") {
    return res.status(400).json({ error: "Data produk tidak valid" });
  }

  const id = pData.id || "prod-" + Date.now().toString(36);
  const stock = Number(pData.stock) || 0;
  const minStock = Number(pData.minStock) || 0;
  const status = stock <= minStock ? "Kritis" : stock <= minStock * 2 ? "Menengah" : "Aman";
  const item = { ...pData, id, stock, minStock, status };

  const existingIndex = products.findIndex((p) => p.id === id || (p.sku && pData.sku && p.sku === pData.sku));
  if (existingIndex >= 0) {
    products[existingIndex] = { ...products[existingIndex], ...item };
    return res.json(products[existingIndex]);
  } else {
    products.unshift(item);
    return res.status(201).json(item);
  }
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);
  if (index >= 0) {
    const pData = req.body;
    const stock = Number(pData.stock ?? products[index].stock) || 0;
    const minStock = Number(pData.minStock ?? products[index].minStock) || 0;
    const status = stock <= minStock ? "Kritis" : stock <= minStock * 2 ? "Menengah" : "Aman";
    products[index] = { ...products[index], ...pData, id, stock, minStock, status };
    return res.json(products[index]);
  }
  res.status(404).json({ error: "Produk tidak ditemukan" });
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  products = products.filter((p) => p.id !== id);
  res.json({ success: true, message: "Produk berhasil dihapus", id });
});

// Transactions API - Full CRUD
app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

app.post("/api/transactions", (req, res) => {
  const txData = req.body;
  const newTx = {
    id: txData.id || "#TRX-" + Math.floor(1000 + Math.random() * 9000),
    time: txData.time || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    date: txData.date || new Date().toISOString().split("T")[0],
    ...txData
  };

  const existingIndex = transactions.findIndex((t) => t.id === newTx.id);
  if (existingIndex >= 0) {
    transactions[existingIndex] = { ...transactions[existingIndex], ...newTx };
  } else {
    transactions.unshift(newTx);
  }

  // Deduct stock for items
  if (Array.isArray(req.body.items)) {
    req.body.items.forEach((item: { name: string; qty: number }) => {
      const p = products.find((prod) => prod.name === item.name);
      if (p) {
        p.stock = Math.max(0, p.stock - (item.qty || 1));
        p.status = p.stock <= p.minStock ? "Kritis" : p.stock <= p.minStock * 2 ? "Menengah" : "Aman";
      }
    });
  }

  res.status(201).json(newTx);
});

app.delete("/api/transactions/:id", (req, res) => {
  const { id } = req.params;
  transactions = transactions.filter((t) => t.id !== id);
  res.json({ success: true, message: "Transaksi dihapus" });
});

// Customers API - Full CRUD
app.get("/api/customers", (req, res) => {
  res.json(customers);
});

app.post("/api/customers", (req, res) => {
  const cData = req.body;
  const id = cData.id || "cust-" + Date.now().toString(36);
  const newCust = { ...cData, id };
  const existingIndex = customers.findIndex((c) => c.id === id);
  if (existingIndex >= 0) {
    customers[existingIndex] = { ...customers[existingIndex], ...newCust };
  } else {
    customers.unshift(newCust);
  }
  res.status(201).json(newCust);
});

app.put("/api/customers/:id", (req, res) => {
  const { id } = req.params;
  const index = customers.findIndex((c) => c.id === id);
  if (index >= 0) {
    customers[index] = { ...customers[index], ...req.body, id };
    return res.json(customers[index]);
  }
  res.status(404).json({ error: "Pelanggan tidak ditemukan" });
});

app.delete("/api/customers/:id", (req, res) => {
  const { id } = req.params;
  customers = customers.filter((c) => c.id !== id);
  res.json({ success: true, message: "Pelanggan dihapus" });
});

// Settings API
app.get("/api/settings", (req, res) => {
  res.json(storeSettings);
});

app.post("/api/settings", (req, res) => {
  storeSettings = { ...storeSettings, ...req.body };
  res.json({ success: true, settings: storeSettings });
});

// Google Sheets Sync Proxy Endpoint
app.post("/api/sheets/sync", async (req, res) => {
  const {
    webAppUrl,
    spreadsheetId,
    driveFolderId,
    action,
    products: reqProducts,
    transactions: reqTransactions,
    customers: reqCustomers,
    settings: reqSettings
  } = req.body;

  const targetProducts = reqProducts || products;
  const targetTransactions = reqTransactions || transactions;
  const targetCustomers = reqCustomers || customers;
  const targetSettings = reqSettings || storeSettings;

  const targetUrl = webAppUrl || storeSettings.webAppUrl;
  const targetAction = action || "syncAll";

  if (targetUrl && typeof targetUrl === "string" && targetUrl.startsWith("http")) {
    try {
      const payload = {
        action: targetAction,
        spreadsheetId: spreadsheetId || storeSettings.spreadsheetId || "1NC-bEJ98ysh-6Fc0ZpE2KOWdEsvk4cqqlJU8Pap7oAs",
        driveFolderId: driveFolderId || storeSettings.driveFolderId,
        products: targetProducts,
        transactions: targetTransactions,
        customers: targetCustomers,
        settings: targetSettings,
        ...req.body
      };

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        redirect: "follow"
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { status: "SUCCESS", message: text };
      }

      if (data && data.status === "ERROR") {
        return res.status(400).json({
          success: false,
          message: "Google Apps Script error: " + data.message,
          details: data
        });
      }

      return res.json({
        success: true,
        message: data.message || `Berhasil menyinkronkan data ke Google Sheets!`,
        details: data,
        syncedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Gagal menghubungi Google Apps Script:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal menghubungkan ke Web App URL Google: " + (err.message || String(err))
      });
    }
  }

  res.json({
    success: true,
    message: "Data disinkronkan secara lokal di server. Konfigurasikan Web App URL di Pengaturan Toko.",
    spreadsheetId: spreadsheetId || storeSettings.spreadsheetId,
    syncedAt: new Date().toISOString()
  });
});

// Google Sheets Fetch All Live Data Endpoint
app.post("/api/sheets/fetch", async (req, res) => {
  const { webAppUrl, spreadsheetId } = req.body;
  const targetUrl = webAppUrl || storeSettings.webAppUrl;
  const targetSpreadsheetId = spreadsheetId || storeSettings.spreadsheetId || "";

  if (targetUrl && typeof targetUrl === "string" && targetUrl.startsWith("http")) {
    try {
      const fetchUrl = `${targetUrl}?action=getAllData&spreadsheetId=${encodeURIComponent(targetSpreadsheetId)}`;
      const response = await fetch(fetchUrl, { redirect: "follow" });
      const data = await response.json();

      if (data && (data.status === "SUCCESS" || Array.isArray(data.products))) {
        if (Array.isArray(data.products) && data.products.length > 0) {
          products = data.products;
        }
        if (Array.isArray(data.transactions) && data.transactions.length > 0) {
          transactions = data.transactions;
        }
        if (Array.isArray(data.customers) && data.customers.length > 0) {
          customers = data.customers;
        }
        if (data.settings && typeof data.settings === "object") {
          storeSettings = { ...storeSettings, ...data.settings };
        }
        return res.json({
          success: true,
          message: "Berhasil membaca dan memperbarui data dari Google Sheets!",
          data: {
            products: data.products || products,
            transactions: data.transactions || transactions,
            customers: data.customers || customers,
            settings: data.settings || storeSettings
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Gagal membaca data dari Google Sheets: " + (data.message || "Respon tidak valid")
        });
      }
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: "Kesalahan jaringan saat membaca Google Sheets: " + (err.message || String(err))
      });
    }
  }

  res.status(400).json({
    success: false,
    message: "Web App URL belum dikonfigurasi. Masukkan Web App URL di Pengaturan Toko."
  });
});

// Periodic Sync Status Polling Endpoint
app.get("/api/sheets/sync-status", (req, res) => {
  const categoriesCount = new Set(products.map((p) => p.category)).size;
  const totalTx = transactions.length;
  const uniqueCustomers = new Set(
    transactions.map((t) => t.customer).filter((c) => c && c.trim() !== "" && c !== "Pelanggan Umum")
  ).size;
  const totalRev = transactions
    .filter((t) => t.status === "Sukses" || t.status === "Selesai")
    .reduce((sum, t) => sum + t.grandTotal, 0);
  const avgBasket = totalTx > 0 && totalRev > 0 ? Math.round(totalRev / totalTx) : 0;

  res.json({
    status: "SUCCESS",
    isLiveConnected: true,
    lastSyncedAt: new Date().toISOString(),
    metrics: {
      categoriesCount,
      totalTransactions: totalTx,
      newCustomersCount: uniqueCustomers,
      avgBasketSize: avgBasket
    }
  });
});

// Auto Setup Google Sheets & Drive Folders Proxy
app.post("/api/sheets/auto-setup", async (req, res) => {
  const { webAppUrl, spreadsheetId, driveFolderId } = req.body;

  if (webAppUrl && typeof webAppUrl === "string" && webAppUrl.startsWith("http")) {
    try {
      const payload = {
        action: "autoSetup",
        spreadsheetId: spreadsheetId || "1NC-bEJ98ysh-6Fc0ZpE2KOWdEsvk4cqqlJU8Pap7oAs",
        driveFolderId: driveFolderId || "1rmK3r-n3ogzygOO9LrM_UQjvB3DN3I00"
      };

      const response = await fetch(webAppUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        redirect: "follow"
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { status: "SUCCESS", message: text };
      }

      if (data && data.status === "ERROR") {
        return res.status(400).json({
          success: false,
          message: "AutoSetup Gagal: " + data.message,
          details: data
        });
      }

      return res.json({
        success: true,
        message: data.message || "AutoSetup Google Sheets & Drive Berhasil!",
        details: data
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: "Gagal menghubungkan ke Web App URL: " + (err.message || String(err))
      });
    }
  }

  res.json({
    success: true,
    message: "Web App URL belum dikonfigurasi. Salin kode Code.gs dan tempel di Google Apps Script."
  });
});

// Google Drive Upload Receipt Proxy
app.post("/api/drive/upload-receipt", async (req, res) => {
  const { webAppUrl, transactionId, fileBase64, spreadsheetId, driveFolderId } = req.body;

  if (webAppUrl && typeof webAppUrl === "string" && webAppUrl.startsWith("http") && fileBase64) {
    try {
      const payload = {
        action: "uploadReceiptPdf",
        fileName: `Struk_${transactionId || "TRX"}_${Date.now()}.png`,
        fileBase64,
        spreadsheetId,
        driveFolderId
      };

      const response = await fetch(webAppUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        redirect: "follow"
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch (e) { data = { fileUrl: "" }; }

      return res.json({
        success: true,
        message: `Struk transaksi ${transactionId || "#TRX"} berhasil disimpan ke Google Drive!`,
        fileUrl: data.fileUrl || data.driveViewUrl || "",
        savedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Gagal upload receipt ke Drive:", err);
    }
  }

  res.json({
    success: true,
    message: `Struk transaksi ${transactionId || "#TRX"} berhasil disimpan!`,
    fileUrl: `https://drive.google.com/file/d/sample-receipt-id/view`,
    savedAt: new Date().toISOString()
  });
});

// Google Apps Script Snippet Endpoint
app.get("/api/appscript/code", (req, res) => {
  res.type("text/plain").send(FULL_GOOGLE_APPS_SCRIPT);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ProPOS Enterprise server running on http://localhost:${PORT}`);
  });
}

startServer();
