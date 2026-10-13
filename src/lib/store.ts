import { Party, Product, Transaction, DashboardStats } from './types';
import { INITIAL_PARTIES, INITIAL_PRODUCTS, INITIAL_TRANSACTIONS } from './seed-data';

const STORAGE_KEYS = {
  PARTIES: 'hisab_parties_v1',
  PRODUCTS: 'hisab_products_v1',
  TRANSACTIONS: 'hisab_transactions_v1',
  INITIALIZED: 'hisab_initialized_v1',
};

// Compute dynamic balance for a single party
export function calculatePartyBalance(party: Party, transactions: Transaction[]): number {
  const partyTxs = transactions.filter((t) => t.partyId === party.id);
  
  let balance = Number(party.openingBalance || 0);

  partyTxs.forEach((tx) => {
    const netDealBalance = Number(tx.remainingBalance || 0);
    const amount = Number(tx.totalAmount || 0);

    if (tx.type === 'PURCHASE') {
      // Purchase increases what we owe to the supplier by remaining unpaid balance
      balance += netDealBalance;
    } else if (tx.type === 'SALE') {
      // Sale decreases what we owe / increases what they owe us (makes balance more negative)
      balance -= netDealBalance;
    } else if (tx.type === 'PAYMENT_GIVEN') {
      // Cash/Bank paid to supplier reduces our liability to them
      balance -= amount;
    } else if (tx.type === 'PAYMENT_RECEIVED') {
      // Cash/Bank received from customer reduces their balance (increases our liability or lowers credit)
      balance += amount;
    }
  });

  return Math.round(balance * 100) / 100;
}

// Compute dashboard statistics
export function calculateDashboardStats(
  parties: Party[],
  products: Product[],
  transactions: Transaction[]
): DashboardStats {
  let totalReceivable = 0; // Total Lena Hai (They owe us -> balance < 0)
  let totalPayable = 0;    // Total Dena Hai (We owe them -> balance > 0)

  parties.forEach((party) => {
    const currentBal = calculatePartyBalance(party, transactions);
    if (currentBal > 0) {
      totalPayable += currentBal;
    } else if (currentBal < 0) {
      totalReceivable += Math.abs(currentBal);
    }
  });

  // Calculate stock value
  const totalStockValue = products.reduce(
    (sum, p) => sum + (Number(p.currentStock) * Number(p.costPrice)),
    0
  );

  // Calculate low stock items count
  const lowStockCount = products.filter(
    (p) => Number(p.currentStock) <= Number(p.minStock)
  ).length;

  // Profit, Loss, Buying Cost & Sales Revenue Calculations
  let totalBuyingCost = 0;
  let totalSalesRevenue = 0;
  let totalCostOfGoodsSold = 0;
  let totalLossDamage = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'PURCHASE') {
      totalBuyingCost += Number(tx.totalAmount || 0);
    } else if (tx.type === 'SALE') {
      totalSalesRevenue += Number(tx.totalAmount || 0);
      if (tx.buyingCostTotal) {
        totalCostOfGoodsSold += Number(tx.buyingCostTotal || 0);
      } else if (tx.items && tx.items.length > 0) {
        const itemsCost = tx.items.reduce(
          (sum, it) => sum + Number(it.costPrice || 0) * Number(it.quantity || 0),
          0
        );
        totalCostOfGoodsSold += itemsCost;
      }
    }
    if (tx.lossAmount) {
      totalLossDamage += Number(tx.lossAmount || 0);
    }
  });

  const totalGrossProfit = Math.max(0, totalSalesRevenue - totalCostOfGoodsSold);
  const netProfit = totalGrossProfit - totalLossDamage;

  return {
    totalReceivable: Math.round(totalReceivable),
    totalPayable: Math.round(totalPayable),
    netBalance: Math.round(totalReceivable - totalPayable),
    totalStockValue: Math.round(totalStockValue),
    lowStockCount,
    totalPartiesCount: parties.length,
    totalProductsCount: products.length,
    totalBuyingCost: Math.round(totalBuyingCost),
    totalSalesRevenue: Math.round(totalSalesRevenue),
    totalGrossProfit: Math.round(totalGrossProfit),
    totalLossDamage: Math.round(totalLossDamage),
    netProfit: Math.round(netProfit),
  };
}

// Local Storage Helper Engine
export class LocalStoreManager {
  static getParties(): Party[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PARTIES);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static getProducts(): Product[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static getTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static clearAll() {
    if (typeof window !== 'undefined') {
      try {
        Object.values(STORAGE_KEYS).forEach((k) => {
          localStorage.removeItem(k);
        });
      } catch (e) {
        console.error('Error clearing local storage keys:', e);
      }
    }
  }

  static saveParties(parties: Party[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
    }
  }

  static saveProducts(products: Product[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  }

  static saveTransactions(txs: Transaction[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    }
  }

  static resetToDemoData() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(INITIAL_PARTIES));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  static addParty(partyInput: Omit<Party, 'id' | 'createdAt'>): Party {
    const parties = this.getParties();
    const newParty: Party = {
      ...partyInput,
      id: `party-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    parties.unshift(newParty);
    this.saveParties(parties);
    return newParty;
  }

  static updateParty(id: string, updates: Partial<Party>): Party | null {
    const parties = this.getParties();
    const idx = parties.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    parties[idx] = { ...parties[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveParties(parties);
    return parties[idx];
  }

  static deleteParty(id: string): boolean {
    const parties = this.getParties();
    const filteredParties = parties.filter((p) => p.id !== id);
    this.saveParties(filteredParties);

    // Clean up associated transactions for the party
    const txs = this.getTransactions();
    const filteredTxs = txs.filter((t) => t.partyId !== id);
    this.saveTransactions(filteredTxs);

    return true;
  }

  static addProduct(productInput: Omit<Product, 'id' | 'createdAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...productInput,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  static updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveProducts(products);
    return products[idx];
  }

  static deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    this.saveProducts(filtered);
    return true;
  }

  static addTransaction(txInput: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const txs = this.getTransactions();
    const products = this.getProducts();

    const newTx: Transaction = {
      ...txInput,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    // Auto update product stocks if purchase or sale
    if (newTx.items && newTx.items.length > 0) {
      newTx.items.forEach((item) => {
        if (item.productId) {
          const prodIdx = products.findIndex((p) => p.id === item.productId);
          if (prodIdx !== -1) {
            if (newTx.type === 'PURCHASE') {
              products[prodIdx].currentStock += Number(item.quantity);
            } else if (newTx.type === 'SALE') {
              products[prodIdx].currentStock = Math.max(0, products[prodIdx].currentStock - Number(item.quantity));
            }
          }
        }
      });
      this.saveProducts(products);
    }

    txs.unshift(newTx);
    this.saveTransactions(txs);
    return newTx;
  }

  static deleteTransaction(id: string): boolean {
    const txs = this.getTransactions();
    const filtered = txs.filter((t) => t.id !== id);
    this.saveTransactions(filtered);
    return true;
  }
}

