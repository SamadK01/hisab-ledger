'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  Building,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { User, PartyType } from '@/lib/types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  hinglishMode: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, hinglishMode }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

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
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [regPartyType, setRegPartyType] = useState<PartyType>('BOTH');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.message || (hinglishMode ? 'Ghalat email ya password.' : 'Invalid email or password.'));
      }
    } catch {
      setErrorMsg(
        hinglishMode
          ? 'Server se rabta nahi ho saka. Barah-e-karam apna internet check karein.'
          : 'Failed to connect to authentication server. Please check your connection.'
      );
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
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword.trim(),
          partyType: regPartyType,
          phone: regPhone.trim() || undefined,
          address: regAddress.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(
          hinglishMode
            ? 'Aapki partner application jama ho gayi hai! Master Admin ki manzoori ke baad aap login kar sakenge.'
            : 'Application submitted successfully! Your account is pending Master Admin approval before you can sign in.'
        );
        // Reset registration fields
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegPhone('');
        setRegAddress('');
      } else {
        setErrorMsg(data.message || (hinglishMode ? 'Registration fail ho gayi.' : 'Failed to complete registration.'));
      }
    } catch {
      setErrorMsg(
        hinglishMode
          ? 'Registration ke dauran khata pesh aayi.'
          : 'An error occurred during registration. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25 text-white mb-1">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">HisabPro</h1>
          <p className="text-xs text-slate-400 font-medium">
            {hinglishMode
              ? 'Multi-Party Inventory & Financial Ledger Portal'
              : 'Multi-Party Inventory & Financial Ledger Portal'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-5">
          {/* Section Header */}
          <div className="text-center pb-1">
            <h2 className="text-lg font-bold text-white">
              {mode === 'LOGIN'
                ? hinglishMode
                  ? 'Apne Account Mein Dakhil Hon'
                  : 'Sign In to Your Account'
                : hinglishMode
                ? 'Nayi Partner Application'
                : 'Apply for Partner Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'LOGIN'
                ? hinglishMode
                  ? 'Master Admin ya Partner credentials enter karein'
                  : 'Enter your credentials to access your dashboard'
                : hinglishMode
                ? 'Master Admin ki verification ke liye maloomat darj karein'
                : 'Submit your business details for Master Admin authorization'}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Unified Login Form */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {hinglishMode ? 'Email Address' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {hinglishMode ? 'Password' : 'Password'}
                </label>
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <span>
                  {isLoading
                    ? hinglishMode
                      ? 'Dakhil ho rahe hain...'
                      : 'Signing In...'
                    : hinglishMode
                    ? 'Sign In Karein'
                    : 'Sign In'}
                </span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="pt-4 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-400">
                  {hinglishMode ? 'Naya Partner Account chahiye?' : 'Need a Partner Account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('REGISTER');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold underline transition-colors cursor-pointer ml-1"
                  >
                    {hinglishMode ? 'Apply for Signup' : 'Apply for Signup'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Partner Registration Form */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {hinglishMode ? 'Partner / Karobar Ka Naam *' : 'Partner Business Name *'}
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Al-Madina Chemical Wholesalers"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="partner@company.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Partner Type</label>
                  <select
                    value={regPartyType}
                    onChange={(e) => setRegPartyType(e.target.value as PartyType)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SUPPLIER">Supplier (Vendor)</option>
                    <option value="CUSTOMER">Customer (Buyer)</option>
                    <option value="BOTH">Both (Supplier & Customer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+92 300 0000000"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Business Address</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Market Gate 2, Shop #14"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-300 leading-relaxed">
                ℹ️ <strong>Approval Workflow:</strong> Application will be marked as{' '}
                <span className="font-mono text-amber-300 font-bold">PENDING_APPROVAL</span>. Master Admin will verify and activate your account.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Submitting Application...' : 'Apply for Partner Account'}</span>
              </button>

              <div className="pt-4 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-400">
                  {hinglishMode ? 'Pehle se account hai?' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('LOGIN');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold underline transition-colors cursor-pointer ml-1"
                  >
                    {hinglishMode ? 'Sign In Karein' : 'Sign In'}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500 font-medium">
          HisabPro Enterprise Ledger • Strict Role & Partner Data Isolation
        </p>
      </div>
    </div>
  );
};
