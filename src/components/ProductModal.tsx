'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductUnit } from '@/lib/types';
import { X, Package, CheckCircle2 } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  hinglishMode: boolean;
  onSubmitProduct: (productData: Omit<Product, 'id' | 'createdAt'>, editId?: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  hinglishMode,
  onSubmitProduct,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Detergents');
  const [unit, setUnit] = useState<ProductUnit>('kg');
  const [costPrice, setCostPrice] = useState<number>(100);
  const [wholesalePrice, setWholesalePrice] = useState<number>(140);
  const [currentStock, setCurrentStock] = useState<number>(50);
  const [minStock, setMinStock] = useState<number>(15);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku || '');
      setCategory(productToEdit.category);
      setUnit(productToEdit.unit);
      setCostPrice(productToEdit.costPrice);
      setWholesalePrice(productToEdit.wholesalePrice);
      setCurrentStock(productToEdit.currentStock);
      setMinStock(productToEdit.minStock);
      setNotes(productToEdit.notes || '');
    } else {
      setName('');
      setSku('');
      setCategory('Detergents');
      setUnit('kg');
      setCostPrice(100);
      setWholesalePrice(140);
      setCurrentStock(50);
      setMinStock(15);
      setNotes('');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmitProduct(
      {
        name: name.trim(),
        sku: sku.trim() || null,
        category: category.trim() || 'General',
        unit,
        costPrice: Number(costPrice || 0),
        wholesalePrice: Number(wholesalePrice || 0),
        currentStock: Number(currentStock || 0),
        minStock: Number(minStock || 10),
        notes: notes.trim() || null,
      },
      productToEdit ? productToEdit.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              {productToEdit
                ? hinglishMode ? 'Product Change Karein' : 'Edit Product'
                : hinglishMode ? 'Naya Inventory Product Add Karein' : 'Add New Inventory Product'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {hinglishMode ? 'Product Ka Naam * (e.g. Surf Excel 1kg, Harpic 500ml)' : 'Product Name *'}
            </label>
            <input
              type="text"
              placeholder="e.g. Concentrated Tezab Acid 1L"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Detergents">Detergents (Surf/Powder)</option>
                <option value="Cleaners">Cleaners (Harpic/Bleach)</option>
                <option value="Chemicals">Chemicals (Tezab/Acid)</option>
                <option value="Household">Household (Phenyl)</option>
                <option value="Soaps">Soaps & Dishwash</option>
                <option value="General">General Items</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measure *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ProductUnit)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="liter">Liter (L)</option>
                <option value="piece">Piece (Pcs)</option>
                <option value="carton">Carton (Box)</option>
                <option value="pack">Pack / Bundle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {hinglishMode ? 'Khareed Rate (Cost Price)' : 'Cost Price (PKR)'}
              </label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {hinglishMode ? 'Wholesale Rate (Sale Price)' : 'Wholesale Price (PKR)'}
              </label>
              <input
                type="number"
                min="0"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-300 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {hinglishMode ? 'Initial Stock Quantity' : 'Current Stock Qty'}
              </label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-300 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Alert Stock</label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{productToEdit ? 'Update Product Details' : 'Save New Product'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
