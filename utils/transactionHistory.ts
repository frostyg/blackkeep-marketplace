export interface Transaction {
  id: string;
  txid: string;
  type: 'buy' | 'sell';
  tokenSymbol: string;
  tokenMint: string;
  amount: number;
  estimatedOutput: string;
  priceImpact?: number;
  fee: number;
  timestamp: number;
  status: 'success' | 'failed';
}

const STORAGE_KEY = 'blackkeep_transactions';
const MAX_TRANSACTIONS = 50;

export const transactionHistory = {
  // Get all transactions
  getAll(): Transaction[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading transaction history:', error);
      return [];
    }
  },

  // Add a new transaction
  add(transaction: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    try {
      const transactions = this.getAll();
      transactions.unshift(newTransaction); // Add to beginning
      
      // Keep only last MAX_TRANSACTIONS
      const trimmed = transactions.slice(0, MAX_TRANSACTIONS);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      return newTransaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      return newTransaction;
    }
  },

  // Get transactions for a specific token
  getByToken(tokenMint: string): Transaction[] {
    return this.getAll().filter(tx => tx.tokenMint === tokenMint);
  },

  // Get recent transactions (last N)
  getRecent(count: number = 10): Transaction[] {
    return this.getAll().slice(0, count);
  },

  // Clear all transactions
  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  // Get statistics
  getStats() {
    const transactions = this.getAll();
    const successful = transactions.filter(tx => tx.status === 'success');
    
    return {
      total: transactions.length,
      successful: successful.length,
      failed: transactions.length - successful.length,
      totalVolume: successful.reduce((sum, tx) => sum + tx.amount, 0),
      totalFees: successful.reduce((sum, tx) => sum + tx.fee, 0),
    };
  }
};
