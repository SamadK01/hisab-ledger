'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  ShieldCheck,
  Check,
  Ban,
  Clock,
  UserCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Copy,
  KeyRound,
  Trash2,
  Edit2,
  TrendingDown,
  TrendingUp,
  Search,
  CheckCircle2,
  UserPlus,
  RefreshCw,
  Building,
} from 'lucide-react';
import { calculatePartyBalance } from '@/lib/store';
import { Party } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

interface PartnerManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  onDataChanged: () => void;
}

export const PartnerManagementModal: React.FC<PartnerManagementModalProps> = ({
  isOpen,
  onClose,
  parties,
  onDataChanged,
}) => {
  const { t, isHinglish, isUrdu } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  
  // Password visibility map (userId -> boolean)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Edit / Create Partner Modal state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState<boolean>(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editStatus, setEditStatus] = useState<'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED'>('APPROVED');
  const [editPartyId, setEditPartyId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        // Filter partners only
        setUsers(data.filter((u: any) => u.role === 'PARTNER'));
      }
    } catch (e) {
      console.error('Fetch users error:', e);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStatusChange = async (userId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/auth/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      if (res.ok) {
        setFeedbackMsg({ text: `Partner status updated to ${newStatus}`, type: 'success' });
        await fetchUsers();
        onDataChanged();
      }
    } catch (e) {
      setFeedbackMsg({ text: 'Failed to update partner status', type: 'error' });
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
  };

  const executeDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);

    try {
      const res = await fetch(`/api/users?userId=${userToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedbackMsg({ text: `Partner account "${userToDelete.name}" deleted permanently`, type: 'success' });
        setUserToDelete(null);
        await fetchUsers();
        onDataChanged();
      } else {
        setFeedbackMsg({ text: 'Failed to delete partner account', type: 'error' });
      }
    } catch (e) {
      setFeedbackMsg({ text: 'Failed to delete partner account', type: 'error' });
    } finally {
      setIsDeletingUser(false);
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword(user.password || '');
    setEditStatus(user.status);
    setEditPartyId(user.partyId || '');
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editName.trim(),
          email: editEmail.trim(),
          password: editPassword.trim(),
          status: editStatus,
          partyId: editPartyId || null,
        }),
      });

      if (res.ok) {
        setFeedbackMsg({ text: 'Partner credentials updated successfully!', type: 'success' });
        setEditingUser(null);
        await fetchUsers();
        onDataChanged();
      } else {
        const err = await res.json();
        setFeedbackMsg({ text: err.message || 'Failed to update partner credentials', type: 'error' });
      }
    } catch (e) {
      setFeedbackMsg({ text: 'Failed to update partner credentials', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.party?.name && u.party.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'APPROVED') return u.status === 'APPROVED';
    if (statusFilter === 'PENDING') return u.status === 'PENDING_APPROVAL';
    if (statusFilter === 'REJECTED') return u.status === 'REJECTED';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Partner Management & Access Credentials
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Master Admin directory: View, edit, reveal passwords, and manage all partner access.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mx-6 mt-4 p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 bg-slate-950/40">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search partner by name, email, or linked business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {(
              [
                { id: 'ALL', label: `All (${users.length})` },
                { id: 'APPROVED', label: `Approved (${users.filter((u) => u.status === 'APPROVED').length})` },
                { id: 'PENDING', label: `Pending (${users.filter((u) => u.status === 'PENDING_APPROVAL').length})` },
                { id: 'REJECTED', label: `Rejected (${users.filter((u) => u.status === 'REJECTED').length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={fetchUsers}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Partners List Container */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-3.5">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading partner directory...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-3xl border border-slate-800/80 p-6">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Partners Found</h4>
              <p className="text-xs text-slate-400 mt-1">
                No partner accounts match your active search or status filter.
              </p>
            </div>
          ) : (
            filteredUsers.map((pUser) => {
              // Calculate live outstanding balance if linked to a party with transactions
              let balanceDisplay: React.ReactNode = null;
              if (pUser.party) {
                const bal = calculatePartyBalance(pUser.party, pUser.party.transactions || []);
                if (bal > 0) {
                  balanceDisplay = (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>PKR {bal.toLocaleString()} Payable (We Owe)</span>
                    </span>
                  );
                } else if (bal < 0) {
                  balanceDisplay = (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>PKR {Math.abs(bal).toLocaleString()} Receivable (They Owe)</span>
                    </span>
                  );
                } else {
                  balanceDisplay = (
                    <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                      Settled (Zero Balance)
                    </span>
                  );
                }
              } else {
                balanceDisplay = (
                  <span className="text-xs font-semibold text-slate-500 italic">
                    Unlinked (No Ledger Attached)
                  </span>
                );
              }

              const isPasswordVisible = Boolean(revealedPasswords[pUser.id]);

              return (
                <div
                  key={pUser.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Column: Profile Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">{pUser.name}</h3>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          pUser.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : pUser.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {pUser.status}
                      </span>
                      {pUser.party && (
                        <span className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md font-mono border border-slate-800">
                          {pUser.party.partyType}
                        </span>
                      )}
                    </div>

                    {/* Linked Business & Outstanding Balance */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-400">Linked Business:</span>
                      <span className="font-bold text-slate-200">
                        {pUser.party ? pUser.party.name : 'None'}
                      </span>
                      <span className="text-slate-600">•</span>
                      {balanceDisplay}
                    </div>

                    {/* Credentials Panel (Email & Revealed Password) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-w-xl">
                      {/* Email pill */}
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300">
                        <div className="flex items-center space-x-2 truncate mr-2">
                          <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{pUser.email}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(pUser.email, `email-${pUser.id}`)}
                          className="text-slate-400 hover:text-white shrink-0 p-1"
                          title="Copy Email"
                        >
                          {copiedKey === `email-${pUser.id}` ? (
                            <span className="text-[10px] text-emerald-400 font-sans font-bold">Copied!</span>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Password pill with Reveal Toggle */}
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300">
                        <div className="flex items-center space-x-2 truncate mr-2">
                          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">
                            {isPasswordVisible ? pUser.password || 'N/A' : '••••••••••••'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => togglePasswordVisibility(pUser.id)}
                            className="text-slate-400 hover:text-white p-1"
                            title={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          {pUser.password && (
                            <button
                              onClick={() => copyToClipboard(pUser.password, `pass-${pUser.id}`)}
                              className="text-slate-400 hover:text-white p-1"
                              title="Copy Password"
                            >
                              {copiedKey === `pass-${pUser.id}` ? (
                                <span className="text-[10px] text-emerald-400 font-sans font-bold">Copied!</span>
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    {pUser.status === 'PENDING_APPROVAL' && (
                      <div className="flex items-center space-x-1.5 w-full md:w-auto">
                        <button
                          onClick={() => handleStatusChange(pUser.id, 'APPROVED')}
                          className="flex items-center space-x-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(pUser.id, 'REJECTED')}
                          className="flex items-center space-x-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 font-bold text-xs border border-slate-700 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(pUser)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold transition-colors"
                        title="Edit Partner Profile & Password"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Credentials</span>
                      </button>

                      <button
                        onClick={() => handleDeleteUser(pUser.id, pUser.name)}
                        className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Delete Partner Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Partner Credentials Sub-Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <Edit2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Edit Partner Credentials</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Partner / Business Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Login Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Access Password
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Set new access password"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Password is visible to Master Admin for customer support and recovery.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING_APPROVAL">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Linked Party Ledger</label>
                  <select
                    value={editPartyId}
                    onChange={(e) => setEditPartyId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="">None (Unlinked)</option>
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSaving ? 'Saving Changes...' : 'Save Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Partner Account Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={userToDelete !== null}
        title={`Delete Account "${userToDelete?.name}"?`}
        message="Are you sure you want to permanently delete this partner account? The user will no longer be able to log in to the Partner Portal."
        confirmLabel="Delete Partner Account"
        isDeleting={isDeletingUser}
        onConfirm={executeDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
