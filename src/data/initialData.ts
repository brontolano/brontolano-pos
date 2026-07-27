import { Product, Transaction, AppUser, Customer, Supplier, ProductTemplate, ExportHeaderTemplate } from "../types";

export const CATEGORIES = [
  "Semua Kategori",
  "Kopi & Espresso",
  "Minuman Dingin",
  "Teh & Herbal",
  "Makanan Utama",
  "Camilan & Snack",
  "Bakery & Pastry",
  "Bahan Baku",
  "Paket Combo",
  "Aksesoris Kopi",
  "Peralatan Kasir",
  "Merchandise",
  "Produk Herbal",
  "Bumbu & Saus",
  "Perlengkapan Meja",
  "Packaging & Dus",
  "Frozen Food",
  "Dessert & Es Krim",
  "Gift Set & Hampers"
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Arabica Gayo Special 1kg",
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
    name: "Espresso House Blend",
    sku: "BEV-ESP-001",
    category: "Kopi & Espresso",
    price: 28000,
    costPrice: 10000,
    stock: 95,
    minStock: 15,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-3",
    name: "Iced Caramel Macchiato",
    sku: "BEV-ICE-002",
    category: "Minuman Dingin",
    price: 35000,
    costPrice: 14000,
    stock: 60,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-4",
    name: "Matcha Jasmine Green Tea",
    sku: "TEA-MTC-003",
    category: "Teh & Herbal",
    price: 32000,
    costPrice: 12000,
    stock: 40,
    minStock: 8,
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-5",
    name: "Nasi Goreng Wagyu Brontolano",
    sku: "FOD-NAS-01",
    category: "Makanan Utama",
    price: 65000,
    costPrice: 32000,
    stock: 25,
    minStock: 5,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-6",
    name: "French Fries Truffle Mayo",
    sku: "SNK-FRY-02",
    category: "Camilan & Snack",
    price: 38000,
    costPrice: 18000,
    stock: 50,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-7",
    name: "Butter Croissant Almond",
    sku: "BAK-CRO-01",
    category: "Bakery & Pastry",
    price: 32000,
    costPrice: 15000,
    stock: 8,
    minStock: 12,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    status: "Kritis"
  },
  {
    id: "prod-8",
    name: "Paket Hemat Sarapan Pagi",
    sku: "CMB-SRP-01",
    category: "Paket Combo",
    price: 55000,
    costPrice: 28000,
    stock: 30,
    minStock: 5,
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-9",
    name: "V60 Coffee Dripper Ceramic",
    sku: "ACC-DRP-01",
    category: "Aksesoris Kopi",
    price: 185000,
    costPrice: 110000,
    stock: 14,
    minStock: 5,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    status: "Menengah"
  },
  {
    id: "prod-10",
    name: "Kertas Struk Thermal 80mm (Box)",
    sku: "EQU-THR-80",
    category: "Peralatan Kasir",
    price: 125000,
    costPrice: 85000,
    stock: 4,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80",
    status: "Kritis"
  },
  {
    id: "prod-11",
    name: "Tote Bag Brontolano Canvas",
    sku: "MER-TOT-01",
    category: "Merchandise",
    price: 75000,
    costPrice: 35000,
    stock: 40,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-12",
    name: "Wedang Jahe Merah Rempah",
    sku: "HRB-JHE-01",
    category: "Produk Herbal",
    price: 25000,
    costPrice: 9000,
    stock: 35,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-13",
    name: "Saus Sambal Premium 1L",
    sku: "BMB-SBL-01",
    category: "Bumbu & Saus",
    price: 42000,
    costPrice: 28000,
    stock: 22,
    minStock: 5,
    image: "https://images.unsplash.com/photo-1582169296194-e4d644c48063?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-14",
    name: "Tempat Tissue Kayu Jati",
    sku: "TAB-TIS-01",
    category: "Perlengkapan Meja",
    price: 68000,
    costPrice: 38000,
    stock: 15,
    minStock: 5,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    status: "Menengah"
  },
  {
    id: "prod-15",
    name: "Dus Food Grade 20x20 (Pack 50)",
    sku: "PKG-DUS-20",
    category: "Packaging & Dus",
    price: 95000,
    costPrice: 65000,
    stock: 3,
    minStock: 8,
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    status: "Kritis"
  },
  {
    id: "prod-16",
    name: "Chicken Patty Frozen 1kg",
    sku: "FRZ-CHK-01",
    category: "Frozen Food",
    price: 88000,
    costPrice: 62000,
    stock: 18,
    minStock: 6,
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
    status: "Menengah"
  },
  {
    id: "prod-17",
    name: "Gelato Vanilla Bean 500ml",
    sku: "DST-GEL-01",
    category: "Dessert & Es Krim",
    price: 65000,
    costPrice: 32000,
    stock: 12,
    minStock: 5,
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-18",
    name: "Hampers Kopi & Pastry Premium",
    sku: "GFT-HMP-01",
    category: "Gift Set & Hampers",
    price: 350000,
    costPrice: 210000,
    stock: 10,
    minStock: 3,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-19",
    name: "Cold Brew Signature Bottle 250ml",
    sku: "BEV-CLD-005",
    category: "Minuman Dingin",
    price: 38000,
    costPrice: 16000,
    stock: 42,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-20",
    name: "Spaghetti Bolognese Beef",
    sku: "FOD-PAS-02",
    category: "Makanan Utama",
    price: 58000,
    costPrice: 28000,
    stock: 20,
    minStock: 5,
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-21",
    name: "Robusta Toraja Dark Roast 1kg",
    sku: "RAW-COF-002",
    category: "Bahan Baku",
    price: 165000,
    costPrice: 105000,
    stock: 35,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-22",
    name: "Chocolate Lava Cake Hot",
    sku: "DST-CAK-02",
    category: "Dessert & Es Krim",
    price: 45000,
    costPrice: 20000,
    stock: 15,
    minStock: 5,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  },
  {
    id: "prod-23",
    name: "Manual Grinder Stainless Steel",
    sku: "ACC-GRN-02",
    category: "Aksesoris Kopi",
    price: 245000,
    costPrice: 150000,
    stock: 9,
    minStock: 4,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    status: "Menengah"
  },
  {
    id: "prod-24",
    name: "French Vanilla Latte",
    sku: "BEV-ESP-008",
    category: "Kopi & Espresso",
    price: 36000,
    costPrice: 13000,
    stock: 55,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80",
    status: "Aman"
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "#TRX-9835",
    time: "15:45",
    date: "2026-07-27",
    customer: "Rizky Ramadhan",
    items: [
      { name: "Espresso House Blend", qty: 2, price: 28000 },
      { name: "Butter Croissant Almond", qty: 2, price: 32000 },
      { name: "Gelato Vanilla Bean 500ml", qty: 1, price: 65000 }
    ],
    total: 185000,
    tax: 20350,
    grandTotal: 205350,
    paymentMethod: "QRIS",
    status: "Sukses"
  },
  {
    id: "#TRX-9834",
    time: "15:20",
    date: "2026-07-27",
    customer: "Siti Nurhaliza",
    items: [
      { name: "Iced Caramel Macchiato", qty: 1, price: 35000 },
      { name: "French Fries Truffle Mayo", qty: 1, price: 38000 }
    ],
    total: 73000,
    tax: 8030,
    grandTotal: 81030,
    paymentMethod: "Tunai",
    status: "Sukses"
  },
  {
    id: "#TRX-9833",
    time: "14:50",
    date: "2026-07-27",
    customer: "Ahmad Dahlan",
    items: [
      { name: "Nasi Goreng Wagyu Brontolano", qty: 2, price: 65000 },
      { name: "Matcha Jasmine Green Tea", qty: 2, price: 32000 }
    ],
    total: 194000,
    tax: 21340,
    grandTotal: 215340,
    paymentMethod: "Transfer",
    status: "Sukses"
  },
  {
    id: "#TRX-9832",
    time: "14:10",
    date: "2026-07-27",
    customer: "Dewi Lestari",
    items: [
      { name: "Paket Hemat Sarapan Pagi", qty: 1, price: 55000 },
      { name: "Wedang Jahe Merah Rempah", qty: 1, price: 25000 }
    ],
    total: 80000,
    tax: 8800,
    grandTotal: 88800,
    paymentMethod: "Kartu",
    status: "Sukses"
  },
  {
    id: "#TRX-9831",
    time: "13:30",
    date: "2026-07-27",
    customer: "Hendra Wijaya",
    items: [
      { name: "Hampers Kopi & Pastry Premium", qty: 1, price: 350000 }
    ],
    total: 350000,
    tax: 38500,
    grandTotal: 388500,
    paymentMethod: "QRIS",
    status: "Sukses"
  },
  {
    id: "#TRX-9830",
    time: "12:15",
    date: "2026-07-26",
    customer: "Budi Santoso",
    items: [
      { name: "Arabica Gayo Special 1kg", qty: 1, price: 185000 },
      { name: "V60 Coffee Dripper Ceramic", qty: 1, price: 185000 }
    ],
    total: 370000,
    tax: 40700,
    grandTotal: 410700,
    paymentMethod: "Transfer",
    status: "Sukses"
  },
  {
    id: "#TRX-9829",
    time: "11:05",
    date: "2026-07-26",
    customer: "Maya Putri",
    items: [
      { name: "Tote Bag Brontolano Canvas", qty: 2, price: 75000 },
      { name: "Iced Caramel Macchiato", qty: 1, price: 35000 }
    ],
    total: 185000,
    tax: 20350,
    grandTotal: 205350,
    paymentMethod: "QRIS",
    status: "Sukses"
  },
  {
    id: "#TRX-9828",
    time: "10:30",
    date: "2026-07-26",
    customer: "Pelanggan Umum",
    items: [
      { name: "Espresso House Blend", qty: 1, price: 28000 }
    ],
    total: 28000,
    tax: 3080,
    grandTotal: 31080,
    paymentMethod: "Tunai",
    status: "Sukses"
  },
  {
    id: "#TRX-9827",
    time: "16:20",
    date: "2026-07-25",
    customer: "Farhan Ardiansyah",
    items: [
      { name: "French Vanilla Latte", qty: 2, price: 36000 },
      { name: "Chocolate Lava Cake Hot", qty: 1, price: 45000 }
    ],
    total: 117000,
    tax: 12870,
    grandTotal: 129870,
    paymentMethod: "QRIS",
    status: "Sukses"
  },
  {
    id: "#TRX-9826",
    time: "13:45",
    date: "2026-07-25",
    customer: "Indah Permata",
    items: [
      { name: "Spaghetti Bolognese Beef", qty: 1, price: 58000 },
      { name: "Cold Brew Signature Bottle 250ml", qty: 1, price: 38000 }
    ],
    total: 96000,
    tax: 10560,
    grandTotal: 106560,
    paymentMethod: "Kartu",
    status: "Sukses"
  },
  {
    id: "#TRX-9825",
    time: "10:15",
    date: "2026-07-24",
    customer: "Bagus Setiawan",
    items: [
      { name: "Robusta Toraja Dark Roast 1kg", qty: 2, price: 165000 }
    ],
    total: 330000,
    tax: 36300,
    grandTotal: 366300,
    paymentMethod: "Transfer",
    status: "Sukses"
  },
  {
    id: "#TRX-9824",
    time: "18:00",
    date: "2026-07-23",
    customer: "Nia Kurnia",
    items: [
      { name: "Nasi Goreng Wagyu Brontolano", qty: 1, price: 65000 },
      { name: "Iced Caramel Macchiato", qty: 1, price: 35000 }
    ],
    total: 100000,
    tax: 11000,
    grandTotal: 111000,
    paymentMethod: "Tunai",
    status: "Sukses"
  }
];

