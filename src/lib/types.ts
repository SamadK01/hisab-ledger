export type PartyType = 'SUPPLIER' | 'CUSTOMER' | 'BOTH';

export type TransactionType = 'PURCHASE' | 'SALE' | 'PAYMENT_GIVEN' | 'PAYMENT_RECEIVED';

export type PaymentMode = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';

export type ProductUnit = 'kg' | 'liter' | 'piece' | 'carton' | 'box' | 'pack';

export type UserStatus = 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED';

export type PasswordRequestStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PARTNER';
  status: UserStatus;
  partyId?: string | null;
  createdAt?: string | Date;
}

export interface PasswordResetRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  partyId?: string | null;
  partyName?: string | null;
  reason?: string | null;
  status: PasswordRequestStatus;
  createdAt: string | Date;
}

export interface LedgerMessage {
  id: string;
  partyId: string;
  senderRole: 'ADMIN' | 'PARTNER';
  senderName: string;
  text: string;
  read?: boolean;
  createdAt: string | Date;
}

export interface Party {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  partyType: PartyType;
  openingBalance: number; // Positive = We owe them (Dena hai), Negative = They owe us (Lena hai)
  creditLimit?: number | null;
  notes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  currentBalance?: number; 
}

export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  category: string;
  unit: ProductUnit;
  costPrice: number;
  wholesalePrice: number;
  currentStock: number;
  minStock: number;
  notes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TransactionItemInput {
  productId?: string | null;
  productName: string;
  unit: ProductUnit;
  quantity: number;
  rate: number;          // Selling price or purchase unit rate
  costPrice?: number;    // Cost/buying price per unit
  subtotal: number;      // quantity * rate
  costSubtotal?: number; // quantity * costPrice
  expectedProfit?: number; // subtotal - costSubtotal
}

export interface TransactionItem extends TransactionItemInput {
  id: string;
  transactionId: string;
}

export interface Transaction {
  id: string;
  partyId: string;
  partyName?: string;
  type: TransactionType;
  invoiceNo?: string | null;
  date: string | Date;
  subtotal: number;
  discount: number;
  additionalCost: number;
  totalAmount: number;
  cashPaid: number;
  remainingBalance: number;
  paymentMode: PaymentMode;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  notes?: string | null;
  receiptImage?: string | null;
  buyingCostTotal?: number;
  sellingPriceTotal?: number;
  expectedProfit?: number;
  lossAmount?: number;
  lossReason?: string | null;
  createdAt?: string | Date;
  items?: TransactionItem[];
}

export interface DashboardStats {
  totalReceivable: number;
  totalPayable: number;
  netBalance: number;
  totalStockValue: number;
  lowStockCount: number;
  totalPartiesCount: number;
  totalProductsCount: number;
  pendingApprovalsCount?: number;
  pendingPasswordRequestsCount?: number;
  totalBuyingCost?: number;
  totalSalesRevenue?: number;
  totalGrossProfit?: number;
  totalLossDamage?: number;
  netProfit?: number;
}
