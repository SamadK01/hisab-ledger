'use client';

import React from 'react';
import { Party, Product, Transaction, DashboardStats, User } from '@/lib/types';
import { calculatePartyBalance } from '@/lib/store';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Package,
  AlertTriangle,
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  ChevronRight,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface DashboardViewProps {
  currentUser: User | null;
  stats: DashboardStats;
  parties: Party[];
  products: Product[];
  transactions: Transaction[];
  hinglishMode: boolean;
  onOpenTransaction: (type: 'PURCHASE' | 'SALE' | 'PAYMENT_GIVEN' | 'PAYMENT_RECEIVED') => void;
  onOpenPartyModal: () => void;
  onOpenProductModal: () => void;
  onSelectParty: (party: Party) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  stats,
  parties,
  products,
  transactions,
  hinglishMode,
  onOpenTransaction,
  onOpenPartyModal,
  onOpenProductModal,
  onSelectParty,
  onNavigateToTab,
}) => {
  const isPartnerUser = currentUser?.role === 'PARTNER' && currentUser?.partyId;
  const myParty = isPartnerUser ? parties.find((p) => p.id === currentUser.partyId) : null;

  // Filter transactions for partner isolation
  const visibleTransactions = isPartnerUser
    ? transactions.filter((t) => t.partyId === currentUser.partyId)
    : transactions;

  const visibleParties = isPartnerUser && myParty ? [myParty] : parties;

  // Partner specific balance
  const partnerBal = myParty ? calculatePartyBalance(myParty, transactions) : 0;

  // Chart Data: Party Net Balances
  const partyChartData = visibleParties.map((party) => {
    const bal = calculatePartyBalance(party, transactions);
    return {
      name: party.name.length > 12 ? party.name.substring(0, 10) + '..' : party.name,
      fullName: party.name,
      balance: bal,
      absBalance: Math.abs(bal),
      status: bal > 0 ? 'Dena Hai' : bal < 0 ? 'Lena Hai' : 'Settled',
    };
  });

  // Category Stock Valuation Chart Data
  const categoryValuationMap: Record<string, number> = {};
  products.forEach((p) => {
    const val = Number(p.currentStock) * Number(p.costPrice);
    categoryValuationMap[p.category] = (categoryValuationMap[p.category] || 0) + val;
  });

  const categoryChartData = Object.keys(categoryValuationMap).map((cat) => ({
    name: cat,
    value: Math.round(categoryValuationMap[cat]),
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
  const lowStockProducts = products.filter((p) => Number(p.currentStock) <= Number(p.minStock));

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 p-6 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>
                {isPartnerUser
                  ? `Partner Portal (${myParty?.name || currentUser?.name})`
                  : hinglishMode
                  ? 'Master Admin Dashboard'
                  : 'Live Master Ledger Summary'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isPartnerUser ? `${myParty?.name || 'Partner'} Khaata Passbook` : hinglishMode ? 'Khaata Master Dashboard' : 'Master Ledger & Inventory'}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              {isPartnerUser
                ? `Aapke sharakati account ka live running balance, mal deals aur receipt statement.`
                : hinglishMode
                ? 'Apni tamam parties ka len-den, total dena/lena aur stock real-time check karein.'
                : 'Real-time overview of supplier liabilities, customer receivables, and stock valuation.'}
            </p>
          </div>

          {!isPartnerUser && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onOpenTransaction('PURCHASE')}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
                <span>{hinglishMode ? '+ Mal Mangwaya' : '+ Purchase Deal'}</span>
              </button>

              <button
                onClick={() => onOpenTransaction('SALE')}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all active:scale-95"
              >
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
                <span>{hinglishMode ? '+ Mal Becha' : '+ Sale Deal'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Partner Isolated Mode Header Banner */}
      {isPartnerUser && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 border border-purple-500/30">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-purple-200">Data Isolation Active</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PARTNER ROLE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                You are securely viewing only your private account passbook and transactions.
              </p>
            </div>
          </div>
          <button
            onClick={() => myParty && onSelectParty(myParty)}
            className="text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl transition-all"
          >
            {hinglishMode ? 'Passbook PDF' : 'Full Passbook'}
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      {isPartnerUser ? (
        /* Partner Isolated View Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {hinglishMode ? 'Mawajooda Net Position' : 'Your Running Balance'}
            </span>
            <div className="mt-2 flex items-baseline space-x-2">
              <div
                className={`text-2xl sm:text-3xl font-black ${
                  partnerBal > 0 ? 'text-rose-400' : partnerBal < 0 ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                PKR {Math.abs(partnerBal).toLocaleString()}
              </div>
              <span className="text-xs font-bold text-slate-400">
                {partnerBal > 0
                  ? '(Wajib-ul-Ada / Payable)'
                  : partnerBal < 0
                  ? '(Credit Surplus / Receivable)'
                  : '(Settled)'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {hinglishMode ? 'Kul Deals Count' : 'Total Deals Handled'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              {visibleTransactions.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Recorded purchases & sales</p>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Opening Balance
            </span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-300 mt-2">
              PKR {Math.abs(myParty?.openingBalance || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Initial starting balance</p>
          </div>
        </div>
      ) : (
        /* Master Admin Full KPI Cards */
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {/* Total Receivable (Lena Hai) */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-emerald-500/20 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {hinglishMode ? 'Kitna Lena Hai' : 'Total Receivable'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-black text-white">
                  PKR {stats.totalReceivable.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {hinglishMode ? 'Customers se vasool karna hai' : 'Owed by customers'}
                </p>
              </div>
            </div>

            {/* Total Payable (Dena Hai) */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-rose-500/20 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  {hinglishMode ? 'Kitna Dena Hai' : 'Total Payable'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-black text-white">
                  PKR {stats.totalPayable.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {hinglishMode ? 'Suppliers ko ada karna hai' : 'Owed to suppliers'}
                </p>
              </div>
            </div>

            {/* Total Stock Value */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-indigo-500/20 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  {hinglishMode ? 'Mawajooda Stock Value' : 'Stock Valuation'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-black text-white">
                  PKR {stats.totalStockValue.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {stats.totalProductsCount} {hinglishMode ? 'items godam mein' : 'active inventory items'}
                </p>
              </div>
            </div>

            {/* Net Balance Status */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {hinglishMode ? 'Net Balance Position' : 'Net Position'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div
                  className={`text-xl sm:text-2xl font-black ${
                    stats.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  PKR {Math.abs(stats.netBalance).toLocaleString()}
                </div>
                <p className="text-[11px] font-semibold mt-1">
                  {stats.netBalance >= 0 ? (
                    <span className="text-emerald-400">
                      {hinglishMode ? 'Aap Plus mein hain (Credit Surplus)' : 'Net Positive Balance'}
                    </span>
                  ) : (
                    <span className="text-rose-400">
                      {hinglishMode ? 'Aap Minus mein hain (Net Deficit)' : 'Net Payable Deficit'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Profit, Cost & Loss Tracking KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            {/* Gross Profit */}
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 rounded-2xl p-4 border border-emerald-500/30 shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <span>{hinglishMode ? 'Kul Munafa (Gross Profit)' : 'Gross Profit Margin'}</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-2">
                PKR {(stats.totalGrossProfit || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Sales Revenue minus Buying Cost</p>
            </div>

            {/* Total Loss & Wastage */}
            <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 rounded-2xl p-4 border border-rose-500/30 shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold text-rose-400 uppercase tracking-wider">
                <span>{hinglishMode ? 'Nuksan & Wastage (Loss)' : 'Loss & Damage Tracked'}</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-300 mt-2">
                PKR {(stats.totalLossDamage || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Spill, damage & bad debt losses</p>
            </div>

            {/* Net Profit */}
            <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 rounded-2xl p-4 border border-indigo-500/30 shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300 uppercase tracking-wider">
                <span>{hinglishMode ? 'Net Profit (Munafa - Loss)' : 'Net Business Profit'}</span>
                <DollarSign className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-2">
                PKR {(stats.netProfit || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-indigo-300 font-semibold mt-0.5">Gross Profit minus Total Losses</p>
            </div>
          </div>
        </div>
      )}


      {/* Low Stock Warning Banner (Master Admin Only) */}
      {!isPartnerUser && lowStockProducts.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                {lowStockProducts.length} {hinglishMode ? 'Products ka stock khatam hone wala hai!' : 'Low Stock Warning Alert!'}
              </h4>
              <p className="text-xs text-amber-300/80">
                {lowStockProducts.map((p) => p.name).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('products')}
            className="text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-colors"
          >
            {hinglishMode ? 'Stock Dekhein' : 'Manage Stock'}
          </button>
        </div>
      )}

      {/* Analytics Charts Section (Master Admin Only) */}
      {!isPartnerUser && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parties Len-Den Breakdown Chart */}
          <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  {hinglishMode ? 'Parties Len-Den Position' : 'Top Parties Balance Breakdown'}
                </h3>
                <p className="text-xs text-slate-400">
                  {hinglishMode ? 'Red = Dena Hai (Payable), Green = Lena Hai (Receivable)' : 'Net balance status per partner'}
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('parties')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <span>{hinglishMode ? 'Tamam Parties' : 'View All'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(value: any, name: any, item: any) => [
                      `PKR ${Math.abs(Number(value)).toLocaleString()} (${item.payload.status})`,
                      'Net Position',
                    ]}
                  />
                  <Bar dataKey="balance" radius={[6, 6, 0, 0]}>
                    {partyChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.balance > 0 ? '#ef4444' : entry.balance < 0 ? '#10b981' : '#64748b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inventory Valuation Category Breakdown */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  {hinglishMode ? 'Stock Distribution' : 'Category Stock Valuation'}
                </h3>
                <p className="text-xs text-slate-400">
                  {hinglishMode ? 'Surf, Harpic, Tezab etc. ki qeemat' : 'Valuation distribution by category'}
                </p>
              </div>
            </div>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(val: any) => [`PKR ${Number(val).toLocaleString()}`, 'Valuation']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 space-y-2">
              {categoryChartData.slice(0, 4).map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-300 font-medium">{cat.name}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">PKR {cat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Parties List & Recent Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parties List (Filtered for partner isolation) */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                {isPartnerUser ? 'Your Account Profile' : hinglishMode ? 'Parties & Suppliers Khaata' : 'Active Parties Directory'}
              </h3>
            </div>
            {!isPartnerUser && (
              <button
                onClick={onOpenPartyModal}
                className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-colors font-semibold"
              >
                + {hinglishMode ? 'Nayi Party' : 'Add Party'}
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {visibleParties.map((party) => {
              const bal = calculatePartyBalance(party, transactions);

              return (
                <div
                  key={party.id}
                  onClick={() => onSelectParty(party)}
                  className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-700 text-indigo-300 font-bold flex items-center justify-center text-sm border border-slate-600">
                      {party.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {party.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {party.phone || 'No Phone'} • <span className="uppercase text-slate-400">{party.partyType}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {bal > 0 ? (
                      <div>
                        <div className="text-sm font-extrabold text-rose-400">PKR {bal.toLocaleString()}</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {hinglishMode ? 'Dena hai (Payable)' : 'Payable'}
                        </span>
                      </div>
                    ) : bal < 0 ? (
                      <div>
                        <div className="text-sm font-extrabold text-emerald-400">PKR {Math.abs(bal).toLocaleString()}</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {hinglishMode ? 'Lena hai (Receivable)' : 'Receivable'}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-extrabold text-slate-400">PKR 0</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                          Settled
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Len-Den Timeline (Filtered for partner isolation) */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">
                {isPartnerUser ? 'Your Deal History' : hinglishMode ? 'Haal Hi Mein Huey Len-Den' : 'Recent Len-Den Deals'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              {hinglishMode ? 'Mukammal History' : 'Full History'}
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {visibleTransactions.slice(0, 5).map((tx) => {
              const txParty = parties.find((p) => p.id === tx.partyId);

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        tx.type === 'PURCHASE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : tx.type === 'SALE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {tx.type === 'PURCHASE' ? 'BUY' : tx.type === 'SALE' ? 'SELL' : 'PAY'}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {txParty?.name || tx.partyName || 'Party'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {tx.type === 'PURCHASE'
                          ? hinglishMode ? 'Mal Mangwaya' : 'Stock Bought'
                          : tx.type === 'SALE'
                          ? hinglishMode ? 'Mal Becha' : 'Stock Sold'
                          : tx.type === 'PAYMENT_GIVEN'
                          ? hinglishMode ? 'Paise Diye' : 'Payment Given'
                          : hinglishMode ? 'Paise Mile' : 'Payment Received'}
                        {' • '}
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold text-white">
                      PKR {tx.totalAmount.toLocaleString()}
                    </div>
                    {tx.remainingBalance > 0 && (
                      <div className="text-[10px] text-rose-400 font-semibold">
                        Baki: PKR {tx.remainingBalance.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
