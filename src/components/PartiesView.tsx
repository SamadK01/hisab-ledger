'use client';

import React, { useState } from 'react';
import { Party, Transaction, User } from '@/lib/types';
import { calculatePartyBalance } from '@/lib/store';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  FileText,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Filter,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

interface PartiesViewProps {
  currentUser: User | null;
  parties: Party[];
  transactions: Transaction[];
  hinglishMode: boolean;
  onOpenPartyModal: () => void;
  onSelectParty: (party: Party) => void;
  onOpenTransactionForParty: (party: Party, type: 'PURCHASE' | 'SALE' | 'PAYMENT_GIVEN' | 'PAYMENT_RECEIVED') => void;
  onDeleteParty?: (partyId: string, partyName: string) => void;
}

export const PartiesView: React.FC<PartiesViewProps> = ({
  currentUser,
  parties,
  transactions,
  hinglishMode,
  onOpenPartyModal,
  onSelectParty,
  onOpenTransactionForParty,
  onDeleteParty,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SUPPLIER' | 'CUSTOMER' | 'DENA' | 'LENA' | 'SETTLED'>('ALL');

  const isAdmin = currentUser?.role === 'ADMIN';
  const isPartnerUser = currentUser?.role === 'PARTNER' && currentUser?.partyId;
  const visibleParties = isPartnerUser
    ? parties.filter((p) => p.id === currentUser.partyId)
    : parties;

  const filteredParties = visibleParties.filter((party) => {
    const bal = calculatePartyBalance(party, transactions);
    const matchesSearch =
      party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (party.phone && party.phone.includes(searchTerm)) ||
      (party.address && party.address.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'SUPPLIER') return party.partyType === 'SUPPLIER' || party.partyType === 'BOTH';
    if (filterType === 'CUSTOMER') return party.partyType === 'CUSTOMER' || party.partyType === 'BOTH';
    if (filterType === 'DENA') return bal > 0;
    if (filterType === 'LENA') return bal < 0;
    if (filterType === 'SETTLED') return bal === 0;

    return true;
  });

  const sendWhatsAppReminder = (party: Party, balance: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = party.phone?.replace(/[^0-9]/g, '');
    let text = `Salam ${party.name}! HisabPro Khaata Summary:\n`;
    if (balance > 0) {
      text += `Aapka Total Dena (Payable): PKR ${balance.toLocaleString()}.\nShukriya!`;
    } else if (balance < 0) {
      text += `Aapka Wajib-ul-Ada Balance (Lena Hai): PKR ${Math.abs(balance).toLocaleString()}.\nBaraye meharbani payment clear karein. Shukriya!`;
    } else {
      text += `Aapka Khaata mukammal settled (Zero Balance) hai. Shukriya!`;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {isPartnerUser ? 'Your Account Profile' : hinglishMode ? 'Parties & Suppliers Khaate' : 'Party & Supplier Directory'}
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {isPartnerUser
              ? 'View your personal account details, contact info, and passbook statement.'
              : hinglishMode
              ? 'Tamam suppliers aur customers ka mukammal hisaab kitab aur passbook.'
              : 'Manage dynamic suppliers, customers, and independent ledgers.'}
          </p>
        </div>

        {!isPartnerUser && (
          <button
            onClick={onOpenPartyModal}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{hinglishMode ? '+ Nayi Party Add Karein' : '+ Add New Party'}</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar (Master Admin Only) */}
      {!isPartnerUser && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={hinglishMode ? 'Party name, phone number ya address se talash karein...' : 'Search by name, phone, address...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filter Chip Tabs */}
          <div className="flex items-center overflow-x-auto space-x-1.5 pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: hinglishMode ? 'Tamam' : 'All' },
              { id: 'SUPPLIER', label: hinglishMode ? 'Suppliers' : 'Suppliers' },
              { id: 'CUSTOMER', label: hinglishMode ? 'Customers' : 'Customers' },
              { id: 'DENA', label: hinglishMode ? 'Dena Hai' : 'Payables' },
              { id: 'LENA', label: hinglishMode ? 'Lena Hai' : 'Receivables' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setFilterType(chip.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterType === chip.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Parties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParties.map((party) => {
          const bal = calculatePartyBalance(party, transactions);

          return (
            <div
              key={party.id}
              onClick={() => onSelectParty(party)}
              className="bg-slate-900/90 hover:bg-slate-900 rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-indigo-400 font-extrabold flex items-center justify-center text-base border border-slate-700 shadow-inner">
                      {party.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {party.name}
                      </h3>
                      <span className="inline-block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                        {party.partyType}
                      </span>
                    </div>
                  </div>

                  {/* Balance Badge */}
                  <div className="text-right">
                    {bal > 0 ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-extrabold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>PKR {bal.toLocaleString()} Dena</span>
                      </span>
                    ) : bal < 0 ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>PKR {Math.abs(bal).toLocaleString()} Lena</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400">
                        Settled
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                  {party.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{party.phone}</span>
                    </div>
                  )}
                  {party.address && (
                    <div className="text-[11px] text-slate-400 truncate">
                      {party.address}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {party.phone && (
                    <button
                      onClick={(e) => sendWhatsAppReminder(party, bal, e)}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                      title="Send WhatsApp Khaata Reminder"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                  {!isPartnerUser && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTransactionForParty(party, 'PURCHASE');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700"
                    >
                      + Deal
                    </button>
                  )}
                  {/* Master Admin Delete Button Only */}
                  {isAdmin && onDeleteParty && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteParty(party.id, party.name);
                      }}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      title="Delete Party / Clear Account (Master Admin)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-xs text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>{hinglishMode ? 'Khaata Passbook' : 'View Passbook'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

