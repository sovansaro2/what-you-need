/**
 * WYN ERP System - Purchase Shared Foundation
 * Purchase Event Emitter Integration
 */

import { appEventBus } from '@/core/events';
import { Supplier, PurchaseOrder } from './purchaseTypes';

export const purchaseEvents = {
  /**
   * Emits 'supplier:created' event.
   */
  emitSupplierCreated(supplier: Supplier, businessId: string): void {
    appEventBus.emit('supplier:created', {
      supplierId: supplier.id,
      businessId,
      companyName: supplier.company_name,
      phone: supplier.phone || undefined,
      email: supplier.email || undefined,
    });
  },

  /**
   * Emits 'supplier:updated' event.
   */
  emitSupplierUpdated(supplier: Supplier, businessId: string, changes: Record<string, any> = {}): void {
    appEventBus.emit('supplier:updated', {
      supplierId: supplier.id,
      businessId,
      companyName: supplier.company_name,
      changes,
    });
  },

  /**
   * Emits 'supplier:deleted' event.
   */
  emitSupplierDeleted(supplierId: string, businessId: string): void {
    appEventBus.emit('supplier:deleted', {
      supplierId,
      businessId,
    });
  },

  /**
   * Emits 'purchase:created' event.
   */
  emitPurchaseCreated(purchase: PurchaseOrder, businessId: string): void {
    appEventBus.emit('purchase:created', {
      purchaseId: purchase.id,
      poNumber: purchase.po_number,
      businessId,
      supplierId: purchase.supplier_id,
      totalAmount: purchase.total_amount,
      status: purchase.status,
      itemCount: purchase.items?.length || 0,
    });
  },

  /**
   * Emits 'purchase:updated' event.
   */
  emitPurchaseUpdated(purchase: PurchaseOrder, businessId: string, changes: Record<string, any> = {}): void {
    appEventBus.emit('purchase:updated', {
      purchaseId: purchase.id,
      poNumber: purchase.po_number,
      businessId,
      changes,
    });
  },

  /**
   * Emits 'purchase:received' event.
   */
  emitPurchaseReceived(purchase: PurchaseOrder, businessId: string, receivedAt: string): void {
    appEventBus.emit('purchase:received', {
      purchaseId: purchase.id,
      poNumber: purchase.po_number,
      businessId,
      supplierId: purchase.supplier_id,
      receivedAt,
      totalAmount: purchase.total_amount,
    });
  },

  /**
   * Emits 'purchase:cancelled' event.
   */
  emitPurchaseCancelled(purchaseId: string, poNumber: string, businessId: string, reason?: string): void {
    appEventBus.emit('purchase:cancelled', {
      purchaseId,
      poNumber,
      businessId,
      reason,
    });
  },
};
