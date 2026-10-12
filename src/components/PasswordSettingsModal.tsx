'use client';

import React, { useState, useEffect } from 'react';
import { User, PasswordResetRequest } from '@/lib/types';
import {
  X,
  Lock,
  KeyRound,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
} from 'lucide-react';

interface PasswordSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  hinglishMode: boolean;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PasswordSettingsModal: React.FC<PasswordSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  hinglishMode,
  onToast,
}) => {
  const isAdmin = currentUser?.role === 'ADMIN';

  // Admin Change Own Password Fields
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  // Partner Request Reset Fields
  const [requestReason, setRequestReason] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  // Admin View Reset Requests
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);
  const [partnerNewPasswords, setPartnerNewPasswords] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchPasswordRequests();
    }
  }, [isOpen, isAdmin]);

  const fetchPasswordRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/password-request');
      if (res.ok) {
        const data = await res.json();
        setResetRequests(data);
      }
    } catch (e) {
      console.error('Fetch password requests error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (adminNewPassword !== adminConfirmPassword) {
      onToast(
        hinglishMode ? 'Naya password aur confirm password match nahi kar rahe!' : 'Passwords do not match!',
        'error'
      );
      return;
    }

    if (adminNewPassword.length < 4) {
      onToast(
        hinglishMode ? 'Password kam se kam 4 characters ka hona chahiye.' : 'Password must be at least 4 characters long.',
        'error'
      );
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          newPassword: adminNewPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onToast(
          hinglishMode
            ? 'Master Admin password kamyabi se update ho gaya!'
            : 'Master Admin password updated successfully!'
        );
        setAdminNewPassword('');
        setAdminConfirmPassword('');
        onClose();
      } else {
        onToast(data.message || 'Failed to update password', 'error');
      }
    } catch (err) {
      onToast('Error updating password', 'error');
    }
  };

  const handlePartnerRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const res = await fetch('/api/auth/password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          partyId: currentUser.partyId,
          reason: requestReason || 'Partner requested password update',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequestSent(true);
        onToast(
          hinglishMode
            ? 'Password Change Request Master Admin ko bhej di gayi hai!'
            : 'Password Change Request submitted to Master Admin!'
        );
      } else {
        onToast(data.message || 'Failed to submit request', 'error');
      }
    } catch {
      onToast('Failed to submit password reset request', 'error');
    }
  };

  const handleResolveRequest = async (requestItem: PasswordResetRequest) => {
    const newPass = partnerNewPasswords[requestItem.id];
    if (!newPass || newPass.trim().length < 4) {
      onToast('Please enter a valid new password for partner (min 4 chars).', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/password-request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: requestItem.id,
          targetUserId: requestItem.userId,
          newPassword: newPass.trim(),
          status: 'RESOLVED',
        }),
      });

      const data = await res.json();
      if (data.success) {
        onToast(`Password updated for ${requestItem.userName}!`);
        setResetRequests((prev) => prev.map((r) => (r.id === requestItem.id ? { ...r, status: 'RESOLVED' } : r)));
      } else {
        onToast(data.message || 'Failed to resolve request', 'error');
      }
    } catch {
      onToast('Error updating partner password', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold border border-indigo-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isAdmin
                  ? hinglishMode ? 'Master Admin Password & Security' : 'Admin Security & Password Control'
                  : hinglishMode ? 'Partner Security & Password' : 'Account Security Settings'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAdmin
                  ? 'Manage your own password and review partner password requests.'
                  : 'Role isolation & password change requests.'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Master Admin Section */}
          {isAdmin ? (
            <>
              {/* Change Master Admin Own Password */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>{hinglishMode ? 'Apna Master Admin Password Badlein' : 'Change Master Admin Password'}</span>
                </div>

                <form onSubmit={handleAdminPasswordChange} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {hinglishMode ? 'Naya Password *' : 'New Password *'}
                    </label>
                    <input
                      type="password"
                      value={adminNewPassword}
                      onChange={(e) => setAdminNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {hinglishMode ? 'Confirm Naya Password *' : 'Confirm New Password *'}
                    </label>
                    <input
                      type="password"
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{hinglishMode ? 'Admin Password Update Karein' : 'Update Admin Password'}</span>
                  </button>
                </form>
              </div>

              {/* Partner Password Reset Requests List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{hinglishMode ? 'Partner Password Reset Requests' : 'Partner Password Reset Requests'}</span>
                </h3>

                {loading ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Loading requests...</p>
                ) : resetRequests.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    No partner password reset requests currently pending.
                  </div>
                ) : (
                  resetRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white">{req.userName}</span>
                          <span className="text-[10px] text-slate-400 ml-2">({req.userEmail})</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      {req.reason && <p className="text-[11px] text-slate-400 italic">"{req.reason}"</p>}

                      {req.status === 'PENDING' && (
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="password"
                            placeholder="Enter new password for partner"
                            value={partnerNewPasswords[req.id] || ''}
                            onChange={(e) =>
                              setPartnerNewPasswords({ ...partnerNewPasswords, [req.id]: e.target.value })
                            }
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                          />
                          <button
                            onClick={() => handleResolveRequest(req)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all shrink-0"
                          >
                            Set Password
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Partner View Section */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">Logged in Partner:</span>
                  <span className="text-xs font-bold text-white">{currentUser?.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Email:</span>
                  <span>{currentUser?.email}</span>
                </div>
              </div>

              {/* Strict Role Policy Banner */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Strict Password Management Policy</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {hinglishMode
                    ? 'Security policies ke mutabiq Partners apna password khud tabdeel nahi kar saktay. Baraye meharbani niche button dabayein taake Master Admin dashboard par notification pohnch jaye.'
                    : 'Partners cannot change passwords directly. Click below to submit a formal Request Password Change to the Master Admin dashboard.'}
                </p>
              </div>

              {requestSent ? (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">
                    {hinglishMode ? 'Request Bhej Di Gayi Hai' : 'Request Submitted'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    Master Admin has been notified. They will update your password shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePartnerRequestSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {hinglishMode ? 'Wajah / Note (Optional)' : 'Reason / Request Note (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      placeholder="e.g. Need password reset for new shop manager"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {hinglishMode ? 'Request Password Change (Master Admin)' : 'Request Password Change'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