export const INITIAL_USERS: AppUser[] = [
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
    createdAt: "2024-01-01T00:00:00.000Z"
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
    createdAt: "2024-02-15T00:00:00.000Z"
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
    createdAt: "2024-02-01T00:00:00.000Z"
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-001",
    name: "Rizky Ramadhan",
    phone: "0812-9988-7766",
    email: "rizky.ramadhan@gmail.com",
    address: "Jl. Kebon Jeruk No. 12, Jakarta Barat",
    memberTier: "Gold",
    points: 450,
    totalSpent: 1850000,
    lastVisit: "2026-07-27"
  },
  {
    id: "cust-002",
    name: "Siti Nurhaliza",
    phone: "0813-4455-6677",
    email: "siti.nurhaliza@yahoo.com",
    address: "Jl. Tebet Raya No. 45, Jakarta Selatan",
    memberTier: "Silver",
    points: 210,
    totalSpent: 850000,
    lastVisit: "2026-07-27"
  },
  {
    id: "cust-003",
    name: "Ahmad Dahlan",
    phone: "0811-2233-4455",
    email: "ahmad.dahlan@outlook.com",
    address: "Jl. Merdeka Barat No. 8, Jakarta Pusat",
    memberTier: "Platinum",
    points: 1200,
    totalSpent: 4500000,
    lastVisit: "2026-07-27"
  },
  {
    id: "cust-004",
    name: "Dewi Lestari",
    phone: "0818-7766-5544",
    email: "dewi.lestari@gmail.com",
    address: "Jl. Cikini Raya No. 102, Jakarta Pusat",
    memberTier: "Bronze",
    points: 85,
    totalSpent: 350000,
    lastVisit: "2026-07-27"
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-001",
    companyName: "PT Gayo Coffee Indonesia",
    contactPerson: "Pak Hendra",
    phone: "0812-1111-2222",
    email: "supplier@gayocoffee.co.id",
    categorySupplied: "Bahan Baku Kopi",
    address: "Kawasan Industri Pulo Gadung, Jakarta"
  },
  {
    id: "sup-002",
    companyName: "CV Packaging Mandiri",
    contactPerson: "Ibu Ratna",
    phone: "0813-3333-4444",
    email: "sales@packagingmandiri.com",
    categorySupplied: "Packaging & Struk Thermal",
    address: "Jl. Daan Mogot Km 14, Tangerang"
  },
  {
    id: "sup-003",
    companyName: "PT Pastry Bake Center",
    contactPerson: "Chef Anton",
    phone: "0811-5555-6666",
    email: "order@pastrybake.co.id",
    categorySupplied: "Bakery & Frozen Food",
    address: "Jl. Senopati No. 88, Jakarta Selatan"
  }
];

