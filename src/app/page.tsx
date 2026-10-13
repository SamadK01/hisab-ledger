'use client';

import React, { useState, useEffect } from 'react';
import { Party, Product, Transaction, DashboardStats, TransactionType, User } from '@/lib/types';
import {
  LocalStoreManager,
  calculateDashboardStats,
} from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { BottomNav, TabType } from '@/components/BottomNav';
import { DashboardView } from '@/components/DashboardView';
import { PartiesView } from '@/components/PartiesView';
import { PartyDetailModal } from '@/components/PartyDetailModal';
import { ProductsView } from '@/components/ProductsView';
import { TransactionModal } from '@/components/TransactionModal';
import { PaymentModal } from '@/components/PaymentModal';
import { PartyModal } from '@/components/PartyModal';
import { ProductModal } from '@/components/ProductModal';
import { ReportsView } from '@/components/ReportsView';
import { NotificationToast } from '@/components/NotificationToast';
import { LoginView } from '@/components/LoginView';
import { PartnerApprovalsModal } from '@/components/PartnerApprovalsModal';
import { PasswordSettingsModal } from '@/components/PasswordSettingsModal';
import { PartnerManagementModal } from '@/components/PartnerManagementModal';
import { PartnersPortalView } from '@/components/PartnersPortalView';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { useLanguage } from '@/lib/i18n';
import { Trash2 } from 'lucide-react';

// Per-tab isolated session storage key
const SESSION_TAB_KEY = 'hisab_session_tab_v1';

