"use client";

import { useState, useEffect } from "react";
import { transactionHistory, Transaction } from "../utils/transactionHistory";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');

  useEffect(() => {
    loadTransactions();
    
    // Listen for storage changes (new transactions)
    const handleStorageChange = () => loadTransactions();
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll every 2 seconds to catch same-tab updates
    const interval = setInterval(loadTransactions, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadTransactions = () => {
    setTransactions(transactionHistory.getAll());
  };

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' ? true : tx.type === filter
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const stats = transactionHistory.getStats();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Recent Trades</h3>
        {transactions.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all transaction history?')) {
                transactionHistory.clear();
                loadTransactions();
              }
            }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-auto"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Stats */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
          <div>
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Volume</div>
            <div className="text-lg font-bold text-gray-900">{stats.totalVolume.toFixed(2)} SOL</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Fees</div>
            <div className="text-lg font-bold text-gray-900">{stats.totalFees.toFixed(4)} SOL</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-semibold text-sm transition-all ${
            filter === 'all'
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('buy')}
          className={`px-4 py-2 font-semibold text-sm transition-all ${
            filter === 'buy'
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Buys
        </button>
        <button
          onClick={() => setFilter('sell')}
          className={`px-4 py-2 font-semibold text-sm transition-all ${
            filter === 'sell'
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Sells
        </button>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">📜</div>
            <p className="text-gray-400">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-1">Your swap history will appear here</p>
          </div>
        ) : (
          filteredTransactions.map((tx, idx) => (
            <div key={tx.id} className="py-2">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    tx.type === 'buy'
                      ? 'bg-[#10b981]/10 text-[#10b981]'
                      : 'bg-[#FF0080]/10 text-[#FF0080]'
                  }`}>
                    {tx.type.toUpperCase()}
                  </div>
                  <span className="font-bold text-gray-900">{tx.tokenSymbol}</span>
                </div>
                <div className="text-xs text-gray-400">{formatTime(tx.timestamp)}</div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold text-gray-900">{tx.amount.toFixed(4)} SOL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Received:</span>
                <span className="font-semibold text-gray-900">{tx.estimatedOutput} {tx.type === 'buy' ? tx.tokenSymbol : 'SOL'}</span>
              </div>
              {tx.priceImpact !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price Impact:</span>
                  <span className="font-semibold text-gray-900">{tx.priceImpact.toFixed(2)}%</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fee:</span>
                <span className="font-semibold text-gray-900">{tx.fee.toFixed(4)} SOL</span>
              </div>
              <a
                href={`https://solscan.io/tx/${tx.txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 transition-all"
              >
                View on Solscan →
              </a>
              {idx !== filteredTransactions.length - 1 && (
                <div className="border-b border-gray-100" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
