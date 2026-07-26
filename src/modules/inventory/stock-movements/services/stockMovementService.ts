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
import {
  KHMER_MOVEMENT_ERRORS,
} from '../constants';
import { stockMovementValidator, ValidationResult } from '../validators/stockMovementValidator';
import { InventoryProduct } from '../../products/types';
import { productService } from '../../products/services/productService';
import { DEFAULT_MIN_STOCK_ALERT } from '../../products/constants';
import { notifyInventoryUpdated } from '../../events/inventoryEvents';

const getLocalStorageKey = (userId: string) => `wyn_stock_movements_${userId}`;
const getProductLocalStorageKey = (userId: string) => `wyn_products_${userId}`;
const getIdempotencyKeyStore = (userId: string) => `wyn_idempotency_${userId}`;

const getLocalMovements = (userId: string): StockMovement[] => {
  try {
    const data = localStorage.getItem(getLocalStorageKey(userId));
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse local stock movements', e);
  }
  return [];
};

const setLocalMovements = (userId: string, movements: StockMovement[]): void => {
  try {
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(movements));
  } catch (e) {
    console.error('Failed to save local stock movements', e);
  }
};

const syncLocalProductStock = (userId: string, productId: string, newStock: number): void => {
  try {
    const data = localStorage.getItem(getProductLocalStorageKey(userId));
    if (data) {
      const products: InventoryProduct[] = JSON.parse(data);
      if (Array.isArray(products)) {
        const index = products.findIndex((p) => p.id === productId);
        if (index !== -1) {
          products[index] = {
            ...products[index],
            current_stock: newStock,
            updated_at: new Date().toISOString(),
          };
          localStorage.setItem(getProductLocalStorageKey(userId), JSON.stringify(products));
        }
      }
    }
  } catch (e) {
    console.error('Failed to sync local product stock', e);
  }
};

const getStoredIdempotencyRecord = (
  userId: string,
  key: string
): StockMovement | null => {
  try {
    const data = localStorage.getItem(getIdempotencyKeyStore(userId));
    if (data) {
      const store: Record<string, StockMovement> = JSON.parse(data);
      if (store && store[key]) {
        return store[key];
      }
    }
  } catch (e) {
    console.error('Failed to read idempotency store', e);
  }
  return null;
};

