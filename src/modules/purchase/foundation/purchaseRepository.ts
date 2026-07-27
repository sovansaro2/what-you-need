/**
 * WYN ERP System - Purchase Shared Foundation
 * Multi-Tenant Purchase Repositories (Suppliers, Purchase Orders, Purchase Items)
 */

import { supabase } from '@/lib/supabase';
import { safeAsync, DatabaseError, NotFoundError } from '@/core/errors';
import { purchaseContext } from './purchaseContext';
import { purchaseMapper } from './purchaseMapper';
import { purchaseValidator } from './purchaseValidator';
import {
  Supplier,
  PurchaseOrder,
  PurchaseItem,
  CreateSupplierInput,
  UpdateSupplierInput,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  CreatePurchaseItemInput,
  PurchaseStatus,
} from './purchaseTypes';

export class BasePurchaseRepository {
  constructor(protected tableName: string) {}

  /**
   * Scopes queries strictly by business_id.
   */
  protected getBaseQuery(businessId: string) {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    return supabase.from(this.tableName).select('*').eq('business_id', validBusinessId);
  }
}

/**
 * Supplier Repository
 */
export class SupplierRepository extends BasePurchaseRepository {
  constructor() {
    super('suppliers');
  }

  async findAll(businessId: string): Promise<Supplier[]> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    const [data, error] = await safeAsync(
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*')
          .eq('business_id', validBusinessId)
          .is('deleted_at', null)
          .order('company_name', { ascending: true });

        if (error) throw error;
        return (data || []).map((row) => purchaseMapper.mapDbToSupplier(row));
      },
      `SupplierRepository.findAll`
    );

    if (error) throw error;
    return data || [];
  }

  async findById(businessId: string, id: string): Promise<Supplier> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    const [data, error] = await safeAsync(
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*')
          .eq('id', id)
          .eq('business_id', validBusinessId)
          .is('deleted_at', null)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new NotFoundError('Supplier', id);
        return purchaseMapper.mapDbToSupplier(data);
      },
      `SupplierRepository.findById`
    );

    if (error) throw error;
    if (!data) throw new NotFoundError('Supplier', id);
    return data;
  }

  async create(businessId: string, input: CreateSupplierInput): Promise<Supplier> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    purchaseValidator.validateCreateSupplier({ ...input, business_id: validBusinessId });

    const payload = purchaseMapper.mapSupplierToDbPayload(validBusinessId, input);

    const [data, error] = await safeAsync(
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .insert(payload)
          .select('*')
          .single();

        if (error) throw error;
        return purchaseMapper.mapDbToSupplier(data);
      },
      `SupplierRepository.create`
    );

    if (error) throw error;
    if (!data) throw new DatabaseError(new Error('Failed to create supplier'), 'SupplierRepository.create');
    return data;
  }

  async update(businessId: string, id: string, input: UpdateSupplierInput): Promise<Supplier> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    purchaseValidator.validateUpdateSupplier({ ...input, business_id: validBusinessId });

    const existing = await this.findById(validBusinessId, id);
    purchaseValidator.validateBusinessOwnership(validBusinessId, existing.business_id);

    const payload = purchaseMapper.mapSupplierToDbPayload(validBusinessId, input);
    payload.updated_at = new Date().toISOString();

    const [data, error] = await safeAsync(
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .update(payload)
          .eq('id', id)
          .eq('business_id', validBusinessId)
          .select('*')
          .single();

        if (error) throw error;
        return purchaseMapper.mapDbToSupplier(data);
      },
      `SupplierRepository.update`
    );

    if (error) throw error;
    if (!data) throw new DatabaseError(new Error('Failed to update supplier'), 'SupplierRepository.update');
    return data;
  }

  async delete(businessId: string, id: string): Promise<boolean> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    const existing = await this.findById(validBusinessId, id);
    purchaseValidator.validateBusinessOwnership(validBusinessId, existing.business_id);

    const [success, error] = await safeAsync(
      async () => {
        const { error } = await supabase
          .from(this.tableName)
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)
          .eq('business_id', validBusinessId);

        if (error) throw error;
        return true;
      },
      `SupplierRepository.delete`
    );

    if (error) throw error;
    return success ?? false;
  }
}

/**
 * Purchase Item Repository
 */
export class PurchaseItemRepository extends BasePurchaseRepository {
  constructor() {
    super('purchase_items');
  }

