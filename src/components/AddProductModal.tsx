import React, { useState, useEffect, useRef } from "react";
import { Product } from "../types";
import { X, Image as ImageIcon, Plus, Check, Upload, Link as LinkIcon, Trash2, FileImage, Sparkles } from "lucide-react";
import { handleImageError } from "../utils/imageUtils";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, "id" | "status">, id?: string) => void;
  categories: string[];
  editingProduct?: Product | null;
}

const PRESET_IMAGES = [
  { name: "Kopi Arabika", url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80" },
  { name: "Air Mineral", url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80" },
  { name: "Keripik Kentang", url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80" },
  { name: "Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" },
  { name: "Keyboard RGB", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80" },
  { name: "Smartwatch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
  { name: "Jus Buah Segar", url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80" },
  { name: "Roti Croissant", url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80" }
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingProduct
}) => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Makanan");
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(5);
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  
  // Image Upload Mode state
  const [imageTab, setImageTab] = useState<"upload" | "url" | "preset">("upload");
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [imageSourceLabel, setImageSourceLabel] = useState<string>("Sampel");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setSku(editingProduct.sku);
      setCategory(editingProduct.category);
      setPrice(editingProduct.price);
      setCostPrice(editingProduct.costPrice || 0);
      setStock(editingProduct.stock);
      setMinStock(editingProduct.minStock);
      setImage(editingProduct.image);
      setCustomUrlInput(editingProduct.image.startsWith("data:") ? "" : editingProduct.image);
      setImageSourceLabel(
        editingProduct.image.startsWith("data:")
          ? "Berkas Terunggah"
          : PRESET_IMAGES.some((p) => p.url === editingProduct.image)
          ? "Sampel Presets"
          : "Tautan URL"
      );
    } else {
      setName("");
      setSku(`PRD-${Math.floor(100 + Math.random() * 900)}`);
      setCategory("Makanan");
      setPrice(25000);
      setCostPrice(15000);
      setStock(20);
      setMinStock(5);
      setImage(PRESET_IMAGES[0].url);
      setCustomUrlInput("");
      setImageSourceLabel("Sampel Presets");
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  // File Upload Process
  const processFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Format berkas tidak didukung. Harap unggah berkas gambar (PNG, JPG, WEBP, SVG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar! Maksimal 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
        setImageSourceLabel("Berkas Lokal Terunggah");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) return;
    setImage(customUrlInput.trim());
    setImageSourceLabel("Tautan URL Eksternal");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) return;

    onSave(
      {
        name,
        sku,
        category,
        price,
        costPrice,
        stock,
        minStock,
        image
      },
      editingProduct?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative border border-slate-100 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {editingProduct ? "Edit Barang Produk" : "Tambah Barang Baru"}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Produk</label>
            <input
              type="text"
              required
              placeholder="Contoh: Kopi Arabika 250g"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30"
            />
          </div>

          {/* SKU & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kode SKU</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 text-xs font-mono text-slate-800 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl border border-slate-200 focus:outline-none"
              >
                {categories.filter((c) => c !== "Semua Kategori").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                required
                min="100"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 text-sm font-bold text-[#1954d6] rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Harga Beli/HPP (Rp)</label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 text-sm font-bold text-slate-700 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Stock Counts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stok Awal (Unit)</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 text-sm font-bold text-slate-800 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Batas Stok Kritis</label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 text-sm font-bold text-red-600 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Image Selection & Upload Area */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase">Gambar Produk</label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#1954d6] font-bold border border-blue-200">
                {imageSourceLabel}
              </span>
            </div>

            {/* Current Active Image Preview Card */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative">
                <img
                  src={image}
                  alt="Preview Produk"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback on broken URL
                    (e.target as HTMLImageElement).src = PRESET_IMAGES[0].url;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs font-bold text-slate-800 truncate">Pratinjau Gambar Aktif</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {image.startsWith("data:") ? "Berkas Gambar Lokal (Base64)" : image}
                </p>
              </div>
            </div>

            {/* Sub-tabs for Image Source */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  imageTab === "upload"
                    ? "bg-white text-[#1954d6] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Berkas</span>
              </button>

              <button
                type="button"
                onClick={() => setImageTab("url")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  imageTab === "url"
                    ? "bg-white text-[#1954d6] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Tautan URL</span>
              </button>

              <button
                type="button"
                onClick={() => setImageTab("preset")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  imageTab === "preset"
                    ? "bg-white text-[#1954d6] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Sampel Preset</span>
              </button>
            </div>

            {/* TAB CONTENT 1: UPLOAD FILE (DRAG & DROP) */}
            {imageTab === "upload" && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-5 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-[#1954d6] bg-blue-50/80 scale-[1.01]"
                    : "border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-400"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="p-3 bg-blue-100/80 text-[#1954d6] rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Klik untuk memilih berkas atau <span className="text-[#1954d6]">Drag & Drop</span> gambar ke sini
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mendukung format PNG, JPG, WEBP, atau SVG (Maks. 5 MB)
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: URL LINK */}
            {imageTab === "url" && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 text-xs font-mono text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1954d6]/30"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 bg-[#1954d6] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Gunakan URL
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tempelkan URL langsung dari web / CDN Hosting tempat gambar disimpan
                </p>
              </div>
            )}

            {/* TAB CONTENT 3: PRESET SAMPLES */}
            {imageTab === "preset" && (
              <div className="grid grid-cols-4 gap-2">
                {PRESET_IMAGES.map((img) => (
                  <button
                    type="button"
                    key={img.url}
                    onClick={() => {
                      setImage(img.url);
                      setImageSourceLabel("Sampel Presets");
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 h-14 transition-all cursor-pointer ${
                      image === img.url ? "border-[#1954d6] ring-2 ring-blue-200" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img src={img.url} alt={img.name} onError={handleImageError} className="w-full h-full object-cover" />
                    {image === img.url && (
                      <div className="absolute inset-0 bg-[#1954d6]/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200">
            <button
              type="submit"
              className="w-full py-3 bg-[#1954d6] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
            >
              {editingProduct ? "Simpan Perubahan Produk" : "Simpan Produk Baru"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

