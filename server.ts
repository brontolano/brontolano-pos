import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent data store during server runtime
let products = [
  {
    id: "prod-1",
    name: "Arabica Coffee Beans 1kg",
    sku: "RAW-COF-001",
    category: "Bahan Baku",
    price: 185000,
    costPrice: 120000,
    stock: 45,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-2",
    name: "Mineral Water 600ml Case",
    sku: "BEV-WAT-012",
    category: "Minuman",
    price: 48000,
    costPrice: 35000,
    stock: 120,
    minStock: 20,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-3",
    name: "Potato Chips BBQ 150g",
    sku: "SNCK-POT-05",
    category: "Makanan",
    price: 15500,
    costPrice: 10000,
    stock: 8,
    minStock: 15,
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80",
    status: "Kritis"
  },
  {
    id: "prod-4",
    name: "Wireless Headphones X2",
    sku: "ELEC-WHP-22",
    category: "Elektronik",
    price: 899000,
    costPrice: 650000,
    stock: 12,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    status: "Menengah"
  },
  {
    id: "prod-5",
    name: "Mechanical Keyboard RGB",
    sku: "ELEC-KBD-09",
    category: "Elektronik",
    price: 1250000,
    costPrice: 900000,
    stock: 3,
    minStock: 5,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    status: "Kritis"
  },
  {
    id: "prod-6",
    name: "Smartwatch Series 5",
    sku: "ELEC-WCH-05",
    category: "Elektronik",
    price: 3450000,
    costPrice: 2600000,
    stock: 25,
    minStock: 8,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-7",
    name: "Running Shoes Red Edition",
    sku: "APP-SHO-101",
    category: "Pakaian",
    price: 750000,
    costPrice: 500000,
    stock: 18,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    status: "Menengah"
  },
  {
    id: "prod-8",
    name: "Instant Camera Mini",
    sku: "ELEC-CAM-02",
    category: "Elektronik",
    price: 1100000,
    costPrice: 850000,
    stock: 5,
    minStock: 8,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
    status: "Kritis"
  },
  {
    id: "prod-9",
    name: "Urban Travel Backpack",
    sku: "ACC-BPK-12",
    category: "Aksesoris",
    price: 450000,
    costPrice: 280000,
    stock: 30,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    status: "Menengah"
  },
  {
    id: "prod-10",
    name: "Pro Wireless Mouse",
    sku: "ELEC-MSE-01",
    category: "Elektronik",
    price: 210000,
    costPrice: 140000,
    stock: 42,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  }
];

let transactions = [
  {
    id: "#TRX-9821",
    time: "14:20",
    date: "2024-05-24",
    customer: "Andi Saputra",
    items: [
      { name: "Arabica Coffee Beans 1kg", qty: 2, price: 185000 },
      { name: "Pro Wireless Mouse", qty: 1, price: 210000 }
    ],
    total: 580000,
    tax: 63800,
    grandTotal: 643800,
    paymentMethod: "QRIS",
    status: "Sukses"
  },
  {
    id: "#TRX-9820",
    time: "14:15",
    date: "2024-05-24",
    customer: "Guest Pelanggan",
    items: [{ name: "Mineral Water 600ml Case", qty: 1, price: 48000 }],
    total: 48000,
    tax: 5280,
    grandTotal: 53280,
    paymentMethod: "Tunai",
    status: "Sukses"
  },
  {
    id: "#TRX-9819",
    time: "14:02",
    date: "2024-05-24",
    customer: "Rina Marlina",
    items: [
      { name: "Running Shoes Red Edition", qty: 1, price: 750000 },
      { name: "Urban Travel Backpack", qty: 1, price: 450000 }
    ],
    total: 1200000,
    tax: 132000,
    grandTotal: 1332000,
    paymentMethod: "Kartu",
    status: "Tertunda"
  },
  {
    id: "#TRX-9818",
    time: "13:45",
    date: "2024-05-24",
    customer: "Budi Hartono",
    items: [{ name: "Pro Wireless Mouse", qty: 1, price: 210000 }],
    total: 210000,
    tax: 23100,
    grandTotal: 233100,
    paymentMethod: "QRIS",
    status: "Sukses"
  },
  {
    id: "#TRX-9817",
    time: "13:30",
    date: "2024-05-24",
    customer: "Siti Aminah",
    items: [{ name: "Potato Chips BBQ 150g", qty: 1, price: 15500 }],
    total: 15500,
    tax: 1705,
    grandTotal: 17205,
    paymentMethod: "Tunai",
    status: "Batal"
  }
];

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "ProPOS Enterprise Server" });
});

// Products API
app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const newProd = {
    id: "prod-" + (products.length + 1) + "-" + Date.now().toString(36),
    ...req.body,
    status: req.body.stock <= req.body.minStock ? "Kritis" : req.body.stock <= req.body.minStock * 2 ? "Menengah" : "Aman"
  };
  products.unshift(newProd);
  res.status(201).json(newProd);
});

// Transactions API
app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

app.post("/api/transactions", (req, res) => {
  const newTx = {
    id: "#TRX-" + Math.floor(1000 + Math.random() * 9000),
    time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    date: new Date().toISOString().split("T")[0],
    ...req.body
  };
  transactions.unshift(newTx);

  // Deduct stock for items
  if (Array.isArray(req.body.items)) {
    req.body.items.forEach((item: { name: string; qty: number }) => {
      const p = products.find((prod) => prod.name === item.name);
      if (p) {
        p.stock = Math.max(0, p.stock - item.qty);
        p.status = p.stock <= p.minStock ? "Kritis" : p.stock <= p.minStock * 2 ? "Menengah" : "Aman";
      }
    });
  }

  res.status(201).json(newTx);
});

// Google Sheets Sync Endpoint Simulator / Proxy
app.post("/api/sheets/sync", (req, res) => {
  const { spreadsheetId, sheetName } = req.body;
  res.json({
    success: true,
    message: `Berhasil menyinkronkan ${transactions.length} transaksi dan ${products.length} produk ke Google Sheets!`,
    spreadsheetId: spreadsheetId || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    syncedAt: new Date().toISOString()
  });
});

// Google Drive Upload Receipt Proxy
app.post("/api/drive/upload-receipt", (req, res) => {
  const { transactionId, folderName } = req.body;
  res.json({
    success: true,
    message: `Struk transaksi ${transactionId || "#TRX-9821"} berhasil disimpan ke folder Google Drive "${folderName || 'ProPOS_Struk'}"`,
    fileUrl: `https://drive.google.com/file/d/sample-receipt-id/view`,
    savedAt: new Date().toISOString()
  });
});

// Google Apps Script Snippet Endpoint
app.get("/api/appscript/code", (req, res) => {
  const scriptCode = `/**
 * Google Apps Script for ProPOS Enterprise Integration
 * Put this in Extensions > Apps Script in your Google Sheet
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    if (data.type === 'TRANSACTION') {
      sheet.appendRow([
        data.id,
        data.date,
        data.time,
        data.customer || 'Guest',
        data.paymentMethod,
        data.grandTotal,
        data.status
      ]);
      return ContentService.createTextOutput(JSON.stringify({ result: "SUCCESS" })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ result: "ERROR", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;
  res.send(scriptCode);
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
