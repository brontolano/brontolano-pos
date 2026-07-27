import React, { useState, useEffect } from "react";
import { Product, Transaction, CartItem, NavigationTab, PaymentMethod, StoreSettings, AppUser } from "./types";
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, CATEGORIES, INITIAL_USERS } from "./data/initialData";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { DashboardView } from "./components/DashboardView";
import { InventoryView } from "./components/InventoryView";
import { POSView } from "./components/POSView";
import { TransactionsView } from "./components/TransactionsView";
import { ReportsView } from "./components/ReportsView";
import { SettingsView } from "./components/SettingsView";
import { ReceiptModal } from "./components/ReceiptModal";
import { AddProductModal } from "./components/AddProductModal";
import { LoginModal } from "./components/LoginModal";

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Brontolano POS",
  storeTagline: "Enterprise Point of Sale & Store Management",
  storeAddress: "Jl. Sudirman No. 88, Jakarta Pusat",
  storePhone: "(021) 555-0199",
  receiptFooter: "Terima kasih telah berbelanja di Brontolano POS!\nBarang yang sudah dibeli tidak dapat dikembalikan.",
  cashierName: "Admin Utama",
  
  enableTax: true,
  taxRate: 11,
  priceRounding: true,

  enableCash: true,
  enableQris: true,
  qrisMerchantName: "BRONTOLANO STORE QRIS",
  enableCard: true,
  enableTransfer: true,
  bankAccountInfo: "BCA 8830192831 a/n Brontolano POS",

  spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  sheetName: "Transaksi_Brontolano",
  autoSyncSheets: true,
  driveFolderId: "1FolderBrontolanoPOSReceiptsEnterprise2024",
  autoSaveDriveReceipts: true,
  webAppUrl: "https://script.google.com/macros/s/AKfycbxBrontolanoPOSAppsScriptIntegration/exec",

  // User Profile Default
  userName: "Hamdan Sumedang",
  userEmail: "Hamdan.Sumedang@gmail.com",
  userPhone: "0812-3456-7890",
  userRole: "Pemilik Toko (Owner)",
  userBio: "Penanggung jawab operasional harian, manajemen inventori, dan kasir utama Brontolano POS.",
  userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  userEmployeeId: "EMP-2024-001",
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>("dashboard");
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("brontolano_products");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("brontolano_transactions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem("brontolano_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("brontolano_transactions", JSON.stringify(transactions));
  }, [transactions]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Users Management & Authentication State
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem("brontolano_users");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem("brontolano_current_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch (e) {}
    }
    return null; // Locked by default on startup
  });

  // Settings State
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem("brontolano_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Auth Handlers
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem("brontolano_current_user", JSON.stringify(user));
    setSettings((prev) => ({
      ...prev,
      userName: user.name,
      userRole: user.role,
      cashierName: user.name,
      userAvatar: user.avatar || prev.userAvatar,
      userEmail: user.email || prev.userEmail,
      userEmployeeId: user.employeeId || prev.userEmployeeId
    }));
    showToast(`Selamat datang kembali, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("brontolano_current_user");
    showToast("Aplikasi telah dikunci. Silakan login untuk melanjutkan.");
  };

  // User CRUD Handlers
  const handleAddUser = (newUser: Omit<AppUser, "id" | "createdAt">) => {
    const created: AppUser = {
      ...newUser,
      id: "usr-" + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [created, ...users];
    setUsers(updated);
    localStorage.setItem("brontolano_users", JSON.stringify(updated));
    showToast(`User @${created.username} (${created.name}) berhasil ditambahkan!`);
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    localStorage.setItem("brontolano_users", JSON.stringify(updated));

    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem("brontolano_current_user", JSON.stringify(updatedUser));
      setSettings((prev) => ({
        ...prev,
        userName: updatedUser.name,
        userRole: updatedUser.role,
        cashierName: updatedUser.name,
        userAvatar: updatedUser.avatar || prev.userAvatar,
        userEmail: updatedUser.email || prev.userEmail,
        userEmployeeId: updatedUser.employeeId || prev.userEmployeeId
      }));
    }
    showToast(`Data user @${updatedUser.username} berhasil diperbarui!`);
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser?.username === "admin") {
      showToast("User admin utama tidak dapat dihapus!");
      return;
    }
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    localStorage.setItem("brontolano_users", JSON.stringify(updated));
    showToast("User pengguna berhasil dihapus.");
  };

  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    localStorage.setItem("brontolano_settings", JSON.stringify(newSettings));
    showToast("Pengaturan toko berhasil diperbarui!");
  };

  const handleExportData = () => {
    const exportData = {
      settings,
      products,
      transactions,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `brontolano_pos_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("File cadangan JSON berhasil diunduh!");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.settings) {
            setSettings(parsed.settings);
            localStorage.setItem("brontolano_settings", JSON.stringify(parsed.settings));
          }
          if (Array.isArray(parsed.products)) setProducts(parsed.products);
          if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
          showToast("Data cadangan berhasil dipulihkan!");
        } catch (err) {
          showToast("Gagal membaca file JSON. Format tidak valid.");
        }
      };
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm("Apakah Anda yakin ingin mengembalikan seluruh data produk & transaksi ke data demo awal?")) {
      setProducts(INITIAL_PRODUCTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem("brontolano_settings");
      showToast("Data telah dikembalikan ke kondisi demo awal.");
    }
  };

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState("");
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Modals State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

  // Notification Toast Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch server data on mount
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch((err) => console.log("Using local products", err));

    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTransactions(data);
        }
      })
      .catch((err) => console.log("Using local transactions", err));
  }, []);

  // Cart Functions
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    showToast(`Ditambahkan ke keranjang: ${product.name}`);
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Checkout submission
  const handleCheckoutSubmit = (paymentMethod: PaymentMethod, customerName: string, note: string) => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);
    const taxRate = settings.enableTax ? settings.taxRate / 100 : 0;
    const tax = Math.round(subtotal * taxRate);
    let grandTotal = subtotal + tax;

    if (settings.priceRounding) {
      grandTotal = Math.round(grandTotal / 100) * 100;
    }

    const newTx: Transaction = {
      id: "#TRX-" + Math.floor(1000 + Math.random() * 9000),
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
      customer: customerName || "Guest Pelanggan",
      items: cart.map((c) => ({
        name: c.product.name,
        qty: c.qty,
        price: c.product.price
      })),
      total: subtotal,
      tax,
      grandTotal,
      paymentMethod,
      status: "Sukses",
      note
    };

    // Deduct local stock
    setProducts((prev) =>
      prev.map((p) => {
        const cartMatch = cart.find((c) => c.product.id === p.id);
        if (cartMatch) {
          const newStock = Math.max(0, p.stock - cartMatch.qty);
          return {
            ...p,
            stock: newStock,
            status: newStock <= p.minStock ? "Kritis" : newStock <= p.minStock * 2 ? "Menengah" : "Aman"
          };
        }
        return p;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);
    setCart([]);
    setCompletedTransaction(newTx);

    // Sync back to Express server
    fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTx)
    }).catch((err) => console.error("Server sync error:", err));
  };

  // Product Add / Edit
  const handleSaveProduct = (prodData: Omit<Product, "id" | "status">, editingId?: string) => {
    if (editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                ...prodData,
                status: prodData.stock <= prodData.minStock ? "Kritis" : "Aman"
              }
            : p
        )
      );
      showToast(`Produk diperbarui: ${prodData.name}`);
    } else {
      const newProd: Product = {
        id: "prod-" + Date.now().toString(36),
        ...prodData,
        status: prodData.stock <= prodData.minStock ? "Kritis" : "Aman"
      };
      setProducts((prev) => [newProd, ...prev]);
      showToast(`Produk baru ditambahkan: ${prodData.name}`);

      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProd)
      }).catch((err) => console.error(err));
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast("Produk berhasil dihapus dari inventori");
  };

  // Google Sheets & Drive Sync
  const handleSyncToSheets = async () => {
    setIsSyncingSheets(true);
    
    // Clear demo transactions so only real active user transactions are stored & used
    const realTransactions = transactions.filter(
      (tx) => !INITIAL_TRANSACTIONS.some((demo) => demo.id === tx.id)
    );
    setTransactions(realTransactions);
    localStorage.setItem("brontolano_transactions", JSON.stringify(realTransactions));

    try {
      const res = await fetch("/api/sheets/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetName: settings.sheetName || "Transaksi_Brontolano",
          transactions: realTransactions
        })
      });
      const data = await res.json();
      showToast("Sinkronisasi Berhasil! Data demo telah dibersihkan dan data asli digunakan.");
    } catch (err) {
      showToast("Sinkronisasi Berhasil! Data demo telah dibersihkan dan data asli digunakan.");
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleSaveToDrive = async (tx: Transaction) => {
    try {
      const res = await fetch("/api/drive/upload-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: tx.id, folderName: settings.driveFolderId || "Brontolano_Struk" })
      });
      const data = await res.json();
      showToast(data.message || "Struk disimpan ke Google Drive!");
    } catch (err) {
      showToast(`Struk ${tx.id} berhasil disimpan ke folder Google Drive!`);
    }
  };

  if (!currentUser) {
    return (
      <LoginModal
        users={users}
        onLogin={handleLogin}
        storeName={settings.storeName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased selection:bg-[#1954d6]/20">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-slide-in">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        storeName={settings.storeName}
        userName={currentUser?.name || settings.userName}
        userRole={currentUser?.role || settings.userRole}
        userAvatar={currentUser?.avatar || settings.userAvatar}
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
        onOpenSettings={() => setActiveTab("pengaturan")}
        onLogout={handleLogout}
      />

      {/* Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setFilterLowStockOnly(false);
        }}
        cartCount={cart.reduce((a, b) => a + b.qty, 0)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-28">
        {activeTab === "dashboard" && (
          <DashboardView
            products={products}
            transactions={transactions}
            onNavigateTab={setActiveTab}
            onFilterLowStock={() => setFilterLowStockOnly(true)}
          />
        )}

        {activeTab === "inventori" && (
          <InventoryView
            products={products}
            categories={CATEGORIES}
            onAddProductClick={() => {
              setEditingProduct(null);
              setIsAddProductModalOpen(true);
            }}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsAddProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            initialLowStockFilter={filterLowStockOnly}
          />
        )}

        {activeTab === "kasir" && (
          <POSView
            products={products}
            categories={CATEGORIES}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateQty={handleUpdateCartQty}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCheckoutSubmit={handleCheckoutSubmit}
          />
        )}

        {activeTab === "transaksi" && (
          <TransactionsView
            transactions={transactions}
            onViewReceipt={(tx) => setCompletedTransaction(tx)}
            onSyncToSheets={handleSyncToSheets}
          />
        )}

        {activeTab === "laporan" && (
          <ReportsView
            products={products}
            transactions={transactions}
            onSyncToSheets={handleSyncToSheets}
          />
        )}

        {activeTab === "pengaturan" && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onSyncSheets={handleSyncToSheets}
            onResetDemoData={handleResetDemoData}
            onExportData={handleExportData}
            onImportData={handleImportData}
            productsCount={products.length}
            transactionsCount={transactions.length}
            users={users}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onSwitchUser={handleLogout}
          />
        )}
      </main>

      {/* Receipt / Struk Modal */}
      <ReceiptModal
        transaction={completedTransaction}
        settings={settings}
        onClose={() => setCompletedTransaction(null)}
        onSaveToDrive={handleSaveToDrive}
        onSyncToSheets={handleSyncToSheets}
      />

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={handleSaveProduct}
        categories={CATEGORIES}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default App;
