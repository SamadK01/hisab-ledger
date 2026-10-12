'use client';

import React, { useState } from 'react';
import { Party, Transaction, User } from '@/lib/types';
import { calculatePartyBalance } from '@/lib/store';
import { exportPartyLedgerPDF } from '@/lib/pdf-generator';
import { DirectMessagingBox } from './DirectMessagingBox';
import {
  X,
  FileText,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  DollarSign,
  MessageSquare,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

interface PartyDetailModalProps {
  party: Party | null;
  transactions: Transaction[];
  currentUser: User | null;
  hinglishMode: boolean;
  onClose: () => void;
  onOpenTransaction: (party: Party, type: 'PURCHASE' | 'SALE' | 'PAYMENT_GIVEN' | 'PAYMENT_RECEIVED') => void;
  onDeleteParty?: (partyId: string, partyName: string) => void;
  onDeleteTransaction?: (txId: string) => void;
}

export const PartyDetailModal: React.FC<PartyDetailModalProps> = ({
  party,
  transactions,
  currentUser,
  hinglishMode,
  onClose,
  onOpenTransaction,
  onDeleteParty,
  onDeleteTransaction,
}) => {
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [showMessaging, setShowMessaging] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!party) return null;

  const isAdmin = currentUser?.role === 'ADMIN';

  const partyTxs = transactions
    .filter((t) => t.partyId === party.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentBal = calculatePartyBalance(party, transactions);

  const toggleExpand = (id: string) => {
    setExpandedTxId(expandedTxId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {party.partyType} Khaata
              </span>
              <span className="text-xs text-slate-400">ID: {party.id.slice(0, 8)}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{party.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
              {party.phone && (
                <div className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{party.phone}</span>
                </div>
              )}
              {party.address && (
                <div className="flex items-center space-x-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{party.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Master Admin Delete Button */}
            {isAdmin && onDeleteParty && (
              <button
                onClick={() => {
                  onDeleteParty(party.id, party.name);
                  onClose();
                }}
                className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                title="Delete Party / Clear Account"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Scroll Container */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
          {/* Current Net Balance Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {hinglishMode ? 'Mawajooda Net Balance Position' : 'Current Net Running Position'}
                </span>
                <div className="mt-1 flex items-baseline space-x-3">
                  <div
                    className={`text-2xl sm:text-3xl font-black ${
                      currentBal > 0 ? 'text-rose-400' : currentBal < 0 ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    PKR {Math.abs(currentBal).toLocaleString()}
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      currentBal > 0
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        : currentBal < 0
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {currentBal > 0
                      ? hinglishMode ? 'AAPNE DENA HAI (PAYABLE)' : 'PAYABLE TO SUPPLIER'
                      : currentBal < 0
                      ? hinglishMode ? 'AAPNE LENA HAI (RECEIVABLE)' : 'RECEIVABLE FROM CUSTOMER'
                      : 'SETTLED (ZERO)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMessaging(!showMessaging)}
                  className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border transition-all ${
                    showMessaging
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-indigo-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{showMessaging ? 'Hide Messages' : 'Direct Messages'}</span>
                </button>

                <button
                  onClick={() => exportPartyLedgerPDF(party, transactions)}
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{hinglishMode ? 'PDF Passbook' : 'Download PDF'}</span>
                </button>
              </div>
            </div>

            {/* Quick Action Buttons (Master Admin Only) */}
            {currentUser?.role === 'ADMIN' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                <button
                  onClick={() => onOpenTransaction(party, 'PURCHASE')}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-all"
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  <span>{hinglishMode ? '+ Mal Mangwaya' : '+ Purchase'}</span>
                </button>

                <button
                  onClick={() => onOpenTransaction(party, 'SALE')}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-all"
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-400" />
                  <span>{hinglishMode ? '+ Mal Becha' : '+ Sale'}</span>
                </button>

                <button
                  onClick={() => onOpenTransaction(party, 'PAYMENT_GIVEN')}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-200 text-xs font-bold border border-rose-500/30 transition-all"
                >
                  <DollarSign className="w-4 h-4 text-rose-400" />
                  <span>{hinglishMode ? '+ Cash Diya' : '+ Pay Cash'}</span>
                </button>

                <button
                  onClick={() => onOpenTransaction(party, 'PAYMENT_RECEIVED')}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-200 text-xs font-bold border border-emerald-500/30 transition-all"
                >
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>{hinglishMode ? '+ Cash Mila' : '+ Collect Cash'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 1-to-1 Direct Messaging Box */}
          {showMessaging && currentUser && (
            <DirectMessagingBox party={party} currentUser={currentUser} hinglishMode={hinglishMode} />
          )}

          {/* Transaction History Timeline Passbook */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              {hinglishMode ? 'Mukammal Len-Den Passbook History' : 'Complete Ledger Statement Timeline'}
            </h3>

            {partyTxs.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">
                  {hinglishMode ? 'Abhi tak is party ke saath koi len-den nahi hua.' : 'No transactions recorded yet.'}
                </p>
              </div>
            ) : (
              partyTxs.map((tx) => {
                const isExpanded = expandedTxId === tx.id;

                return (
                  <div
                    key={tx.id}
                    className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-4 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(tx.id)}>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                            tx.type === 'PURCHASE'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : tx.type === 'SALE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : tx.type === 'PAYMENT_GIVEN'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {tx.type === 'PURCHASE' ? 'BUY' : tx.type === 'SALE' ? 'SELL' : 'CASH'}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-white">
                              {tx.type === 'PURCHASE'
                                ? 'Mal Mangwaya (Purchase)'
                                : tx.type === 'SALE'
                                ? 'Mal Becha (Sale)'
                                : tx.type === 'PAYMENT_GIVEN'
                                ? 'Cash Paid Out'
                                : 'Cash Received'}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {tx.invoiceNo || tx.id.slice(0, 8)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {new Date(tx.date).toLocaleDateString('en-GB')} • Mode: {tx.paymentMode}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Receipt Slip Image Thumbnail Button */}
                        {tx.receiptImage && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(tx.receiptImage || null);
                            }}
                            className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center space-x-1"
                            title="View Attached Slip/Bill Image"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="hidden sm:inline">Slip</span>
                          </button>
                        )}

                        <div className="text-right">
                          <div className="text-sm font-black text-white">
                            PKR {tx.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Paid: PKR {tx.cashPaid.toLocaleString()}
                            {tx.remainingBalance > 0 && (
                              <span className="text-rose-400 font-semibold ml-1">
                                (Rem: {tx.remainingBalance.toLocaleString()})
                              </span>
                            )}
                          </div>
                        </div>

                        {isAdmin && onDeleteTransaction && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTransaction(tx.id);
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                            title="Delete Transaction (Master Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {tx.items && tx.items.length > 0 && (
                          <button className="text-slate-400 hover:text-white p-1">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Multi-Item Breakdown Expandable Section */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-700/80 bg-slate-900/90 rounded-xl p-3.5 space-y-3 text-xs">
                        {tx.items && tx.items.length > 0 && (
                          <>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Itemized Products & Profit Margins:
                            </div>
                            <div className="space-y-2">
                              {tx.items.map((item, idx) => {
                                const cPrice = item.costPrice || 0;
                                const cSubtotal = item.costSubtotal || cPrice * item.quantity;
                                const itemMargin = item.subtotal - cSubtotal;

                                return (
                                  <div key={idx} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                                    <div className="flex items-center justify-between text-slate-200 font-bold">
                                      <span>{item.productName}</span>
                                      <span className="text-white">PKR {item.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                      <span>
                                        Qty: {item.quantity} {item.unit} • Rate: PKR {item.rate}
                                        {cPrice > 0 && <span className="text-slate-500 ml-1.5">(Cost: PKR {cPrice}/unit)</span>}
                                      </span>
                                      {itemMargin > 0 && (
                                        <span className="text-emerald-400 font-semibold">
                                          Margin: +PKR {itemMargin.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {/* Financial Deal Breakdown Summary Box */}
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                          {tx.buyingCostTotal ? (
                            <div className="flex justify-between text-slate-400">
                              <span>Total Buying Stock Cost:</span>
                              <span className="text-slate-200">PKR {tx.buyingCostTotal.toLocaleString()}</span>
                            </div>
                          ) : null}

                          <div className="flex justify-between text-slate-400">
                            <span>Total Selling Deal Value:</span>
                            <span className="text-indigo-300 font-bold">PKR {tx.totalAmount.toLocaleString()}</span>
                          </div>

                          {tx.discount > 0 && (
                            <div className="flex justify-between text-slate-400">
                              <span>Discount Given:</span>
                              <span className="text-amber-400">-PKR {tx.discount.toLocaleString()}</span>
                            </div>
                          )}

                          {tx.additionalCost > 0 && (
                            <div className="flex justify-between text-slate-400">
                              <span>Freight / Extra Charges:</span>
                              <span className="text-slate-300">+PKR {tx.additionalCost.toLocaleString()}</span>
                            </div>
                          )}

                          {tx.lossAmount && tx.lossAmount > 0 ? (
                            <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-slate-800">
                              <span>Loss / Wastage Subtracted ({tx.lossReason || 'Damage'}):</span>
                              <span>-PKR {tx.lossAmount.toLocaleString()}</span>
                            </div>
                          ) : null}

                          {tx.type === 'SALE' && tx.buyingCostTotal ? (
                            <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                              <span>Net Deal Profit (Sales - Cost - Loss):</span>
                              <span>
                                PKR {Math.max(0, tx.totalAmount - (tx.buyingCostTotal || 0) - (tx.lossAmount || 0)).toLocaleString()}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>


      {/* Image Slip Lightbox Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>Transaction Slip / Bill Receipt Proof</span>
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-slate-950 p-2 flex items-center justify-center">
              <img src={previewImage} alt="Receipt Slip Proof" className="max-w-full max-h-[65vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