export const EMPTY_PRODUCT_TEMPLATE: ProductTemplate = {
  name: "",
  sku: "",
  category: "Kopi & Espresso",
  price: 0,
  costPrice: 0,
  stock: 0,
  minStock: 5,
  image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
  status: "Aman"
};

export const DATA_EXPORT_TEMPLATES: {
  products: ExportHeaderTemplate[];
  transactions: ExportHeaderTemplate[];
} = {
  products: [
    { key: "id", label: "ID Produk" },
    { key: "sku", label: "SKU" },
    { key: "name", label: "Nama Produk" },
    { key: "category", label: "Kategori" },
    { key: "price", label: "Harga Jual (Rp)" },
    { key: "costPrice", label: "Harga Modal (Rp)" },
    { key: "stock", label: "Stok Toko" },
    { key: "minStock", label: "Stok Minimum" },
    { key: "status", label: "Status Stok" }
  ],
  transactions: [
    { key: "id", label: "ID Transaksi" },
    { key: "date", label: "Tanggal" },
    { key: "time", label: "Waktu" },
    { key: "customer", label: "Pelanggan" },
    { key: "paymentMethod", label: "Metode Pembayaran" },
    { key: "total", label: "Subtotal (Rp)" },
    { key: "tax", label: "Pajak (Rp)" },
    { key: "grandTotal", label: "Grand Total (Rp)" },
    { key: "status", label: "Status Transaksi" }
  ]
};

export const PAYMENT_METHOD_OPTIONS = [
  { id: "QRIS", name: "QRIS Instant", feeRate: 0, active: true },
  { id: "Tunai", name: "Uang Tunai (Cash)", feeRate: 0, active: true },
  { id: "Kartu", name: "Debit / Kredit Card", feeRate: 0.015, active: true },
  { id: "Transfer", name: "Bank Transfer / VA", feeRate: 0, active: true }
];

export const RECEIPT_TEMPLATE_DATA = {
  header: "BRONTOLANO POS STORE",
  subHeader: "Enterprise POS & Retail Management",
  footerMessage: "Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar/dikembalikan.",
  website: "www.brontolanopos.com"
};