  async findByOrderId(businessId: string, purchaseOrderId: string): Promise<PurchaseItem[]> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    const [data, error] = await safeAsync(
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*, product:products(id, name, sku, barcode)')
          .eq('purchase_order_id', purchaseOrderId)
          .eq('business_id', validBusinessId);

        if (error) throw error;
        return (data || []).map((row) => purchaseMapper.mapDbToPurchaseItem(row));
      },
      `PurchaseItemRepository.findByOrderId`
    );

    if (error) throw error;
    return data || [];
  }

  async createMany(businessId: string, purchaseOrderId: string, items: CreatePurchaseItemInput[]): Promise<PurchaseItem[]> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    const payloads = items.map((item) => purchaseMapper.mapPurchaseItemToDbPayload(validBusinessId, purchaseOrderId, item));

    const [data, error] = await safeAsync(
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .insert(payloads)
          .select('*, product:products(id, name, sku, barcode)');

        if (error) throw error;
        return (data || []).map((row) => purchaseMapper.mapDbToPurchaseItem(row));
      },
      `PurchaseItemRepository.createMany`
    );

    if (error) throw error;
    return data || [];
  }

  async updateReceivedQuantity(businessId: string, itemId: string, quantityReceived: number): Promise<PurchaseItem> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    const [data, error] = await safeAsync(
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .update({ quantity_received: quantityReceived })
          .eq('id', itemId)
          .eq('business_id', validBusinessId)
          .select('*, product:products(id, name, sku, barcode)')
          .single();

        if (error) throw error;
        return purchaseMapper.mapDbToPurchaseItem(data);
      },
      `PurchaseItemRepository.updateReceivedQuantity`
    );

    if (error) throw error;
    if (!data) throw new NotFoundError('PurchaseItem', itemId);
    return data;
  }

  async deleteByOrderId(businessId: string, purchaseOrderId: string): Promise<boolean> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    const [success, error] = await safeAsync(
      async () => {
        const { error } = await supabase
          .from(this.tableName)
          .delete()
          .eq('purchase_order_id', purchaseOrderId)
          .eq('business_id', validBusinessId);

        if (error) throw error;
        return true;
      },
      `PurchaseItemRepository.deleteByOrderId`
    );

    if (error) throw error;
    return success ?? false;
  }
}

/**
 * Purchase Order Repository
 */
export class PurchaseOrderRepository extends BasePurchaseRepository {
  private itemRepo = new PurchaseItemRepository();

  constructor() {
    super('purchase_orders');
  }

  async findAll(
    businessId: string,
    filters?: { supplier_id?: string; status?: PurchaseStatus }
  ): Promise<PurchaseOrder[]> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    const [data, error] = await safeAsync(
      async () => {
        let query = supabase
          .from(this.tableName)
          .select('*, supplier:suppliers(*), items:purchase_items(*, product:products(id, name, sku, barcode))')
          .eq('business_id', validBusinessId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (filters?.supplier_id) {
          query = query.eq('supplier_id', filters.supplier_id);
        }
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((row) => purchaseMapper.mapDbToPurchaseOrder(row));
      },
      `PurchaseOrderRepository.findAll`
    );

    if (error) throw error;
    return data || [];
  }

