export interface SaleCreatedEventPayload {
  saleId: string;
  saleNumber: string;
  userId: string;
  customerName: string;
  totalAmount: number;
  paymentMethod: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  soldAt: string;
}

export interface StockUpdatedEventPayload {
  productId: string;
  productName: string;
  oldStock: number;
  newStock: number;
  changeQty: number;
  type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'initial';
  referenceId?: string;
  timestamp: string;
}

export interface StockLowAlertEventPayload {
  productId: string;
  productName: string;
  currentStock: number;
  minStockAlert: number;
  unit: string;
}

export interface ProductCreatedEventPayload {
  productId: string;
  name: string;
  sku?: string;
  userId: string;
  category?: string;
}

export interface ProductUpdatedEventPayload {
  productId: string;
  name: string;
  userId: string;
  changes: Record<string, any>;
}

export interface ProductDeletedEventPayload {
  productId: string;
  userId: string;
}

export interface CustomerCreatedEventPayload {
  customerId: string;
  name: string;
  phone?: string;
  userId: string;
}

export interface TransactionCreatedEventPayload {
  transactionId: string;
  businessId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note?: string;
  date: string;
}

export interface TransactionUpdatedEventPayload {
  transactionId: string;
  businessId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note?: string;
  date: string;
}

export interface TransactionDeletedEventPayload {
  transactionId: string;
  businessId: string;
}

export interface SettingsUpdatedEventPayload {
  businessId: string;
  settings: Record<string, any>;
  timestamp: string;
}

export interface BusinessUpdatedEventPayload {
  businessId: string;
  businessName: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  timestamp: string;
}

export interface ProfileUpdatedEventPayload {
  userId: string;
  fullName?: string;
  phone?: string;
  timestamp: string;
}

export interface SupplierCreatedEventPayload {
  supplierId: string;
  businessId: string;
  companyName: string;
  phone?: string;
  email?: string;
}

export interface SupplierUpdatedEventPayload {
  supplierId: string;
  businessId: string;
  companyName: string;
  changes: Record<string, any>;
}

export interface SupplierDeletedEventPayload {
  supplierId: string;
  businessId: string;
}

export interface PurchaseCreatedEventPayload {
  purchaseId: string;
  poNumber: string;
  businessId: string;
  supplierId: string;
  totalAmount: number;
  status: string;
  itemCount: number;
}

export interface PurchaseUpdatedEventPayload {
  purchaseId: string;
  poNumber: string;
  businessId: string;
  changes: Record<string, any>;
}

export interface PurchaseReceivedEventPayload {
  purchaseId: string;
  poNumber: string;
  businessId: string;
  supplierId: string;
  receivedAt: string;
  totalAmount: number;
}

export interface PurchaseCancelledEventPayload {
  purchaseId: string;
  poNumber: string;
  businessId: string;
  reason?: string;
}

export interface AppEventMap {
  'sale:created': SaleCreatedEventPayload;
  'stock:updated': StockUpdatedEventPayload;
  'stock:low_alert': StockLowAlertEventPayload;
  'product:created': ProductCreatedEventPayload;
  'product:updated': ProductUpdatedEventPayload;
  'product:deleted': ProductDeletedEventPayload;
  'customer:created': CustomerCreatedEventPayload;
  'finance:transaction_created': TransactionCreatedEventPayload;
  'finance:transaction_updated': TransactionUpdatedEventPayload;
  'finance:transaction_deleted': TransactionDeletedEventPayload;
  'settings:updated': SettingsUpdatedEventPayload;
  'business:updated': BusinessUpdatedEventPayload;
  'profile:updated': ProfileUpdatedEventPayload;
  'supplier:created': SupplierCreatedEventPayload;
  'supplier:updated': SupplierUpdatedEventPayload;
  'supplier:deleted': SupplierDeletedEventPayload;
  'purchase:created': PurchaseCreatedEventPayload;
  'purchase:updated': PurchaseUpdatedEventPayload;
  'purchase:received': PurchaseReceivedEventPayload;
  'purchase:cancelled': PurchaseCancelledEventPayload;
}

export type EventType = keyof AppEventMap;
export type EventHandler<T extends EventType> = (payload: AppEventMap[T]) => void;
