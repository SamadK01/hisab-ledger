import React, { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { X, ShieldCheck, Check, Ban, Clock, UserCheck, Mail, Copy, KeyRound } from 'lucide-react';

interface PartnerApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hinglishMode: boolean;
  onApprovalChanged: () => void;
}

export const PartnerApprovalsModal: React.FC<PartnerApprovalsModalProps> = ({
  isOpen,
  onClose,
  hinglishMode,
  onApprovalChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL_PARTNERS'>('PENDING');
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchApprovalsAndUsers();
    }
  }, [isOpen]);

  const fetchApprovalsAndUsers = async () => {
    setLoading(true);
    try {
      const pRes = await fetch('/api/auth/approval');
      if (pRes.ok) {
        const pData = await pRes.json();
        setPendingUsers(pData);
      }

      const uRes = await fetch('/api/users');
      if (uRes.ok) {
        const uData = await uRes.json();
        setAllUsers(uData.filter((u: any) => u.role === 'PARTNER'));
      }
    } catch (e) {
      console.error('Fetch approvals error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, actionStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/auth/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: actionStatus }),
      });

      if (res.ok) {
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
        fetchApprovalsAndUsers();
        onApprovalChanged();
      }
    } catch (e) {
      console.error('Approval action error:', e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold border border-amber-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {hinglishMode ? 'Partner Accounts & Credentials' : 'Partner Management & Login Directory'}
              </h2>
              <p className="text-xs text-slate-400">
                Review pending requests and manage partner login credentials.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4 flex space-x-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`py-2 px-4 text-xs font-extrabold rounded-xl transition-all ${
              activeTab === 'PENDING'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Pending Approvals ({pendingUsers.length})
          </button>

          <button
            onClick={() => setActiveTab('ALL_PARTNERS')}
            className={`py-2 px-4 text-xs font-extrabold rounded-xl transition-all ${
              activeTab === 'ALL_PARTNERS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All Partner Credentials Directory ({allUsers.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-xs">Loading partner data...</div>
          ) : activeTab === 'PENDING' ? (
            pendingUsers.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/50 rounded-2xl border border-slate-800">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">
                  {hinglishMode ? 'Koi pending request nahi hai' : 'No Pending Approvals'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  All partner registration requests have been reviewed and approved.
                </p>
              </div>
            ) : (
              pendingUsers.map((pUser) => (
                <div
                  key={pUser.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white">{pUser.name}</h3>
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                        PENDING
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-indigo-300 font-mono mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{pUser.email}</span>
                    </div>
                    {pUser.party && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Type: {pUser.party.partyType} • Phone: {pUser.party.phone || 'N/A'} • Address: {pUser.party.address || 'N/A'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleAction(pUser.id, 'APPROVED')}
                      className="flex items-center space-x-1 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleAction(pUser.id, 'REJECTED')}
                      className="flex items-center space-x-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 font-bold text-xs border border-slate-700 transition-colors"
                    >
                      <Ban className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            /* ALL PARTNER CREDENTIALS TAB */
            allUsers.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/50 rounded-2xl border border-slate-800 text-xs text-slate-400">
                No partner accounts registered yet.
              </div>
            ) : (
              allUsers.map((pUser) => (
                <div
                  key={pUser.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white">{pUser.name}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          pUser.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {pUser.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono text-indigo-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 w-fit">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Login Email: {pUser.email}</span>
                      <button
                        onClick={() => copyToClipboard(pUser.email, pUser.id)}
                        className="text-slate-400 hover:text-white pl-1"
                        title="Copy Email"
                      >
                        {copiedId === pUser.id ? (
                          <span className="text-[10px] text-emerald-400 font-sans font-bold">Copied!</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {pUser.party && (
                      <p className="text-[11px] text-slate-400">
                        Linked Party: <span className="text-white font-bold">{pUser.party.name}</span> ({pUser.party.partyType})
                      </p>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

