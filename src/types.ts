export type StockStatus = "Aman" | "Menengah" | "Kritis";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  image: string;
  status: StockStatus;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface TransactionItem {
  name: string;
  qty: number;
  price: number;
}

export type PaymentMethod = "QRIS" | "Tunai" | "Kartu" | "Transfer";
export type TransactionStatus = "Sukses" | "Selesai" | "Tertunda" | "Batal" | "Pending";

export interface Transaction {
  id: string;
  time: string;
  date: string;
  customer?: string;
  items: TransactionItem[];
  total: number;
  tax: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  note?: string;
}

export type NavigationTab = "dashboard" | "inventori" | "kasir" | "transaksi" | "laporan" | "pengaturan";

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetName: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface GoogleDriveConfig {
  folderId: string;
  folderName: string;
  autoSaveReceipts: boolean;
  lastSavedAt?: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeAddress: string;
  storePhone: string;
  receiptFooter: string;
  cashierName: string;
  
  // Tax
  enableTax: boolean;
  taxRate: number;
  priceRounding: boolean;

  // Payments
  enableCash: boolean;
  enableQris: boolean;
  qrisMerchantName: string;
  enableCard: boolean;
  enableTransfer: boolean;
  bankAccountInfo: string;

  // Google Workspace
  spreadsheetId: string;
  sheetName: string;
  autoSyncSheets: boolean;
  driveFolderId: string;
  autoSaveDriveReceipts: boolean;
  webAppUrl?: string;

  // User Profile Detail
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userRole?: string;
  userBio?: string;
  userAvatar?: string;
  userEmployeeId?: string;
}

export type UserRole = "Super Admin" | "Kasir" | "Manager Store";

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole | string;
  email?: string;
  phone?: string;
  avatar?: string;
  employeeId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  memberTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  points: number;
  totalSpent: number;
  lastVisit: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  categorySupplied: string;
  address: string;
}

export interface ProductTemplate {
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  image: string;
  status: StockStatus;
}

export interface ExportHeaderTemplate {
  key: string;
  label: string;
}

