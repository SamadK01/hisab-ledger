'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'ur_ro' | 'ur';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English (US)', nativeLabel: 'English', flag: '🇺🇸' },
  { code: 'ur_ro', label: 'Roman Urdu', nativeLabel: 'Roman Urdu (Hinglish)', flag: '🇵🇰' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', flag: '🇵🇰' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Brand & App
    appName: 'HisabPro',
    appTagline: 'Multi-Party Financial Ledger & Inventory System',
    
    // Nav
    navDashboard: 'Dashboard',
    navParties: 'Parties',
    navProducts: 'Inventory',
    navTransactions: 'Deals & Passbook',
    navReports: 'Reports',
    navPartnerManagement: 'Partner Management',
    navApprovals: 'Approvals',
    navSeedData: 'Seed Data',
    navLogout: 'Logout',
    
    // Financial Metrics
    totalReceivable: 'Total Receivables',
    totalPayable: 'Total Payables',
    netBalance: 'Net Balance Position',
    totalStockValue: 'Inventory Valuation',
    lowStockAlerts: 'Low Stock Alerts',
    totalPartners: 'Registered Partners',
    totalProducts: 'Catalog Products',
    grossProfit: 'Estimated Gross Profit',
    salesRevenue: 'Total Sales Revenue',
    buyingCost: 'Total Buying Cost',
    lossDamage: 'Damage & Loss',
    
    // Status
    payable: 'Payable (You Owe)',
    receivable: 'Receivable (They Owe)',
    settled: 'Settled (Zero Balance)',
    approved: 'Approved',
    pendingApproval: 'Pending Approval',
    rejected: 'Rejected',
    
    // Actions
    newDeal: 'New Deal',
    newPurchase: 'Purchase Deal',
    newSale: 'Sale Deal',
    paymentEntry: 'Payment Entry',
    paymentGiven: 'Payment Given (Cash Out)',
    paymentReceived: 'Payment Received (Cash In)',
    addParty: 'Add Partner',
    addProduct: 'Add Product',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    approve: 'Approve',
    reject: 'Reject',
    search: 'Search...',
    all: 'All',
    suppliers: 'Suppliers',
    customers: 'Customers',
    copy: 'Copy',
    copied: 'Copied!',
    revealPassword: 'Show Password',
    hidePassword: 'Hide Password',
    
    // Form Labels
    partnerName: 'Partner Business Name',
    email: 'Email Address',
    password: 'Password',
    phone: 'Phone Number',
    address: 'Business Address',
    partnerType: 'Partner Category',
    openingBalance: 'Opening Balance (PKR)',
    creditLimit: 'Credit Limit (PKR)',
    notes: 'Terms & Notes',
    portalPassword: 'Portal Login Password',
    
    // Messages
    confirmDeleteParty: 'Are you sure you want to permanently delete this partner and all associated ledger records? This action cannot be undone.',
    confirmDeleteTx: 'Are you sure you want to permanently delete this transaction record?',
    deleteSuccess: 'Partner and associated ledger records permanently deleted!',
  },
  ur_ro: {
    // Brand & App
    appName: 'HisabPro',
    appTagline: 'Multi-Party Khaata & Maal Inventory System',
    
    // Nav
    navDashboard: 'Dashboard',
    navParties: 'Khaate / Parties',
    navProducts: 'Maal / Products',
    navTransactions: 'Len-Den Passbook',
    navReports: 'Hisaab Reports',
    navPartnerManagement: 'Partner Khaata Panel',
    navApprovals: 'Manzoori / Approvals',
    navSeedData: 'Demo Data',
    navLogout: 'Logout',
    
    // Financial Metrics
    totalReceivable: 'Kul Lena Hai (Receivable)',
    totalPayable: 'Kul Dena Hai (Payable)',
    netBalance: 'Net Position',
    totalStockValue: 'Stock Value',
    lowStockAlerts: 'Kam Stock Alerts',
    totalPartners: 'Kul Parties',
    totalProducts: 'Kul Products',
    grossProfit: 'Munafa (Gross Profit)',
    salesRevenue: 'Kul Bikri Revenue',
    buyingCost: 'Kharidari Cost',
    lossDamage: 'Nuqsaan / Damage',
    
    // Status
    payable: 'Aapne Dena Hai',
    receivable: 'Aapne Lena Hai',
    settled: 'Khaata Barabar (Settled)',
    approved: 'Manzoor Shuda',
    pendingApproval: 'Zair-e-Ghor (Pending)',
    rejected: 'Mustarad (Rejected)',
    
    // Actions
    newDeal: 'Nayi Deal',
    newPurchase: 'Mal Mangwaya Deal',
    newSale: 'Mal Becha Deal',
    paymentEntry: 'Cash Entry',
    paymentGiven: 'Cash Diya (Payment Given)',
    paymentReceived: 'Cash Mila (Payment Received)',
    addParty: 'Nayi Party Shamil Karein',
    addProduct: 'Naya Maal Add Karein',
    edit: 'Tabdeel Karein',
    delete: 'Delete Karein',
    save: 'Mehfooz Karein',
    cancel: 'Radd Karein',
    approve: 'Manzoor Karein',
    reject: 'Radd Karein',
    search: 'Talash karein...',
    all: 'Tamam',
    suppliers: 'Suppliers',
    customers: 'Customers',
    copy: 'Copy Karein',
    copied: 'Copy Ho Gaya!',
    revealPassword: 'Password Dekhein',
    hidePassword: 'Password Chupayein',
    
    // Form Labels
    partnerName: 'Party / Karobar Ka Naam',
    email: 'Email Address',
    password: 'Password',
    phone: 'Phone Number',
    address: 'Dukan / Address',
    partnerType: 'Party Ki Qisam',
    openingBalance: 'Pichla Balance (PKR)',
    creditLimit: 'Credit Limit (PKR)',
    notes: 'Zaruri Hidayat',
    portalPassword: 'Portal Login Password',
    
    // Messages
    confirmDeleteParty: 'Kya aap is party aur unke tamam khaate pakke taur par delete karna chahte hain?',
    confirmDeleteTx: 'Kya aap is len-den ko permanently delete karna chahte hain?',
    deleteSuccess: 'Party aur uske tamam len-den khaate delete ho gaye!',
  },
  ur: {
    // Brand & App
    appName: 'حساب پرو',
    appTagline: 'ملٹی پارٹی کھاتہ اور مال انوینٹری سسٹم',
    
    // Nav
    navDashboard: 'ڈیش بورڈ',
    navParties: 'کھاتے اور پارٹیاں',
    navProducts: 'مال انوینٹری',
    navTransactions: 'لین دین پاس بک',
    navReports: 'رپورٹس',
    navPartnerManagement: 'پارٹنر انتظام',
    navApprovals: 'منظوری',
    navSeedData: 'ڈیمو ڈیٹا',
    navLogout: 'لاگ آؤٹ',
    
    // Financial Metrics
    totalReceivable: 'کل لینا ہے (وصولی)',
    totalPayable: 'کل دینا ہے (ادائیگی)',
    netBalance: 'خالص پوزیشن',
    totalStockValue: 'اسٹاک مالیت',
    lowStockAlerts: 'کم اسٹاک انتباہ',
    totalPartners: 'کل پارٹنرز',
    totalProducts: 'کل پراڈکٹس',
    grossProfit: 'تخمینی منافع',
    salesRevenue: 'کل سیلز آمدنی',
    buyingCost: 'کل خریداری لاگت',
    lossDamage: 'نقصان و ضیاع',
    
    // Status
    payable: 'دینا ہے (ادائیگی)',
    receivable: 'لینا ہے (وصولی)',
    settled: 'برابر (سیٹلڈ)',
    approved: 'منظور شدہ',
    pendingApproval: 'زیر غور',
    rejected: 'مسترد',
    
    // Actions
    newDeal: 'نئی ڈیل',
    newPurchase: 'مال منگوایا',
    newSale: 'مال بیچا',
    paymentEntry: 'کیش ادائیگی',
    paymentGiven: 'کیش دیا',
    paymentReceived: 'کیش ملا',
    addParty: 'نئی پارٹی شامل کریں',
    addProduct: 'نیا مال شامل کریں',
    edit: 'ترمیم کریں',
    delete: 'حذف کریں',
    save: 'محفوظ کریں',
    cancel: 'منسوخ کریں',
    approve: 'منظور کریں',
    reject: 'مسترد کریں',
    search: 'تلاش کریں...',
    all: 'تمام',
    suppliers: 'سپلائرز',
    customers: 'خریدار',
    copy: 'کاپی کریں',
    copied: 'کاپی ہو گیا!',
    revealPassword: 'پاس ورڈ دکھائیں',
    hidePassword: 'پاس ورڈ چھپائیں',
    
    // Form Labels
    partnerName: 'پارٹی کا کاروباری نام',
    email: 'ای میل ایڈریس',
    password: 'پاس ورڈ',
    phone: 'فون نمبر',
    address: 'کاروباری پتہ',
    partnerType: 'پارٹی کی قسم',
    openingBalance: 'سابقہ بیلنس (روپے)',
    creditLimit: 'ادھار کی حد (روپے)',
    notes: 'نوٹس و شرائط',
    portalPassword: 'پورٹل لاگ ان پاس ورڈ',
    
    // Messages
    confirmDeleteParty: 'کیا آپ واقعی اس پارٹی اور اس کے تمام ریکارڈز مستقل طور پر حذف کرنا چاہتے ہیں؟',
    confirmDeleteTx: 'کیا آپ واقعی اس لین دین کو حذف کرنا چاہتے ہیں؟',
    deleteSuccess: 'پارٹی اور تمام ریکارڈز مستقل طور پر حذف ہو گئے!',
  },
};

const LANGUAGE_STORAGE_KEY = 'hisab_language_preference_v2';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  isEnglish: boolean;
  isHinglish: boolean;
  isUrdu: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  isEnglish: true,
  isHinglish: false,
  isUrdu: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // STRICT DEFAULT: 'en' (English)
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
      if (stored && ['en', 'ur_ro', 'ur'].includes(stored)) {
        setLanguageState(stored);
      } else {
        // Enforce English as default
        setLanguageState('en');
        localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
      }
    } catch {
      setLanguageState('en');
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict[key]) return langDict[key];
    const enDict = TRANSLATIONS.en;
    if (enDict[key]) return enDict[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isEnglish: language === 'en',
        isHinglish: language === 'ur_ro',
        isUrdu: language === 'ur',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
