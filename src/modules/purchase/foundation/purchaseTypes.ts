/**
 * WYN ERP System - Purchase Shared Foundation
 * Domain Types, Input DTOs, and Status Enums
 */

export type PurchaseStatus = 'draft' | 'ordered' | 'received' | 'cancelled';
export type PurchasePaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface Supplier {
  id: string;
  business_id: string;
  supplier_code: string | null;
  company_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  outstanding_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface PurchaseItem {
  id: string;
  business_id: string;
  purchase_order_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  subtotal: number;
  created_at: string;
  // Optional relations
  product?: {
    id: string;
    name: string;
    sku?: string | null;
    barcode?: string | null;
  } | null;
}

export interface PurchaseOrder {
  id: string;
  business_id: string;
  supplier_id: string;
  po_number: string;
  status: PurchaseStatus;
  payment_status: PurchasePaymentStatus;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  expected_delivery_date: string | null;
  received_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  // Optional relations
  supplier?: Supplier | null;
  items?: PurchaseItem[];
}

export interface CreateSupplierInput {
  business_id: string;
  supplier_code?: string;
  company_name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  outstanding_balance?: number;
  is_active?: boolean;
}

export interface UpdateSupplierInput {
  business_id: string;
  supplier_code?: string;
  company_name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  outstanding_balance?: number;
  is_active?: boolean;
}

export interface CreatePurchaseItemInput {
  product_id: string;
  quantity_ordered: number;
  unit_cost: number;
  subtotal?: number;
}

export interface CreatePurchaseOrderInput {
  business_id: string;
  supplier_id: string;
  po_number?: string;
  status?: PurchaseStatus;
  payment_status?: PurchasePaymentStatus;
  total_amount?: number;
  paid_amount?: number;
  expected_delivery_date?: string;
  notes?: string;
  items: CreatePurchaseItemInput[];
}

export interface UpdatePurchaseOrderInput {
  business_id: string;
  supplier_id?: string;
  po_number?: string;
  status?: PurchaseStatus;
  payment_status?: PurchasePaymentStatus;
  total_amount?: number;
  paid_amount?: number;
  expected_delivery_date?: string;
  notes?: string;
  items?: CreatePurchaseItemInput[];
}

export interface ReceivePurchaseItemInput {
  item_id: string;
  quantity_received: number;
}

export interface ReceivePurchaseInput {
  business_id: string;
  purchase_order_id: string;
  received_at?: string;
  items: ReceivePurchaseItemInput[];
  notes?: string;
}
