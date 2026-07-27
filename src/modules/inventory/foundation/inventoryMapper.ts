import { InventoryProduct, CreateInventoryProductInput, UpdateInventoryProductInput } from '../products/types';
import { ProductCategory } from '../categories/types';
import { ProductUnit } from '../units/types';
import { DEFAULT_MIN_STOCK_ALERT } from '../products/constants';

export const inventoryMapper = {
  /**
   * Maps a raw Supabase products table row to an InventoryProduct interface.
   */
  mapDbRecordToProduct(item: any): InventoryProduct {
    return {
      id: item.id,
      business_id: item.business_id,
      user_id: item.business_id,
      name: item.name,
      unit: item.unit?.name || 'កញ្ចប់',
      unit_id: item.unit_id || null,
      category: item.category?.name || 'ទូទៅ',
      category_id: item.category_id || null,
      cost_price: Number(item.cost_price) || 0,
      selling_price: Number(item.selling_price) || 0,
      current_stock: Number(item.current_stock) || 0,
      sku: item.sku || null,
      barcode: item.barcode || null,
      description: null,
      image_url: item.image_url || null,
      min_stock_alert:
        item.min_stock_alert !== undefined && item.min_stock_alert !== null
          ? Number(item.min_stock_alert)
          : DEFAULT_MIN_STOCK_ALERT,
      is_archived: Boolean(item.is_archived),
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    };
  },

  /**
   * Maps a CreateInventoryProductInput object to a database insert payload.
   */
  mapCreateProductInputToDbPayload(businessId: string, input: CreateInventoryProductInput): Record<string, any> {
    return {
      business_id: businessId,
      name: input.name.trim(),
      sku: input.sku?.trim() || `SKU-${Date.now()}`,
      barcode: input.barcode?.trim() || null,
      cost_price: Number(input.cost_price) || 0,
      selling_price: Number(input.selling_price) || 0,
      current_stock: input.initial_stock !== undefined ? Number(input.initial_stock) : 0,
      min_stock_alert:
        input.min_stock_alert !== undefined && input.min_stock_alert !== null
          ? Number(input.min_stock_alert)
          : DEFAULT_MIN_STOCK_ALERT,
      image_url: input.image_url?.trim() || null,
      category_id: input.category_id || null,
      unit_id: input.unit_id || null,
      is_archived: false,
    };
  },

  /**
   * Maps an UpdateInventoryProductInput object to a database update payload.
   */
  mapUpdateProductInputToDbPayload(input: UpdateInventoryProductInput): Record<string, any> {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.category_id !== undefined) payload.category_id = input.category_id;
    if (input.unit_id !== undefined) payload.unit_id = input.unit_id;
    if (input.cost_price !== undefined) payload.cost_price = Number(input.cost_price);
    if (input.selling_price !== undefined) payload.selling_price = Number(input.selling_price);
    if (input.sku !== undefined) payload.sku = input.sku.trim() || null;
    if (input.barcode !== undefined) payload.barcode = input.barcode.trim() || null;
    if (input.image_url !== undefined) payload.image_url = input.image_url.trim() || null;
    if (input.min_stock_alert !== undefined) payload.min_stock_alert = Number(input.min_stock_alert);
    if (input.is_archived !== undefined) payload.is_archived = input.is_archived;

    return payload;
  },

  /**
   * Maps a raw Supabase product_categories table row to a ProductCategory model.
   */
  mapDbRecordToCategory(item: any, userId?: string): ProductCategory {
    return {
      id: item.id,
      user_id: userId || item.user_id || '',
      business_id: userId || item.business_id || '',
      name: item.name || '',
      description: item.description || null,
      color: item.color || '#6366f1',
      is_default: Boolean(item.is_default),
      is_archived: Boolean(item.is_archived),
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.created_at || new Date().toISOString(),
    };
  },

  /**
   * Maps category input to DB payload containing only existing columns (name).
   */
  mapCategoryInputToDbPayload(name: string): Record<string, any> {
    return {
      name: name.trim(),
    };
  },

  /**
   * Maps a raw Supabase product_units table row to a ProductUnit model.
   */
  mapDbRecordToUnit(item: any, userId?: string): ProductUnit {
    return {
      id: item.id,
      user_id: userId || item.user_id || '',
      business_id: userId || item.business_id || '',
      name: item.name || '',
      symbol: item.symbol || item.name || '',
      description: item.description || null,
      is_default: Boolean(item.is_default),
      is_archived: Boolean(item.is_archived),
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.created_at || new Date().toISOString(),
    };
  },

  /**
   * Maps unit input to DB payload containing only existing columns (name).
   */
  mapUnitInputToDbPayload(name: string): Record<string, any> {
    return {
      name: name.trim(),
    };
  },

  /**
   * Maps a raw Supabase stock_movements row to a StockMovement model.
   */
  mapDbRecordToStockMovement(item: any, userId?: string): any {
    const qty = Math.abs(Number(item.quantity) || 0);
    const balanceBefore = Number(item.balance_before) || 0;
    const balanceAfter = Number(item.balance_after) || 0;
    const rawType = item.movement_type || 'in';

    let delta = 0;
    if (rawType === 'in' || rawType === 'stock_in') {
      delta = qty;
    } else if (['out', 'stock_out', 'sale', 'damage', 'expired'].includes(rawType)) {
      delta = -qty;
    } else {
      delta = balanceAfter - balanceBefore;
    }

    return {
      id: item.id,
      user_id: userId || item.business_id || '',
      business_id: item.business_id || userId || '',
      product_id: item.product_id,
      product_name: item.products?.name || item.product_name || 'ទំនិញ',
      product_sku: item.products?.sku || item.product_sku || null,
      movement_type: rawType === 'in' ? 'stock_in' : rawType,
      quantity: qty,
      delta,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reason: item.reason || null,
      reference_type: item.reference_type || 'manual',
      reference_id: item.reference_id || null,
      reference_code: item.reference_code || null,
      movement_source: 'manual',
      status: 'completed',
      idempotency_key: item.idempotency_key || null,
      created_by: userId || item.business_id || '',
      created_at: item.created_at || new Date().toISOString(),
    };
  },
};
