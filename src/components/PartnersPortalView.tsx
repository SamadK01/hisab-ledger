'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Plus,
  Trash2,
  Building,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Edit2,
  Lock,
} from 'lucide-react';
import { Party, Transaction, User } from '@/lib/types';
import { calculatePartyBalance } from '@/lib/store';

interface PartnersPortalViewProps {
  currentUser: User | null;
  parties: Party[];
  transactions: Transaction[];
  users: any[];
  onOpenPartyModal: () => void;
  onSelectParty: (party: Party) => void;
  onRefreshUsers: () => void;
  onDeleteUser: (userId: string, userName: string, partyId?: string | null) => void;
  onUpdateUserCredentials: (userId: string, updates: any) => Promise<boolean>;
  onApproveUser: (userId: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
  onOpenTransactionForParty: (party: Party, type: 'PURCHASE' | 'SALE') => void;
}

export const PartnersPortalView: React.FC<PartnersPortalViewProps> = ({
  currentUser,
  parties,
  transactions,
  users,
  onOpenPartyModal,
  onSelectParty,
  onRefreshUsers,
  onDeleteUser,
  onUpdateUserCredentials,
  onApproveUser,
  onOpenTransactionForParty,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [dealFilter, setDealFilter] = useState<'ALL' | 'WITH_DEALS' | 'NO_DEALS'>('ALL');
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<'ALL' | 'SUPPLIER' | 'CUSTOMER'>('ALL');

  // Credential modal / drawer states
  const [selectedUserForCreds, setSelectedUserForCreds] = useState<any | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editPasswordInput, setEditPasswordInput] = useState<string>('');
  const [isEditingPassword, setIsEditingPassword] = useState<boolean>(false);
  const [isSavingCreds, setIsSavingCreds] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const togglePasswordVisibility = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const copyToClipboard = (text: string, keyId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const copyFullCredentials = (user: any) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hisab-ledger.vercel.app';
    const text = `HisabPro Partner Portal Access:\nLogin URL: ${origin}\nEmail: ${user.email}\nPassword: ${user.password || 'partner123'}\nStatus: ${user.status}`;
    copyToClipboard(text, `full-${user.id}`);
  };

  // Combine user records with their linked party and transaction metrics
  const partnerAccounts = users
    .filter((u) => u.role === 'PARTNER')
    .map((u) => {
      const linkedParty = parties.find((p) => p.id === u.partyId) || u.party;
      const partyTxs = linkedParty ? transactions.filter((t) => t.partyId === linkedParty.id) : [];
      const balance = linkedParty ? calculatePartyBalance(linkedParty, transactions) : 0;
      const hasActiveDeals = partyTxs.length > 0;

      return {
        user: u,
        party: linkedParty,
        dealCount: partyTxs.length,
        hasActiveDeals,
        balance,
      };
    });

  // Filter accounts
  const filteredAccounts = partnerAccounts.filter(({ user, party, hasActiveDeals }) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (party?.name && party.name.toLowerCase().includes(q)) ||
      (party?.phone && party.phone.includes(q)) ||
      (party?.address && party.address.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (statusFilter === 'APPROVED' && user.status !== 'APPROVED') return false;
    if (statusFilter === 'PENDING' && user.status !== 'PENDING_APPROVAL') return false;
    if (statusFilter === 'REJECTED' && user.status !== 'REJECTED') return false;

    if (dealFilter === 'WITH_DEALS' && !hasActiveDeals) return false;
    if (dealFilter === 'NO_DEALS' && hasActiveDeals) return false;

    if (partnerTypeFilter === 'SUPPLIER' && party?.partyType !== 'SUPPLIER' && party?.partyType !== 'BOTH') return false;
    if (partnerTypeFilter === 'CUSTOMER' && party?.partyType !== 'CUSTOMER' && party?.partyType !== 'BOTH') return false;

    return true;
  });

  // KPI stats
  const totalPartners = partnerAccounts.length;
  const approvedCount = partnerAccounts.filter((a) => a.user.status === 'APPROVED').length;
  const pendingCount = partnerAccounts.filter((a) => a.user.status === 'PENDING_APPROVAL').length;
  const activeTradingCount = partnerAccounts.filter((a) => a.hasActiveDeals).length;
  const unengagedCount = partnerAccounts.filter((a) => !a.hasActiveDeals).length;

  const handleSavePassword = async () => {
    if (!selectedUserForCreds || !editPasswordInput.trim()) return;
    setIsSavingCreds(true);
    setStatusMsg(null);
    try {
      const ok = await onUpdateUserCredentials(selectedUserForCreds.id, {
        password: editPasswordInput.trim(),
      });
      if (ok) {
        setStatusMsg({ text: 'Password updated successfully!', type: 'success' });
        selectedUserForCreds.password = editPasswordInput.trim();
        setIsEditingPassword(false);
      } else {
        setStatusMsg({ text: 'Failed to update password.', type: 'error' });
      }
    } catch {
      setStatusMsg({ text: 'Error saving password.', type: 'error' });
    } finally {
      setIsSavingCreds(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Users className="w-4 h-4" />
            <span>Master Admin Partner Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            All Registered Partners & Portal Users
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            View every registered partner profile, account verification status, and contact info across the platform, regardless of whether they have active deals with Master Admin.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRefreshUsers}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onOpenPartyModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Partner</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Total Partners</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalPartners}</div>
          <p className="text-[11px] text-slate-400 mt-1">Platform registered users</p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/20 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <span>Approved Accounts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-2">{approvedCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Full portal access enabled</p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/20 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2">{pendingCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting admin review</p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-indigo-500/20 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <span>Active Trading</span>
            <Building className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {activeTradingCount}
            <span className="text-xs text-slate-400 font-normal ml-2">({unengagedCount} without deals)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Directly linked to admin deals</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, or address..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filters */}
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  statusFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  statusFilter === 'APPROVED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  statusFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending {pendingCount > 0 && `(${pendingCount})`}
              </button>
            </div>

            {/* Deals Filter */}
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setDealFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  dealFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Deals
              </button>
              <button
                onClick={() => setDealFilter('WITH_DEALS')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  dealFilter === 'WITH_DEALS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Active Deals ({activeTradingCount})
              </button>
              <button
                onClick={() => setDealFilter('NO_DEALS')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  dealFilter === 'NO_DEALS' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                No Deals Yet ({unengagedCount})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="space-y-3">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Partners Match Criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or filters to view registered platform partners.
            </p>
          </div>
        ) : (
          filteredAccounts.map(({ user, party, dealCount, hasActiveDeals, balance }) => {
            const isPasswordRevealed = revealedPasswords[user.id] || false;
            const isSelected = selectedUserForCreds?.id === user.id;

            return (
              <div
                key={user.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all shadow-lg space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Partner Identity */}
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-900 to-purple-900 border border-indigo-500/30 text-indigo-200 font-extrabold flex items-center justify-center text-lg shrink-0 shadow-inner">
                      {user.name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white">{user.name}</h3>
                        
                        {/* Approval Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                            user.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : user.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {user.status === 'APPROVED' ? 'Approved' : user.status === 'PENDING_APPROVAL' ? 'Pending Approval' : 'Rejected'}
                        </span>

                        {/* Party Category Badge */}
                        {party && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                            {party.partyType}
                          </span>
                        )}

                        {/* Deals Relation Badge */}
                        {hasActiveDeals ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <span>{dealCount} Active Deals with Admin</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700">
                            No Deals with Admin Yet
                          </span>
                        )}
                      </div>

                      {/* Contact Info Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-mono text-slate-300">{user.email}</span>
                        </div>
                        {party?.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{party.phone}</span>
                          </div>
                        )}
                        {party?.address && (
                          <div className="flex items-center space-x-1 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{party.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Net Running Position (if deals exist) */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    {hasActiveDeals ? (
                      <div className="text-left lg:text-right">
                        <div className="text-[11px] text-slate-400 font-medium">Net Running Position</div>
                        <div
                          className={`text-base font-extrabold ${
                            balance > 0 ? 'text-rose-400' : balance < 0 ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          PKR {Math.abs(balance).toLocaleString()}
                        </div>
                        <div className="text-[10px] font-semibold">
                          {balance > 0 ? (
                            <span className="text-rose-400">Payable to Partner</span>
                          ) : balance < 0 ? (
                            <span className="text-emerald-400">Receivable from Partner</span>
                          ) : (
                            <span className="text-slate-400">Settled (Zero)</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-left lg:text-right">
                        <div className="text-[11px] text-slate-400 font-medium">Admin Balance</div>
                        <div className="text-xs font-semibold text-slate-400">PKR 0 (No transactions)</div>
                        <span className="text-[10px] text-slate-400">Ready for initial deal</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (isSelected) {
                            setSelectedUserForCreds(null);
                          } else {
                            setSelectedUserForCreds(user);
                            setEditPasswordInput(user.password || '');
                            setIsEditingPassword(false);
                            setStatusMsg(null);
                          }
                        }}
                        className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-indigo-500/30'
                        }`}
                        title="View / Edit Login Credentials"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Credentials</span>
                      </button>

                      {party && (
                        <button
                          onClick={() => onSelectParty(party)}
                          className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-xs font-bold rounded-xl border border-indigo-500/40 transition-all"
                          title="Open Passbook Ledger"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Passbook</span>
                        </button>
                      )}

                      {user.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => onApproveUser(user.id, 'APPROVED')}
                          className="flex items-center space-x-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                          title="Approve Partner"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteUser(user.id, user.name, user.partyId);
                        }}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                        title="Delete Partner Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Credentials Drawer */}
                {isSelected && (
                  <div className="mt-3 p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Partner Login Credentials & Access Details
                        </h4>
                      </div>
                      <button
                        onClick={() => copyFullCredentials(user)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
                      >
                        {copiedKey === `full-${user.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied Invite!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy All Credentials</span>
                          </>
                        )}
                      </button>
                    </div>

                    {statusMsg && (
                      <div
                        className={`text-xs p-2.5 rounded-xl border ${
                          statusMsg.type === 'success'
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        {statusMsg.text}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Portal URL */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Portal URL</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-slate-200 font-mono truncate text-[11px]">
                            {typeof window !== 'undefined' ? window.location.origin : 'https://hisab-ledger.vercel.app'}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                typeof window !== 'undefined' ? window.location.origin : 'https://hisab-ledger.vercel.app',
                                `url-${user.id}`
                              )
                            }
                            className="p-1 text-slate-400 hover:text-indigo-400 ml-2"
                            title="Copy URL"
                          >
                            {copiedKey === `url-${user.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Login Email */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Login Email</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-slate-200 font-mono truncate text-[11px]">{user.email}</span>
                          <button
                            onClick={() => copyToClipboard(user.email, `email-${user.id}`)}
                            className="p-1 text-slate-400 hover:text-indigo-400 ml-2"
                            title="Copy Email"
                          >
                            {copiedKey === `email-${user.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Password</span>
                          <button
                            onClick={() => setIsEditingPassword(!isEditingPassword)}
                            className="text-[10px] text-indigo-400 hover:underline flex items-center space-x-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>{isEditingPassword ? 'Cancel' : 'Change'}</span>
                          </button>
                        </div>

                        {isEditingPassword ? (
                          <div className="flex items-center space-x-2 mt-1.5">
                            <input
                              type="text"
                              value={editPasswordInput}
                              onChange={(e) => setEditPasswordInput(e.target.value)}
                              placeholder="New password..."
                              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white w-full font-mono focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={handleSavePassword}
                              disabled={isSavingCreds}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-white font-mono text-[11px]">
                              {isPasswordRevealed ? user.password || 'partner123' : '••••••••••••'}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => togglePasswordVisibility(user.id)}
                                className="p-1 text-slate-400 hover:text-white"
                                title={isPasswordRevealed ? 'Hide Password' : 'Show Password'}
                              >
                                {isPasswordRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => copyToClipboard(user.password || 'partner123', `pw-${user.id}`)}
                                className="p-1 text-slate-400 hover:text-indigo-400"
                                title="Copy Password"
                              >
                                {copiedKey === `pw-${user.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
