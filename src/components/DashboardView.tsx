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
  ExternalLink,
  CheckCircle2,
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
  hinglishMode?: boolean;
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
  hinglishMode = false,
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

  // REQUIREMENT 2: Main Master Dashboard strictly displays parties directly linked to Master Admin transactions!
  const tradingParties = isPartnerUser && myParty
    ? [myParty]
    : parties.filter((p) => transactions.some((t) => t.partyId === p.id));

  // Partner specific balance
  const partnerBal = myParty ? calculatePartyBalance(myParty, transactions) : 0;

  // Master Admin isolated metrics strictly computed from trading parties
  let adminTotalReceivable = 0;
  let adminTotalPayable = 0;
  tradingParties.forEach((party) => {
    const bal = calculatePartyBalance(party, visibleTransactions);
    if (bal > 0) adminTotalPayable += bal;
    else if (bal < 0) adminTotalReceivable += Math.abs(bal);
  });
  const adminNetPosition = adminTotalReceivable - adminTotalPayable;

  // Cash paid (purchases) and cash collected (sales)
  const cashPaidPurchases = visibleTransactions
    .filter((t) => t.type === 'PURCHASE')
    .reduce((sum, t) => sum + Number(t.cashPaid || 0), 0);
  const cashCollectedSales = visibleTransactions
    .filter((t) => t.type === 'SALE')
    .reduce((sum, t) => sum + Number(t.cashPaid || 0), 0);

  // Chart Data: Party Net Balances (Strictly only trading parties)
  const partyChartData = tradingParties.map((party) => {
    const bal = calculatePartyBalance(party, visibleTransactions);
    return {
      name: party.name.length > 12 ? party.name.substring(0, 10) + '..' : party.name,
      fullName: party.name,
      balance: bal,
      absBalance: Math.abs(bal),
      status: bal > 0 ? 'Payable' : bal < 0 ? 'Receivable' : 'Settled',
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
      {/* Welcome & Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 p-6 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>
                {isPartnerUser
                  ? `Partner Portal (${myParty?.name || currentUser?.name})`
                  : 'Master Admin Trading Dashboard'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isPartnerUser ? `${myParty?.name || 'Partner'} Ledger Passbook` : 'Multi-Party Trading Dashboard'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              {isPartnerUser
                ? 'Your private ledger account statement, running balance, and recorded invoices.'
                : 'Live overview of Master Admin trading accounts, cash collections, liabilities, and product inventory.'}
            </p>
          </div>

          {!isPartnerUser && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onOpenTransaction('PURCHASE')}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
                <span>+ Purchase Deal</span>
              </button>

              <button
                onClick={() => onOpenTransaction('SALE')}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all active:scale-95"
              >
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
                <span>+ Sale Deal</span>
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
            Full Passbook Statement
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      {isPartnerUser ? (
        /* Partner Isolated View Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Your Running Position
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
                  ? '(Payable to Admin)'
                  : partnerBal < 0
                  ? '(Receivable from Admin)'
                  : '(Settled)'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Deals Handled
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
            <p className="text-[11px] text-slate-400 mt-1">Initial starting ledger position</p>
          </div>
        </div>
      ) : (
        /* Master Admin Full KPI Cards (Strictly Trading Parties Isolated) */
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Receivable */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-emerald-500/20 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Total Receivable
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-black text-white">
                  PKR {adminTotalReceivable.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Owed to you by trading customers
                </p>
              </div>
            </div>

            {/* Total Payable */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-rose-500/20 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  Total Payable
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-black text-white">
                  PKR {adminTotalPayable.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Owed by you to wholesale suppliers
                </p>
              </div>
            </div>

            {/* Net Position */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Net Position
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div
                  className={`text-xl sm:text-2xl font-black ${
                    adminNetPosition >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  PKR {Math.abs(adminNetPosition).toLocaleString()}
                </div>
                <p className="text-[11px] font-semibold mt-1">
                  {adminNetPosition >= 0 ? (
                    <span className="text-emerald-400">Net Credit Surplus (Receivable &gt; Payable)</span>
                  ) : (
                    <span className="text-rose-400">Net Liability Deficit (Payable &gt; Receivable)</span>
                  )}
                </p>
              </div>
            </div>

            {/* Inventory Valuation */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-indigo-500/20 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Inventory Valuation
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
                  {stats.totalProductsCount} active products in warehouse
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Financial Row: Cash Paid, Cash Collected & Gross Profit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Purchases Cash Paid */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Cash Paid (Purchases)</span>
                <DollarSign className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl font-black text-white mt-2">
                PKR {cashPaidPurchases.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Disbursed cash to suppliers</p>
            </div>

            {/* Sales Cash Collected */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Cash Collected (Sales)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-300 mt-2">
                PKR {cashCollectedSales.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Collected cash from customers</p>
            </div>

            {/* Estimated Gross Profit */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/30 shadow-md">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <span>Estimated Gross Profit</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-300 mt-2">
                PKR {(stats.totalGrossProfit || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Sales revenue minus cost of goods sold</p>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {!isPartnerUser && lowStockProducts.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                {lowStockProducts.length} Inventory Product(s) at Minimum Stock Level
              </h4>
              <p className="text-xs text-amber-300/80">
                {lowStockProducts.map((p) => `${p.name} (${p.currentStock} ${p.unit})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('products')}
            className="text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-colors"
          >
            Manage Inventory
          </button>
        </div>
      )}

      {/* Analytics Charts (Master Admin Only) */}
      {!isPartnerUser && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parties Len-Den Breakdown Chart */}
          <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Trading Parties Balance Breakdown
                </h3>
                <p className="text-xs text-slate-400">
                  Direct ledger balances with Master Admin (Red = Payable, Green = Receivable)
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('partners')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <span>All Partners Portal</span>
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
                  Inventory Valuation by Category
                </h3>
                <p className="text-xs text-slate-400">
                  Current stock value breakdown
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

      {/* REQUIREMENT 2: Active Trading Parties Directory & Recent Deals Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Trading Parties Directory (Isolated to parties with active transactions) */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Active Trading Parties
                </h3>
                <p className="text-[11px] text-slate-400">
                  {tradingParties.length} parties directly linked to your transactions
                </p>
              </div>
            </div>
            
            <button
              onClick={() => onNavigateToTab('partners')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
            >
              <span>All Partners ({parties.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {tradingParties.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No trading parties with active transactions yet.
              </div>
            ) : (
              tradingParties.map((party) => {
                const bal = calculatePartyBalance(party, visibleTransactions);
                const partyTxs = visibleTransactions.filter((t) => t.partyId === party.id);

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
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {party.name}
                          </h4>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-700/80 text-slate-300 uppercase">
                            {party.partyType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {partyTxs.length} Deals Recorded • {party.phone || party.email || 'No contact'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {bal > 0 ? (
                        <div>
                          <div className="text-sm font-extrabold text-rose-400">PKR {bal.toLocaleString()}</div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            Payable
                          </span>
                        </div>
                      ) : bal < 0 ? (
                        <div>
                          <div className="text-sm font-extrabold text-emerald-400">PKR {Math.abs(bal).toLocaleString()}</div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Receivable
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
              })
            )}
          </div>
        </div>

        {/* Recent Deals Timeline */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Recent Deals & Transactions
                </h3>
                <p className="text-[11px] text-slate-400">
                  Latest activity linked to Master Admin
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              Full History
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
                      {tx.type === 'PURCHASE' ? 'BUY' : tx.type === 'SALE' ? 'SELL' : 'CASH'}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {txParty?.name || tx.partyName || 'Party'}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {tx.type === 'PURCHASE'
                          ? 'Purchase Deal'
                          : tx.type === 'SALE'
                          ? 'Sale Deal'
                          : tx.type === 'PAYMENT_GIVEN'
                          ? 'Cash Payment'
                          : 'Cash Collection'}
                        {' • '}
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold text-white">
                      PKR {tx.totalAmount.toLocaleString()}
                    </div>
                    {tx.remainingBalance > 0 ? (
                      <div className="text-[10px] text-rose-400 font-semibold">
                        Due: PKR {tx.remainingBalance.toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        Fully Paid
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
