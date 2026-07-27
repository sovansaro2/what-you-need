import { InventoryProduct } from '../../inventory/products/types';

export type PaymentMethod = 'cash' | 'khqr' | 'bank_transfer' | 'card' | 'credit';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';
export type SaleStatus = 'completed' | 'pending' | 'cancelled' | 'refunded' | 'voided';
export type CustomerType = 'walk_in' | 'individual' | 'business' | 'vip' | 'wholesale';

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  type: CustomerType;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  type?: CustomerType;
}

export interface CartItem {
  id: string; // unique item id in cart or product id
  product_id: string;
  product_name: string;
  product_sku?: string | null;
  product_barcode?: string | null;
  unit_name?: string | null;
  current_stock: number;
  quantity: number;
  unit_price: number;
  discount_amount: number; // item-level discount in currency
  subtotal: number; // quantity * unit_price
  total: number; // (quantity * unit_price) - discount_amount
  cost_price?: number;
}

export interface CartTotals {
  item_count: number;
  total_quantity: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
}

export interface SalePaymentMetadata {
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  paid_amount: number;
  change_amount: number;
  due_amount: number;
  reference_number?: string | null;
  notes?: string | null;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  subtotal: number;
  total: number;
  created_at?: string;
}

export interface Sale {
  id: string;
  business_id: string;
  customer_id?: string | null;
  customer_name?: string;
  sale_number: string;
  status: SaleStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  change_amount: number;
  notes?: string | null;
  sold_at: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  items?: SaleItem[];
}

export interface ProcessSaleInput {
  customer_id?: string | null;
  customer_name?: string;
  payment_method: PaymentMethod;
  payment_status?: PaymentStatus;
  paid_amount: number;
  discount_amount?: number;
  tax_amount?: number;
  notes?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
  }>;
  idempotency_key?: string;
}

export interface ProcessSaleResult {
  success: boolean;
  sale_id: string;
  sale_number: string;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  due_amount: number;
  payment_status: PaymentStatus;
  sold_at: string;
  sale?: Sale;
}

export interface SaleFilter {
  customer_id?: string;
  payment_method?: PaymentMethod | 'all';
  payment_status?: PaymentStatus | 'all';
  status?: SaleStatus | 'all';
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

// Retain legacy interface aliases for backward compatibility if needed
export interface Product extends InventoryProduct {}