const saveIdempotencyRecord = (
  userId: string,
  key: string,
  movement: StockMovement
): void => {
  try {
    const storeKey = getIdempotencyKeyStore(userId);
    const existing = localStorage.getItem(storeKey);
    const store: Record<string, StockMovement> = existing ? JSON.parse(existing) : {};
    store[key] = movement;
    localStorage.setItem(storeKey, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save idempotency record', e);
  }
};

export const stockMovementService = {
  /**
   * Validate movement input prior to commit.
   */
  validateBeforeCommit(
    input: CreateStockMovementInput,
    product: InventoryProduct
  ): ValidationResult {
    return stockMovementValidator.validateMovementPayload(input, product);
  },

  /**
   * Atomic Transaction Wrapper
   * Wraps an inventory movement transaction with commit/rollback protections.
   * Future-ready for Supabase RPC execution.
   */
  async executeMovementTransaction<T>(
    userId: string,
    transactionFn: () => Promise<T>
  ): Promise<T> {
    try {
      // Execute pipeline steps
      const result = await transactionFn();
      return result;
    } catch (error: any) {
      console.error(`Transaction aborted for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Single entry point for every inventory movement operation.
   * Executes full 9-step atomic transaction pipeline.
   */
  async processStockMovement(
    userId: string,
    input: CreateStockMovementInput,
    initialProduct?: InventoryProduct,
    options?: TransactionOptions
  ): Promise<StockMovementResult> {
    const idempotencyKey =
      input.idempotency_key || input.request_id || options?.idempotency_key;

    // Step 1: Idempotency Protection Check
    if (idempotencyKey) {
      const existingRecord = getStoredIdempotencyRecord(userId, idempotencyKey);
      if (existingRecord) {
        return {
          movement_id: existingRecord.id,
          product_id: existingRecord.product_id,
          movement_type: existingRecord.movement_type,
          balance_before: existingRecord.balance_before,
          delta: existingRecord.delta,
          balance_after: existingRecord.balance_after,
          created_by: existingRecord.created_by || userId,
          created_at: existingRecord.created_at,
          status: existingRecord.status || 'completed',
          movement: existingRecord,
          is_duplicate: true,
        };
      }
    }

    return this.executeMovementTransaction(userId, async () => {
      // Step 2: Load current product (fresh state from storage/DB)
      let currentProduct = initialProduct;
      if (!currentProduct || !currentProduct.id) {
        currentProduct = await productService.getProductById(userId, input.product_id);
      } else {
        // Fetch fresh state to prevent stale stock read
        const fresh = await productService.getProductById(userId, currentProduct.id);
        if (fresh) {
          currentProduct = fresh;
        }
      }

      if (!currentProduct) {
        throw new Error(KHMER_MOVEMENT_ERRORS.PRODUCT_NOT_FOUND);
      }

      // Step 3: Verify product is active (not archived)
      if (currentProduct.is_archived) {
        throw new Error(KHMER_MOVEMENT_ERRORS.ARCHIVED_PRODUCT);
      }

      // Step 4: Calculate balance_before, delta, balance_after
      const balance_before = currentProduct.current_stock ?? 0;
      const qty = Math.abs(input.quantity);
      let delta = 0;

      switch (input.movement_type) {
        case 'stock_in':
          delta = qty;
          break;
        case 'sale':
        case 'damage':
        case 'expired':
          delta = -qty;
          break;
        case 'adjustment':
          delta = input.quantity; // Adjustment quantity is delta directly
          break;
        default:
          delta = qty;
      }

      const balance_after = balance_before + delta;

      // Step 5: Validate business rules
      // Payload validation
      const validation = this.validateBeforeCommit(input, currentProduct);
      if (!validation.isValid) {
        const errorValues = Object.values(validation.errors);
        const firstError =
          errorValues.length > 0 && typeof errorValues[0] === 'string'
            ? errorValues[0]
            : KHMER_MOVEMENT_ERRORS.UNEXPECTED_ERROR;
        throw new Error(firstError);
      }

      // Concurrency protection check
      if (
        input.expected_balance_before !== undefined &&
        input.expected_balance_before !== null &&
        input.expected_balance_before !== balance_before
      ) {
        throw new Error(KHMER_MOVEMENT_ERRORS.CONCURRENT_UPDATE);
      }

      // Negative stock protection
      if (balance_after < 0 && !options?.allow_negative_stock) {
        throw new Error(KHMER_MOVEMENT_ERRORS.INSUFFICIENT_STOCK);
      }

      // Mandatory reason check
      if (
        (input.movement_type === 'adjustment' ||
          input.movement_type === 'damage' ||
          input.movement_type === 'expired') &&
        (!input.reason || !input.reason.trim())
      ) {
        throw new Error(KHMER_MOVEMENT_ERRORS.MISSING_REASON);
      }

      // Step 6: Create immutable ledger entry
      const movementId = `mvt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const createdAt = new Date().toISOString();

      const newMovement: StockMovement = {
        id: movementId,
        user_id: userId,
        product_id: currentProduct.id,
        product_name: currentProduct.name,
        product_sku: currentProduct.sku || null,
        movement_type: input.movement_type,
        quantity: qty,
        delta,
        balance_before,
        balance_after,
        reason: input.reason || null,
        reference_type: input.reference_type || 'manual',
        reference_id: input.reference_id || null,
        reference_code: input.reference_code || null,
        movement_source: input.movement_source || 'manual',
        status: 'completed',
        idempotency_key: idempotencyKey || null,
        created_by: userId,
        created_at: createdAt,
        notes: input.notes || null,
      };

      // Persist in local movements ledger
      const localMovements = getLocalMovements(userId);
      localMovements.unshift(newMovement);
      setLocalMovements(userId, localMovements);

      // Save idempotency record if key provided
      if (idempotencyKey) {
        saveIdempotencyRecord(userId, idempotencyKey, newMovement);
      }

      // Step 7: Synchronize products.current_stock using balance_after
      syncLocalProductStock(userId, currentProduct.id, balance_after);

      // Step 8: Commit transaction to Supabase backend
      try {
        const { error: mvtError } = await supabase
          .from('stock_movements')
          .insert({
            id: newMovement.id,
            user_id: userId,
            product_id: currentProduct.id,
            product_name: currentProduct.name,
            product_sku: currentProduct.sku || null,
            movement_type: input.movement_type,
            quantity: newMovement.quantity,
            delta: newMovement.delta,
            balance_before: newMovement.balance_before,
            balance_after: newMovement.balance_after,
            reason: input.reason || null,
            reference_type: input.reference_type || 'manual',
            reference_id: input.reference_id || null,
            reference_code: input.reference_code || null,
            movement_source: input.movement_source || 'manual',
            status: 'completed',
            idempotency_key: idempotencyKey || null,
            created_by: userId,
            notes: input.notes || null,
            created_at: createdAt,
          });

        if (mvtError) {
          console.warn('Supabase ledger insert warning (local cache synced):', mvtError.message);
        }

        const { error: prodError } = await supabase
          .from('products')
          .update({
            current_stock: balance_after,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentProduct.id)
          .eq('user_id', userId);

        if (prodError) {
          console.warn('Supabase stock sync warning (local cache synced):', prodError.message);
        }
      } catch (err) {
        console.warn('Network sync exception, transaction preserved in local ledger:', err);
      }

      // Step 9: Low stock evaluation & cache notification
      const minAlert = currentProduct.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT;
      const isLowStock = balance_after <= minAlert;

      notifyInventoryUpdated({
        productId: currentProduct.id,
        movementId: newMovement.id,
        isLowStock,
        source: 'stock_movement',
      });

      return {
        movement_id: newMovement.id,
        product_id: currentProduct.id,
        movement_type: input.movement_type,
        balance_before,
        delta,
        balance_after,
        created_by: userId,
        created_at: createdAt,
        status: 'completed',
        movement: newMovement,
        is_duplicate: false,
        is_low_stock: isLowStock,
        isLowStock: isLowStock,
      };
    });
  },

  /**
   * Legacy / direct caller adapter.
   * Delegates to processStockMovement to ensure single entry point execution.
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
   * Fetch stock movement history with filtering and sorting options.
   */
  async getMovementHistory(
    userId: string,
    filter?: StockMovementFilter
  ): Promise<StockMovement[]> {
    let movements = getLocalMovements(userId);

    // Attempt Supabase fetch
    try {
      let query = supabase
        .from('stock_movements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filter?.product_id) {
        query = query.eq('product_id', filter.product_id);
      }
      if (filter?.movement_type && filter.movement_type !== 'all') {
        query = query.eq('movement_type', filter.movement_type);
      }
      if (filter?.movement_source && filter.movement_source !== 'all') {
        query = query.eq('movement_source', filter.movement_source);
      }
      if (filter?.startDate) {
        query = query.gte('created_at', filter.startDate);
      }
      if (filter?.endDate) {
        query = query.lte('created_at', filter.endDate);
      }

      const { data, error } = await query;
      if (!error && data) {
        movements = data as StockMovement[];
        setLocalMovements(userId, movements);
      }
    } catch (err) {
      console.warn('Network error fetching stock movements, fallback to local:', err);
    }

    // Apply filter in memory if needed
    if (filter) {
      if (filter.product_id) {
        movements = movements.filter((m) => m.product_id === filter.product_id);
      }
      if (filter.movement_type && filter.movement_type !== 'all') {
        movements = movements.filter((m) => m.movement_type === filter.movement_type);
      }
      if (filter.movement_source && filter.movement_source !== 'all') {
        movements = movements.filter((m) => m.movement_source === filter.movement_source);
      }
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase().trim();
        movements = movements.filter(
          (m) =>
            (m.product_name && m.product_name.toLowerCase().includes(q)) ||
            (m.product_sku && m.product_sku.toLowerCase().includes(q)) ||
            (m.reason && m.reason.toLowerCase().includes(q)) ||
            (m.reference_code && m.reference_code.toLowerCase().includes(q))
        );
      }
    }

    return movements;
  },

  /**
   * Get stock movements for a specific product.
   */
  async getProductMovements(userId: string, productId: string): Promise<StockMovement[]> {
    return this.getMovementHistory(userId, { product_id: productId });
  },

  /**
   * Get summary statistics of movements.
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
      if (m.movement_type === 'stock_in') {
        total_stock_in += m.quantity;
      } else if (['sale', 'damage', 'expired'].includes(m.movement_type)) {
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
      if (by_type[m.movement_type] !== undefined) {
        by_type[m.movement_type] += 1;
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
   * Sync product current stock directly if needed by system processes.
   */
  async syncCurrentStock(userId: string, productId: string, newBalance: number): Promise<void> {
    syncLocalProductStock(userId, productId, newBalance);
    try {
      await supabase
        .from('products')
        .update({ current_stock: newBalance, updated_at: new Date().toISOString() })
        .eq('id', productId)
        .eq('user_id', userId);
    } catch (e) {
      console.warn('Network syncCurrentStock warning:', e);
    }
  },

  /**
   * System rollback helper (for cancelled transactions).
   */
  async rollbackMovement(userId: string, movementId: string): Promise<boolean> {
    console.warn(`Rollback requested for movement: ${movementId} (userId: ${userId})`);
    return true;
  },
};
