'use client';

import React from 'react';
import { LayoutDashboard, Users, Package, ArrowLeftRight, FileSpreadsheet, Plus } from 'lucide-react';

export type TabType = 'dashboard' | 'parties' | 'products' | 'transactions' | 'reports';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenQuickDeal: () => void;
  hinglishMode: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickDeal,
  hinglishMode,
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: hinglishMode ? 'Ghar' : 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'parties' as TabType,
      label: hinglishMode ? 'Khaate' : 'Parties',
      icon: Users,
    },
    {
      id: 'products' as TabType,
      label: hinglishMode ? 'Stock' : 'Inventory',
      icon: Package,
    },
    {
      id: 'transactions' as TabType,
      label: hinglishMode ? 'Len-Den' : 'History',
      icon: ArrowLeftRight,
    },
    {
      id: 'reports' as TabType,
      label: hinglishMode ? 'Hisaab' : 'Reports',
      icon: FileSpreadsheet,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 py-2 px-3 sm:px-6 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className={`relative p-1 rounded-lg ${isActive ? 'bg-indigo-500/10' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
