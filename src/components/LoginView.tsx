'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  UserCheck,
  Building,
  Phone,
  MapPin,
} from 'lucide-react';
import { DEFAULT_ADMIN_CREDENTIALS, DEFAULT_PARTNER_CREDENTIALS } from '@/lib/seed-data';
import { User, PartyType } from '@/lib/types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  hinglishMode: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, hinglishMode }) => {
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'PARTNER' | 'REGISTER'>('ADMIN');

  // Login Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Registration Form Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPartyType, setRegPartyType] = useState<PartyType>('BOTH');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const handleAutoFillAdmin = () => {
    setActiveTab('ADMIN');
    setEmail(DEFAULT_ADMIN_CREDENTIALS.email);
    setPassword(DEFAULT_ADMIN_CREDENTIALS.password);
    setErrorMsg(null);
  };

  const handleAutoFillPartner = (idx: number) => {
    setActiveTab('PARTNER');
    const p = DEFAULT_PARTNER_CREDENTIALS[idx];
    setEmail(p.email);
    setPassword(p.password);
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.message || 'Ghalat email ya password credentials.');
      }
    } catch {
      // Offline / Client-side fallback check
      const normalized = email.trim().toLowerCase();
      if (
        normalized === DEFAULT_ADMIN_CREDENTIALS.email &&
        password.trim() === DEFAULT_ADMIN_CREDENTIALS.password
      ) {
        onLoginSuccess({
          id: 'user-admin-1',
          name: 'Master Business Admin',
          email: DEFAULT_ADMIN_CREDENTIALS.email,
          role: 'ADMIN',
          status: 'APPROVED',
        });
        return;
      }

      const pMatch = DEFAULT_PARTNER_CREDENTIALS.find(
        (p) => p.email.toLowerCase() === normalized && p.password === password.trim()
      );

      if (pMatch) {
        onLoginSuccess({
          id: `user-${pMatch.partyId}`,
          name: pMatch.name,
          email: pMatch.email,
          role: 'PARTNER',
          status: 'APPROVED',
          partyId: pMatch.partyId,
        });
        return;
      }

      setErrorMsg('Invalid login credentials!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          partyType: regPartyType,
          phone: regPhone,
          address: regAddress,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setSuccessMsg('Registration submitted! Your account status is PENDING_APPROVAL. Master Admin will approve your account.');
      } else {
        setErrorMsg(data.message || 'Failed to complete registration.');
      }
    } catch (err) {
      setErrorMsg('An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30 text-white mb-2">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">HisabPro</h1>
          <p className="text-xs text-slate-400 font-medium">
            {hinglishMode
              ? 'Multi-Party Inventory & Partner Portal Ledger'
              : 'Multi-Party Inventory & Partner Data Isolation'}
          </p>
        </div>

        {/* Role & Signup Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            onClick={() => {
              setActiveTab('ADMIN');
              setErrorMsg(null);
            }}
            className={`py-2 text-[11px] font-extrabold rounded-xl transition-all ${
              activeTab === 'ADMIN' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Master Admin
          </button>

          <button
            onClick={() => {
              setActiveTab('PARTNER');
              setErrorMsg(null);
            }}
            className={`py-2 text-[11px] font-extrabold rounded-xl transition-all ${
              activeTab === 'PARTNER' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Partner Portal
          </button>

          <button
            onClick={() => {
              setActiveTab('REGISTER');
              setErrorMsg(null);
            }}
            className={`py-2 text-[11px] font-extrabold rounded-xl transition-all ${
              activeTab === 'REGISTER' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            + Partner Signup
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Quick Demo Credentials Buttons */}
          {(activeTab === 'ADMIN' || activeTab === 'PARTNER') && (
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>One-Tap Test Credentials:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleAutoFillAdmin}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 text-[11px] font-bold text-indigo-300 text-left transition-colors flex items-center justify-between"
                >
                  <span>🛡️ Master Admin</span>
                  <span className="text-[10px] text-slate-500 font-mono">admin123</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoFillPartner(0)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-[11px] font-bold text-slate-300 text-left transition-colors flex items-center justify-between"
                >
                  <span>⚡ Al-Madina (Supplier)</span>
                  <span className="text-[10px] text-slate-500 font-mono">partner123</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoFillPartner(1)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-[11px] font-bold text-slate-300 text-left transition-colors flex items-center justify-between sm:col-span-2"
                >
                  <span>⚡ Bismillah Super Mart (Customer)</span>
                  <span className="text-[10px] text-slate-500 font-mono">partner123</span>
                </button>
              </div>
            </div>
          )}


          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium text-center">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium text-center">
              {successMsg}
            </div>
          )}

          {/* Login Form (Admin or Partner) */}
          {(activeTab === 'ADMIN' || activeTab === 'PARTNER') && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {activeTab === 'ADMIN' ? 'Master Admin Email' : 'Partner Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'ADMIN' ? 'admin@hisabpro.com' : 'almadina@partner.com'}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>
                  {isLoading
                    ? 'Authenticating...'
                    : activeTab === 'ADMIN'
                    ? 'Master Admin Sign In'
                    : 'Partner Portal Sign In'}
                </span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* Partner Registration Form */}
          {activeTab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {hinglishMode ? 'Partner / Business Name *' : 'Partner Business Name *'}
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Al-Madina Chemical Wholesalers"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="partner@company.com"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Partner Type</label>
                  <select
                    value={regPartyType}
                    onChange={(e) => setRegPartyType(e.target.value as PartyType)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="SUPPLIER">Supplier (Vendor)</option>
                    <option value="CUSTOMER">Customer (Buyer)</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Business Address</label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Market Gate 2, Shop 14"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Creating Account...' : 'Register Partner Account'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500">
          HisabPro Ledger Engine • Data Privacy & Role Isolation
        </p>
      </div>
    </div>
  );
};
