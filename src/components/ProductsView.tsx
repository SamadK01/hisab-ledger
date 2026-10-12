'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { exportInventoryReportPDF } from '@/lib/pdf-generator';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Download,
  Edit2,
  Trash2,
  Boxes,
  TrendingUp,
  Tag,
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  hinglishMode: boolean;
  onOpenProductModal: (product?: Product) => void;
  onUpdateStock: (product: Product, delta: number) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  hinglishMode,
  onOpenProductModal,
  onUpdateStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory !== 'ALL' && product.category !== selectedCategory) return false;

    return true;
  });

  const totalValuation = products.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {hinglishMode ? 'Multi-Product Inventory Catalog' : 'Product Inventory Catalog'}
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {hinglishMode
              ? 'Surf, Harpic, Tezab aur baqi tamam household items ka stock aur rates.'
              : 'Track products, custom units, purchase rates, and wholesale rates.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportInventoryReportPDF(products)}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>{hinglishMode ? 'Valuation PDF' : 'Export Stock PDF'}</span>
          </button>

          <button
            onClick={() => onOpenProductModal()}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{hinglishMode ? '+ Naya Product Add Karein' : '+ Add Product'}</span>
          </button>
        </div>
      </div>

      {/* Stock Summary Header Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {hinglishMode ? 'Total Stock Valuation (At Cost)' : 'Total Inventory Valuation'}
            </span>
            <div className="text-xl font-black text-white">PKR {totalValuation.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="text-center sm:text-right">
            <span className="text-slate-400 block">{hinglishMode ? 'Total Products' : 'Total Items'}</span>
            <span className="text-sm font-bold text-white">{products.length}</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center sm:text-right">
            <span className="text-amber-400 block">{hinglishMode ? 'Low Stock Items' : 'Low Stock Count'}</span>
            <span className="text-sm font-bold text-amber-300">
              {products.filter((p) => p.currentStock <= p.minStock).length}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={hinglishMode ? 'Surf, Harpic, Tezab ya SKU se talash karein...' : 'Search product name, category, SKU...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {hinglishMode ? 'Sab Categories' : 'All Categories'}
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const isLowStock = product.currentStock <= product.minStock;

          return (
            <div
              key={product.id}
              className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/30 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      {product.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{product.name}</h3>
                    {product.sku && <p className="text-[11px] text-slate-400 font-mono">SKU: {product.sku}</p>}
                  </div>

                  {/* Stock level badge */}
                  <div className="text-right">
                    <div
                      className={`text-lg font-black ${
                        isLowStock ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {product.currentStock} {product.unit}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLowStock
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}
                    >
                      {isLowStock
                        ? hinglishMode ? 'Kam Stock Alert!' : 'Low Stock Warning'
                        : hinglishMode ? 'In Stock' : 'In Stock'}
                    </span>
                  </div>
                </div>

                {/* Price Details */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">{hinglishMode ? 'Khareed Rate (Cost)' : 'Cost Price'}</span>
                    <span className="font-extrabold text-white">PKR {product.costPrice} / {product.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">{hinglishMode ? 'Wholesale Rate (Sale)' : 'Wholesale Rate'}</span>
                    <span className="font-extrabold text-indigo-300">PKR {product.wholesalePrice} / {product.unit}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Stock Adjustment & Edit */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] text-slate-400 mr-1">{hinglishMode ? 'Stock Adjust:' : 'Adjust:'}</span>
                  <button
                    onClick={() => onUpdateStock(product, -5)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-700"
                    title="Deduct 5 items"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => onUpdateStock(product, 10)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center border border-slate-700"
                    title="Add 10 items"
                  >
                    +10
                  </button>
                </div>

                <button
                  onClick={() => onOpenProductModal(product)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Edit Product"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
