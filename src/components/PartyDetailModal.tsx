'use client';

import React, { useState, useEffect } from 'react';
import { Party, Transaction, User } from '@/lib/types';
import { calculatePartyBalance } from '@/lib/store';
import { exportPartyLedgerPDF } from '@/lib/pdf-generator';
import { DirectMessagingBox } from './DirectMessagingBox';
import {
  X,
  FileText,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  DollarSign,
  MessageSquare,
  Trash2,
  Image as ImageIcon,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Ban,
  Lock,
  Edit2,
  Mail,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

interface PartyDetailModalProps {
  party: Party | null;
  transactions: Transaction[];
  currentUser: User | null;
  hinglishMode?: boolean;
  onClose: () => void;
  onOpenTransaction: (party: Party, type: 'PURCHASE' | 'SALE' | 'PAYMENT_GIVEN' | 'PAYMENT_RECEIVED') => void;
  onDeleteParty?: (partyId: string, partyName: string) => void;
  onDeleteTransaction?: (txId: string) => void;
  users?: any[];
  onUserCredentialsUpdated?: () => void;
}

export const PartyDetailModal: React.FC<PartyDetailModalProps> = ({
  party,
  transactions,
  currentUser,
  hinglishMode = false,
  onClose,
  onOpenTransaction,
  onDeleteParty,
  onDeleteTransaction,
  users: initialUsers = [],
  onUserCredentialsUpdated,
}) => {
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [showMessaging, setShowMessaging] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Credentials section state
  const [showCredentials, setShowCredentials] = useState<boolean>(true);
  const [isPasswordRevealed, setIsPasswordRevealed] = useState<boolean>(false);
  const [isEditingPassword, setIsEditingPassword] = useState<boolean>(false);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Quick provision state for unlinked party
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);
  const [newAccountEmail, setNewAccountEmail] = useState<string>('');
  const [newAccountPassword, setNewAccountPassword] = useState<string>('partner123');

  // Local users list in case parent did not pass
  const [usersList, setUsersList] = useState<any[]>(initialUsers);

  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      setUsersList(initialUsers);
    } else if (party) {
      fetchUsers();
    }
  }, [initialUsers, party]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
      console.error('Fetch users error in PartyDetailModal:', e);
    }
  };

  if (!party) return null;

  const isAdmin = currentUser?.role === 'ADMIN';

  // Find linked user for this party
  const linkedUser =
    usersList.find((u) => u.partyId === party.id) ||
    usersList.find((u) => party.email && u.email?.toLowerCase() === party.email.toLowerCase()) ||
    (party.users && party.users.length > 0 ? party.users[0] : null);

  const partyTxs = transactions
    .filter((t) => t.partyId === party.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentBal = calculatePartyBalance(party, transactions);

  const toggleExpand = (id: string) => {
    setExpandedTxId(expandedTxId === id ? null : id);
  };

  const copyToClipboard = (text: string, keyId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleCopyAllCredentials = () => {
    if (!linkedUser) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hisab-ledger.vercel.app';
    const text = `HisabPro Partner Portal Login:\nURL: ${origin}\nEmail: ${linkedUser.email}\nPassword: ${linkedUser.password || 'partner123'}\nStatus: ${linkedUser.status}`;
    copyToClipboard(text, 'all-credentials');
  };

  const handleSavePassword = async () => {
    if (!linkedUser || !newPasswordInput.trim()) return;
    setIsSavingPassword(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: linkedUser.id,
          password: newPasswordInput.trim(),
        }),
      });
      if (res.ok) {
        setFeedbackMessage({ text: 'Password updated successfully!', type: 'success' });
        linkedUser.password = newPasswordInput.trim();
        setIsEditingPassword(false);
        if (onUserCredentialsUpdated) onUserCredentialsUpdated();
      } else {
        const data = await res.json().catch(() => ({}));
        setFeedbackMessage({ text: data.message || 'Failed to update password', type: 'error' });
      }
    } catch {
      setFeedbackMessage({ text: 'Failed to update password', type: 'error' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCreatePartnerAccount = async () => {
    const cleanEmail = (newAccountEmail || party.email || `${party.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@partner.com`).trim().toLowerCase();
    const cleanPassword = (newAccountPassword || 'partner123').trim();

    setIsSavingPassword(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: party.name,
          email: cleanEmail,
          password: cleanPassword,
          role: 'PARTNER',
          status: 'APPROVED',
          partyId: party.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbackMessage({ text: 'Partner portal login created & approved!', type: 'success' });
        setIsCreatingAccount(false);
        await fetchUsers();
        if (onUserCredentialsUpdated) onUserCredentialsUpdated();
      } else {
        const data = await res.json().catch(() => ({}));
        setFeedbackMessage({ text: data.message || 'Failed to create partner account', type: 'error' });
      }
    } catch {
      setFeedbackMessage({ text: 'Failed to create partner account', type: 'error' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {party.partyType} Account
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {party.id.slice(0, 8)}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{party.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
              {party.phone && (
                <div className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{party.phone}</span>
                </div>
              )}
              {party.address && (
                <div className="flex items-center space-x-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{party.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Master Admin Delete Button */}
            {isAdmin && onDeleteParty && (
              <button
                onClick={() => {
                  onDeleteParty(party.id, party.name);
                  onClose();
                }}
                className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                title="Delete Party & Associated Ledger Records"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Scroll Container */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
          {/* Current Net Balance Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Current Net Balance Position
                </span>
                <div className="mt-1 flex items-baseline space-x-3">
                  <div
                    className={`text-2xl sm:text-3xl font-black ${
                      currentBal > 0 ? 'text-rose-400' : currentBal < 0 ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    PKR {Math.abs(currentBal).toLocaleString()}
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      currentBal > 0
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        : currentBal < 0
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {currentBal > 0
                      ? 'PAYABLE TO SUPPLIER'
                      : currentBal < 0
                      ? 'RECEIVABLE FROM CUSTOMER'
                      : 'SETTLED (ZERO)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMessaging(!showMessaging)}
                  className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border transition-all ${
                    showMessaging
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-indigo-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{showMessaging ? 'Hide Messages' : 'Direct Messages'}</span>
                </button>

                <button
                  onClick={() => exportPartyLedgerPDF(party, transactions)}
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Passbook</span>
                </button>
              </div>
            </div>

            {/* Quick Action Buttons (Master Admin Only) */}
            {currentUser?.role === 'ADMIN' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                <button
                  onClick={() => onOpenTransaction(party, 'PURCHASE')}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-all"
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  <span>+ Purchase Deal</span>
                </button>

                <button
                  onClick={() => onOpenTransaction(party, 'SALE')}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-all"
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-400" />
                  <span>+ Sale Deal</span>
                </button>

                <button
                  onClick={() => onOpenTransaction(party, 'PAYMENT_GIVEN')}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-200 text-xs font-bold border border-rose-500/30 transition-all"
                >
                  <DollarSign className="w-4 h-4 text-rose-400" />
                  <span>+ Pay Cash</span>
                </button>

                <button
                  onClick={() => onOpenTransaction(party, 'PAYMENT_RECEIVED')}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-200 text-xs font-bold border border-emerald-500/30 transition-all"
                >
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>+ Collect Cash</span>
                </button>
              </div>
            )}
          </div>

          {/* REQUIREMENT 3: Master Admin Credentials Access - Partner Portal Credentials Panel */}
          {isAdmin && (
            <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 border border-indigo-500/30 p-4 space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Partner Portal Credentials
                      </h4>
                      {linkedUser ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            linkedUser.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : linkedUser.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {linkedUser.status === 'APPROVED' ? 'Approved' : linkedUser.status === 'PENDING_APPROVAL' ? 'Pending Approval' : 'Rejected'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          No Portal Account
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {linkedUser
                        ? `Linked Email: ${linkedUser.email}`
                        : 'No portal account linked for this partner yet.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {linkedUser ? (
                    <>
                      <button
                        onClick={handleCopyAllCredentials}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                        title="Copy Login URL, Email & Password"
                      >
                        {copiedKey === 'all-credentials' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Credentials</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setShowCredentials(!showCredentials)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-all"
                      >
                        <span>{showCredentials ? 'Hide Details' : 'Show / Reset Password'}</span>
                        {showCredentials ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsCreatingAccount(!isCreatingAccount)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isCreatingAccount ? 'Cancel' : 'Create Portal Account'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback Alert */}
              {feedbackMessage && (
                <div
                  className={`text-xs p-2.5 rounded-xl border ${
                    feedbackMessage.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {feedbackMessage.text}
                </div>
              )}

              {/* View / Edit Credentials Section */}
              {linkedUser && showCredentials && (
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
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
                              'modal-url'
                            )
                          }
                          className="p-1 text-slate-400 hover:text-indigo-400 ml-1"
                          title="Copy URL"
                        >
                          {copiedKey === 'modal-url' ? (
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
                        <span className="text-slate-200 font-mono truncate text-[11px]">{linkedUser.email}</span>
                        <button
                          onClick={() => copyToClipboard(linkedUser.email, 'modal-email')}
                          className="p-1 text-slate-400 hover:text-indigo-400 ml-1"
                          title="Copy Email"
                        >
                          {copiedKey === 'modal-email' ? (
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
                          onClick={() => {
                            setIsEditingPassword(!isEditingPassword);
                            setNewPasswordInput(linkedUser.password || 'partner123');
                          }}
                          className="text-[10px] text-indigo-400 hover:underline flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{isEditingPassword ? 'Cancel' : 'Reset Password'}</span>
                        </button>
                      </div>

                      {isEditingPassword ? (
                        <div className="flex items-center space-x-2 mt-1.5">
                          <input
                            type="text"
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="New password..."
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white w-full font-mono focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={handleSavePassword}
                            disabled={isSavingPassword}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-white font-mono text-[11px]">
                            {isPasswordRevealed ? linkedUser.password || 'partner123' : '••••••••••••'}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setIsPasswordRevealed(!isPasswordRevealed)}
                              className="p-1 text-slate-400 hover:text-white"
                              title={isPasswordRevealed ? 'Hide Password' : 'Show Password'}
                            >
                              {isPasswordRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(linkedUser.password || 'partner123', 'modal-pw')}
                              className="p-1 text-slate-400 hover:text-indigo-400"
                              title="Copy Password"
                            >
                              {copiedKey === 'modal-pw' ? (
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

              {/* Provision Form for Unlinked Party */}
              {!linkedUser && isCreatingAccount && (
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <p className="text-xs text-slate-300">
                    Provision login credentials for <strong>{party.name}</strong> so they can log into the partner portal.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">Login Email</label>
                      <input
                        type="email"
                        value={newAccountEmail}
                        onChange={(e) => setNewAccountEmail(e.target.value)}
                        placeholder={party.email || `${party.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@partner.com`}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">Password</label>
                      <input
                        type="text"
                        value={newAccountPassword}
                        onChange={(e) => setNewAccountPassword(e.target.value)}
                        placeholder="partner123"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleCreatePartnerAccount}
                      disabled={isSavingPassword}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                      Create Portal Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 1-to-1 Direct Messaging Box */}
          {showMessaging && currentUser && (
            <DirectMessagingBox party={party} currentUser={currentUser} hinglishMode={hinglishMode} />
          )}

          {/* Transaction History Timeline Passbook */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Complete Ledger Statement & Deals History
            </h3>

            {partyTxs.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">
                  No transactions recorded yet with this party.
                </p>
              </div>
            ) : (
              partyTxs.map((tx) => {
                const isExpanded = expandedTxId === tx.id;

                return (
                  <div
                    key={tx.id}
                    className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-4 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(tx.id)}>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                            tx.type === 'PURCHASE'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : tx.type === 'SALE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : tx.type === 'PAYMENT_GIVEN'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {tx.type === 'PURCHASE'
                            ? 'BUY'
                            : tx.type === 'SALE'
                            ? 'SELL'
                            : tx.type === 'PAYMENT_GIVEN'
                            ? 'PAID'
                            : 'RCVD'}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white">
                              {tx.type === 'PURCHASE'
                                ? 'Purchase Deal'
                                : tx.type === 'SALE'
                                ? 'Sale Deal'
                                : tx.type === 'PAYMENT_GIVEN'
                                ? 'Cash Payment (Given)'
                                : 'Cash Collection (Received)'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{tx.invoiceNo || tx.id.slice(0, 6)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{new Date(tx.date).toLocaleDateString()}</span>
                            </span>
                            <span>•</span>
                            <span className="capitalize">{tx.paymentMode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-black text-white">PKR {tx.totalAmount.toLocaleString()}</div>
                          <div className="text-[11px] text-slate-400">
                            Paid: PKR {tx.cashPaid.toLocaleString()}
                            {tx.remainingBalance > 0 && (
                              <span className="text-rose-400 font-bold ml-1">
                                (Due: PKR {tx.remainingBalance.toLocaleString()})
                              </span>
                            )}
                          </div>
                        </div>

                        {isAdmin && onDeleteTransaction && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this transaction record?')) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button className="text-slate-400 hover:text-white p-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Details */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-700/60 space-y-3 text-xs animate-in fade-in duration-200">
                        {tx.notes && (
                          <div className="p-2.5 rounded-xl bg-slate-900/60 text-slate-300 border border-slate-800">
                            <span className="text-slate-400 font-medium">Notes: </span>
                            {tx.notes}
                          </div>
                        )}

                        {tx.items && tx.items.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                              Items Breakdown:
                            </div>
                            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
                              {tx.items.map((item, idx) => (
                                <div key={idx} className="p-2.5 flex items-center justify-between text-slate-300">
                                  <div>
                                    <div className="font-bold text-white">{item.productName}</div>
                                    <div className="text-[11px] text-slate-400">
                                      {item.quantity} {item.unit} @ PKR {item.rate}
                                      {Boolean(item.costPrice && item.costPrice > 0) && ` (Cost: PKR ${item.costPrice})`}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-black text-white">PKR {item.subtotal.toLocaleString()}</div>
                                    {item.expectedProfit && item.expectedProfit > 0 ? (
                                      <div className="text-[10px] text-emerald-400 font-semibold">
                                        Profit: +PKR {item.expectedProfit.toLocaleString()}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {tx.receiptImage && (
                          <div>
                            <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                              Receipt Photo:
                            </div>
                            <img
                              src={tx.receiptImage}
                              alt="Receipt"
                              onClick={() => setPreviewImage(tx.receiptImage || null)}
                              className="h-20 w-32 object-cover rounded-xl border border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={previewImage} alt="Receipt full" className="max-h-[90vh] max-w-full rounded-2xl object-contain" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
