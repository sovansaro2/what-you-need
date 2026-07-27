/**
 * WYN ERP System - Purchase Shared Foundation
 * Bidirectional Data Mapper (Database <-> Domain <-> DB Payload)
 */

import {
  Supplier,
  PurchaseOrder,
  PurchaseItem,
  CreateSupplierInput,
  UpdateSupplierInput,
  CreatePurchaseOrderInput,
  CreatePurchaseItemInput,
} from './purchaseTypes';

export const purchaseMapper = {
  /**
   * Maps DB record from public.suppliers to Supplier domain model.
   */
  mapDbToSupplier(record: any): Supplier {
    if (!record) {
      throw new Error('[PurchaseMapper Error] Cannot map null or undefined supplier record.');
    }
    return {
      id: record.id,
      business_id: record.business_id,
      supplier_code: record.supplier_code || null,
      company_name: record.company_name || '',
      contact_name: record.contact_name || null,
      phone: record.phone || null,
      email: record.email || null,
      address: record.address || null,
      outstanding_balance: Number(record.outstanding_balance) || 0,
      is_active: record.is_active ?? true,
      created_at: record.created_at,
      updated_at: record.updated_at,
      deleted_at: record.deleted_at || null,
      created_by: record.created_by || null,
      updated_by: record.updated_by || null,
    };
  },

  /**
   * Maps CreateSupplierInput / UpdateSupplierInput to DB write payload.
   */
  mapSupplierToDbPayload(businessId: string, input: CreateSupplierInput | UpdateSupplierInput): Record<string, any> {
    const payload: Record<string, any> = {
      business_id: businessId,
    };

    if (input.supplier_code !== undefined) payload.supplier_code = input.supplier_code?.trim() || null;
    if (input.company_name !== undefined) payload.company_name = input.company_name.trim();
    if (input.contact_name !== undefined) payload.contact_name = input.contact_name?.trim() || null;
    if (input.phone !== undefined) payload.phone = input.phone?.trim() || null;
    if (input.email !== undefined) payload.email = input.email?.trim() || null;
    if (input.address !== undefined) payload.address = input.address?.trim() || null;
    if (input.outstanding_balance !== undefined) payload.outstanding_balance = Number(input.outstanding_balance) || 0;
    if (input.is_active !== undefined) payload.is_active = Boolean(input.is_active);

    return payload;
  },

  /**
   * Maps DB record from public.purchase_items to PurchaseItem domain model.
   */
  mapDbToPurchaseItem(record: any): PurchaseItem {
    if (!record) {
      throw new Error('[PurchaseMapper Error] Cannot map null or undefined purchase_item record.');
    }
    const productRecord = record.product || record.products || null;
    return {
      id: record.id,
      business_id: record.business_id,
      purchase_order_id: record.purchase_order_id,
      product_id: record.product_id,
      quantity_ordered: Number(record.quantity_ordered) || 0,
      quantity_received: Number(record.quantity_received) || 0,
      unit_cost: Number(record.unit_cost) || 0,
      subtotal: Number(record.subtotal) || 0,
      created_at: record.created_at,
      product: productRecord
        ? {
            id: productRecord.id,
            name: productRecord.name || '',
            sku: productRecord.sku || null,
            barcode: productRecord.barcode || null,
          }
        : null,
    };
  },

  /**
   * Maps CreatePurchaseItemInput to DB write payload.
   */
  mapPurchaseItemToDbPayload(businessId: string, purchaseOrderId: string, item: CreatePurchaseItemInput): Record<string, any> {
    const qty = Number(item.quantity_ordered) || 0;
    const cost = Number(item.unit_cost) || 0;
    const subtotal = item.subtotal !== undefined ? Number(item.subtotal) : qty * cost;

    return {
      business_id: businessId,
      purchase_order_id: purchaseOrderId,
      product_id: item.product_id,
      quantity_ordered: qty,
      quantity_received: 0,
      unit_cost: cost,
      subtotal,
    };
  },

  /**
   * Maps DB record from public.purchase_orders to PurchaseOrder domain model.
   */
  mapDbToPurchaseOrder(record: any): PurchaseOrder {
    if (!record) {
      throw new Error('[PurchaseMapper Error] Cannot map null or undefined purchase_order record.');
    }

    const supplierRecord = record.supplier || record.suppliers || null;
    const supplier = supplierRecord ? this.mapDbToSupplier(supplierRecord) : null;

    const rawItems = record.purchase_items || record.items || [];
    const items = Array.isArray(rawItems) ? rawItems.map((item: any) => this.mapDbToPurchaseItem(item)) : [];

    const totalAmount = Number(record.total_amount) || 0;
    const paidAmount = Number(record.paid_amount) || 0;
    const dueAmount = record.due_amount !== undefined ? Number(record.due_amount) : Math.max(0, totalAmount - paidAmount);

    return {
      id: record.id,
      business_id: record.business_id,
      supplier_id: record.supplier_id,
      po_number: record.po_number || '',
      status: record.status || 'draft',
      payment_status: record.payment_status || 'unpaid',
      total_amount: totalAmount,
      paid_amount: paidAmount,
      due_amount: dueAmount,
      expected_delivery_date: record.expected_delivery_date || null,
      received_at: record.received_at || null,
      notes: record.notes || null,
      created_at: record.created_at,
      updated_at: record.updated_at,
      deleted_at: record.deleted_at || null,
      created_by: record.created_by || null,
      updated_by: record.updated_by || null,
      supplier,
      items,
    };
  },

  /**
   * Maps CreatePurchaseOrderInput to DB write payload.
   */
  mapPurchaseOrderToDbPayload(businessId: string, input: CreatePurchaseOrderInput): Record<string, any> {
    const totalAmount = Number(input.total_amount) || 0;
    const paidAmount = Number(input.paid_amount) || 0;
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    return {
      business_id: businessId,
      supplier_id: input.supplier_id,
      po_number: input.po_number || `PO-${Date.now().toString().slice(-6)}`,
      status: input.status || 'draft',
      payment_status: input.payment_status || (paidAmount >= totalAmount && totalAmount > 0 ? 'paid' : paidAmount > 0 ? 'partially_paid' : 'unpaid'),
      total_amount: totalAmount,
      paid_amount: paidAmount,
      due_amount: dueAmount,
      expected_delivery_date: input.expected_delivery_date || null,
      notes: input.notes?.trim() || null,
    };
  },
};
