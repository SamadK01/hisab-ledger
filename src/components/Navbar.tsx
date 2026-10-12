'use client';

import React from 'react';
import { BookOpen, RefreshCw, Languages, Plus, LogOut, UserCheck, ShieldCheck, KeyRound } from 'lucide-react';
import { User } from '@/lib/types';

interface NavbarProps {
  currentUser: User | null;
  pendingApprovalsCount?: number;
  pendingPasswordRequestsCount?: number;
  hinglishMode: boolean;
  setHinglishMode: (val: boolean) => void;
  onOpenTransaction: (type: 'PURCHASE' | 'SALE' | 'PAYMENT_GIVEN' | 'PAYMENT_RECEIVED') => void;
  onOpenPartyModal: () => void;
  onOpenProductModal: () => void;
  onOpenApprovalsModal: () => void;
  onOpenPasswordModal: () => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  pendingApprovalsCount = 0,
  pendingPasswordRequestsCount = 0,
  hinglishMode,
  setHinglishMode,
  onOpenTransaction,
  onOpenPartyModal,
  onOpenProductModal,
  onOpenApprovalsModal,
  onOpenPasswordModal,
  onResetData,
  onLogout,
}) => {
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                HisabPro
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                {isAdmin ? 'Master Admin' : 'Partner Portal'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden xs:block">
              {hinglishMode ? 'Multi-Party Khaata & Stock Engine' : 'Multi-Party Inventory & Financial Ledger'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Security & Password Settings Button */}
          <button
            onClick={onOpenPasswordModal}
            className="relative flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors"
            title="Password & Security Settings"
          >
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">{isAdmin ? 'Security' : 'Password'}</span>
            {isAdmin && pendingPasswordRequestsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-purple-500 text-white font-black text-[10px] rounded-full animate-pulse">
                {pendingPasswordRequestsCount}
              </span>
            )}
          </button>

          {/* Admin Approval Button */}
          {isAdmin && (
            <button
              onClick={onOpenApprovalsModal}
              className="relative flex items-center space-x-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 transition-colors"
              title="Partner Approvals Panel"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Approvals</span>
              {pendingApprovalsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full animate-bounce">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          )}

          {/* Quick Len-Den Deal Button (Master Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => onOpenTransaction('PURCHASE')}
              className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{hinglishMode ? 'Naya Len-Den' : 'New Transaction'}</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setHinglishMode(!hinglishMode)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            title="Toggle Terminology (Roman Urdu vs English)"
          >
            <Languages className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">{hinglishMode ? 'Roman Urdu' : 'English'}</span>
          </button>

          {/* Reset Demo Data Button (Master Admin Only) */}
          {isAdmin && (
            <button
              onClick={onResetData}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-xs font-medium rounded-lg border border-slate-700 hover:border-rose-500/30 transition-colors"
              title="Seed / Reset Demo Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{hinglishMode ? 'Demo Data' : 'Seed Data'}</span>
            </button>
          )}

          {/* User Profile / Logout Button */}
          {currentUser && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-200">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{currentUser.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-lg border border-slate-700 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