export default function Home() {
  const { language, setLanguage, t, isHinglish } = useLanguage();
  const hinglishMode = false; // Strict default is clean professional English
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isPartnerManagementOpen, setIsPartnerManagementOpen] = useState<boolean>(false);
  const [partyToDelete, setPartyToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingParty, setIsDeletingParty] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; partyId?: string | null } | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState<boolean>(false);

  // Auth User State (Per-tab Session Isolation)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [pendingPasswordRequestsCount, setPendingPasswordRequestsCount] = useState<number>(0);
  const [users, setUsers] = useState<any[]>([]);

  // Application Data States
  const [parties, setParties] = useState<Party[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalReceivable: 0,
    totalPayable: 0,
    netBalance: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    totalPartiesCount: 0,
    totalProductsCount: 0,
  });

  // Modals & Selected Item States
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [isPartyDetailOpen, setIsPartyDetailOpen] = useState<boolean>(false);

  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [txInitialType, setTxInitialType] = useState<TransactionType>('PURCHASE');
  const [txInitialParty, setTxInitialParty] = useState<Party | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentInitialType, setPaymentInitialType] = useState<'PAYMENT_GIVEN' | 'PAYMENT_RECEIVED'>('PAYMENT_GIVEN');

  const [isPartyModalOpen, setIsPartyModalOpen] = useState<boolean>(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [isApprovalsModalOpen, setIsApprovalsModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Check Auth & Hydrate Session (Per-Tab Isolated in sessionStorage)
  useEffect(() => {
    try {
      const tabSession = sessionStorage.getItem(SESSION_TAB_KEY);
      if (tabSession) {
        const parsedUser: User = JSON.parse(tabSession);
        if (parsedUser && parsedUser.id && parsedUser.role) {
          setCurrentUser(parsedUser);
          loadAllData(parsedUser);
          if (parsedUser.role === 'ADMIN') {
            fetchPendingApprovals();
            fetchPasswordRequestsCount();
          }
        } else {
          setCurrentUser(null);
          sessionStorage.removeItem(SESSION_TAB_KEY);
        }
      } else {
        // Strictly stay logged out - ZERO fallback to default admin!
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESSION_TAB_KEY);
      }
    } finally {
      setIsAuthChecked(true);
    }
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const res = await fetch('/api/auth/approval');
      if (res.ok) {
        const pending = await res.json();
        setPendingApprovalsCount(pending.length || 0);
      }
    } catch (e) {
      console.error('Fetch pending count error:', e);
    }
  };

  const fetchPasswordRequestsCount = async () => {
    try {
      const res = await fetch('/api/auth/password-request');
      if (res.ok) {
        const requests = await res.json();
        const pending = requests.filter((r: any) => r.status === 'PENDING');
        setPendingPasswordRequestsCount(pending.length || 0);
      }
    } catch (e) {
      console.error('Fetch password requests error:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('Fetch users error:', e);
    }
  };

  const handleUpdateUserCredentials = async (userId: string, updates: any) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });
      if (res.ok) {
        showToast('Partner credentials updated successfully!');
        await fetchUsers();
        await loadAllData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleApproveUser = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      });
      if (res.ok) {
        showToast(status === 'APPROVED' ? 'Partner account approved!' : 'Partner registration rejected.');
        await fetchUsers();
        await fetchPendingApprovals();
        await loadAllData();
      }
    } catch (e) {
      console.error('Approve user error:', e);
    }
  };

  const handleDeleteUser = (userId: string, userName: string, partyId?: string | null) => {
    if (currentUser?.role !== 'ADMIN') {
      showToast('Only Master Admin can delete partner accounts.', 'error');
      return;
    }
    setUserToDelete({ id: userId, name: userName, partyId });
  };

  const executeDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      const res = await fetch(`/api/users?userId=${userToDelete.id}&deleteParty=true`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`Partner account "${userToDelete.name}" permanently deleted.`);
        if (userToDelete.partyId) {
          LocalStoreManager.deleteParty(userToDelete.partyId);
          setParties((prev) => prev.filter((p) => p.id !== userToDelete.partyId));
        }
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        setUserToDelete(null);
        await fetchUsers();
        await fetchPendingApprovals();
        await loadAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to delete partner account.', 'error');
      }
    } catch (e) {
      console.error('Delete user error:', e);
      showToast('Network error while deleting partner account.', 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const loadAllData = async (userToLoad?: User | null) => {
    const activeUser = userToLoad !== undefined ? userToLoad : currentUser;
    if (!activeUser) {
      // Unauthenticated: strictly do not fetch or leak any data!
      setParties([]);
      setProducts([]);
      setTransactions([]);
      setUsers([]);
      setStats({
        totalReceivable: 0,
        totalPayable: 0,
        netBalance: 0,
        totalStockValue: 0,
        lowStockCount: 0,
        totalPartiesCount: 0,
        totalProductsCount: 0,
      });
      return;
    }

    const isPartner = activeUser.role === 'PARTNER' && Boolean(activeUser.partyId);
    let pList: Party[] | null = null;
    let prList: Product[] | null = null;
    let txList: Transaction[] | null = null;

    try {
      const partyUrl = isPartner ? `/api/parties?partyId=${activeUser.partyId}` : '/api/parties';
      const pRes = await fetch(partyUrl);
      if (pRes.ok) pList = await pRes.json();
    } catch {
      pList = [];
    }

    try {
      const prRes = await fetch('/api/products');
      if (prRes.ok) prList = await prRes.json();
    } catch {
      prList = [];
    }

    try {
      const txUrl = isPartner ? `/api/transactions?partyId=${activeUser.partyId}` : '/api/transactions';
      const txRes = await fetch(txUrl);
      if (txRes.ok) txList = await txRes.json();
    } catch {
      txList = [];
    }

    const finalParties = pList !== null ? pList : [];
    const finalProducts = prList !== null ? prList : [];
    const finalTxs = txList !== null ? txList : [];

    // REQUIREMENT 2: Main Master Dashboard strictly displays metrics, outstanding balances, and recent deals ONLY for parties directly linked to Master Admin transactions!
    const tradingParties = activeUser.role === 'ADMIN'
      ? finalParties.filter((p) => finalTxs.some((t) => t.partyId === p.id))
      : finalParties;

    setParties(finalParties);
    setProducts(finalProducts);
    setTransactions(finalTxs);
    setStats(calculateDashboardStats(tradingParties, finalProducts, finalTxs));

    if (activeUser.role === 'ADMIN') {
      fetchUsers();
    }

    // Only save in browser storage if Master Admin
    if (activeUser.role === 'ADMIN') {
      LocalStoreManager.saveParties(finalParties);
      LocalStoreManager.saveProducts(finalProducts);
      LocalStoreManager.saveTransactions(finalTxs);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      // Save session in sessionStorage (isolated per tab)
      sessionStorage.setItem(SESSION_TAB_KEY, JSON.stringify(user));
    }
    loadAllData(user);
    if (user.role === 'ADMIN') {
      fetchPendingApprovals();
      fetchPasswordRequestsCount();
      fetchUsers();
    }
    showToast(
      user.role === 'ADMIN'
        ? `Welcome Master Admin ${user.name}`
        : `Welcome ${user.name}`
    );
  };

  const handleLogout = () => {
    // 1. Wipe in-memory states completely
    setCurrentUser(null);
    setParties([]);
    setProducts([]);
    setTransactions([]);
    setSelectedParty(null);
    setIsPartyDetailOpen(false);
    setIsTxModalOpen(false);
    setIsPaymentModalOpen(false);
    setIsPartyModalOpen(false);
    setIsProductModalOpen(false);
    setIsApprovalsModalOpen(false);
    setIsPasswordModalOpen(false);
    setPendingApprovalsCount(0);
    setPendingPasswordRequestsCount(0);
    setStats({
      totalReceivable: 0,
      totalPayable: 0,
      netBalance: 0,
      totalStockValue: 0,
      lowStockCount: 0,
      totalPartiesCount: 0,
      totalProductsCount: 0,
    });
    setActiveTab('dashboard');

    // 2. Completely wipe browser storage & cookies
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_TAB_KEY);
      sessionStorage.clear();
      LocalStoreManager.clearAll();
      localStorage.clear();

      try {
        document.cookie.split(';').forEach((cookie) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
          }
        });
      } catch (e) {
        console.error('Clear cookies error:', e);
      }
    }

    showToast(hinglishMode ? 'Aap ba-hifazat logout ho chukay hain.' : 'Logged out securely.', 'info');
  };

  // Delete Party (Master Admin Only - Trigger In-App Modal)
  const handleDeleteParty = (partyId: string, partyName: string) => {
    if (currentUser?.role !== 'ADMIN') {
      showToast('Only Master Admin can delete parties and clear account ledgers.', 'error');
      return;
    }
    setPartyToDelete({ id: partyId, name: partyName });
  };

  // Permanently cascade delete party and all records upon modal confirmation
  const executeDeleteParty = async () => {
    if (!partyToDelete) return;
    const { id: partyId, name: partyName } = partyToDelete;
    setIsDeletingParty(true);

    try {
      const res = await fetch(`/api/parties/${partyId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || 'Failed to delete party from server', 'error');
        setIsDeletingParty(false);
        return;
      }
    } catch (e) {
      console.error('Delete party API failed:', e);
      showToast('Network error while deleting party', 'error');
      setIsDeletingParty(false);
      return;
    }

    // Close modal and unselect party if currently viewing
    if (selectedParty?.id === partyId) {
      setSelectedParty(null);
      setIsPartyDetailOpen(false);
    }

    LocalStoreManager.deleteParty(partyId);
    const updatedParties = parties.filter((p) => p.id !== partyId);
    const updatedTxs = transactions.filter((t) => t.partyId !== partyId);

    setParties(updatedParties);
    setTransactions(updatedTxs);
    setStats(calculateDashboardStats(updatedParties, products, updatedTxs));
    LocalStoreManager.saveParties(updatedParties);
    LocalStoreManager.saveTransactions(updatedTxs);

    setPartyToDelete(null);
    setIsDeletingParty(false);

    showToast(
      hinglishMode
        ? `Party "${partyName}" aur uske tamam len-den khaate delete ho gaye!`
        : `Party "${partyName}" and associated ledger records permanently deleted!`,
      'info'
    );

    // Re-fetch in background to ensure 100% sync
    loadAllData();
    fetchPendingApprovals();
  };

  // Delete Transaction (Master Admin Only - Permanent DB Delete)
  const handleDeleteTransaction = async (txId: string) => {
    if (currentUser?.role !== 'ADMIN') {
      showToast('Only Master Admin can delete transactions.', 'error');
      return;
    }

    if (confirm('Are you sure you want to permanently delete this transaction record?')) {
      try {
        await fetch(`/api/transactions/${txId}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Delete transaction API failed:', e);
      }

      LocalStoreManager.deleteTransaction(txId);
      const updatedTxs = transactions.filter((t) => t.id !== txId);

      setTransactions(updatedTxs);
      setStats(calculateDashboardStats(parties, products, updatedTxs));
      LocalStoreManager.saveTransactions(updatedTxs);

      showToast('Transaction permanently deleted!', 'info');
    }
  };


  // Trigger Transaction Modal for Specific Deal or Payment
  const handleOpenTransaction = (
    type: 'PURCHASE' | 'SALE' | 'PAYMENT_GIVEN' | 'PAYMENT_RECEIVED',
    party?: Party
  ) => {
    if (type === 'PAYMENT_GIVEN' || type === 'PAYMENT_RECEIVED') {
      setPaymentInitialType(type);
      if (party) setTxInitialParty(party);
      setIsPaymentModalOpen(true);
    } else {
      setTxInitialType(type);
      setTxInitialParty(party || null);
      setIsTxModalOpen(true);
    }
  };

  // Submit Multi-Item Deal Transaction
  const handleSubmitTransaction = async (txData: any) => {
    let newTx: Transaction | null = null;
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData),
      });
      if (res.ok) {
        newTx = await res.json();
      }
    } catch (e) {
      console.error('Create tx error:', e);
    }

    const createdTx = newTx || LocalStoreManager.addTransaction(txData);
    const updatedTxs = [createdTx, ...transactions.filter((t) => t.id !== createdTx.id)];
    const updatedProducts = LocalStoreManager.getProducts();

    setTransactions(updatedTxs);
    setProducts(updatedProducts);
    setStats(calculateDashboardStats(parties, updatedProducts, updatedTxs));
    LocalStoreManager.saveTransactions(updatedTxs);

    showToast(
      txData.type === 'PURCHASE'
        ? hinglishMode
          ? 'Mal Mangwaya deal record ho gaya aur party khaata update hua!'
          : 'Purchase deal saved & ledger updated successfully!'
        : hinglishMode
        ? 'Mal Becha deal record ho gaya!'
        : 'Sale transaction recorded successfully!'
    );
  };

  // Submit Payment Settlement
  const handleSubmitPayment = async (paymentData: any) => {
    let newTx: Transaction | null = null;
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      if (res.ok) {
        newTx = await res.json();
      }
    } catch (e) {
      console.error('Create payment error:', e);
    }

    const createdTx = newTx || LocalStoreManager.addTransaction(paymentData);
    const updatedTxs = [createdTx, ...transactions.filter((t) => t.id !== createdTx.id)];

    setTransactions(updatedTxs);
    setStats(calculateDashboardStats(parties, products, updatedTxs));
    LocalStoreManager.saveTransactions(updatedTxs);

    showToast(
      paymentData.type === 'PAYMENT_GIVEN'
        ? hinglishMode
          ? 'Cash Diya (Payment Given) entry record ho gayi!'
          : 'Payment Given recorded successfully!'
        : hinglishMode
        ? 'Cash Mila (Payment Received) entry record ho gayi!'
        : 'Payment Received recorded successfully!'
    );
  };

  // Submit New Party
  const handleSubmitParty = async (partyData: Omit<Party, 'id' | 'createdAt'>) => {
    let createdPartyFromDb: Party | null = null;
    try {
      const res = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partyData),
      });
      if (res.ok) {
        createdPartyFromDb = await res.json();
      }
    } catch (e) {
      console.error('Create party API error:', e);
    }

    const newParty = createdPartyFromDb || LocalStoreManager.addParty(partyData);
    const updatedParties = [newParty, ...parties.filter((p) => p.id !== newParty.id)];

    setParties(updatedParties);
    setStats(calculateDashboardStats(updatedParties, products, transactions));
    LocalStoreManager.saveParties(updatedParties);

    showToast(
      hinglishMode
        ? `Nayi party "${newParty.name}" shamil kar di gayi!`
        : `New party "${newParty.name}" added successfully!`
    );
  };

  // Submit New / Edit Product
  const handleSubmitProduct = async (
    productData: Omit<Product, 'id' | 'createdAt'>,
    editId?: string
  ) => {
    let updatedProducts: Product[] = [];

    if (editId) {
      LocalStoreManager.updateProduct(editId, productData);
      updatedProducts = LocalStoreManager.getProducts();
      showToast(hinglishMode ? 'Product details update ho gayin!' : 'Product updated successfully!');
    } else {
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      } catch {}

      const newProd = LocalStoreManager.addProduct(productData);
      updatedProducts = [newProd, ...products];
      showToast(
        hinglishMode
          ? `Naya product "${newProd.name}" inventory mein shamil ho gaya!`
          : `Product "${newProd.name}" added to inventory!`
      );
    }

    setProducts(updatedProducts);
    setStats(calculateDashboardStats(parties, updatedProducts, transactions));
  };

  // Quick Stock Adjustment
  const handleUpdateStock = (product: Product, delta: number) => {
    const newStock = Math.max(0, product.currentStock + delta);
    LocalStoreManager.updateProduct(product.id, { currentStock: newStock });
    const updatedProducts = LocalStoreManager.getProducts();
    setProducts(updatedProducts);
    setStats(calculateDashboardStats(parties, updatedProducts, transactions));
    showToast(
      hinglishMode
        ? `${product.name} ka stock ${newStock} ${product.unit} update ho gaya!`
        : `Stock updated for ${product.name} to ${newStock} ${product.unit}`
    );
  };

  // Reset to Demo Data
  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset and reload default demo data?')) {
      try {
        await fetch('/api/seed', { method: 'POST' });
      } catch {}

      LocalStoreManager.resetToDemoData();
      await loadAllData();
      await fetchUsers();
      await fetchPendingApprovals();
      await fetchPasswordRequestsCount();
      showToast('Database successfully reset to clean multi-party trading dataset!');
    }
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} hinglishMode={hinglishMode} />;
  }

  const isPartnerUser = currentUser.role === 'PARTNER' && currentUser.partyId;
  const visibleTransactions = isPartnerUser
    ? transactions.filter((t) => t.partyId === currentUser.partyId)
    : transactions;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      <NotificationToast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        pendingApprovalsCount={pendingApprovalsCount}
        pendingPasswordRequestsCount={pendingPasswordRequestsCount}
        onOpenTransaction={(t) => handleOpenTransaction(t)}
        onOpenPartyModal={() => setIsPartyModalOpen(true)}
        onOpenProductModal={() => {
          setProductToEdit(null);
          setIsProductModalOpen(true);
        }}
        onOpenPartnerManagementModal={() => setActiveTab('partners')}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        onResetData={handleResetData}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            stats={stats}
            parties={parties}
            products={products}
            transactions={transactions}
            hinglishMode={hinglishMode}
            onOpenTransaction={(t) => handleOpenTransaction(t)}
            onOpenPartyModal={() => setIsPartyModalOpen(true)}
            onOpenProductModal={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            onSelectParty={(party) => {
              setSelectedParty(party);
              setIsPartyDetailOpen(true);
            }}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'partners' && (
          <PartnersPortalView
            currentUser={currentUser}
            parties={parties}
            transactions={transactions}
            users={users}
            onOpenPartyModal={() => setIsPartyModalOpen(true)}
            onSelectParty={(party) => {
              setSelectedParty(party);
              setIsPartyDetailOpen(true);
            }}
            onRefreshUsers={fetchUsers}
            onDeleteUser={handleDeleteUser}
            onUpdateUserCredentials={handleUpdateUserCredentials}
            onApproveUser={handleApproveUser}
            onOpenTransactionForParty={(party, t) => handleOpenTransaction(t, party)}
          />
        )}

        {activeTab === 'parties' && (
          <PartiesView
            currentUser={currentUser}
            parties={parties}
            transactions={transactions}
            hinglishMode={hinglishMode}
            onOpenPartyModal={() => setIsPartyModalOpen(true)}
            onSelectParty={(party) => {
              setSelectedParty(party);
              setIsPartyDetailOpen(true);
            }}
            onOpenTransactionForParty={(party, t) => handleOpenTransaction(t, party)}
            onDeleteParty={handleDeleteParty}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView
            products={products}
            hinglishMode={hinglishMode}
            onOpenProductModal={(product) => {
              setProductToEdit(product || null);
              setIsProductModalOpen(true);
            }}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {isPartnerUser ? 'Your Transaction Passbook' : hinglishMode ? 'Tamam Len-Den Deals History' : 'Complete Transaction History'}
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  {isPartnerUser
                    ? 'All transactions recorded for your account.'
                    : hinglishMode
                    ? 'Puri deals aur payments ka timeline.'
                    : 'All recorded purchases, sales, and cash entries.'}
                </p>
              </div>

              {!isPartnerUser && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenTransaction('PURCHASE')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
                  >
                    + Purchase Deal
                  </button>
                  <button
                    onClick={() => handleOpenTransaction('PAYMENT_GIVEN')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
                  >
                    + Cash Payment
                  </button>
                </div>
              )}
            </div>

            {/* Transactions Timeline */}
            <div className="space-y-3">
              {visibleTransactions.map((tx) => {
                const txParty = parties.find((p) => p.id === tx.partyId);

                return (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
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
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-white">{txParty?.name || tx.partyName}</h3>
                          <span className="text-[10px] text-slate-400 font-mono">#{tx.invoiceNo || tx.id.slice(0, 6)}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {tx.type === 'PURCHASE'
                            ? 'Purchase'
                            : tx.type === 'SALE'
                            ? 'Sale'
                            : tx.type === 'PAYMENT_GIVEN'
                            ? 'Cash Payment'
                            : 'Cash Collection'}
                          {' • '}
                          {new Date(tx.date).toLocaleDateString()} • Mode: {tx.paymentMode}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:text-right flex sm:flex-col justify-between items-end gap-2">
                      <div className="flex items-center space-x-2 justify-end">
                        <div className="text-base font-black text-white">PKR {tx.totalAmount.toLocaleString()}</div>
                        {currentUser?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all ml-1"
                            title="Delete Transaction (Master Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        Cash Paid: PKR {tx.cashPaid.toLocaleString()}
                        {tx.remainingBalance > 0 && (
                          <span className="text-rose-400 font-bold ml-1">
                            (Remaining: PKR {tx.remainingBalance.toLocaleString()})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <ReportsView
            stats={stats}
            parties={parties}
            products={products}
            transactions={transactions}
            hinglishMode={hinglishMode}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Modals */}
      <PartyDetailModal
        party={selectedParty}
        transactions={transactions}
        currentUser={currentUser}
        hinglishMode={hinglishMode}
        users={users}
        onUserCredentialsUpdated={() => {
          fetchUsers();
          loadAllData();
        }}
        onClose={() => {
          setIsPartyDetailOpen(false);
          setSelectedParty(null);
        }}
        onOpenTransaction={(party, type) => handleOpenTransaction(type, party)}
        onDeleteParty={handleDeleteParty}
        onDeleteTransaction={handleDeleteTransaction}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        parties={parties}
        products={products}
        initialParty={txInitialParty}
        initialType={txInitialType}
        hinglishMode={hinglishMode}
        onSubmitTransaction={handleSubmitTransaction}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        parties={parties}
        initialParty={txInitialParty}
        initialType={paymentInitialType}
        hinglishMode={hinglishMode}
        onSubmitPayment={handleSubmitPayment}
      />

      <PartyModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        hinglishMode={hinglishMode}
        onSubmitParty={handleSubmitParty}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        hinglishMode={hinglishMode}
        onSubmitProduct={handleSubmitProduct}
      />

      <PartnerApprovalsModal
        isOpen={isApprovalsModalOpen}
        onClose={() => setIsApprovalsModalOpen(false)}
        hinglishMode={hinglishMode}
        onApprovalChanged={() => {
          fetchPendingApprovals();
          loadAllData();
        }}
      />

      <PasswordSettingsModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        currentUser={currentUser}
        hinglishMode={hinglishMode}
        onToast={showToast}
      />

      {/* Master Admin Dedicated Partner Management & Credentials Panel */}
      <PartnerManagementModal
        isOpen={isPartnerManagementOpen}
        onClose={() => setIsPartnerManagementOpen(false)}
        parties={parties}
        onDataChanged={() => {
          fetchPendingApprovals();
          fetchPasswordRequestsCount();
          loadAllData();
        }}
      />

      {/* In-App Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={partyToDelete !== null}
        title={`Delete Party "${partyToDelete?.name}"?`}
        message="This action will permanently delete this partner record and cascade-delete all associated transactions, ledger entries, and linked user profiles from the database. This action CANNOT be undone."
        confirmLabel="Permanently Delete Party"
        isDeleting={isDeletingParty}
        onConfirm={executeDeleteParty}
        onCancel={() => setPartyToDelete(null)}
      />

      {/* In-App User Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={userToDelete !== null}
        title={`Delete Partner "${userToDelete?.name}"?`}
        message="This action will permanently delete this partner user account and remove their linked platform profile and records from the database. This action CANNOT be undone."
        confirmLabel="Permanently Delete Partner"
        isDeleting={isDeletingUser}
        onConfirm={executeDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickDeal={() => handleOpenTransaction('PURCHASE')}
        hinglishMode={hinglishMode}
      />
    </div>
  );
}

