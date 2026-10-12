'use client';

import React, { useState } from 'react';
import { Party, PartyType } from '@/lib/types';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';

interface PartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  hinglishMode: boolean;
  onSubmitParty: (partyData: Omit<Party, 'id' | 'createdAt'>) => void;
}

export const PartyModal: React.FC<PartyModalProps> = ({
  isOpen,
  onClose,
  hinglishMode,
  onSubmitParty,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [partyType, setPartyType] = useState<PartyType>('BOTH');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [creditLimit, setCreditLimit] = useState<number>(100000);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmitParty({
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      partyType,
      openingBalance: Number(openingBalance || 0),
      creditLimit: Number(creditLimit || 0),
      notes: notes.trim() || null,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              {hinglishMode ? 'Nayi Party / Supplier Shamil Karein' : 'Add New Party / Partner'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {hinglishMode ? 'Party Ka Naam *' : 'Party / Business Name *'}
            </label>
            <input
              type="text"
              placeholder="e.g. Al-Rehman Chemical Wholesalers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {hinglishMode ? 'Phone Number' : 'Phone Number'}
              </label>
              <input
                type="text"
                placeholder="+92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Party Type</label>
              <select
                value={partyType}
                onChange={(e) => setPartyType(e.target.value as PartyType)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="SUPPLIER">Supplier (Vendor)</option>
                <option value="CUSTOMER">Customer (Buyer)</option>
                <option value="BOTH">Both (Supplier & Customer)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Address / Location</label>
            <input
              type="text"
              placeholder="e.g. Market Gate 4, Shop 12"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {hinglishMode ? 'Opening Balance (PKR)' : 'Opening Balance (PKR)'}
              </label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Positive = Dena hai, Negative = Lena hai
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Credit Limit (PKR)</label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Terms</label>
            <textarea
              rows={2}
              placeholder="Payment terms or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{hinglishMode ? 'Party Shamil Karein' : 'Save Party Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
