'use client';

import React, { useState, useEffect } from 'react';
import { Party, PaymentMode } from '@/lib/types';
import { X, DollarSign, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  initialParty?: Party | null;
  initialType?: 'PAYMENT_GIVEN' | 'PAYMENT_RECEIVED';
  hinglishMode: boolean;
  onSubmitPayment: (paymentData: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  parties,
  initialParty,
  initialType = 'PAYMENT_GIVEN',
  hinglishMode,
  onSubmitPayment,
}) => {
  const [partyId, setPartyId] = useState<string>('');
  const [type, setType] = useState<'PAYMENT_GIVEN' | 'PAYMENT_RECEIVED'>(initialType);
  const [amount, setAmount] = useState<number>(1000);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPartyId(initialParty ? initialParty.id : parties[0]?.id || '');
      setType(initialType);
      setAmount(1000);
      setPaymentMode('CASH');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
    }
  }, [isOpen, initialParty, initialType, parties]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId || amount <= 0) return;

    const party = parties.find((p) => p.id === partyId);

    const paymentData = {
      partyId,
      partyName: party?.name || '',
      type,
      invoiceNo: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      date: date || new Date().toISOString().slice(0, 10),
      subtotal: amount,
      discount: 0,
      additionalCost: 0,
      totalAmount: amount,
      cashPaid: amount,
      remainingBalance: 0,
      paymentMode,
      notes,
      items: [],
    };

    onSubmitPayment(paymentData);

    try {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    } catch {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              {hinglishMode ? 'Cash Jama / Payment Settlement' : 'Payment Entry'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('PAYMENT_GIVEN')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'PAYMENT_GIVEN' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cash Payment (Paid Out)
            </button>
            <button
              type="button"
              onClick={() => setType('PAYMENT_RECEIVED')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'PAYMENT_RECEIVED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cash Collection (Received)
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {hinglishMode ? 'Party Muntakhib Karein' : 'Select Party'}
            </label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              required
            >
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {hinglishMode ? 'Payment Rakam (PKR)' : 'Payment Amount (PKR)'}
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-black text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="CASH">Cash Naqad</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">EasyPaisa / JazzCash</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Weekly collection settlement"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{hinglishMode ? 'Payment Save Karein' : 'Save Payment Entry'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
