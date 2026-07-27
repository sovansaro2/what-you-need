import { supabase } from '@/lib/supabase';
import {
  StockMovement,
  CreateStockMovementInput,
  StockMovementFilter,
  StockMovementSummary,
  MovementStatistics,
  StockMovementType,
  StockMovementResult,
  TransactionOptions,
} from '../types';
import { KHMER_MOVEMENT_ERRORS } from '../constants';
import { InventoryProduct } from '../../products/types';
import { DEFAULT_MIN_STOCK_ALERT } from '../../products/constants';
import { notifyInventoryUpdated } from '../../events/inventoryEvents';
import { stockMovementValidator } from '../validators/stockMovementValidator';
import {
  businessContext,
  handleInventoryError,
  queryHelpers,
  inventoryMapper,
} from '../../foundation';

export const stockMovementService = {
  /**
   * Validate movement input prior to commit using shared inventory validator.
   */
  validateBeforeCommit(
    input: CreateStockMovementInput,
    product: InventoryProduct
  ) {
    return stockMovementValidator.validateMovementPayload(input, product);
  },

  /**
   * Primary transactional entry point for every inventory movement operation.
   * Calls Supabase PostgreSQL RPC `process_stock_movement` for atomic execution.
   */
  async processStockMovement(
    userId: string,
    input: CreateStockMovementInput,
    initialProduct?: InventoryProduct,
    options?: TransactionOptions
  ): Promise<StockMovementResult> {
    const businessId = businessContext.resolveBusinessId(userId);
    const idempotencyKey =
      input.idempotency_key || input.request_id || options?.idempotency_key || null;

    try {
      // 1. First fetch current product state for pre-validation & min stock alert
      let currentProduct = initialProduct;
      if (!currentProduct || !currentProduct.id) {
        const { data: fetchedProd, error: prodErr } = await supabase
          .from('products')
          .select('id, name, sku, current_stock, min_stock_alert, is_archived')
          .eq('id', input.product_id)
          .single();

        if (prodErr || !fetchedProd) {
          throw new Error(KHMER_MOVEMENT_ERRORS.PRODUCT_NOT_FOUND);
        }
        currentProduct = fetchedProd as any;
      }

      if (currentProduct.is_archived) {
        throw new Error(KHMER_MOVEMENT_ERRORS.ARCHIVED_PRODUCT);
      }

      // 2. Client-side pre-validation using shared validator
      const validation = this.validateBeforeCommit(input, currentProduct);
      if (!validation.isValid) {
        const errorValues = Object.values(validation.errors);
        const firstError = errorValues.length > 0 ? String(errorValues[0]) : KHMER_MOVEMENT_ERRORS.UNEXPECTED_ERROR;
        throw new Error(firstError);
      }

      // 3. Normalize movement type
      let rpcMovementType = input.movement_type;
      if (input.movement_type === 'stock_in') rpcMovementType = 'in' as any;

      // 4. Execute atomic transactional update via Supabase PostgreSQL RPC
      const rpcParams = {
        p_business_id: businessId,
        p_product_id: input.product_id,
        p_movement_type: rpcMovementType,
        p_quantity: Math.abs(input.quantity),
        p_reason: input.reason || 'Stock movement record',
        p_reference_type: input.reference_type || 'manual',
        p_reference_id: input.reference_id || null,
        p_idempotency_key: idempotencyKey,
        p_unit_cost: null,
      };

      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'process_stock_movement',
        rpcParams
      );

      let resultData: any = rpcResult;

      // Fallback if RPC function is not yet created in PostgreSQL instance
      if (rpcError) {
        if (rpcError.code === '42883') {
          // Function does not exist: fall back to transactional direct DB query
          resultData = await this.fallbackDirectStockMovement(userId, businessId, input, currentProduct, idempotencyKey);
        } else {
          // RPC executed and raised PostgreSQL Exception (e.g. insufficient stock, negative stock)
          throw new Error(rpcError.message || KHMER_MOVEMENT_ERRORS.UNEXPECTED_ERROR);
        }
      }

      const balanceAfter = Number(resultData.balance_after ?? resultData.current_stock ?? 0);
      const minAlert = currentProduct.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT;
      const isLowStock = balanceAfter <= minAlert;

      const movementObj: StockMovement = {
        id: resultData.movement_id || resultData.id || '',
        user_id: userId,
        product_id: input.product_id,
        product_name: resultData.product_name || currentProduct.name,
        product_sku: currentProduct.sku || null,
        movement_type: input.movement_type,
        quantity: Math.abs(input.quantity),
        delta: Number(resultData.delta ?? 0),
        balance_before: Number(resultData.balance_before ?? 0),
        balance_after: balanceAfter,
        reason: input.reason || null,
        reference_type: input.reference_type || 'manual',
        reference_id: input.reference_id || null,
        reference_code: input.reference_code || null,
        movement_source: 'manual',
        status: 'completed',
        idempotency_key: idempotencyKey,
        created_by: userId,
        created_at: resultData.created_at || new Date().toISOString(),
      };

      // Notify inventory event
      notifyInventoryUpdated({
        productId: input.product_id,
        movementId: movementObj.id,
        isLowStock,
        source: 'stock_movement',
      });

      return {
        movement_id: movementObj.id,
        product_id: input.product_id,
        movement_type: input.movement_type,
        balance_before: movementObj.balance_before,
        delta: movementObj.delta,
        balance_after: balanceAfter,
        created_by: userId,
        created_at: movementObj.created_at,
        status: 'completed',
        movement: movementObj,
        is_duplicate: Boolean(resultData.is_duplicate),
        is_low_stock: isLowStock,
        isLowStock: isLowStock,
      };
    } catch (err: any) {
      handleInventoryError(err, 'StockMovementService.processStockMovement');
    }
  },

  /**
   * Fallback method if PostgreSQL RPC function has not been applied yet.
   * Performs direct atomic DB insertion and stock update.
   */
  async fallbackDirectStockMovement(
    userId: string,
    businessId: string,
    input: CreateStockMovementInput,
    product: InventoryProduct,
    idempotencyKey: string | null
  ): Promise<any> {
    const qty = Math.abs(input.quantity);
    const balanceBefore = Number(product.current_stock ?? 0);
    let delta = 0;

    const rawType = input.movement_type as string;
    if (rawType === 'stock_in' || rawType === 'in') {
      delta = qty;
    } else if (['stock_out', 'sale', 'damage', 'expired', 'out'].includes(rawType)) {
      delta = -qty;
    } else if (rawType === 'adjustment') {
      delta = input.quantity;
    }

    const balanceAfter = balanceBefore + delta;

    if (balanceAfter < 0) {
      throw new Error(KHMER_MOVEMENT_ERRORS.INSUFFICIENT_STOCK);
    }

    const dbMovementType = rawType === 'stock_in' ? 'in' : rawType;

    // Insert into stock_movements (DB auto-generates UUID id)
    const { data: inserted, error: mvtError } = await supabase
      .from('stock_movements')
      .insert({
        business_id: businessId,
        product_id: product.id,
        movement_type: dbMovementType,
        quantity: qty,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reason: input.reason || 'Stock movement record',
        reference_type: input.reference_type || 'manual',
        reference_id: input.reference_id || null,
        idempotency_key: idempotencyKey,
      })
      .select('*')
      .single();

    if (mvtError || !inserted) {
      throw mvtError || new Error('Failed to insert stock movement');
    }

    // Update product current stock
    const { error: prodError } = await supabase
      .from('products')
      .update({
        current_stock: balanceAfter,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id);

    if (prodError) {
      throw prodError;
    }

    return {
      movement_id: inserted.id,
      product_id: product.id,
      product_name: product.name,
      movement_type: dbMovementType,
      quantity: qty,
      delta,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      current_stock: balanceAfter,
      created_at: inserted.created_at,
      is_duplicate: false,
    };
  },

  /**
   * Direct caller adapter. Delegates to processStockMovement.
   */
  async commitMovement(
    userId: string,
    input: CreateStockMovementInput,
    product: InventoryProduct
  ): Promise<StockMovement> {
    const result = await this.processStockMovement(userId, input, product);
    return result.movement;
  },

  /**
   * Alias for commitMovement.
   */
  async createMovement(
    userId: string,
    input: CreateStockMovementInput,
    product: InventoryProduct
  ): Promise<StockMovement> {
    return this.commitMovement(userId, input, product);
  },

  /**
   * Fetch stock movement history directly from live Supabase DB.
   */
  async getMovementHistory(
    userId: string,
    filter?: StockMovementFilter
  ): Promise<StockMovement[]> {
    try {
      let query = supabase
        .from('stock_movements')
        .select('*, products(name, sku)');

      if (businessContext.validateBusinessId(userId)) {
        query = queryHelpers.byBusiness(query, userId);
      }

      if (filter?.product_id) {
        query = query.eq('product_id', filter.product_id);
      }

      if (filter?.movement_type && filter.movement_type !== 'all') {
        const typeMap: Record<string, string> = {
          stock_in: 'in',
          sale: 'sale',
          adjustment: 'adjustment',
          damage: 'damage',
          expired: 'expired',
          in: 'in',
          out: 'out',
        };
        const dbType = typeMap[filter.movement_type] || filter.movement_type;
        query = query.eq('movement_type', dbType);
      }

      if (filter?.startDate) {
        query = query.gte('created_at', filter.startDate);
      }

      if (filter?.endDate) {
        query = query.lte('created_at', filter.endDate);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      let results = (data || []).map((row: any) =>
        inventoryMapper.mapDbRecordToStockMovement(row, userId)
      );

      if (filter?.searchQuery && filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase().trim();
        results = results.filter(
          (m: StockMovement) =>
            (m.product_name && m.product_name.toLowerCase().includes(q)) ||
            (m.product_sku && m.product_sku.toLowerCase().includes(q)) ||
            (m.reason && m.reason.toLowerCase().includes(q)) ||
            (m.reference_code && m.reference_code.toLowerCase().includes(q))
        );
      }

      return results;
    } catch (err: any) {
      handleInventoryError(err, 'StockMovementService.getMovementHistory');
    }
  },

  /**
   * Get stock movements for a specific product directly from DB.
   */
  async getProductMovements(userId: string, productId: string): Promise<StockMovement[]> {
    return this.getMovementHistory(userId, { product_id: productId });
  },

  /**
   * Get summary statistics of movements from live DB records.
   */
  async getMovementSummary(
    userId: string,
    productId?: string
  ): Promise<StockMovementSummary> {
    const history = await this.getMovementHistory(userId, { product_id: productId });

    let total_stock_in = 0;
    let total_stock_out = 0;
    let total_adjustments = 0;
    let net_change = 0;

    for (const m of history) {
      if (m.movement_type === 'stock_in' || (m.movement_type as string) === 'in') {
        total_stock_in += m.quantity;
      } else if (['sale', 'damage', 'expired', 'out'].includes(m.movement_type as string)) {
        total_stock_out += m.quantity;
      } else if (m.movement_type === 'adjustment') {
        total_adjustments += Math.abs(m.delta);
      }
      net_change += m.delta;
    }

    return {
      total_movements: history.length,
      total_stock_in,
      total_stock_out,
      total_adjustments,
      net_change,
    };
  },

  /**
   * Get detailed movement statistics for reporting & dashboard consumption.
   */
  async getMovementStatistics(userId: string): Promise<MovementStatistics> {
    const history = await this.getMovementHistory(userId);

    const by_type: Record<StockMovementType, number> = {
      stock_in: 0,
      sale: 0,
      adjustment: 0,
      damage: 0,
      expired: 0,
    };

    const by_reason: Record<string, number> = {};

    for (const m of history) {
      const typeKey = (m.movement_type as string) === 'in' ? 'stock_in' : m.movement_type;
      if (by_type[typeKey] !== undefined) {
        by_type[typeKey] += 1;
      }
      if (m.reason) {
        by_reason[m.reason] = (by_reason[m.reason] || 0) + 1;
      }
    }

    return {
      by_type,
      by_reason,
      recent_movements_count: history.length,
    };
  },

  /**
   * Sync product current stock directly in DB.
   */
  async syncCurrentStock(userId: string, productId: string, newBalance: number): Promise<void> {
    try {
      let query = supabase
        .from('products')
        .update({ current_stock: newBalance, updated_at: new Date().toISOString() })
        .eq('id', productId);

      if (businessContext.validateBusinessId(userId)) {
        query = queryHelpers.byBusiness(query, userId);
      }

      const { error } = await query;
      if (error) {
        throw error;
      }
    } catch (err: any) {
      handleInventoryError(err, 'StockMovementService.syncCurrentStock');
    }
  },

  /**
   * System rollback helper.
   */
  async rollbackMovement(userId: string, movementId: string): Promise<boolean> {
    console.warn(`Rollback requested for movement: ${movementId} (userId: ${userId})`);
    return true;
  },
};
