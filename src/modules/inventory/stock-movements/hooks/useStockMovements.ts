import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  StockMovement,
  CreateStockMovementInput,
  StockMovementFilter,
  StockMovementSummary,
  MovementStatistics,
  StockMovementResult,
  TransactionOptions,
} from '../types';
import { stockMovementService } from '../services/stockMovementService';
import { InventoryProduct } from '../../products/types';
import { INVENTORY_UPDATED_EVENT } from '../../events/inventoryEvents';

export const useStockMovements = (
  initialFilter?: StockMovementFilter,
  autoFetch = true
) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [summary, setSummary] = useState<StockMovementSummary | null>(null);
  const [statistics, setStatistics] = useState<MovementStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(
    async (filter?: StockMovementFilter) => {
      setLoading(true);
      setError(null);
      try {
        const historyData = await stockMovementService.getMovementHistory(
          userId,
          filter || initialFilter
        );
        setMovements(historyData);

        // Fetch summary & stats
        const summaryData = await stockMovementService.getMovementSummary(
          userId,
          filter?.product_id
        );
        setSummary(summaryData);

        const statsData = await stockMovementService.getMovementStatistics(userId);
        setStatistics(statsData);
      } catch (err: any) {
        console.error('Failed to fetch stock movements:', err);
        setError(err?.message || 'មានបញ្ហាក្នុងការទាញយកប្រវត្តិស្តុក');
      } finally {
        setLoading(false);
      }
    },
    [userId, initialFilter]
  );

  const fetchProductMovements = useCallback(
    async (productId: string): Promise<StockMovement[]> => {
      try {
        return await stockMovementService.getProductMovements(userId, productId);
      } catch (err) {
        console.error('Failed to fetch product stock movements:', err);
        return [];
      }
    },
    [userId]
  );

  const processStockMovement = useCallback(
    async (
      input: CreateStockMovementInput,
      product?: InventoryProduct,
      options?: TransactionOptions
    ): Promise<StockMovementResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await stockMovementService.processStockMovement(
          userId,
          input,
          product,
          options
        );
        await fetchMovements();
        return result;
      } catch (err: any) {
        console.error('Failed to process stock movement:', err);
        const errMsg = err?.message || 'មិនអាចរក្សាទុកប្រតិបត្តិការស្តុកបានឡើយ';
        setError(errMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchMovements]
  );

  const createMovement = useCallback(
    async (
      input: CreateStockMovementInput,
      product: InventoryProduct
    ): Promise<StockMovement | null> => {
      const result = await processStockMovement(input, product);
      return result ? result.movement : null;
    },
    [processStockMovement]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchMovements();
    }
  }, [autoFetch, fetchMovements]);

  useEffect(() => {
    const handleInventoryUpdated = () => {
      fetchMovements();
    };

    window.addEventListener(INVENTORY_UPDATED_EVENT, handleInventoryUpdated);
    return () => {
      window.removeEventListener(INVENTORY_UPDATED_EVENT, handleInventoryUpdated);
    };
  }, [fetchMovements]);

  return {
    loading,
    error,
    movements,
    history: movements, // Alias
    summary,
    statistics,
    processStockMovement,
    createMovement,
    fetchMovements,
    fetchProductMovements,
    refresh: fetchMovements,
    clearError,
  };
};