  async findById(businessId: string, id: string): Promise<PurchaseOrder> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    const [data, error] = await safeAsync(
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*, supplier:suppliers(*), items:purchase_items(*, product:products(id, name, sku, barcode))')
          .eq('id', id)
          .eq('business_id', validBusinessId)
          .is('deleted_at', null)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new NotFoundError('PurchaseOrder', id);
        return purchaseMapper.mapDbToPurchaseOrder(data);
      },
      `PurchaseOrderRepository.findById`
    );

    if (error) throw error;
    if (!data) throw new NotFoundError('PurchaseOrder', id);
    return data;
  }

  async create(businessId: string, input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    purchaseValidator.validateCreatePurchaseOrder({ ...input, business_id: validBusinessId });

    const orderPayload = purchaseMapper.mapPurchaseOrderToDbPayload(validBusinessId, input);

    const [orderData, error] = await safeAsync(
      async () => {
        const { data: order, error: orderErr } = await supabase
          .from(this.tableName)
          .insert(orderPayload)
          .select('*')
          .single();

        if (orderErr) throw orderErr;

        if (input.items && input.items.length > 0) {
          await this.itemRepo.createMany(validBusinessId, order.id, input.items);
        }

        return this.findById(validBusinessId, order.id);
      },
      `PurchaseOrderRepository.create`
    );

    if (error) throw error;
    if (!orderData) throw new DatabaseError(new Error('Failed to create purchase order'), 'PurchaseOrderRepository.create');
    return orderData;
  }

  async update(businessId: string, id: string, input: UpdatePurchaseOrderInput): Promise<PurchaseOrder> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    purchaseValidator.validateUpdatePurchaseOrder({ ...input, business_id: validBusinessId });

    const existing = await this.findById(validBusinessId, id);
    purchaseValidator.validateBusinessOwnership(validBusinessId, existing.business_id);

    const [updatedOrder, error] = await safeAsync(
      async () => {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (input.supplier_id !== undefined) payload.supplier_id = input.supplier_id;
        if (input.po_number !== undefined) payload.po_number = input.po_number;
        if (input.status !== undefined) payload.status = input.status;
        if (input.payment_status !== undefined) payload.payment_status = input.payment_status;
        if (input.total_amount !== undefined) payload.total_amount = Number(input.total_amount);
        if (input.paid_amount !== undefined) payload.paid_amount = Number(input.paid_amount);
        if (input.expected_delivery_date !== undefined) payload.expected_delivery_date = input.expected_delivery_date || null;
        if (input.notes !== undefined) payload.notes = input.notes?.trim() || null;

        if (input.total_amount !== undefined || input.paid_amount !== undefined) {
          const newTotal = input.total_amount !== undefined ? Number(input.total_amount) : existing.total_amount;
          const newPaid = input.paid_amount !== undefined ? Number(input.paid_amount) : existing.paid_amount;
          payload.due_amount = Math.max(0, newTotal - newPaid);
        }

        const { error: updateErr } = await supabase
          .from(this.tableName)
          .update(payload)
          .eq('id', id)
          .eq('business_id', validBusinessId);

        if (updateErr) throw updateErr;

        if (input.items !== undefined) {
          await this.itemRepo.deleteByOrderId(validBusinessId, id);
          if (input.items.length > 0) {
            await this.itemRepo.createMany(validBusinessId, id, input.items);
          }
        }

        return this.findById(validBusinessId, id);
      },
      `PurchaseOrderRepository.update`
    );

    if (error) throw error;
    if (!updatedOrder) throw new DatabaseError(new Error('Failed to update purchase order'), 'PurchaseOrderRepository.update');
    return updatedOrder;
  }

  async updateStatus(
    businessId: string,
    id: string,
    status: PurchaseStatus,
    receivedAt?: string
  ): Promise<PurchaseOrder> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    const existing = await this.findById(validBusinessId, id);
    purchaseValidator.validateBusinessOwnership(validBusinessId, existing.business_id);

    const [data, error] = await safeAsync(
      async () => {
        const payload: Record<string, any> = {
          status,
          updated_at: new Date().toISOString(),
        };
        if (status === 'received') {
          payload.received_at = receivedAt || new Date().toISOString();
        }

        const { error: updateErr } = await supabase
          .from(this.tableName)
          .update(payload)
          .eq('id', id)
          .eq('business_id', validBusinessId);

        if (updateErr) throw updateErr;
        return this.findById(validBusinessId, id);
      },
      `PurchaseOrderRepository.updateStatus`
    );

    if (error) throw error;
    if (!data) throw new DatabaseError(new Error('Failed to update purchase status'), 'PurchaseOrderRepository.updateStatus');
    return data;
  }

  async delete(businessId: string, id: string): Promise<boolean> {
    const validBusinessId = purchaseContext.resolveBusinessId(businessId);
    const existing = await this.findById(validBusinessId, id);
    purchaseValidator.validateBusinessOwnership(validBusinessId, existing.business_id);

    const [success, error] = await safeAsync(
      async () => {
        const { error } = await supabase
          .from(this.tableName)
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)
          .eq('business_id', validBusinessId);

        if (error) throw error;
        return true;
      },
      `PurchaseOrderRepository.delete`
    );

    if (error) throw error;
    return success ?? false;
  }
}

export const supplierRepository = new SupplierRepository();
export const purchaseItemRepository = new PurchaseItemRepository();
export const purchaseOrderRepository = new PurchaseOrderRepository();
