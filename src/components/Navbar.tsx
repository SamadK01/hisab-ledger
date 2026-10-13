'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  RefreshCw,
  Globe,
  Plus,
  LogOut,
  UserCheck,
  ShieldCheck,
  KeyRound,
  ChevronDown,
  Check,
} from 'lucide-react';
import { User } from '@/lib/types';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/i18n';

interface NavbarProps {
  currentUser: User | null;
  pendingApprovalsCount?: number;
  pendingPasswordRequestsCount?: number;
  onOpenTransaction: (type: 'PURCHASE' | 'SALE' | 'PAYMENT_GIVEN' | 'PAYMENT_RECEIVED') => void;
  onOpenPartyModal: () => void;
  onOpenProductModal: () => void;
  onOpenPartnerManagementModal: () => void;
  onOpenPasswordModal: () => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  pendingApprovalsCount = 0,
  pendingPasswordRequestsCount = 0,
  onOpenTransaction,
  onOpenPartyModal,
  onOpenProductModal,
  onOpenPartnerManagementModal,
  onOpenPasswordModal,
  onResetData,
  onLogout,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Language Dropdown state
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                HisabPro
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full uppercase tracking-wider">
                {isAdmin ? 'Master Admin' : 'Partner Portal'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden xs:block">
              {t('appTagline', 'Multi-Party Financial Ledger & Inventory System')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Master Admin Partner Management & Credentials Panel */}
          {isAdmin && (
            <button
              onClick={onOpenPartnerManagementModal}
              className="relative flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-200 text-xs font-bold rounded-xl border border-indigo-500/40 shadow-sm transition-all cursor-pointer"
              title="Partner Management & Credentials"
            >
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Partner Credentials</span>
              {pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full animate-pulse ml-0.5">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          )}

          {/* Quick Transaction Deal (Master Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => onOpenTransaction('PURCHASE')}
              className="hidden lg:flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('newDeal', 'New Deal')}</span>
            </button>
          )}

          {/* i18n Language Dropdown Selector */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Select Display Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs">{currentLangOption.flag}</span>
              <span className="hidden sm:inline">{currentLangOption.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Select Language (i18n)
                </div>
                {SUPPORTED_LANGUAGES.map((langOption) => (
                  <button
                    key={langOption.code}
                    onClick={() => {
                      setLanguage(langOption.code);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                      language === langOption.code ? 'text-indigo-400 font-bold bg-indigo-950/30' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{langOption.flag}</span>
                      <span>{langOption.label}</span>
                    </div>
                    {language === langOption.code && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Demo Data Button (Master Admin Only) */}
          {isAdmin && (
            <button
              onClick={onResetData}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-xs font-medium rounded-xl border border-slate-700 hover:border-rose-500/30 transition-colors cursor-pointer"
              title="Seed / Reset Demo Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{t('navSeedData', 'Seed Data')}</span>
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
                id="logout-button"
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">{t('navLogout', 'Logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
