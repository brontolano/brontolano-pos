import { Product, Transaction } from "../types";

export const INITIAL_PRODUCTS: Product[] = [
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
    status: "Menengah"
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
  },
  {
    id: "prod-11",
    name: "Bamboo Glass Bottle 500ml",
    sku: "HG-BOT-052",
    category: "Aksesoris",
    price: 120000,
    costPrice: 75000,
    stock: 3,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    status: "Kritis"
  },
  {
    id: "prod-12",
    name: "Executive Journal Navy",
    sku: "ST-JRN-01",
    category: "Aksesoris",
    price: 195000,
    costPrice: 110000,
    stock: 22,
    minStock: 8,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "#TRX-9821",
    time: "14:20",
    date: "2024-05-24",
    customer: "Andi Saputra",
    items: [
      { name: "Kopi Susu Gula Aren", qty: 2, price: 25000 },
      { name: "Croissant Butter", qty: 1, price: 35000 },
      { name: "Pro Wireless Mouse", qty: 1, price: 210000 }
    ],
    total: 295000,
    tax: 32450,
    grandTotal: 327450,
    paymentMethod: "QRIS",
    status: "Sukses"
  },
  {
    id: "#TRX-9820",
    time: "14:15",
    date: "2024-05-24",
    customer: "Guest Pelanggan",
    items: [
      { name: "Soto Ayam Madura", qty: 1, price: 30000 },
      { name: "Es Jeruk Peras", qty: 1, price: 15000 }
    ],
    total: 45000,
    tax: 4950,
    grandTotal: 49950,
    paymentMethod: "Tunai",
    status: "Sukses"
  },
  {
    id: "#TRX-9819",
    time: "14:02",
    date: "2024-05-24",
    customer: "Rina Marlina",
    items: [{ name: "Ayam Bakar Taliwang", qty: 2, price: 44000 }],
    total: 88000,
    tax: 9680,
    grandTotal: 97680,
    paymentMethod: "Kartu",
    status: "Tertunda"
  },
  {
    id: "#TRX-9818",
    time: "13:45",
    date: "2024-05-24",
    customer: "Budi Hartono",
    items: [
      { name: "Nasi Goreng Spesial", qty: 1, price: 30000 },
      { name: "Teh Manis Dingin", qty: 1, price: 5000 }
    ],
    total: 35000,
    tax: 3850,
    grandTotal: 38850,
    paymentMethod: "QRIS",
    status: "Sukses"
  },
  {
    id: "#TRX-9817",
    time: "13:30",
    date: "2024-05-24",
    customer: "Siti Aminah",
    items: [{ name: "Paket Family A", qty: 1, price: 245000 }],
    total: 245000,
    tax: 26950,
    grandTotal: 271950,
    paymentMethod: "Tunai",
    status: "Batal"
  }
];

export const CATEGORIES = [
  "Semua Kategori",
  "Bahan Baku",
  "Minuman",
  "Makanan",
  "Elektronik",
  "Pakaian",
  "Aksesoris"
];

export const INITIAL_USERS = [
  {
    id: "usr-admin-001",
    username: "admin",
    password: "bismillahberkah",
    name: "Hamdan Sumedang (Super Admin)",
    role: "Super Admin",
    email: "Hamdan.Sumedang@gmail.com",
    phone: "0812-3456-7890",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    employeeId: "ADM-001",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "usr-kasir-001",
    username: "kasir1",
    password: "kasir123",
    name: "Siti Rahmawati",
    role: "Kasir",
    email: "siti.kasir@brontolanopos.com",
    phone: "0819-8765-4321",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    employeeId: "KSR-002",
    isActive: true,
    createdAt: "2024-02-15T00:00:00.000Z",
  },
  {
    id: "usr-manager-001",
    username: "manager1",
    password: "manager123",
    name: "Budi Santoso",
    role: "Manager Store",
    email: "budi.manager@brontolanopos.com",
    phone: "0813-1122-3344",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    employeeId: "MGR-001",
    isActive: true,
    createdAt: "2024-02-01T00:00:00.000Z",
  }
];
