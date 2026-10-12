'use client';

import React, { useState, useEffect } from 'react';
import { LedgerMessage, User, Party } from '@/lib/types';
import { MessageSquare, Send, CheckCheck, Clock, ShieldCheck, User as UserIcon } from 'lucide-react';

interface DirectMessagingBoxProps {
  party: Party;
  currentUser: User;
  hinglishMode: boolean;
}

export const DirectMessagingBox: React.FC<DirectMessagingBoxProps> = ({
  party,
  currentUser,
  hinglishMode,
}) => {
  const [messages, setMessages] = useState<LedgerMessage[]>([]);
  const [newMsgText, setNewMsgText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [party.id]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?partyId=${party.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Fetch messages error:', e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || newMsgText).trim();
    if (!text) return;

    setIsSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: party.id,
          senderRole: currentUser.role,
          senderName: currentUser.role === 'ADMIN' ? 'Master Admin' : party.name,
          text,
        }),
      });

      if (res.ok) {
        const createdMsg = await res.json();
        setMessages((prev) => [...prev, createdMsg]);
        setNewMsgText('');
      }
    } catch (e) {
      console.error('Send message error:', e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              {hinglishMode ? '1-to-1 Direct Messaging & Updates' : '1-to-1 Direct Ledger Messages'}
            </h4>
            <p className="text-[10px] text-slate-400">
              Private chat between Master Admin & {party.name}
            </p>
          </div>
        </div>

        <button
          onClick={fetchMessages}
          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded bg-slate-800 border border-slate-700"
        >
          Refresh
        </button>
      </div>

      {/* Messages Timeline */}
      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            {hinglishMode ? 'Abhi tak koi direct message nahi bheja gaya.' : 'No direct messages sent yet.'}
          </div>
        ) : (
          messages.map((msg) => {
            const isMe =
              (currentUser.role === 'ADMIN' && msg.senderRole === 'ADMIN') ||
              (currentUser.role === 'PARTNER' && msg.senderRole === 'PARTNER');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center justify-between space-x-2 mb-1 opacity-80 text-[10px]">
                    <span className="font-bold">
                      {msg.senderRole === 'ADMIN' ? '🛡️ Master Admin' : `🏬 ${msg.senderName}`}
                    </span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {[
          '⚡ Order stock update',
          '⚡ Payment transfer done',
          '⚡ Balance receipt verified',
        ].map((preset) => (
          <button
            key={preset}
            onClick={() => handleSendMessage(preset)}
            className="text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 transition-colors"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Send Message Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-2 pt-2 border-t border-slate-800"
      >
        <input
          type="text"
          value={newMsgText}
          onChange={(e) => setNewMsgText(e.target.value)}
          placeholder={
            currentUser.role === 'ADMIN'
              ? `Message ${party.name}...`
              : 'Write update or order request to Admin...'
          }
          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={isSending || !newMsgText.trim()}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
