'use client';

import React, { useState, useEffect } from 'react';
import { Party, Product, TransactionType, PaymentMode, ProductUnit } from '@/lib/types';
import confetti from 'canvas-confetti';
import {
  X,
  Plus,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  products: Product[];
  initialParty?: Party | null;
  initialType?: TransactionType;
  hinglishMode: boolean;
  onSubmitTransaction: (txData: any) => void;
}

interface ItemRow {
  productId: string;
  productName: string;
  unit: ProductUnit;
  quantity: number;
  rate: number;          // Selling rate or transaction rate
  costPrice: number;     // Buying / Cost price
  subtotal: number;      // quantity * rate
  costSubtotal: number;  // quantity * costPrice
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  parties,
  products,
  initialParty,
  initialType = 'PURCHASE',
  hinglishMode,
  onSubmitTransaction,
}) => {
  const [partyId, setPartyId] = useState<string>('');
  const [type, setType] = useState<TransactionType>(initialType);
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [notes, setNotes] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const [items, setItems] = useState<ItemRow[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [additionalCost, setAdditionalCost] = useState<number>(0);
  const [cashPaid, setCashPaid] = useState<number>(0);

  // Loss & Damage Tracking state
  const [lossAmount, setLossAmount] = useState<number>(0);
  const [lossReason, setLossReason] = useState<string>('Wastage / Spill');

  useEffect(() => {
    if (isOpen) {
      setPartyId(initialParty ? initialParty.id : parties[0]?.id || '');
      setType(initialType);
      setInvoiceNo(`INV-${Date.now().toString().slice(-6)}`);
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMode('CASH');
      setNotes('');
      setReceiptImage(null);
      setDiscount(0);
      setAdditionalCost(0);
      setCashPaid(0);
      setLossAmount(0);
      setLossReason('Wastage / Spill');

      if (products.length > 0) {
        const p = products[0];
        const costRate = p.costPrice || 100;
        const sellRate = initialType === 'PURCHASE' ? p.costPrice : p.wholesalePrice || 120;
        setItems([
          {
            productId: p.id,
            productName: p.name,
            unit: p.unit,
            quantity: 10,
            costPrice: costRate,
            rate: sellRate,
            subtotal: sellRate * 10,
            costSubtotal: costRate * 10,
          },
        ]);
      }
    }
  }, [isOpen, initialParty, initialType, parties, products]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB! Please select a smaller receipt picture.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setReceiptImage(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProductChange = (index: number, pId: string) => {
    const p = products.find((prod) => prod.id === pId);
    if (!p) return;

    const costRate = p.costPrice || 0;
    const sellRate = type === 'PURCHASE' ? p.costPrice : p.wholesalePrice;
    const newItems = [...items];
    const qty = newItems[index].quantity;
    newItems[index] = {
      ...newItems[index],
      productId: p.id,
      productName: p.name,
      unit: p.unit,
      costPrice: costRate,
      rate: sellRate,
      subtotal: Math.round(sellRate * qty),
      costSubtotal: Math.round(costRate * qty),
    };
    setItems(newItems);
  };

  const handleQtyChange = (index: number, qty: number) => {
    const newItems = [...items];
    const q = Math.max(0, qty);
    newItems[index].quantity = q;
    newItems[index].subtotal = Math.round(q * newItems[index].rate);
    newItems[index].costSubtotal = Math.round(q * newItems[index].costPrice);
    setItems(newItems);
  };

  const handleRateChange = (index: number, r: number) => {
    const newItems = [...items];
    const rate = Math.max(0, r);
    newItems[index].rate = rate;
    newItems[index].subtotal = Math.round(newItems[index].quantity * rate);
    setItems(newItems);
  };

  const handleCostPriceChange = (index: number, cp: number) => {
    const newItems = [...items];
    const costPrice = Math.max(0, cp);
    newItems[index].costPrice = costPrice;
    newItems[index].costSubtotal = Math.round(newItems[index].quantity * costPrice);
    setItems(newItems);
  };

  const addItemRow = () => {
    const p = products[0];
    const costRate = p?.costPrice || 100;
    const sellRate = type === 'PURCHASE' ? costRate : p?.wholesalePrice || 120;
    setItems([
      ...items,
      {
        productId: p?.id || '',
        productName: p?.name || 'Product',
        unit: p?.unit || 'kg',
        quantity: 1,
        costPrice: costRate,
        rate: sellRate,
        subtotal: sellRate,
        costSubtotal: costRate,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const calculatedSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const calculatedCostSubtotal = items.reduce((sum, item) => sum + item.costSubtotal, 0);
  const calculatedTotalAmount = Math.max(0, calculatedSubtotal - discount + Number(additionalCost));
  const calculatedRemaining = Math.max(0, calculatedTotalAmount - cashPaid);

  // Profit calculations
  const expectedProfitAmount = Math.max(0, calculatedTotalAmount - calculatedCostSubtotal);
  const profitPercentage = calculatedCostSubtotal > 0
    ? Math.round((expectedProfitAmount / calculatedCostSubtotal) * 1000) / 10
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!partyId) {
      alert('Please select a party/supplier!');
      return;
    }

    const party = parties.find((p) => p.id === partyId);

    const txData = {
      partyId,
      partyName: party?.name || '',
      type,
      invoiceNo: invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
      date: date || new Date().toISOString().slice(0, 10),
      subtotal: calculatedSubtotal,
      discount,
      additionalCost,
      totalAmount: calculatedTotalAmount,
      cashPaid,
      remainingBalance: calculatedRemaining,
      paymentMode,
      notes,
      receiptImage,
      buyingCostTotal: calculatedCostSubtotal,
      sellingPriceTotal: calculatedTotalAmount,
      expectedProfit: expectedProfitAmount,
      lossAmount: Number(lossAmount || 0),
      lossReason: lossAmount > 0 ? lossReason : null,
      items,
    };

    onSubmitTransaction(txData);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                type === 'PURCHASE' ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {type === 'PURCHASE' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {type === 'PURCHASE'
                  ? hinglishMode ? 'Naya Mal Mangwaya (Purchase Deal)' : 'New Purchase Transaction'
                  : hinglishMode ? 'Naya Mal Becha (Sale Deal)' : 'New Sale Transaction'}
              </h2>
              <p className="text-xs text-slate-400">
                {hinglishMode ? 'Multi-product items, cash paid upfront, profit margin aur receipt slip attach karein.' : 'Record multi-product deals with cost, selling price & profit tracking.'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto font-sans">
          {/* Deal Type Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('PURCHASE')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'PURCHASE' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {hinglishMode ? 'Mal Mangwaya (Purchase)' : 'Purchase (Buy Stock)'}
            </button>
            <button
              type="button"
              onClick={() => setType('SALE')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'SALE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {hinglishMode ? 'Mal Becha (Sale)' : 'Sale (Sell Stock)'}
            </button>
          </div>

          {/* Select Party & Invoice Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {hinglishMode ? 'Party / Supplier Muntakhib Karein *' : 'Select Party / Supplier *'}
              </label>
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                required
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.partyType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {hinglishMode ? 'Tareegh (Date)' : 'Transaction Date'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Multi-Product Line Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {hinglishMode ? 'Deal Products List (Cost vs Selling Price)' : 'Transaction Products List'}
              </span>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{hinglishMode ? '+ Ek Aur Item Shamil Karein' : '+ Add Product'}</span>
              </button>
            </div>

            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 relative group"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  {/* Select Product */}
                  <div className="sm:col-span-4">
                    <label className="text-[10px] text-slate-400 block mb-1">Item Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-1">Qty ({item.unit})</label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleQtyChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-bold text-center"
                    />
                  </div>

                  {/* Buying Cost Price */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-1">Cost Price</label>
                    <input
                      type="number"
                      min="0"
                      value={item.costPrice}
                      onChange={(e) => handleCostPriceChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 text-center"
                      placeholder="Cost"
                    />
                  </div>

                  {/* Selling Rate */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-emerald-400 font-bold block mb-1">Sell Rate</label>
                    <input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(e) => handleRateChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 bg-slate-900 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-bold text-center"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="sm:col-span-2 text-right">
                    <label className="text-[10px] text-slate-400 block mb-1">Subtotal</label>
                    <span className="text-xs font-black text-indigo-300 block pt-1">
                      PKR {item.subtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Delete Row button */}
                  <div className="sm:col-span-12 text-right pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Cost Total: PKR {item.costSubtotal.toLocaleString()} | Margin: PKR {(item.subtotal - item.costSubtotal).toLocaleString()}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-[10px] flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Profit Margin Highlight Banner (for Sales) */}
          {type === 'SALE' && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  {hinglishMode ? 'Bachat / Profit Margin Summary' : 'Expected Profit Margin Calculation'}
                </span>
                <div className="text-sm font-black text-white mt-0.5">
                  Expected Profit: <span className="text-emerald-300">PKR {expectedProfitAmount.toLocaleString()}</span> ({profitPercentage}% Margin)
                </div>
              </div>
              <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-xl border border-emerald-500/30 text-xs font-extrabold">
                +{profitPercentage}%
              </div>
            </div>
          )}

          {/* Subtotals & Payment Calculation Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Buying Stock Cost Total:</span>
              <span className="font-bold text-slate-400">PKR {calculatedCostSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Selling Items Subtotal:</span>
              <span className="font-bold text-white">PKR {calculatedSubtotal.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Discount (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Freight / Extra Cost</label>
                <input
                  type="number"
                  min="0"
                  value={additionalCost}
                  onChange={(e) => setAdditionalCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-semibold"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase">{hinglishMode ? 'Kul Qula Qam (Total Amount):' : 'Final Total Deal Amount:'}</span>
              <span className="text-lg font-black text-indigo-400">PKR {calculatedTotalAmount.toLocaleString()}</span>
            </div>

            {/* Upfront Cash Paid & Remaining Balance */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-emerald-400 block mb-1">
                  {type === 'PURCHASE'
                    ? hinglishMode ? 'Abhi Naqad Diya (Cash Paid Upfront)' : 'Cash Paid Upfront'
                    : hinglishMode ? 'Abhi Naqad Mila (Cash Received Upfront)' : 'Cash Received Upfront'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={cashPaid}
                  onChange={(e) => setCashPaid(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-emerald-500/30 rounded-xl text-sm font-black text-emerald-300 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-rose-400 block mb-1">
                  {hinglishMode ? 'Baqaya Khaate Mein Add Hoga' : 'Remaining Balance to Ledger'}
                </label>
                <div className="w-full px-3.5 py-2 bg-slate-900 border border-rose-500/30 rounded-xl text-sm font-black text-rose-300">
                  PKR {calculatedRemaining.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Loss & Damage Tracking Section */}
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-300 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{hinglishMode ? 'Nuksan / Loss & Damage Tracking (Optional)' : 'Loss & Damage / Wastage Record'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Loss Amount (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={lossAmount}
                  onChange={(e) => setLossAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-900 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Reason for Loss</label>
                <select
                  value={lossReason}
                  onChange={(e) => setLossReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="Wastage / Spill">Wastage / Product Spill</option>
                  <option value="Damaged Goods / Transport Loss">Water / Transport Damage</option>
                  <option value="Bad Debt / Unrecoverable">Bad Debt / Unrecoverable</option>
                  <option value="Expired Product">Product Expiry</option>
                </select>
              </div>
            </div>
          </div>

          {/* Receipt & Bill Slip Image Upload */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {hinglishMode ? 'Bill / Handwritten Slip / Product Photo Attach Karein' : 'Attach Receipt / Handwritten Slip Picture'}
            </label>

            {receiptImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-indigo-500/40 bg-slate-900 p-2 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={receiptImage} alt="Slip Preview" className="w-14 h-14 object-cover rounded-xl border border-slate-800" />
                  <span className="text-xs text-slate-300 font-medium">Receipt Picture Attached</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptImage(null)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/30 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-all text-center">
                <span className="text-xs text-indigo-400 font-bold">+ Upload Slip / Bill Photo</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Click to choose image (JPEG/PNG up to 5MB)</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Payment Mode & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {hinglishMode ? 'Payment Method' : 'Payment Method'}
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="CASH">Cash Naqad</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">EasyPaisa / JazzCash / UPI</option>
                <option value="CHEQUE">Bank Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {hinglishMode ? 'Notes / Bill Number' : 'Notes / Remarks'}
              </label>
              <input
                type="text"
                placeholder="e.g. Special wholesale discount deal"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{hinglishMode ? 'Len-Den Record Karein Aur Khaata Update Karein' : 'Save Transaction & Update Ledger'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

