'use client';

import React from 'react';
import { Party, Product, Transaction, DashboardStats } from '@/lib/types';
import { exportPartyLedgerPDF, exportInventoryReportPDF } from '@/lib/pdf-generator';
import {
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Scale,
  TrendingUp,
  TrendingDown,
  Boxes,
  ShieldCheck,
} from 'lucide-react';

interface ReportsViewProps {
  stats: DashboardStats;
  parties: Party[];
  products: Product[];
  transactions: Transaction[];
  hinglishMode: boolean;
  onResetData: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  stats,
  parties,
  products,
  transactions,
  hinglishMode,
  onResetData,
}) => {
  const exportJSONBackup = () => {
    const backupData = {
      version: 'HisabPro_v1',
      exportedAt: new Date().toISOString(),
      parties,
      products,
      transactions,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HisabPro_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJSONBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.parties && json.products && json.transactions) {
          localStorage.setItem('hisab_parties_v1', JSON.stringify(json.parties));
          localStorage.setItem('hisab_products_v1', JSON.stringify(json.products));
          localStorage.setItem('hisab_transactions_v1', JSON.stringify(json.transactions));
          alert('Backup restored successfully! Reloading page...');
          window.location.reload();
        } else {
          alert('Invalid backup file format!');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          {hinglishMode ? 'Master Hisaab & Financial Reports' : 'Financial Ledger & Backup Reports'}
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          {hinglishMode
            ? 'Tamam parties ke passbooks, stock valuation reports aur JSON backups export karein.'
            : 'Download PDF statements, inventory valuation reports, and data backups.'}
        </p>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/20 shadow-lg">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase">
            <TrendingUp className="w-4 h-4" />
            <span>{hinglishMode ? 'Total Receivable (Lena)' : 'Total Receivable'}</span>
          </div>
          <div className="text-xl font-black text-white mt-2">PKR {stats.totalReceivable.toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/20 shadow-lg">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold uppercase">
            <TrendingDown className="w-4 h-4" />
            <span>{hinglishMode ? 'Total Payable (Dena)' : 'Total Payable'}</span>
          </div>
          <div className="text-xl font-black text-white mt-2">PKR {stats.totalPayable.toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/20 shadow-lg">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase">
            <Boxes className="w-4 h-4" />
            <span>{hinglishMode ? 'Mawajooda Stock Value' : 'Stock Valuation'}</span>
          </div>
          <div className="text-xl font-black text-white mt-2">PKR {stats.totalStockValue.toLocaleString()}</div>
        </div>

        {/* Profit & Loss Summaries */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 shadow-lg">
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase">
            <TrendingUp className="w-4 h-4" />
            <span>{hinglishMode ? 'Kul Gross Profit' : 'Gross Profit'}</span>
          </div>
          <div className="text-xl font-black text-emerald-300 mt-2">PKR {(stats.totalGrossProfit || 0).toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 shadow-lg">
          <div className="flex items-center space-x-2 text-rose-300 text-xs font-bold uppercase">
            <TrendingDown className="w-4 h-4" />
            <span>{hinglishMode ? 'Wastage & Loss' : 'Loss & Damage'}</span>
          </div>
          <div className="text-xl font-black text-rose-300 mt-2">PKR {(stats.totalLossDamage || 0).toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 shadow-lg">
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase">
            <Scale className="w-4 h-4" />
            <span>{hinglishMode ? 'Net Profit' : 'Net Profit'}</span>
          </div>
          <div className="text-xl font-black text-white mt-2">PKR {(stats.netProfit || 0).toLocaleString()}</div>
        </div>
      </div>


      {/* PDF Reports Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Report Card */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-3 border border-indigo-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {hinglishMode ? 'Stock Inventory Valuation PDF Report' : 'Inventory Valuation PDF Report'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {hinglishMode
                ? 'Godam ke tamam Surf, Harpic, Tezab products aur unki qeemat par tayyar hone wali PDF report.'
                : 'Complete PDF document with cost rates, wholesale rates, and low stock items.'}
            </p>
          </div>

          <button
            onClick={() => exportInventoryReportPDF(products)}
            className="mt-4 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{hinglishMode ? 'Inventory PDF Export Karein' : 'Download Inventory PDF'}</span>
          </button>
        </div>

        {/* Data Backup & Restore Card */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-3 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {hinglishMode ? 'HisabPro JSON Backup & Restore' : 'JSON Data Backup & Restore'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {hinglishMode
                ? 'Apne pure business khaate ka offline JSON file backup download karein ya restore karein.'
                : 'Export complete database backup file for safe keeping or migrating between devices.'}
            </p>
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <button
              onClick={exportJSONBackup}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-1.5"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{hinglishMode ? 'Backup Download' : 'Export JSON'}</span>
            </button>

            <label className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-1.5 cursor-pointer">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>{hinglishMode ? 'Restore Backup' : 'Import JSON'}</span>
              <input type="file" accept=".json" onChange={importJSONBackup} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Reset to Demo Data Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <h4 className="text-sm font-bold text-rose-300">
            {hinglishMode ? 'Demo Data Re-seed Karein' : 'Reset & Re-seed Demo Data'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {hinglishMode
              ? 'Wapas original household products aur 5 parties data load karne ke liye yahan click karein.'
              : 'Wipe current storage and re-populate with realistic household multi-party demo dataset.'}
          </p>
        </div>

        <button
          onClick={onResetData}
          className="py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/40 text-xs font-bold transition-all flex items-center space-x-2 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{hinglishMode ? 'Demo Data Seed' : 'Reset Database'}</span>
        </button>
      </div>
    </div>
  );
};
