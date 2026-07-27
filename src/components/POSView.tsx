import React, { useState } from "react";
import { Product, CartItem, PaymentMethod } from "../types";
import { Search, QrCode, Plus, Minus, ShoppingBag, Trash2, ArrowRight, X, CreditCard, Banknote, Smartphone, Check, User, FileText, ShoppingCart } from "lucide-react";
import { handleImageError } from "../utils/imageUtils";

interface POSViewProps {
  products: Product[];
  categories: string[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onCheckoutSubmit: (paymentMethod: PaymentMethod, customerName: string, note: string) => void;
}

export const POSView: React.FC<POSViewProps> = ({
  products,
  categories,
  cart,
  onAddToCart,
  onUpdateQty,
  onRemoveFromCart,
  onClearCart,
  onCheckoutSubmit
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);

  // Checkout Form State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [customerName, setCustomerName] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [cashAmount, setCashAmount] = useState<number>(0);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "Semua Kategori" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const cartTotalItemCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);
  const tax = Math.round(subtotal * 0.11); // 11% PPN
  const grandTotal = subtotal + tax;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckoutSubmit(paymentMethod, customerName || "Guest Pelanggan", orderNote);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="pb-24 lg:pb-8 relative">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Search, Categories & Product Grid */}
        <div className="flex-1 w-full space-y-6 min-w-0">
          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari produk atau scan barcode SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30 focus:border-[#1954d6]"
                />
              </div>

              {/* Barcode Scanner Button Simulator */}
              <button
                onClick={() => setIsBarcodeOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                title="Scan Barcode"
              >
                <QrCode className="w-4 h-4 text-[#1954d6]" />
                <span className="hidden sm:inline">Scan SKU</span>
              </button>
            </div>

            {/* Category Pills horizontal scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isSel = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSel
                        ? "bg-[#1954d6] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((i) => i.product.id === product.id);
              const inCartQty = cartItem ? cartItem.qty : 0;
              const isLowStock = product.stock <= product.minStock;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                    inCartQty > 0
                      ? "border-[#1954d6] ring-2 ring-[#1954d6]/20 shadow-sm"
                      : "border-slate-200 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="relative h-36 bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-xs ${
                          isLowStock ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                        }`}
                      >
                        {isLowStock ? "STOK KRITIS" : "STOK AMAN"}
                      </span>
                      {inCartQty > 0 && (
                        <span className="absolute top-2 right-2 w-6 h-6 bg-[#1954d6] text-white font-black text-xs rounded-full flex items-center justify-center shadow-md">
                          {inCartQty}
                        </span>
                      )}
                    </div>

                    <div className="p-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {product.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mt-0.5">
                        {product.name}
                      </h4>
                      <p className="text-sm font-bold text-[#1954d6] mt-1">
                        {formatRupiah(product.price)}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Stok: {product.stock}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 pt-0">
                    {inCartQty > 0 ? (
                      <div className="flex items-center justify-between bg-blue-50 rounded-xl p-1 border border-blue-200">
                        <button
                          onClick={() => onUpdateQty(product.id, -1)}
                          className="w-8 h-8 bg-white hover:bg-slate-100 text-[#1954d6] font-bold rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm text-[#1954d6]">{inCartQty}</span>
                        <button
                          onClick={() => onUpdateQty(product.id, 1)}
                          className="w-8 h-8 bg-[#1954d6] hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddToCart(product)}
                        className="w-full py-2 bg-slate-100 hover:bg-[#1954d6] hover:text-white text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Persistent Desktop Cart Sidebar */}
        <div className="hidden lg:block w-[380px] xl:w-[420px] shrink-0 sticky top-20">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-[#1954d6] rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Keranjang Kasir</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {cartTotalItemCount} item terpilih
                  </p>
                </div>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer font-bold"
                  title="Kosongkan Keranjang"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Keranjang Masih Kosong</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pilih produk di sebelah kiri untuk ditambahkan ke transaksi kasir.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        onError={handleImageError}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {formatRupiah(item.product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                        <button
                          onClick={() => onUpdateQty(item.product.id, -1)}
                          className="w-6 h-6 hover:bg-slate-100 text-[#1954d6] font-bold rounded flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800">{item.qty}</span>
                        <button
                          onClick={() => onUpdateQty(item.product.id, 1)}
                          className="w-6 h-6 bg-[#1954d6] hover:bg-blue-700 text-white font-bold rounded flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveFromCart(item.product.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Optional Customer & Notes Inputs */}
            {cart.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nama Pelanggan (opsional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1954d6]"
                  />
                </div>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Catatan pesanan..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1954d6]"
                  />
                </div>
              </div>
            )}

            {/* Price Calculations */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pajak PPN (11%)</span>
                <span className="font-semibold text-slate-800">{formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between items-center font-extrabold text-slate-900 text-sm pt-2 border-t border-slate-200">
                <span>Total Bayar</span>
                <span className="text-[#1954d6] text-base">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className={`w-full py-3 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                cart.length > 0
                  ? "bg-[#1954d6] hover:bg-blue-700 shadow-blue-200"
                  : "bg-slate-300 cursor-not-allowed shadow-none"
              }`}
            >
              <span>Bayar Sekarang ({formatRupiah(grandTotal)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Cart Bar (Visible ONLY on Mobile/Tablet < lg:) */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-4 right-4 max-w-xl mx-auto z-30 bg-[#1954d6] text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-blue-400/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center relative">
              <ShoppingBag className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-[#1954d6]">
                {cartTotalItemCount}
              </span>
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">Total Pesanan ({cartTotalItemCount} Item)</p>
              <p className="text-lg font-black tracking-tight">{formatRupiah(grandTotal)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearCart}
              className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Kosongkan Keranjang"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1954d6] font-extrabold text-sm rounded-xl hover:bg-blue-50 transition-all cursor-pointer shadow-md"
            >
              <span>Bayar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal Simulator */}
      {isBarcodeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Scan Barcode / SKU</h3>
              <button onClick={() => setIsBarcodeOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full h-48 bg-slate-900 rounded-xl relative overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-[#1954d6]">
              <div className="absolute inset-x-0 h-0.5 bg-red-500 animate-pulse top-1/2" />
              <QrCode className="w-16 h-16 text-slate-600 animate-bounce" />
              <p className="text-xs text-slate-400 mt-2">Arahkan kamera ke barcode produk</p>
            </div>
            <p className="text-xs text-slate-500">Klik produk sampel untuk mensimulasikan scan instan:</p>
            <div className="grid grid-cols-2 gap-2 text-left">
              {products.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onAddToCart(p);
                    setIsBarcodeOpen(false);
                  }}
                  className="p-2 bg-slate-50 hover:bg-blue-50 rounded-xl text-xs font-bold text-slate-800 border border-slate-200 cursor-pointer"
                >
                  + {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Detail Pembayaran</h3>
                  <p className="text-xs text-slate-500 font-mono">Invoice: INV/{new Date().getFullYear()}/001</p>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Name */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Nama Pelanggan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Andi Saputra"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30"
                />
              </div>

              {/* Order Items List */}
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Ringkasan Pesanan ({cartTotalItemCount} Item)</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          onError={handleImageError}
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.product.name}</p>
                          <p className="text-[11px] text-slate-500">{formatRupiah(item.product.price)} x {item.qty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1954d6]">
                          {formatRupiah(item.product.price * item.qty)}
                        </span>
                        <button
                          onClick={() => onRemoveFromCart(item.product.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pajak Resto/PPN (11%)</span>
                  <span>{formatRupiah(tax)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Total Bayar</span>
                  <span className="text-[#1954d6]">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "QRIS", label: "QRIS Instan", icon: QrCode },
                    { id: "Tunai", label: "Uang Tunai", icon: Banknote },
                    { id: "Kartu", label: "Kartu Debit/Kredit", icon: CreditCard },
                    { id: "Transfer", label: "Transfer Bank", icon: Smartphone }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                          isSelected
                            ? "border-[#1954d6] bg-blue-50 text-[#1954d6] font-bold shadow-xs ring-1 ring-[#1954d6]"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#1954d6]" />
                        <span className="text-xs font-semibold">{m.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-[#1954d6]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QRIS Code Preview if QRIS selected */}
              {paymentMethod === "QRIS" && (
                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 text-center space-y-2 mb-4">
                  <p className="text-xs font-bold text-[#1954d6]">Scan QRIS Pembayaran Sangat Cepat</p>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ProPOS-QRIS-TEST-INVOICE"
                    alt="QRIS Code"
                    className="w-32 h-32 mx-auto rounded-xl border border-blue-200 shadow-xs bg-white p-2"
                  />
                  <p className="text-[11px] text-slate-500">Mendukung GoPay, OVO, ShopeePay, Dana, & Semua Bank</p>
                </div>
              )}

              {/* Cash nominal suggestion if Tunai selected */}
              {paymentMethod === "Tunai" && (
                <div className="mb-4 space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase">
                    Uang Diterima
                  </label>
                  <div className="flex gap-2">
                    {Array.from(new Set([grandTotal, 50000, 100000, 200000, 500000])).map((nom, idx) => (
                      <button
                        key={`${nom}-${idx}`}
                        type="button"
                        onClick={() => setCashAmount(nom)}
                        className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-blue-50 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer"
                      >
                        {formatRupiah(nom)}
                      </button>
                    ))}
                  </div>
                  {cashAmount >= grandTotal && (
                    <p className="text-xs font-bold text-emerald-600">
                      Kembalian: {formatRupiah(cashAmount - grandTotal)}
                    </p>
                  )}
                </div>
              )}

              {/* Note */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tanpa es, minta kantong plastik..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30"
                />
              </div>
            </div>

            {/* Bottom Process Payment Action Button */}
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleProcessPayment}
                className="w-full py-3.5 bg-[#1954d6] hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proses Pembayaran ({formatRupiah(grandTotal)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

