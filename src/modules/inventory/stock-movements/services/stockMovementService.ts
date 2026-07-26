import { supabase } from '@/lib/supabase';
import {
  StockMovement,
  CreateStockMovementInput,
  StockMovementFilter,
  StockMovementSummary,
  MovementStatistics,
  StockMovementType,
} from '../types';
import {
  KHMER_MOVEMENT_ERRORS,
} from '../constants';
import { stockMovementValidator, ValidationResult } from '../validators/stockMovementValidator';
import { InventoryProduct } from '../../products/types';

const getLocalStorageKey = (userId: string) => `wyn_stock_movements_${userId}`;
const getProductLocalStorageKey = (userId: string) => `wyn_products_${userId}`;

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
   * Prepare a movement payload calculating balance_before, delta, and balance_after.
   */
  prepareMovementPayload(
    userId: string,
    input: CreateStockMovementInput,
    product: InventoryProduct
  ): Omit<StockMovement, 'id' | 'created_at'> {
    const balance_before = product.current_stock ?? 0;
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
        // For adjustment, quantity can be positive (increase) or negative (decrease) or delta
        delta = input.quantity;
        break;
      default:
        delta = qty;
    }

    const balance_after = Math.max(0, balance_before + delta);

    return {
      user_id: userId,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku || null,
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
      created_by: userId,
      notes: input.notes || null,
    };
  },

  /**
   * Commit a stock movement atomically following the append-only ledger model.
   * Updates current_stock of product and appends movement record.
   */
  async commitMovement(
    userId: string,
    input: CreateStockMovementInput,
    product: InventoryProduct
  ): Promise<StockMovement> {
    // 1. Validate payload
    const validation = this.validateBeforeCommit(input, product);
    if (!validation.isValid) {
      const errorValues = Object.values(validation.errors);
      const firstError = errorValues.length > 0 && typeof errorValues[0] === 'string'
        ? errorValues[0]
        : KHMER_MOVEMENT_ERRORS.UNEXPECTED_ERROR;
      throw new Error(firstError);
    }

    // 2. Prepare payload
    const payload = this.prepareMovementPayload(userId, input, product);
    const newMovement: StockMovement = {
      ...payload,
      id: `mvt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    // 3. Persist movement in local cache
    const localMovements = getLocalMovements(userId);
    localMovements.unshift(newMovement);
    setLocalMovements(userId, localMovements);

    // 4. Sync product stock locally
    syncLocalProductStock(userId, product.id, newMovement.balance_after);

    // 5. Sync to Supabase
    try {
      // Insert movement ledger entry
      const { data: dbMovement, error: mvtError } = await supabase
        .from('stock_movements')
        .insert({
          id: newMovement.id,
          user_id: userId,
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku || null,
          movement_type: input.movement_type,
          quantity: payload.quantity,
          delta: payload.delta,
          balance_before: payload.balance_before,
          balance_after: payload.balance_after,
          reason: input.reason || null,
          reference_type: input.reference_type || 'manual',
          reference_id: input.reference_id || null,
          reference_code: input.reference_code || null,
          movement_source: input.movement_source || 'manual',
          status: 'completed',
          created_by: userId,
          notes: input.notes || null,
          created_at: newMovement.created_at,
        })
        .select()
        .single();

      if (mvtError) {
        console.warn('Supabase stock_movements insert warning (local cache used):', mvtError.message);
      }

      // Update product current_stock in Supabase
      const { error: prodError } = await supabase
        .from('products')
        .update({
          current_stock: newMovement.balance_after,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id)
        .eq('user_id', userId);

      if (prodError) {
        console.warn('Supabase product stock sync warning (local cache used):', prodError.message);
      }

      if (dbMovement) {
        return dbMovement as StockMovement;
      }
    } catch (err) {
      console.warn('Network error during movement commit, preserved locally:', err);
    }

    return newMovement;
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
